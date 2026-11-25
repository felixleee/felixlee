/*
 * Monami France 데모 — 예약 조회 (tour/lookup.html?no=)
 * 예약번호 + 예약자 이름으로 조회 → 예약 카드, 예약 취소(환불 규정 계산), 이용완료면 후기 쓰기
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var $form = $('#lkForm'), $result = $('#lkResult');

	function renderMine() {
		var mine = MockDB.getItem('monami.myBookings', []) || [];
		mine = mine.filter(function (m) { return MockDB.find(C.bookings, m.no); });
		if (!mine.length) { $('#lkMine').hide(); return; }
		$('#lkMine').show().html('이 브라우저에서 예약한 내역<br>' + mine.map(function (m) {
			return '<button type="button" data-no="' + Mock.esc(m.no) + '" data-name="' + Mock.esc(m.name) + '">' + Mock.esc(m.no) + '</button>';
		}).join(''));
	}

	function search(no, name) {
		D.loading($result, '예약 내역을 찾는 중이에요…');
		MockApi.resolve(function () {
			var b = MockDB.find(C.bookings, no);
			return b && b.name.replace(/\s/g, '') === name.replace(/\s/g, '') ? b : null;
		}).then(function (b) {
			D.syncQuery({ no: no });
			if (!b) {
				D.empty($result, '일치하는 예약이 없어요. 예약번호와 예약자 이름을 다시 확인해 주세요.');
				return;
			}
			render(b);
		}, function (e) { D.fail($result, e); });
	}

	function render(b) {
		var t = D.tour(b.tourId) || {};
		var off = D.dayOffset(b.date);
		var canCancel = (b.status === '예약접수' || b.status === '예약확정') && off >= 0;
		var rows = [
			['투어', '<a href="' + D.url.tour(b.tourId) + '">' + Mock.esc(b.tourName) + '</a>'],
			['날짜', Mock.esc(D.dateKo(b.date)) + ' · ' + Mock.esc(t.time || '') + (off >= 0 && b.status !== '예약취소' ? ' <span class="dm-muted">(D-' + off + ')</span>' : '')],
			['만나는 장소', Mock.esc(t.meeting ? t.meeting.place + ' (' + t.meeting.time + ')' : '-')],
			['인원', '성인 ' + b.adults + '명' + (b.children ? ' · 아동 ' + b.children + '명' : '')],
			['결제 금액', '<strong>' + D.won(b.total) + '</strong> (' + (b.payment === 'onsite' ? '현지 결제' : '무통장입금') + ')'],
			['예약자', Mock.esc(b.name) + ' (' + Mock.esc(b.nameEn || '') + ')'],
			['연락처', Mock.esc(b.phone) + ' · ' + Mock.esc(b.email) + (b.kakao ? ' · 카카오톡 ' + Mock.esc(b.kakao) : '')],
			['요청사항', b.request ? D.br(b.request) : '<span class="dm-muted">없음</span>'],
			['예약일', Mock.esc(Mock.date(b.createdAt, 'YYYY.MM.DD HH:mm'))]
		];
		if (b.status === '예약취소') rows.push(['취소', Mock.esc(Mock.date(b.cancelledAt, 'YYYY.MM.DD HH:mm')) + ' · 환불 예정 ' + D.won(b.refund || 0)]);
		var foot = '';
		if (b.status === '이용완료') foot += '<a class="dm-btn dm-btn-primary" href="' + D.url.write({ tourId: b.tourId }) + '"><i class="xi-pen-o"></i> 후기 쓰기</a>';
		if (canCancel) foot += '<button type="button" class="dm-btn" id="lkCancel">예약 취소</button>';
		foot += '<a class="dm-btn" href="' + D.url.tour(b.tourId) + '">투어 다시 보기</a>';

		$result.html('<div class="dm-bkcard">' +
			'<div class="dm-bkcard-head"><span class="dm-muted">예약번호</span><span class="no">' + Mock.esc(b.id) + '</span><span class="dm-st dm-st-' + Mock.esc(b.status) + '">' + Mock.esc(b.status) + '</span></div>' +
			'<div class="dm-bkcard-body"><table class="dm-ftbl">' + rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</table></div>' +
			'<div class="dm-bkcard-foot">' + foot + '</div></div>');

		$('#lkCancel').on('click', function () {
			var rate = D.refundRate(b.date), refund = Math.round(b.total * rate / 100);
			var msg = '이 예약을 취소할까요?\n\n' + b.tourName + ' · ' + D.dateKo(b.date) + '\n' +
				'환불 규정 : 투어 ' + off + '일 전 → ' + rate + '% 환불\n환불 예정 금액 : ' + D.won(refund) + '\n\n(가상 데이터라 실제 결제·환불은 없어요)';
			if (!window.confirm(msg)) return;
			var $btn = $(this).addClass('is-busy').text('취소하는 중…');
			MockApi.update(C.bookings, b.id, { status: '예약취소', cancelledAt: Mock.now(), refund: refund }).then(function (nb) {
				Mock.toast('예약을 취소했어요', { type: 'success' });
				render(nb);
			}, function (e) { $btn.removeClass('is-busy').text('예약 취소'); Mock.toast(e.message, { type: 'error' }); });
		});
	}

	$form.on('submit', function (e) {
		e.preventDefault();
		var ok = D.validate($form, [
			{ name: 'no', label: '예약번호', required: true, pattern: /^MF[A-Z0-9]{6,14}$/i, patternMsg: '예약번호는 MF 로 시작해요. (예: MF2611250123)' },
			{ name: 'name', label: '예약자 이름', required: true }
		]);
		if (!ok) return;
		search($.trim($('#lkNo').val()).toUpperCase(), $.trim($('#lkName').val()));
	});
	$form.on('click', '[data-no]', function () {
		$('#lkNo').val($(this).attr('data-no'));
		$('#lkName').val($(this).attr('data-name'));
		$form.find('.dm-err').remove();
		$form.find('.dm-invalid').removeClass('dm-invalid');
		search($(this).attr('data-no'), $(this).attr('data-name'));
	});

	renderMine();
	// ?no= 로 들어오면, 이 브라우저에서 한 예약이면 이름을 채워 바로 조회 (이름은 주소에 싣지 않음)
	var qn = (Mock.qs('no') || '').toUpperCase();
	if (qn) {
		$('#lkNo').val(qn);
		var hit = (MockDB.getItem('monami.myBookings', []) || []).filter(function (m) { return m.no === qn; })[0];
		if (hit) { $('#lkName').val(hit.name); search(qn, hit.name); }
		else $('#lkName').focus();
	}
})(jQuery, window.Demo);

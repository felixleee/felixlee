/*!
 * TourOffice 예약조회 — mypage/res_check.html?name=&res=
 *  예약자명 + 예약번호로 조회 → TMS 에서 바꾼 예약상태·입금·담당자가 그대로 보임
 *  TMS 를 다른 탭에 열어 두고 처리하면 이 화면이 자동으로 새로 그려짐 (MockDB.on)
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $form = $('#demo_check_form'), $out = $('#demo_check_result');
	if (!$form.length) return;

	var current = null;      // { name, id, status, paid }

	// 예시 안내 (내가 방금 한 예약 / 체험용 예약)
	(function hint() {
		var last = MockDB.getItem('touroffice.lastRes', null);
		var sample = MockDB.all('tms.reservations').filter(function (r) { return r.status === '예약확정'; })[0];
		var links = [];
		if (last) links.push('<a href="javascript:;" class="demo_fill" data-name="' + esc(last.name) + '" data-res="' + esc(last.id) + '">최근 내 예약 ' + esc(last.id) + '</a>');
		if (sample) links.push('<a href="javascript:;" class="demo_fill" data-name="' + esc(sample.customer.name) + '" data-res="' + esc(sample.id) + '">체험용 예약 (' + esc(sample.customer.name) + ' / ' + esc(sample.id) + ')</a>');
		$('#demo_check_hint').html('<i class="xi-info-o"></i> 예약번호는 예약 완료 화면과 안내 문자에서 확인할 수 있어요.' + (links.length ? ' 데모 바로 채우기: ' + links.join(' · ') : ''));
	})();
	$(document).on('click', '.demo_fill', function () {
		$('#q_name').val($(this).attr('data-name'));
		$('#q_res').val($(this).attr('data-res'));
		$form.trigger('submit');
	});

	$form.on('submit', function (e) {
		e.preventDefault();
		D.clearErrors($form);
		var name = $.trim($('#q_name').val()), res = $.trim($('#q_res').val()).toUpperCase();
		var first = null;
		if (!name) { D.fieldError($('#q_name'), '예약자명을 입력해 주세요.'); first = first || $('#q_name'); }
		if (!res) { D.fieldError($('#q_res'), '예약번호를 입력해 주세요.'); first = first || $('#q_res'); }
		else if (!/^R\d{10}$/.test(res)) { D.fieldError($('#q_res'), 'R 로 시작하는 11자리 예약번호예요. (예: R2611250001)'); first = first || $('#q_res'); }
		if (first) { first.focus(); return; }
		$('#q_res').val(res);
		lookup(name, res, false);
	});
	$form.on('input', 'input', function () { if ($(this).hasClass('demo_invalid')) D.fieldError($(this), ''); });

	function lookup(name, id, silent) {
		if (!silent) $out.html(D.stateHtml('loading', '예약을 찾는 중…'));
		var $btn = $form.find('button[type=submit]').addClass('is-loading');
		return MockApi.list('tms.reservations', {
			filter: function (r) { return r.id === id && r.customer.name === name; }
		}).then(function (res) {
			$btn.removeClass('is-loading');
			if (!res.items.length) {
				current = null;
				$out.html('<div class="demo_state demo_state_empty"><i class="xi-search"></i><span>일치하는 예약이 없어요.<br>예약자명과 예약번호를 다시 확인해 주세요.</span></div>');
				return;
			}
			var r = res.items[0];
			if (silent && current && (current.status !== r.status || current.paid !== r.paid || current.manager !== r.manager)) {
				Mock.toast('예약 상태가 바뀌었어요 → ' + r.status, { type: 'success' });
			}
			current = { name: name, id: id, status: r.status, paid: r.paid, manager: r.manager };
			draw(r);
		}, function (e) {
			$btn.removeClass('is-loading');
			$out.html(D.stateHtml('empty', '조회하지 못했어요: ' + e.message));
		});
	}

	function draw(r) {
		var hotel = r.kind === 'hotel';
		var canceled = r.status === '취소요청' || r.status === '취소완료';
		var steps = TourRes.STEPS;
		var idx = steps.indexOf(r.status === '계약금입금' ? '예약확정' : r.status);
		var progress = canceled ? '' : '<ol class="demo_progress" aria-label="진행 단계">' + steps.map(function (s, i) {
			return '<li class="' + (i < idx ? 'done' : i === idx ? 'now' : '') + '"><i>' + (i < idx ? '✓' : i + 1) + '</i>' + esc(s) + '</li>';
		}).join('') + '</ol>';
		var unpaid = TourRes.unpaid(r);
		var lastMemo = (r.memos || []).filter(function (m) { return m.public; }).slice(-1)[0];
		var who = '성인 ' + r.pax.adult + '명' + (r.pax.child ? ', 아동 ' + r.pax.child + '명' : '') + (r.pax.infant ? ', 유아 ' + r.pax.infant + '명' : '');
		var payRows = [
			['결제수단', r.payMethod === '카드' ? '신용카드' : '무통장입금'],
			['결제 금액', Mock.won(r.amount)],
			['입금 확인', '<strong class="demo_blue" id="demo_paid">' + Mock.won(r.paid || 0) + '</strong> <span class="demo_muted">(' + esc(TourRes.payState(r)) + ')</span>'],
			['남은 금액', '<strong class="' + (unpaid > 0 ? 'demo_red' : '') + '" id="demo_unpaid">' + Mock.won(Math.max(0, unpaid)) + '</strong>']
		];
		if (r.payMethod !== '카드' && unpaid > 0 && !canceled) {
			payRows.push(['입금 계좌', esc(D.BANK.bank + ' ' + D.BANK.no) + ' (예금주 ' + esc(D.BANK.holder) + ') <span class="demo_muted">— 가상 계좌</span>']);
		}
		var html = '<div class="demo_status_big"><div>현재 예약 상태 &nbsp;<strong id="demo_status" style="color:' + (TourRes.COLOR[r.status] || '#333') + '">' + esc(r.status) + '</strong></div>' +
			'<span class="demo_updated">' + (lastMemo ? '최근 처리 ' + esc(Mock.date(lastMemo.at, 'YYYY.MM.DD HH:mm')) + ' · ' + esc(lastMemo.text) : '') + '</span></div>' +
			progress +
			'<h3 class="demo_h3" style="margin-top:30px">예약 내용</h3>' +
			'<table class="demo_kv"><tbody>' +
			'<tr><th scope="row">예약번호</th><td>' + esc(r.id) + ' <span class="demo_muted">(' + esc(Mock.date(r.createdAt, 'YYYY.MM.DD HH:mm')) + ' 접수)</span></td></tr>' +
			'<tr><th scope="row">상품</th><td><a href="' + esc(D.detailUrl({ id: r.tourId, kind: r.kind })) + '">' + esc(r.tourTitle) + '</a></td></tr>' +
			'<tr><th scope="row">' + (hotel ? '숙박 일정' : '여행 일정') + '</th><td>' + esc(Mock.date(r.departDate, 'YYYY.MM.DD (ddd)') + ' ~ ' + Mock.date(r.returnDate, 'YYYY.MM.DD (ddd)')) +
			(hotel && r.hotel ? ' · ' + esc(r.hotel.room) + ' ' + r.hotel.rooms + '실 ' + r.hotel.nights + '박' : (r.departFlight && r.departFlight.no ? ' · ' + esc(r.departFlight.airline + ' ' + r.departFlight.no + ' / ' + r.returnFlight.no) : '')) + '</td></tr>' +
			'<tr><th scope="row">인원</th><td>' + esc(who) + '</td></tr>' +
			'<tr><th scope="row">' + (hotel ? '투숙객' : '여행자') + '</th><td>' + r.travelers.map(function (t) { return esc(t.name) + ' <span class="demo_muted">(' + esc(t.type) + ')</span>'; }).join(', ') + '</td></tr>' +
			'<tr><th scope="row">담당자</th><td id="demo_manager">' + (r.manager ? esc(r.manager) + ' <span class="demo_muted">(고객센터 012-3456-7890)</span>' : '<span class="demo_muted">배정 전 — 곧 담당자가 연락드려요</span>') + '</td></tr>' +
			'</tbody></table>' +
			'<h3 class="demo_h3">결제 정보</h3>' +
			'<table class="demo_kv"><tbody>' + payRows.map(function (x) { return '<tr><th scope="row">' + x[0] + '</th><td>' + x[1] + '</td></tr>'; }).join('') + '</tbody></table>';
		if (['예약접수', '예약확정', '계약금입금', '입금완료'].indexOf(r.status) >= 0) {
			html += '<div class="demo_cancel_box"><button type="button" class="demo_btn demo_btn_line demo_btn_sm" id="demo_cancel_req">예약 취소 요청</button></div>';
		} else if (r.status === '취소요청') {
			html += '<p class="demo_notice" style="margin-top:16px">취소 요청이 접수됐어요. 담당자가 확인 후 환불 금액을 안내해 드려요.</p>';
		}
		$out.html(html);
	}

	$out.on('click', '#demo_cancel_req', function () {
		if (!current) return;
		if (!window.confirm('예약을 취소 요청할까요?\n담당자가 확인한 뒤 취소·환불을 처리해요.')) return;
		var $b = $(this).addClass('is-loading');
		MockApi.update('tms.reservations', current.id, function (row) {
			row.status = '취소요청';
			row.memos = (row.memos || []).concat([{ at: Mock.now(), by: '고객', text: '고객이 홈페이지에서 취소를 요청했습니다', public: true }]);
		}).then(function () {
			Mock.toast('취소 요청을 접수했어요', { type: 'success' });
			lookup(current.name, current.id, false);
		}, function (e) { $b.removeClass('is-loading'); Mock.toast(e.message, { type: 'error' }); });
	});

	// TMS(다른 탭)에서 상태·입금을 바꾸면 바로 반영
	MockDB.on('tms.reservations', function (src) {
		if (current && src !== 'local') lookup(current.name, current.id, true);
	});

	// 주소로 들어온 값 / 완료 화면에서 넘어온 값
	var qn = Mock.qs('name'), qr = Mock.qs('res');
	if (qn) $('#q_name').val(qn);
	if (qr) $('#q_res').val(qr);
	if (qn && qr) $form.trigger('submit');
})(jQuery);

/*
 * 로뎀투어 데모 — 예약조회 (good/reserve_check.html)
 *  - 신청자 이름 + (신청번호 또는 휴대폰 번호) 로 rothem.reservations 조회
 *  - ?no= 로 오면 방금 신청한 내역(이 브라우저에 기억한 이름)으로 바로 조회
 *  - 접수/상담중 상태는 [신청 취소] 가능 → 잔여석 되돌림
 */
(function ($) {
	'use strict';

	var $form = $('#rdCheckForm'), $result = $('#rdCheckResult'), last = MockDB.getItem('rothem.lastReserve', null);

	function people(r) {
		return '성인 ' + r.adults + (r.children ? ' · 아동 ' + r.children : '') + (r.infants ? ' · 유아 ' + r.infants : '');
	}
	function digits(s) { return String(s || '').replace(/\D/g, ''); }

	function search(name, key) {
		var byNo = /^rt/i.test(key);
		$result.html(RD.loading('신청 내역을 찾는 중이에요…'));
		MockApi.list('rothem.reservations', {
			filter: function (r) {
				if (r.name !== name) return false;
				return byNo ? r.no.toUpperCase() === key.toUpperCase() : digits(r.phone) === digits(key);
			},
			sort: '-createdAt'
		}).then(function (res) {
			if (!res.items.length) {
				$result.html(RD.empty('일치하는 신청 내역이 없어요', '이름과 신청번호(또는 휴대폰 번호)를 다시 확인해 주세요.'));
				return;
			}
			$result.html(
				'<h3 class="rd-box-tit">신청 내역 <small style="font-size:13px;color:#999;font-weight:normal">' + res.total + '건</small></h3>' +
				'<table class="rd-table"><caption>예약 신청 내역</caption><thead><tr>' +
					'<th scope="col">신청번호</th><th scope="col">상품명</th><th scope="col">출발일</th><th scope="col">인원</th><th scope="col">예상 금액</th><th scope="col">상태</th><th scope="col">관리</th>' +
				'</tr></thead><tbody>' +
				res.items.map(function (r) {
					var canCancel = r.status === '접수' || r.status === '상담중';
					return '<tr>' +
						'<td><strong>' + Mock.esc(r.no) + '</strong><br><span class="rd-help">' + Mock.date(r.createdAt, 'YYYY.MM.DD') + ' 신청</span></td>' +
						'<td class="l"><a href="' + Mock.esc(RD.goodUrl(r.goodId)) + '">' + Mock.esc(r.goodTitle) + '</a></td>' +
						'<td>' + Mock.date(r.depDate, 'YYYY.MM.DD (ddd)') + '</td>' +
						'<td>' + people(r) + '</td>' +
						'<td class="price">' + Mock.won(r.total) + '</td>' +
						'<td>' + RD.badge(r.status) + '</td>' +
						'<td>' + (canCancel ? '<button type="button" class="rd-btn sm line" data-cancel="' + Mock.esc(r.no) + '">신청 취소</button>' : '-') + '</td>' +
					'</tr>';
				}).join('') +
				'</tbody></table>' +
				'<div class="rd-notice-box"><ul><li>예약확정 이후의 변경 · 취소는 고객센터(0123-4567)로 연락해 주세요. 출발일에 따라 취소 수수료가 부과될 수 있어요.</li></ul></div>'
			);
		});
	}

	$form.on('submit', function (e) {
		e.preventDefault();
		var name = $.trim($('#ckName').val()), key = $.trim($('#ckKey').val()), errs = [];
		if (!name) errs.push({ el: '#ckName', msg: '신청자 이름을 입력해 주세요.' });
		if (!key) errs.push({ el: '#ckKey', msg: '신청번호 또는 휴대폰 번호를 입력해 주세요.' });
		else if (!/^rt\d{10}$/i.test(key) && !RD.phoneOk(key)) errs.push({ el: '#ckKey', msg: '신청번호(RT + 숫자 10자리) 또는 휴대폰 번호 형식으로 입력해 주세요.' });
		if (!RD.showErrors($form, errs)) return;
		search(name, key);
	});

	$result.on('click', '[data-cancel]', function () {
		var no = $(this).attr('data-cancel');
		if (!window.confirm('신청번호 ' + no + ' 예약 신청을 취소할까요?')) return;
		var r = MockDB.find('rothem.reservations', no);
		MockApi.update('rothem.reservations', no, { status: '취소', canceledAt: Mock.now() }).then(function () {
			// 잔여석 되돌리기
			MockDB.update('rothem.goods', r.goodId, function (g) {
				g.departures.forEach(function (d) {
					if (d.date === r.depDate) {
						d.seats += r.adults + r.children;
						if (d.status === '마감') d.status = '예약가능';
					}
				});
			});
			Mock.toast('예약 신청을 취소했어요', { type: 'success' });
			$form.trigger('submit');
		});
	});

	// 예시 안내 (가상 데이터) — 누르면 칸을 채운다
	var samples = MockDB.all('rothem.reservations').slice(0, 1);
	if (samples.length) {
		$('#rdCheckTip').html('데모 안내: 예시 신청 <a href="#" data-fill="' + Mock.esc(samples[0].no) + '">' + Mock.esc(samples[0].name) + ' / ' + Mock.esc(samples[0].no) + '</a> 로 조회해 볼 수 있어요.' +
			(last ? ' · 최근 신청 <a href="#" data-fill="' + Mock.esc(last.no) + '">' + Mock.esc(last.no) + '</a>' : ''));
		$('#rdCheckTip').on('click', 'a[data-fill]', function (e) {
			e.preventDefault();
			var r = MockDB.find('rothem.reservations', $(this).attr('data-fill'));
			if (!r) return;
			$('#ckName').val(r.name); $('#ckKey').val(r.no);
			$form.trigger('submit');
		});
	}

	// 완료 화면에서 넘어온 경우 바로 조회
	var no = Mock.qs('no');
	if (no && last && last.no === no) {
		$('#ckName').val(last.name); $('#ckKey').val(no);
		search(last.name, no);
	} else if (no) {
		$('#ckKey').val(no);
		$('#ckName').focus();
	}
})(jQuery);

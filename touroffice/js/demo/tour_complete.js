/*!
 * TourOffice 예약 완료 — good/tour_complete.html?res=예약번호
 *  예약번호·예약 내용·입금 안내(무통장) 표시
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $root = $('#demo_complete');
	if (!$root.length) return;

	var BANK = D.BANK;   // 가상 입금 계좌

	var resNo = Mock.qs('res');
	$root.html(D.stateHtml('loading', '예약 내용을 불러오는 중…'));
	if (!resNo) { fail(); return; }
	MockApi.get('tms.reservations', resNo).then(draw, fail);

	function fail() {
		$root.html('<div class="demo_done"><div class="demo_done_icon"><i class="xi-error-o"></i></div><h2>예약 정보를 찾을 수 없어요</h2>' +
			'<p class="demo_muted">예약번호를 확인하시거나 예약조회에서 다시 찾아 주세요.</p>' +
			'<div class="demo_btns"><a href="../mypage/res_check.html" class="demo_btn">예약조회</a><a href="../main/pure_main.html" class="demo_btn demo_btn_line">메인으로</a></div></div>');
	}

	function draw(r) {
		document.title = '예약 완료 :: ' + document.title;
		var hotel = r.kind === 'hotel';
		var due = Mock.date(Mock.addDays(r.createdAt, 2), 'YYYY.MM.DD (ddd)') + ' 23:59';
		var who = '성인 ' + r.pax.adult + '명' + (r.pax.child ? ', 아동 ' + r.pax.child + '명' : '') + (r.pax.infant ? ', 유아 ' + r.pax.infant + '명' : '');
		var rows = [
			['예약 상품', '<a href="' + esc(D.detailUrl({ id: r.tourId, kind: r.kind })) + '">' + esc(r.tourTitle) + '</a>'],
			[hotel ? '숙박 일정' : '여행 일정', esc(Mock.date(r.departDate, 'YYYY.MM.DD (ddd)') + ' ~ ' + Mock.date(r.returnDate, 'YYYY.MM.DD (ddd)')) +
				(hotel ? ' · ' + esc(r.hotel.room) + ' ' + r.hotel.rooms + '실 ' + r.hotel.nights + '박' : r.departFlight.no ? ' · ' + esc(r.departFlight.airline + ' ' + r.departFlight.no) : '')],
			['인원', esc(who)],
			['예약자', esc(r.customer.name) + ' / ' + esc(r.customer.phone) + ' / ' + esc(r.customer.email)],
			[hotel ? '투숙객' : '여행자', r.travelers.map(function (t) { return esc(t.name) + ' <span class="demo_muted">(' + esc(t.type) + ')</span>'; }).join(', ')],
			['결제수단', r.payMethod === '카드' ? '신용카드 (승인 완료)' : '무통장입금'],
			['결제 금액', '<strong class="demo_red">' + Mock.won(r.amount) + '</strong>'],
			['예약 상태', '<strong style="color:' + (TourRes.COLOR[r.status] || '#333') + '">' + esc(r.status) + '</strong> <span class="demo_muted">— 담당자가 확인 후 예약을 확정해 드려요</span>']
		];
		var html = '<div class="demo_done">' +
			'<ol class="demo_steps" style="text-align:left"><li><b>01</b>상품 선택</li><li><b>02</b>예약정보 입력</li><li class="on"><b>03</b>예약 완료</li></ol>' +
			'<div class="demo_done_icon"><i class="xi-check-circle-o"></i></div>' +
			'<h2>예약이 접수되었습니다</h2>' +
			'<p class="demo_resno">예약번호<strong id="demo_res_no">' + esc(r.id) + '</strong></p>' +
			'<table class="demo_kv"><tbody>' + rows.map(function (x) { return '<tr><th scope="row">' + x[0] + '</th><td>' + x[1] + '</td></tr>'; }).join('') + '</tbody></table>';
		if (r.payMethod !== '카드' && TourRes.unpaid(r) > 0) {
			html += '<div class="demo_bank"><h3><i class="xi-bank"></i> 입금 안내</h3><p>' +
				'입금 계좌 : <strong>' + esc(BANK.bank + ' ' + BANK.no) + '</strong> (예금주 ' + esc(BANK.holder) + ')<br>' +
				'입금 금액 : <strong class="demo_red">' + Mock.won(TourRes.unpaid(r)) + '</strong><br>' +
				'입금자명 : <strong>' + esc(r.depositor || r.customer.name) + '</strong><br>' +
				'입금 기한 : <strong>' + esc(due) + '</strong> 까지 (기한이 지나면 예약이 자동 취소될 수 있어요)<br>' +
				'<span class="demo_muted">※ 데모용 가상 계좌입니다. 실제로 입금하지 마세요.</span></p></div>';
		}
		html += '<div class="demo_btns"><a href="' + esc(Mock.url('../mypage/res_check.html', { name: r.customer.name, res: r.id })) + '" class="demo_btn demo_btn_red" id="demo_go_check">예약조회</a>' +
			'<a href="../main/pure_main.html" class="demo_btn demo_btn_line">메인으로</a></div></div>';
		$root.html(html);
	}
})(jQuery);

/*
 * Monami France 데모 — 예약 완료 (tour/complete.html?no=예약번호)
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var no = Mock.qs('no');

	D.loading($('#cpState'), '예약 내역을 확인하는 중이에요…');
	MockApi.get(C.bookings, no).then(render, function () {
		$('#dmPageTitle').text('예약 내역을 찾을 수 없어요');
		D.empty($('#cpState'), '예약번호에 해당하는 예약이 없어요. 예약 조회에서 다시 확인해 주세요.',
			'<a class="dm-btn dm-btn-primary" href="lookup.html">예약 조회</a> <a class="dm-btn" href="list.html">투어 목록</a>');
	});

	function render(b) {
		var t = D.tour(b.tourId) || {};
		$('#cpState').empty();
		$('#cpDone').show();
		$('#cpMsg').html(Mock.esc(b.name) + '님, <strong>' + Mock.esc(b.tourName) + '</strong> 예약 신청이 접수되었어요.<br>입금이 확인되면 ' + Mock.esc(b.phone) + ' 로 확정 문자를 보내 드려요.');
		$('#cpNo').text(b.id);
		var rows = [
			['투어', '<a href="' + D.url.tour(b.tourId) + '">' + Mock.esc(b.tourName) + '</a>'],
			['날짜', Mock.esc(D.dateKo(b.date)) + ' · ' + Mock.esc(t.time || '')],
			['만나는 장소', Mock.esc(t.meeting ? t.meeting.place + ' (' + t.meeting.time + ')' : '-')],
			['인원', '성인 ' + b.adults + '명' + (b.children ? ' · 아동 ' + b.children + '명' : '')],
			['결제 금액', '<strong>' + D.won(b.total) + '</strong> (' + (b.payment === 'onsite' ? '현지 결제' : '무통장입금') + ')'],
			['예약자', Mock.esc(b.name) + ' (' + Mock.esc(b.nameEn) + ') · ' + Mock.esc(b.phone) + ' · ' + Mock.esc(b.email)],
			['진행 상태', '<span class="dm-st dm-st-' + Mock.esc(b.status) + '">' + Mock.esc(b.status) + '</span>']
		];
		$('#cpTable').html(rows.map(function (r) { return '<tr><th>' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join(''));
		$('#cpBank').html(b.payment === 'onsite'
			? '<strong>현지 결제</strong>를 선택하셨어요. 투어 당일 미팅 장소에서 가이드에게 유로(€) 현금 또는 카드로 결제해 주세요.<br>예약 확정 문자는 담당 가이드 배정 후 보내 드려요.'
			: '<strong>입금 계좌</strong> 샘플은행 012345-67-890123 (예금주: 샘플)<br><strong>입금 금액</strong> ' + D.won(b.total) + ' · <strong>입금 기한</strong> ' + Mock.date(Mock.addDays(b.createdAt, 1), 'YYYY.MM.DD HH:mm') + '까지<br>입금자명이 예약자명과 다르면 고객센터로 예약번호를 알려 주세요.');
		// 이름은 주소에 싣지 않음 — 조회 화면이 이 브라우저의 예약 목록(myBookings)에서 이름을 찾아 채움
		$('#cpLookup').attr('href', D.url.lookup({ no: b.id }));
	}
})(jQuery, window.Demo);

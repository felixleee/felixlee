/*
 * MyCultureis 데모 — 예약 완료 (good/complete.html?no=<예약번호>)
 *  예약번호를 크게 보여 주고, 예약 내용과 '이 시간 남은 자리'(예약만큼 줄어든 값)를 함께 보여 준다.
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var $root = $('#mcComplete');
	var no = Mock.qs('no');

	if (!no) {
		$root.html(MC.empty('예약 정보를 찾을 수 없어요.', '<a class="mc-btn" href="' + MC.link.mypage() + '">예약 확인하러 가기</a>'));
		return;
	}
	$root.html(MC.loading('예약 내용을 확인하는 중이에요…'));
	MockApi.get(MC.C.book, no).then(function (b) {
		var cls = MC.cls(b.classId) || { title: b.title, duration: 0, place: { name: '-' }, capacity: 0 };
		var seat = cls.id ? MC.seats(cls, b.date, b.time) : null;
		var status = MC.bookingStatus(b);
		$root.html(
			'<div class="mc-done">' +
				'<span class="mc-done-ico" aria-hidden="true">✓</span>' +
				'<h3>' + (status === '예약취소' ? '취소된 예약이에요' : '예약이 완료되었어요!') + '</h3>' +
				'<p>' + esc(b.name) + '님, ' + Mock.date(b.date, 'MM월 DD일 (ddd)') + ' ' + esc(b.time) + ' 클래스에서 만나요.<br>예약 확인 문자를 ' + esc(b.phone) + ' 로 보내 드렸어요. (데모라 실제로 보내지는 않아요)</p>' +
				'<div class="mc-bookno"><span>예약번호</span><strong id="mcBookNo">' + esc(b.id) + '</strong></div>' +
			'</div>' +
			'<div class="mc-box mc-done-box">' +
				'<div class="mc-panel-title"><h3>예약 내용</h3>' + MC.statusBadge(status) + '</div>' +
				'<dl class="mc-dl">' +
					'<div><dt>클래스</dt><dd><a href="' + esc(MC.link.detail(b.classId)) + '">' + esc(b.title) + '</a></dd></div>' +
					'<div><dt>일시</dt><dd>' + Mock.date(b.date, 'YYYY.MM.DD (ddd)') + ' ' + esc(b.time) + (cls.duration ? ' ~ ' + MC.endTime(b.time, cls.duration) : '') + '</dd></div>' +
					'<div><dt>장소</dt><dd>' + esc(cls.place.name) + (cls.place.addr ? '<br><small style="color:#999">' + esc(cls.place.addr) + '</small>' : '') + '</dd></div>' +
					'<div><dt>인원</dt><dd>' + b.people + '명</dd></div>' +
					'<div><dt>결제 금액</dt><dd><b>' + Mock.won(b.total) + '</b> (1인 ' + Mock.won(b.price) + ')</dd></div>' +
					'<div><dt>예약자</dt><dd>' + esc(b.name) + ' · ' + esc(b.phone) + ' · ' + esc(b.email) + '</dd></div>' +
					(b.request ? '<div><dt>요청사항</dt><dd>' + esc(b.request) + '</dd></div>' : '') +
				'</dl>' +
				(seat ? '<p class="mc-seatline' + (seat.few || seat.closed ? ' is-few' : '') + '" id="mcSeatAfter">이 시간 남은 자리: ' + seat.left + '석 / 정원 ' + seat.capacity + '명' + (seat.closed ? ' (마감)' : '') + '</p>' : '') +
			'</div>' +
			'<div class="mc-btns">' +
				'<a class="mc-btn mc-btn-primary" href="' + esc(MC.link.mypage({ id: b.id })) + '" id="mcGoMy">예약 확인 · 취소</a>' +
				'<a class="mc-btn" href="' + esc(MC.link.list()) + '">다른 클래스 둘러보기</a>' +
				'<a class="mc-btn mc-btn-gray" href="' + esc(MC.link.main()) + '">메인으로</a>' +
			'</div>'
		);
	}).catch(function (e) {
		if (!(e && e.status === 404)) console.error(e);
		$root.html(MC.empty('예약번호 ' + esc(no) + ' 에 해당하는 예약이 없어요.', '<a class="mc-btn" href="' + MC.link.mypage() + '">예약 확인하러 가기</a>'));
	});
})(jQuery);

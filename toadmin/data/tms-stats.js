/*!
 * TMS 회원·게시판 일별 현황 가상 데이터 — 대시보드 '회원가입 및 게시판현황', '고객현황'
 *  MockDB 컬렉션 : 'tms.dailyStats'  (오늘부터 30일 전까지, 날짜는 Mock.rel 로 늘 최신)
 *  예약·상담 집계는 이 데이터가 아니라 tms.reservations / tms.inquiries 에서 바로 계산합니다.
 */
(function (w) {
	'use strict';
	var rows = [];
	for (var i = 0; i < 30; i++) {
		var seed = (i * 37 + 11) % 17;
		rows.push({
			id: Mock.rel(-i),
			date: Mock.rel(-i),
			join: seed % 5,
			login: 6 + (seed * 3) % 14,
			qna: [seed % 4, Math.max(0, (seed % 4) - (i === 0 ? 1 : 0))],
			review: seed % 3,
			notice: i % 9 === 0 ? 1 : 0
		});
	}
	MockDB.define('tms.dailyStats', rows, { version: '1' });
	/** 데모 이전부터 있던 회원 수 (가상) */
	w.TMS_BASE_MEMBERS = 1284;
})(window);

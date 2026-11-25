/*
 * Monami France — 가상 예약(monami.bookings)
 *  - id 가 예약번호입니다. 새 예약은 Mock.uid('MF') 로 만듭니다 (MF + YYMMDD + 4자리).
 *  - status : 예약접수(입금 대기) | 예약확정 | 이용완료 | 예약취소
 *  - 예약 조회 화면에서 바로 써 볼 수 있게 예시 예약 2건을 넣어 둡니다.
 *    (예약번호 MFDEMO0001 / 예약자 김모나,  MFDEMO0002 / 이프랑)
 * 이름·연락처는 모두 가상입니다.
 */
(function () {
	// 오늘 기준 from 일 뒤부터, 운영 요일(days)에 맞는 첫 날짜
	function openDay(from, days) {
		for (var i = from; i < from + 14; i++) {
			if (days.indexOf(Mock.toDate(Mock.rel(i)).getDay()) >= 0) return Mock.rel(i);
		}
		return Mock.rel(from);
	}
	MockDB.define('monami.bookings', [
		{
			id: 'MFDEMO0001', tourId: 1, tourName: '파리시내+베르사유', date: openDay(12, [0, 2, 3, 4, 5, 6]),
			adults: 2, children: 1, priceAdult: 98000, priceChild: 78000, total: 274000,
			name: '김모나', nameEn: 'KIM MONA', phone: '010-0000-1234', email: 'mona.kim@example.com', kakao: 'monami_demo',
			hotel: '오페라 인근 호텔', payment: 'bank', request: '아이가 8살이에요. 쉬는 시간을 조금 넉넉히 부탁드려요.',
			status: '예약확정', createdAt: Mock.rel(-3, '14:22')
		},
		{
			id: 'MFDEMO0002', tourId: 2, tourName: '파리시내+파리야경', date: openDay(-10, [0, 3, 5]),
			adults: 2, children: 0, priceAdult: 59000, priceChild: 45000, total: 118000,
			name: '이프랑', nameEn: 'LEE FRAN', phone: '010-0000-5678', email: 'fran.lee@example.com', kakao: '',
			hotel: '', payment: 'bank', request: '',
			status: '이용완료', createdAt: Mock.rel(-25, '09:41')
		}
	], { version: '1' });
})();

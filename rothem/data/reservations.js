/*
 * 로뎀투어 데모 — 예약 신청 가상 데이터
 * MockDB.define('rothem.reservations', [...], { key: 'no' })
 *  - 신청번호(no) 로 찾는다.  예) RT2611250001
 *  - 신청자 · 교회 · 연락처는 모두 가상
 *  - goods.js 다음에 불러온다 (출발일 · 금액을 상품에서 가져온다)
 */
(function () {
	'use strict';

	function seed(no, goodId, depIndex, o) {
		var g = MockDB.find('rothem.goods', goodId);
		var dep = g ? g.departures[depIndex] : null;
		o.no = no;
		o.goodId = goodId;
		o.goodTitle = g ? g.title : '';
		o.depDate = dep ? dep.date : Mock.rel(30);
		o.unitPrice = dep ? dep.price : 0;
		o.total = o.unitPrice * o.adults + Math.round(o.unitPrice * 0.9) * (o.children || 0) + Math.round(o.unitPrice * 0.2) * (o.infants || 0);
		return o;
	}

	MockDB.define('rothem.reservations', [
		seed('RT' + Mock.date(Mock.rel(-5), 'YYMMDD') + '0007', 101, 1, { adults: 2, children: 0, infants: 0, name: '홍예린', phone: '010-0000-3101', email: 'yerin@example.com', church: '새빛누리교회', request: '부부 동반입니다. 같은 방 배정 부탁드립니다.', status: '예약확정', createdAt: Mock.rel(-5, '10:20') }),
		seed('RT' + Mock.date(Mock.rel(-2), 'YYMMDD') + '0012', 110, 2, { adults: 4, children: 1, infants: 0, name: '강믿음', phone: '010-0000-3102', email: 'mideum@example.com', church: '가온들교회', request: '어린이 1명 포함(10세)입니다.', status: '상담중', createdAt: Mock.rel(-2, '15:45') })
	], { key: 'no', version: '1' });
})();

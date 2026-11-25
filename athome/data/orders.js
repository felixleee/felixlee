/*
 * AthomeTrip 가상 데이터 — 예약(주문) · 장바구니
 *
 * athome.orders : 예약 1건 = 예약번호(id) + 상품 묶음(items) + 예약자(booker) + 결제수단 + 상태
 *   status : 예약대기 → 예약확정 → (이용일이 지나면 화면에서 '이용완료')
 *            취소요청 → 취소완료
 * athome.cart   : 장바구니 담긴 상품 (처음에는 비어 있음)
 *
 * 예약자 정보는 모두 가상 (전화 010-0000-xxxx, 이메일 @example.com)
 */
(function () {
	var BOOKER = { name: '김여행', engLast: 'KIM', engFirst: 'YEOHAENG', phone: '010-0000-1234', email: 'traveler@example.com' };
	function no(daysAgo, tail) { return 'AT' + Mock.date(Mock.rel(-daysAgo), 'YYMMDD') + tail; }

	MockDB.define('athome.orders', [
		{
			id: no(2, '0418'), status: '예약대기', createdAt: Mock.rel(-2, '21:14'), payMethod: '카카오페이',
			booker: BOOKER, memo: '가능하면 붙어 있는 좌석으로 부탁드려요.',
			items: [{ productId: 104, title: '브로드웨이 뮤지컬 <라이온 킹> 오케스트라석', img: 'FileData/good/20210617_54C21DF235C964D9.jpg', cate: 'show', city: 'ny', unit: '1인',
				date: Mock.rel(25), opts: [{ code: 'adult', name: '성인 (만 13세 이상)', price: 239000, qty: 2 }], amount: 478000 }],
			total: 478000
		},
		{
			id: no(12, '0127'), status: '예약확정', createdAt: Mock.rel(-12, '10:32'), payMethod: '신용카드',
			booker: BOOKER, memo: '',
			items: [{ productId: 101, title: '뉴욕 시티패스 (CityPASS) 5개 명소 통합 입장권', img: 'FileData/good/20210617_6D2E5367DB9265D3.jpg', cate: 'pass', city: 'ny', unit: '1인',
				date: Mock.rel(18), opts: [{ code: 'adult', name: '성인 (만 13세 이상)', price: 189000, qty: 2 }, { code: 'child', name: '아동 (만 6~17세)', price: 159000, qty: 1 }], amount: 537000 },
				{ productId: 112, title: '뉴욕 공항 픽업 (JFK·뉴어크 → 맨해튼 호텔)', img: 'FileData/hotel/20210616_608FDB6683FBAF6F.jpg', cate: 'trans', city: 'ny', unit: '1대',
				date: Mock.rel(17), opts: [{ code: 'sedan', name: '세단 (1~3인)', price: 129000, qty: 1 }], amount: 129000 }],
			total: 666000
		},
		{
			id: no(31, '0903'), status: '취소완료', createdAt: Mock.rel(-31, '14:05'), payMethod: '신용카드',
			booker: BOOKER, memo: '', cancelReason: '여행 일정이 바뀌었어요', cancelRequestedAt: Mock.rel(-27, '09:40'),
			items: [{ productId: 202, title: '그랜드캐니언 사우스림 1일 투어 (라스베이거스 출발)', img: 'image/product/lasvegas.jpg', cate: 'guide', city: 'lv', unit: '1인',
				date: Mock.rel(-6), opts: [{ code: 'adult', name: '성인 (만 13세 이상)', price: 219000, qty: 2 }], amount: 438000 }],
			total: 438000
		},
		{
			id: no(64, '0552'), status: '예약확정', createdAt: Mock.rel(-64, '19:47'), payMethod: '네이버페이',
			booker: BOOKER, memo: '',
			items: [{ productId: 701, title: '하나우마 베이 스노클링 투어 (장비 대여 포함)', img: 'FileData/good/20210331_E66A48A518365881.jpg', cate: 'guide', city: 'hnl', unit: '1인',
				date: Mock.rel(-41), opts: [{ code: 'adult', name: '성인 (만 13세 이상)', price: 99000, qty: 2 }], amount: 198000 }],
			total: 198000
		}
	], { version: '1' });

	MockDB.define('athome.cart', [], { version: '1' });
})();

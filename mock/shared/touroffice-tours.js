/*!
 * TourOffice 상품(투어·숙소) 가상 데이터 — touroffice(B2C) 와 toadmin(TMS) 이 함께 씀
 *
 *  MockDB 컬렉션 : 'touroffice.tours'
 *  전역 도우미   : window.TourOfficeData  (카테고리 트리, 지역 목록, 출발일 계산 등)
 *
 *  - 이미지 경로(thumb)는 touroffice 폴더 기준입니다. 화면에서는 '../' + thumb 로 씁니다.
 *  - 출발일은 Mock.rel() 로 오늘 기준 상대 날짜라 언제 열어도 앞으로의 날짜로 보입니다.
 *  - 잔여석 = 좌석수 - 기존 판매(sold) - tms.reservations 에서 취소되지 않은 예약 인원
 */
(function (w) {
	'use strict';

	/* ---------- 카테고리 (GNB · TMS 카테고리 select 와 같은 코드) ---------- */
	var CATE = [
		{ uid: 71, name: '국내여행', kind: 'tour', children: [
			{ uid: 7101, name: '부산출발' }, { uid: 7102, name: '대구출발' }, { uid: 7103, name: '서울출발' }] },
		{ uid: 70, name: '해외여행', kind: 'tour', children: [
			{ uid: 7001, name: '일본' }, { uid: 7002, name: '중국, 홍콩, 마카오, 대만' }, { uid: 7003, name: '동남아' },
			{ uid: 7004, name: '서유럽' }, { uid: 7005, name: '미국캐마나' }, { uid: 7006, name: '기타및특수지역' }] },
		{ uid: 86, name: '섬여행', kind: 'tour', children: [
			{ uid: 8601, name: '홍도' }, { uid: 8602, name: '울릉도' }, { uid: 8603, name: '제주도' }] },
		{ uid: 2, name: '데이투어', kind: 'tour', children: [
			{ uid: 201, name: '지상투어' }, { uid: 202, name: '차량투어' }, { uid: 203, name: '골프투어' }] },
		{ uid: 108, name: '패스/티켓', kind: 'tour', children: [{ uid: 10801, name: '뮤지컬' }] },
		{ uid: 69, name: '호텔/리조트', kind: 'hotel', children: [{ uid: 6901, name: '국내호텔' }, { uid: 6902, name: '해외호텔' }] },
		{ uid: 109, name: '픽업/샌딩', kind: 'tour', children: [{ uid: 10901, name: '인천국제공항' }] }
	];

	/* ---------- 출발일 만들기 ---------- */
	function r1000(n) { return Math.round(n / 1000) * 1000; }
	function r100(n) { return Math.round(n / 100) * 100; }
	/**
	 * o = { start: 첫 출발(오늘+n일), every: 간격(일), count, days: 여행일수, price, seats,
	 *       confirm: [출발확정 index], close: [마감 index], sold: [index별 기존 판매석], childRate, infantRate }
	 */
	function deps(o) {
		var out = [];
		for (var i = 0; i < o.count; i++) {
			var off = o.start + i * o.every;
			var date = Mock.rel(off);
			var dow = Mock.toDate(date).getDay();
			var base = o.price == null ? null : (dow === 5 || dow === 6) && o.weekend !== false ? r1000(o.price * 1.08) : o.price;
			out.push({
				date: date,
				ret: Mock.rel(off + Math.max(0, (o.days || 1) - 1)),
				price: base,
				child: base == null ? null : r100(base * (o.childRate == null ? 0.8 : o.childRate)),
				infant: base == null ? null : r100(base * (o.infantRate == null ? 0.1 : o.infantRate)),
				seats: o.seats || 20,
				sold: (o.sold && o.sold[i]) || 0,
				min: o.min || 2,
				confirmed: (o.confirm || []).indexOf(i) >= 0,
				closed: (o.close || []).indexOf(i) >= 0
			});
		}
		return out;
	}

	/* ---------- 포함/불포함·유의사항 기본값 ---------- */
	var INC = {
		abroad: ['왕복 항공료 및 유류할증료, 제세공과금', '일정표상 호텔 숙박 (2인 1실 기준)', '일정표상 식사 및 관광지 입장료', '전용차량 및 현지 한국어 가이드', '해외여행자보험 (1억원 한도)'],
		domestic: ['왕복 교통 (일정표상 항공·KTX·전용버스)', '일정표상 숙박 (2인 1실 기준)', '일정표상 식사 및 관광지 입장료', '국내여행자보험'],
		day: ['전문 가이드 동행', '일정표상 관광지 입장료', '여행자보험'],
		ticket: ['공연 관람권 (지정석)', '예매 수수료']
	};
	var EXC = {
		abroad: ['개인 경비 및 매너팁', '가이드/기사 경비 (현지 지불)', '선택관광 비용', '1인실 사용료 (싱글차지)'],
		domestic: ['개인 경비', '선택관광 비용', '1인실 사용료'],
		day: ['개인 경비 및 식사', '숙소까지의 교통비'],
		ticket: ['공연장까지의 교통비', '주차비']
	};
	var NOTICE = {
		abroad: '여권 유효기간이 출발일 기준 6개월 이상 남아 있어야 합니다. 항공 좌석과 현지 사정에 따라 일정이 바뀔 수 있으며, 최소 출발 인원이 모이지 않으면 출발 7일 전까지 안내드립니다.',
		domestic: '기상 상황(태풍·풍랑)에 따라 일정이 바뀌거나 취소될 수 있습니다. 출발 3일 전까지 취소하면 전액 환불됩니다.',
		day: '집결 시간 10분 전까지 도착해 주세요. 늦게 오시면 기다리지 않고 출발할 수 있습니다.',
		ticket: '공연 당일 취소·변경은 불가하며, 관람일 3일 전까지 취소하면 전액 환불됩니다.'
	};

	/* ---------- 일정표 ---------- */
	function plan(rows) {
		return rows.map(function (r, i) {
			return { day: i + 1, area: r[0], title: r[1], spots: r[2] || [], meal: r[3] || '', hotel: r[4] || '' };
		});
	}

	var IMG = 'FileData/good_thum/';

	var TOURS = [
		/* ===== 국내여행 ===== */
		{
			id: 1001, kind: 'tour', b_uid: 71, m_uid: 7102, region: '국내', country: '대한민국', countryCode: 'KO', city: '제주',
			title: '[대구출발] 제주도 3대특식 3박4일 흑돼지+제주갈치+회정식', evTitle: '제주 3대특식 3박4일',
			summary: '제주도를 대표하는 3대음식 흑돼지,갈치,회정식 모두 즐길 수 있는 노팁노옵션 여행',
			thumb: IMG + '20210326_D72199DF5B48AF7B.jpg', price: null, days: 4, nights: 3,
			trans: '항공', flight: { airline: '7C', go: '7C501', back: '7C502' },
			recommend: { tab: 71, order: 1 }, tags: ['노팁노옵션', '3대특식'], type: 'domestic',
			deps: deps({ start: 6, every: 7, count: 8, days: 4, price: null, seats: 24, sold: [10, 4, 0, 2], confirm: [0] }),
			itinerary: plan([
				['대구·제주', '대구공항 출발 → 제주 도착', ['용두암', '동문재래시장'], '석식: 흑돼지 구이', '제주 시내 호텔'],
				['제주 동부', '성산일출봉과 섭지코지', ['성산일출봉', '섭지코지', '우도 (선택)'], '조식: 호텔식 / 중식: 해물뚝배기 / 석식: 갈치조림', '서귀포 호텔'],
				['서귀포', '천지연폭포와 주상절리', ['천지연폭포', '주상절리대', '오설록 티뮤지엄'], '조식: 호텔식 / 석식: 회정식', '서귀포 호텔'],
				['제주 서부·대구', '협재해변 → 대구 도착', ['한림공원', '협재해변'], '조식: 호텔식', '']
			])
		},
		{
			id: 1002, kind: 'tour', b_uid: 71, m_uid: 7103, region: '국내', country: '대한민국', countryCode: 'KO', city: '부산',
			title: '바다의 땅 부산 1박2일', evTitle: '바다의 땅 부산 1박2일',
			summary: '부산 인기명소만 콕!콕! 찝어보는 BEST 여행',
			thumb: IMG + '20210326_62B8EDFFC19B9138.jpg', price: 199000, days: 2, nights: 1, childRate: 0.9,
			trans: 'KTX', flight: { airline: 'KTX', go: '101', back: '150' },
			recommend: { tab: 71, order: 2 }, tags: ['BEST', 'KTX 왕복'], type: 'domestic',
			deps: deps({ start: 3, every: 4, count: 10, days: 2, price: 199000, seats: 30, sold: [6, 22, 3, 0, 27], confirm: [0, 1], close: [4], childRate: 0.9 }),
			itinerary: plan([
				['서울·부산', '서울역 KTX 출발 → 부산 도착', ['감천문화마을', '흰여울문화마을', '광안리 야경'], '중식: 밀면 / 석식: 해물 한정식', '해운대 호텔'],
				['부산·서울', '해운대 바닷길 → 서울 도착', ['해동용궁사', '해운대 블루라인파크', '자갈치시장'], '조식: 호텔식 / 중식: 돼지국밥', '']
			])
		},
		{
			id: 1003, kind: 'tour', b_uid: 71, m_uid: 7101, region: '국내', country: '대한민국', countryCode: 'KO', city: '전주',
			title: '[부산출발] 전주한옥마을 1박2일', evTitle: '전주 1박 2일 맛집투어',
			summary: '전주의 관광명소만을 엄선하여 기획한 실속형 국내여행!!',
			thumb: IMG + '20221130_F1C39DF0D34252BC.jpg', price: 100000, days: 2, nights: 1, childRate: 0.9,
			trans: '전용버스', flight: { airline: '전용버스', go: '1호차', back: '1호차' },
			recommend: { tab: 71, order: 3 }, tags: ['한옥스테이', '맛집투어'], type: 'domestic',
			deps: deps({ start: 4, every: 7, count: 8, days: 2, price: 100000, seats: 40, sold: [18, 5, 0], confirm: [0], childRate: 0.9 }),
			itinerary: plan([
				['부산·전주', '부산 출발 → 전주한옥마을', ['전주한옥마을', '경기전', '전동성당', '남부시장 야시장'], '중식: 전주비빔밥 / 석식: 한정식', '한옥스테이'],
				['전주·부산', '오목대 산책 → 부산 도착', ['오목대', '자만벽화마을', '덕진공원'], '조식: 콩나물국밥', '']
			])
		},
		{
			id: 1004, kind: 'tour', b_uid: 71, m_uid: 7101, region: '국내', country: '대한민국', countryCode: 'KO', city: '제천',
			title: '[부산출발] 문화재의 집합소 제천 여행', evTitle: '문화재 투어',
			summary: '문화재단지를 시작으로 국내에서 가장 오래된 저수지 의림지를 비롯해 한국 천년의 역사를 둘러보는 여행',
			thumb: IMG + '20221130_4F527ADB3EFBDEFB.jpg', price: 200000, days: 1, nights: 0, childRate: 0.9,
			trans: '전용버스', flight: { airline: '전용버스', go: '2호차', back: '2호차' },
			recommend: { tab: 71, order: 4 }, tags: ['당일여행'], type: 'domestic',
			deps: deps({ start: 9, every: 7, count: 6, days: 1, price: 200000, seats: 40, sold: [12], childRate: 0.9 }),
			itinerary: plan([
				['부산·제천', '청풍문화재단지 → 의림지 → 부산 도착', ['청풍문화재단지', '의림지', '청풍호반 케이블카'], '중식: 약채락 정식', '']
			])
		},

		/* ===== 해외여행 ===== */
		{
			id: 1005, kind: 'tour', b_uid: 70, m_uid: 7004, region: '유럽', country: '스페인', countryCode: 'ES', city: '바르셀로나',
			title: '[선착순+좌석확보](싱글팩)스페인 일주 9일-QR', evTitle: '스페인 일주 9일-QR',
			summary: '★ 좌석확보된 금액으로 스페인 완전정복하기~!\n★ 전 구간 이동수단 포함~!\n★ 알함브라 궁전 입장 포함',
			thumb: IMG + '20180416_E67836499CDBC838.jpg', price: 1460000, days: 9, nights: 7,
			trans: '항공', flight: { airline: 'QR', go: 'QR859', back: 'QR858' },
			recommend: { tab: 70, order: 1 }, monthly: { tour: 1 }, tags: ['좌석확보', '싱글팩'], type: 'abroad',
			deps: deps({ start: 12, every: 7, count: 8, days: 9, price: 1460000, seats: 25, sold: [17, 8, 2], confirm: [0], min: 10, infantRate: 0.15 }),
			itinerary: plan([
				['인천·도하', '인천 출발 → 도하 경유', ['인천국제공항 집결 (출발 3시간 전)'], '기내식', '기내 숙박'],
				['바르셀로나', '가우디의 도시 바르셀로나', ['사그라다 파밀리아', '구엘공원', '람블라스 거리'], '조식: 기내식 / 중식: 빠에야 / 석식: 현지식', '바르셀로나 4성급'],
				['몬세라트·사라고사', '톱니산 몬세라트 수도원', ['몬세라트 수도원', '사라고사 필라르 성당'], '조식: 호텔식 / 중식: 현지식 / 석식: 한식', '사라고사 4성급'],
				['마드리드', '스페인의 수도 마드리드', ['프라도 미술관', '솔 광장', '마요르 광장'], '조식: 호텔식 / 중식: 현지식 / 석식: 현지식', '마드리드 4성급'],
				['톨레도·콘수에그라', '중세 도시와 돈키호테 풍차마을', ['톨레도 대성당', '콘수에그라 풍차마을'], '조식: 호텔식 / 중식: 현지식 / 석식: 현지식', '그라나다 4성급'],
				['그라나다', '알함브라 궁전', ['알함브라 궁전', '알바이신 지구'], '조식: 호텔식 / 중식: 현지식 / 석식: 한식', '코스타델솔 4성급'],
				['미하스·론다·세비야', '하얀 마을과 협곡 도시', ['미하스', '론다 누에보 다리', '세비야 대성당', '스페인 광장'], '조식: 호텔식 / 중식: 현지식 / 석식: 현지식', '세비야 4성급'],
				['세비야·마드리드', '마드리드 공항 출발', ['마드리드 바라하스 공항'], '조식: 호텔식 / 중식: 현지식', '기내 숙박'],
				['도하·인천', '도하 경유 → 인천 도착', ['인천국제공항 도착 후 해산'], '기내식', '']
			])
		},
		{
			id: 1006, kind: 'tour', b_uid: 70, m_uid: 7003, region: '동남아', country: '태국', countryCode: 'TA', city: '푸켓',
			title: '[바다 속 체험] 푸켓5일 #스쿠버다이빙 체험 투어 5일', evTitle: '푸켓 스쿠버다이빙 5일',
			summary: '초특급 리조트 투숙\n라차섬 스킨스쿠버체험 투어\n바닷속 기념 사진\n푸껫 유명 맛집 투어',
			thumb: IMG + '20210419_52B7C6C3C0B7492C.jpg', price: 1716000, days: 5, nights: 3,
			trans: '항공', flight: { airline: 'KE', go: 'KE637', back: 'KE638' },
			recommend: { tab: 70, order: 2 }, tags: ['스쿠버다이빙', '초특급 리조트'], type: 'abroad',
			deps: deps({ start: 8, every: 5, count: 10, days: 5, price: 1716000, seats: 20, sold: [14, 6, 19], confirm: [0], min: 6 }),
			itinerary: plan([
				['인천·푸켓', '인천 출발 → 푸켓 도착', ['푸켓 국제공항', '리조트 체크인'], '석식: 기내식', '푸켓 초특급 리조트'],
				['라차섬', '라차섬 스킨스쿠버 체험', ['라차섬', '스쿠버다이빙 체험', '바닷속 기념 사진'], '조식: 호텔식 / 중식: 씨푸드 / 석식: 수끼', '푸켓 초특급 리조트'],
				['피피섬', '스피드보트 피피섬 투어', ['피피섬', '마야베이', '몽키비치'], '조식: 호텔식 / 중식: 현지식 / 석식: 한식', '푸켓 초특급 리조트'],
				['푸켓', '빠통 비치 자유시간 → 공항', ['푸켓 올드타운', '빠통 비치'], '조식: 호텔식 / 중식: 맛집투어 / 석식: 현지식', '기내 숙박'],
				['인천', '인천 도착', ['인천국제공항 도착 후 해산'], '', '']
			])
		},
		{
			id: 1007, kind: 'tour', b_uid: 70, m_uid: 7006, region: '동남아', country: '몰디브', countryCode: 'MV', city: '말레',
			title: '[몰디브_SQ] 그랜드파크 코디파루_오션풀빌라 (HB)', evTitle: '몰디브 그랜드파크 코디파루 6일',
			summary: '★ 스피드보트 | 식사플랜 : HB I★\n\n2017년 7월 그랜드오픈한 그랜드파크 코디파루 리조트',
			thumb: IMG + '20180906_2E3A805364876CDF.jpg', price: 2859200, days: 6, nights: 4,
			trans: '항공', flight: { airline: 'SQ', go: 'SQ607', back: 'SQ602' },
			recommend: { tab: 70, order: 3 }, tags: ['허니문', '오션풀빌라'], type: 'abroad',
			deps: deps({ start: 10, every: 6, count: 8, days: 6, price: 2859200, seats: 12, sold: [10, 2], confirm: [0], min: 2, weekend: false }),
			itinerary: plan([
				['인천·싱가포르', '인천 출발 → 싱가포르 경유', ['인천국제공항 집결'], '기내식', '기내 숙박'],
				['말레', '스피드보트로 리조트 이동', ['말레 국제공항', '그랜드파크 코디파루 체크인'], '석식: 리조트 (HB)', '오션풀빌라'],
				['코디파루', '리조트 자유일정', ['하우스리프 스노클링', '스파 (선택)'], '조식·석식: 리조트 (HB)', '오션풀빌라'],
				['코디파루', '리조트 자유일정', ['선셋 크루즈 (선택)'], '조식·석식: 리조트 (HB)', '오션풀빌라'],
				['말레·싱가포르', '말레 출발 → 싱가포르 경유', ['말레 국제공항'], '조식: 리조트', '기내 숙박'],
				['인천', '인천 도착', ['인천국제공항 도착 후 해산'], '', '']
			])
		},
		{
			id: 1008, kind: 'tour', b_uid: 70, m_uid: 7003, region: '동남아', country: '태국', countryCode: 'TA', city: '파타야',
			title: '럭셔리in파타야 [초특급 MYTT.미트호텔] 방콕&파타야 5일', evTitle: '방콕&파타야 5일',
			summary: '관광만으론 부족한 노랑족에게.. 파타야에 럭셔리를 더한 신상품을 소개합니다.',
			thumb: IMG + '20221206_62D65C36F5438AB0.jpg', price: 1890000, days: 5, nights: 3,
			trans: '항공', flight: { airline: 'TG', go: 'TG659', back: 'TG658' },
			recommend: { tab: 70, order: 4 }, tags: ['초특급 호텔'], type: 'abroad',
			deps: deps({ start: 5, every: 7, count: 8, days: 5, price: 1890000, seats: 20, sold: [16, 3], confirm: [0], min: 6 }),
			itinerary: plan([
				['인천·방콕', '인천 출발 → 방콕 도착', ['수완나품 공항', '호텔 체크인'], '석식: 기내식', '방콕 5성급'],
				['방콕·파타야', '왕궁과 리버보트', ['왕궁', '왓포', '짜오프라야 리버보트'], '조식: 호텔식 / 중식: 현지식 / 석식: 씨푸드', '파타야 미트호텔'],
				['파타야', '산호섬 해양스포츠', ['산호섬', '미트호텔 인피니티풀'], '조식: 호텔식 / 중식: 현지식 / 석식: 한식', '파타야 미트호텔'],
				['파타야·방콕', '농눅빌리지 → 야간 출발', ['농눅빌리지', '알카자쇼'], '조식: 호텔식 / 중식: 현지식 / 석식: 수끼', '기내 숙박'],
				['인천', '인천 도착', ['인천국제공항 도착 후 해산'], '', '']
			])
		},
		{
			id: 1009, kind: 'tour', b_uid: 70, m_uid: 7001, region: '일본', country: '일본', countryCode: 'JP', city: '유후인',
			title: '[유후인] 와잔호료칸 3일', evTitle: '유후인 와잔호료칸 3일',
			summary: '전객실 실내탕과 노천탕을 갖추고 있는 별채타입의 료칸.\n자그마한 강과 나무들에 둘러싸인 조용한 휴식',
			thumb: IMG + '20180907_D61D1CDEDFD2E07C.jpg', price: 900000, days: 3, nights: 2,
			trans: '항공', flight: { airline: 'KE', go: 'KE787', back: 'KE788' },
			monthly: { tour: 2 }, tags: ['료칸', '온천'], type: 'abroad',
			deps: deps({ start: 7, every: 3, count: 12, days: 3, price: 900000, seats: 16, sold: [12, 4, 0, 15], confirm: [0], min: 4 }),
			itinerary: plan([
				['인천·후쿠오카·유후인', '후쿠오카 도착 → 유후인', ['긴린코 호수', '유노쓰보 거리'], '석식: 료칸 가이세키', '와잔호료칸'],
				['벳푸·다자이후', '지옥온천 순례', ['벳푸 지옥온천', '다자이후 텐만구'], '조식: 료칸 / 중식: 현지식 / 석식: 료칸 가이세키', '와잔호료칸'],
				['후쿠오카·인천', '후쿠오카 쇼핑 → 인천 도착', ['캐널시티 하카타'], '조식: 료칸', '']
			])
		},

		/* ===== 섬여행 ===== */
		{
			id: 1010, kind: 'tour', b_uid: 86, m_uid: 8603, region: '국내', country: '대한민국', countryCode: 'KO', city: '제주',
			title: '[김포출발](이벤트특가)제주도 완전정복 3일', evTitle: '제주도 완전정복 3일',
			summary: '★ 좌석확보된 금액으로 스페인 완전정복하기~!\n★ 전 구간 이동수단 포함~!\n★ 이벤트 특가',
			thumb: IMG + '20180910_16F67F29B4493A87.jpg', price: 250000, days: 3, nights: 2,
			trans: '항공', flight: { airline: 'OZ', go: 'OZ8915', back: 'OZ8936' },
			recommend: { tab: 86, order: 1 }, tags: ['이벤트특가'], type: 'domestic',
			deps: deps({ start: 5, every: 4, count: 10, days: 3, price: 250000, seats: 30, sold: [20, 8], confirm: [0] }),
			itinerary: plan([
				['김포·제주', '김포 출발 → 제주 도착', ['용두암', '이호테우 해변'], '중식: 고기국수 / 석식: 흑돼지', '제주 시내 호텔'],
				['제주 동부', '성산일출봉과 우도', ['성산일출봉', '우도', '섭지코지'], '조식: 호텔식 / 중식: 해물라면 / 석식: 한정식', '제주 시내 호텔'],
				['제주 서부·김포', '1100고지 → 김포 도착', ['한라산 1100고지', '오설록 티뮤지엄'], '조식: 호텔식 / 중식: 갈치조림', '']
			])
		},
		{
			id: 1011, kind: 'tour', b_uid: 86, m_uid: 8603, region: '국내', country: '대한민국', countryCode: 'KO', city: '제주',
			title: '[1박3일] 첫번째 자유여행으로 제주도 완전정복 >_<', evTitle: '제주 자유여행 1박3일',
			summary: '★호주여행의 종결자,작은 유럽★ 세계3대미항 "시드니",호주속의　작은유럽 "멜버른" 같은 제주 자유여행',
			thumb: IMG + '20180910_6AF663B40ED685B8.jpg', price: null, days: 3, nights: 1,
			trans: '항공', flight: { airline: 'LJ', go: 'LJ331', back: 'LJ318' },
			recommend: { tab: 86, order: 2 }, tags: ['자유여행', '렌터카 포함'], type: 'domestic',
			deps: deps({ start: 6, every: 7, count: 6, days: 3, price: null, seats: 20 }),
			itinerary: plan([
				['김포·제주', '김포 야간 출발 → 제주 도착', ['제주공항 렌터카 인수'], '', '제주 시내 호텔'],
				['제주', '자유일정', ['추천: 애월 카페거리', '협재해변', '새별오름'], '조식: 호텔식', ''],
				['제주·김포', '자유일정 → 김포 도착', ['제주공항 렌터카 반납'], '', '']
			])
		},
		{
			id: 1012, kind: 'tour', b_uid: 86, m_uid: 8601, region: '국내', country: '대한민국', countryCode: 'KO', city: '홍도',
			title: '홍도/흑산도 1박2일', evTitle: '홍도/흑산도 1박2일',
			summary: '가보고 싶은 섬, 홍도/흑산도 1박2일여행',
			thumb: IMG + '20180910_849EC78AE2D25ABF.jpg', price: 389000, days: 2, nights: 1,
			trans: '쾌속선', flight: { airline: '쾌속선', go: '07:50', back: '14:30' },
			recommend: { tab: 86, order: 3 }, tags: ['섬여행'], type: 'domestic',
			deps: deps({ start: 8, every: 7, count: 6, days: 2, price: 389000, seats: 30, sold: [9], confirm: [0] }),
			itinerary: plan([
				['목포·흑산도·홍도', '목포 출발 → 흑산도 → 홍도', ['흑산도 일주', '상라산 전망대', '홍도 깃대봉'], '중식: 홍어 정식 / 석식: 해산물', '홍도 펜션'],
				['홍도·목포', '홍도 유람선 일주 → 목포', ['남문바위', '독립문바위', '탑섬'], '조식: 백반 / 중식: 전복죽', '']
			])
		},
		{
			id: 1013, kind: 'tour', b_uid: 86, m_uid: 8602, region: '국내', country: '대한민국', countryCode: 'KO', city: '울릉도',
			title: '[포항출발] 울릉도 2박3일', evTitle: '울릉도 2박3일',
			summary: '아름다운 신비의 섬, 울릉도로 여러분을 초대합니다.',
			thumb: IMG + '20180910_9B07E2236F9899BF.jpg', price: 299000, days: 3, nights: 2,
			trans: '여객선', flight: { airline: '여객선', go: '09:50', back: '15:30' },
			recommend: { tab: 86, order: 4 }, tags: ['독도 입도'], type: 'domestic',
			deps: deps({ start: 11, every: 7, count: 6, days: 3, price: 299000, seats: 30, sold: [22, 4], confirm: [0] }),
			itinerary: plan([
				['포항·울릉도', '포항 출발 → 도동항', ['행남해안산책로', '독도전망대 케이블카'], '중식: 따개비밥 / 석식: 약소불고기', '울릉 호텔'],
				['울릉도', '울릉도 내륙관광', ['나리분지', '태하향목 관광모노레일', '독도 입도 (기상 시)'], '조식: 호텔식 / 중식: 산채비빔밥 / 석식: 오징어회', '울릉 호텔'],
				['울릉도·포항', '저동항 → 포항', ['저동항', '봉래폭포'], '조식: 호텔식 / 중식: 홍합밥', '']
			])
		},

		/* ===== 데이투어 ===== */
		{
			id: 1014, kind: 'tour', b_uid: 2, m_uid: 201, region: '유럽', country: '프랑스', countryCode: 'FR', city: '파리',
			title: '[단체투어] 파리 루브르 박물관+시내+야경 - 가이드투어', evTitle: '파리 루브르+시내+야경 가이드투어',
			summary: '세계 3대 박물관이자, 다빈치 코드의 무대가 된 루브르 박물관 & 파리의 하이라이트를 하루에',
			thumb: IMG + '20210326_A8461EB2DAB9EB50.jpg', price: 55900, days: 1, nights: 0, childRate: 0.7, infantRate: 0,
			trans: '도보', flight: { airline: '집결', go: '09:00', back: '21:30' },
			recommend: { tab: 2, order: 1 }, tags: ['한국어 가이드'], type: 'day',
			deps: deps({ start: 2, every: 2, count: 14, days: 1, price: 55900, seats: 15, sold: [11, 4, 15], confirm: [0, 1], close: [2], childRate: 0.7, infantRate: 0, weekend: false, min: 4 }),
			itinerary: plan([
				['파리', '루브르 → 시테섬 → 에펠탑 야경', ['루브르 박물관 (모나리자·밀로의 비너스)', '시테섬 · 노트르담', '샹젤리제 거리', '에펠탑 야경 · 세느강'], '', '']
			])
		},
		{
			id: 1015, kind: 'tour', b_uid: 2, m_uid: 202, region: '국내', country: '대한민국', countryCode: 'KO', city: '부산',
			title: '[대구출발] 부산 당일 버스투어', evTitle: '부산 당일 버스투어',
			summary: '당일투어로부산의 관광명소만을 엄선하여 기획한 실속형 국내여행!',
			thumb: IMG + '20210326_9407E83024257DAF.jpg', price: null, days: 1, nights: 0,
			trans: '전용버스', flight: { airline: '전용버스', go: '07:30', back: '19:00' },
			recommend: { tab: 2, order: 2 }, monthly: { tour: 3 }, tags: ['당일여행'], type: 'day',
			deps: deps({ start: 3, every: 3, count: 10, days: 1, price: null, seats: 40 }),
			itinerary: plan([
				['대구·부산', '대구 출발 → 부산 명소 → 대구 도착', ['해동용궁사', '해운대', '감천문화마을', '자갈치시장'], '중식: 밀면', '']
			])
		},
		{
			id: 1016, kind: 'tour', b_uid: 2, m_uid: 202, region: '국내', country: '대한민국', countryCode: 'KO', city: '부산',
			title: '[단독투어] 부산 시티투어', evTitle: '[단독투어] 부산 시티투어',
			summary: '당일투어로부산의 관광명소만을 엄선하여 기획한 실속형 국내여행!',
			thumb: IMG + '20221206_78E0110904E9FBE0.jpg', price: 60000, days: 1, nights: 0, childRate: 1, infantRate: 0,
			trans: '단독차량', flight: { airline: '픽업', go: '09:00', back: '18:00' },
			recommend: { tab: 2, order: 3 }, tags: ['단독차량'], type: 'day',
			deps: deps({ start: 1, every: 1, count: 20, days: 1, price: 60000, seats: 8, childRate: 1, infantRate: 0, weekend: false, min: 1 }),
			itinerary: plan([
				['부산', '호텔 픽업 → 부산 시티투어 → 호텔 샌딩', ['흰여울문화마을', '태종대', '광안리'], '', '']
			])
		},

		/* ===== 패스/티켓 ===== */
		{
			id: 1017, kind: 'tour', b_uid: 108, m_uid: 10801, region: '국내', country: '대한민국', countryCode: 'KO', city: '서울',
			title: '쿵푸팬더 브로드웨이 뮤지컬', evTitle: '쿵푸팬더 뮤지컬 관람권',
			summary: '10%',
			thumb: IMG + '20220729_77E1EBBB9CD42849.png', price: 29900, days: 1, nights: 0, childRate: 1, infantRate: 0,
			trans: '공연', flight: { airline: '공연', go: '14:00', back: '16:00' },
			recommend: { tab: 108, order: 1 }, tags: ['10% 할인'], type: 'ticket',
			deps: deps({ start: 2, every: 2, count: 12, days: 1, price: 29900, seats: 60, sold: [41, 20], confirm: [0, 1], childRate: 1, infantRate: 0, weekend: false, min: 1 }),
			itinerary: plan([
				['서울', '공연 관람', ['공연장 입장 (공연 30분 전)', '러닝타임 100분 (인터미션 15분)'], '', '']
			])
		},

		/* ===== 호텔/리조트 ===== */
		hotel(1018, 6902, '호주', 'AU', '시드니', '메리톤 스위트 캠벨 스트리트', '20221130_05B1C240EDB38D3F.jpg', null, 'star04.png',
			'아파트 인근에 즐비한 다양한 레스토랑과 카페를 이용할 수 있어 더욱 편리합니다.', '8 Campbell St, Sydney NSW', { tab: 69, order: 1 }, null,
			[['원 베드룸 스위트', 238000], ['투 베드룸 스위트', 342000]]),
		hotel(1019, 6901, '대한민국', 'KO', '부산', '이비스 앰배서더 부산 해운대', '20221130_08D3B0AED3E5408A.jpg', 150000, 'star03.png',
			'이비스 앰배서더 부산 해운대 - <3성급:한국관광공사 인증> - 해운대에 위치한 비즈니스 호텔', '부산 해운대구 해운대로 696', { tab: 69, order: 2 }, null,
			[['스탠다드 더블', 150000], ['스탠다드 트윈', 165000], ['디럭스 오션뷰', 198000]]),
		hotel(1020, 6901, '대한민국', 'KO', '제주', '씨에스 호텔 앤 리조트', '20221130_04CFC8ABFD9503DF.jpg', null, 'star03.png',
			' 인기드라마 시크릿가든, 미안하다 사랑한다, 꽃보다남자, 궁 등의 드라마 촬영장소로 유명한 리조트', '제주 서귀포시 중문관광로 198', { tab: 69, order: 3 }, { hotel: 3 },
			[['초가 스위트', 320000], ['오션 디럭스', 260000]]),
		hotel(1021, 6901, '대한민국', 'KO', '제주', '제주 더 원', '20221206_11EA4729E248F8FC.jpg', null, 'star04.png',
			'더 원 호텔은 공항 5분거리의 연동 중심가에 위치한 특급 비즈니스형 휴양호텔입니다.', '제주 제주시 연동 263-15', { tab: 69, order: 4 }, null,
			[['슈페리어 더블', 129000], ['디럭스 트윈', 149000]]),
		hotel(1022, 6902, '이탈리아', 'IT', '피렌체', '포 시즌스 호텔', '20221130_30A24394490B3E56.jpg', null, 'star4_5.png',
			'게라르데스카 정원(Giardino della Gherardesca) 옆에 자리 잡고 있으며, 다양한 럭셔리 시설을 갖춘 호텔', 'Borgo Pinti 99, Firenze', null, { hotel: 1 },
			[['슈페리어 룸', 980000], ['디럭스 가든뷰', 1240000]]),
		hotel(1023, 6901, '대한민국', 'KO', '제주', '스위트호텔', '20221130_6DF358BCD5B8FBDB.jpg', null, 'star4_5.png',
			'녹음의 향과 청정함의 아름다움, 눈을 뜨는 곳마다, 손에 닿을 듯 수려한 경관 하나하나가 그림인 곳', '제주 서귀포시 중문관광로72번길 15', null, { hotel: 2 },
			[['디럭스 더블', 189000], ['패밀리 트윈', 219000]])
	];

	function hotel(id, m, country, code, city, title, img, price, star, summary, address, rec, monthly, rooms) {
		return {
			id: id, kind: 'hotel', b_uid: 69, m_uid: m, region: code === 'KO' ? '국내' : '해외', country: country, countryCode: code, city: city,
			title: title, evTitle: title, summary: summary, thumb: IMG + img, price: price, star: star, address: address,
			recommend: rec || undefined, monthly: monthly || undefined, type: 'hotel', days: 2, nights: 1,
			checkin: '15:00', checkout: '11:00',
			rooms: rooms.map(function (r, i) { return { code: 'RM' + (i + 1), name: r[0], price: r[1], max: /패밀리|투 베드룸/.test(r[0]) ? 4 : 2 }; }),
			facilities: ['무료 Wi-Fi', '피트니스', '레스토랑', '주차'],
			deps: []
		};
	}

	// 상품 공통 값 채우기
	TOURS.forEach(function (t) {
		var c = CATE.filter(function (x) { return x.uid === t.b_uid; })[0];
		var m = c.children.filter(function (x) { return x.uid === t.m_uid; })[0];
		t.cate1 = c.name;
		t.cate2 = m ? m.name : '';
		t.cate = [c.name, m ? m.name : '', t.country].join('>');   // TMS 카테고리 문자열
		t.code = (t.kind === 'hotel' ? 'H' : 'G') + t.id;
		if (t.kind !== 'hotel') {
			t.includes = INC[t.type];
			t.excludes = EXC[t.type];
			t.notice = NOTICE[t.type];
		}
	});

	MockDB.define('touroffice.tours', TOURS, { version: '1' });

	/* ---------- 도우미 ---------- */
	function findCate(uid) {
		uid = Number(uid);
		for (var i = 0; i < CATE.length; i++) {
			if (CATE[i].uid === uid) return { b: CATE[i], m: null };
			for (var j = 0; j < CATE[i].children.length; j++) if (CATE[i].children[j].uid === uid) return { b: CATE[i], m: CATE[i].children[j] };
		}
		return null;
	}

	w.TourOfficeData = {
		cate: CATE,
		findCate: findCate,
		/** 'b_uid' 이름 */
		cateName: function (uid) { var f = findCate(uid); return f ? (f.m || f.b).name : ''; },
		/** 지역(검색 레이어) — kind: 'tour' | 'hotel' → [{ code, name, cities:[...] }] */
		areas: function (kind) {
			var map = {}, order = [];
			MockDB.all('touroffice.tours').forEach(function (t) {
				if ((kind === 'hotel') !== (t.kind === 'hotel')) return;
				if (!map[t.region]) { map[t.region] = []; order.push(t.region); }
				if (map[t.region].indexOf(t.city) < 0) map[t.region].push(t.city);
			});
			return order.map(function (r) { return { code: r, name: r, cities: map[r] }; });
		},
		/** 출발일 정보 (날짜로 찾기) */
		dep: function (tour, date) {
			var d = (tour.deps || []).filter(function (x) { return x.date === date; });
			return d[0] || null;
		}
	};
})(window);

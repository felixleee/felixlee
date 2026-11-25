/*
 * MyCultureis 가상 데이터 — 카테고리 · 클래스 · 금주의 Pick · 후기 · 예약
 *
 *  - 카테고리 id 는 사이트맵에 원래 걸려 있던 b_uid_s 값을 그대로 쓴다 (한국문화 100~105).
 *    세계문화(대륙)는 원래 링크가 비어 있어서 110~116 을 새로 붙였다.
 *  - 이미지 경로는 myculture/ 기준 (화면에서는 MC.img() 로 '../' 를 붙여 쓴다). 모두 폴더에 이미 있는 파일.
 *  - 인명·연락처는 전부 가상이다 (전화 010-0000-xxxx, 이메일 @example.com).
 *  - 시간 슬롯은 따로 저장하지 않는다. 요일(days)·시간(times)·정원(capacity)으로 날짜별 슬롯을 만들고,
 *    잔여 인원 = 정원 − (기존 예약분: 날짜·시간으로 정해지는 고정값) − (myculture.bookings 의 예약확정 인원)
 *    → 예약하면 그 슬롯의 잔여 인원이 줄고, 취소하면 돌아온다. (js/demo/common.js 의 MC.seats)
 */
(function () {
	'use strict';

	/* ---------- 카테고리 ---------- */
	MockDB.define('myculture.categories', [
		{ id: '110', grp: 'global', order: 1, tile: true,  name: 'Asia',            ko: '아시아',            img: 'image/main/Asia_0804.jpg',            desc: '태국·베트남·인도·대만, 향신료와 길거리 음식의 대륙' },
		{ id: '111', grp: 'global', order: 2, tile: true,  name: 'America/Oceania', ko: '아메리카·오세아니아', img: 'image/main/America_Oceania_0804.jpg', desc: '멕시코 타코부터 페루 세비체, 호주식 브런치까지' },
		{ id: '112', grp: 'global', order: 3, tile: true,  name: 'Africa',          ko: '아프리카',          img: 'image/main/Africa.jpg',               desc: '모로코 타진과 에티오피아 커피 세리머니' },
		{ id: '113', grp: 'global', order: 4, tile: true,  name: 'Europe',          ko: '유럽',              img: 'image/main/Europe_0804.jpg',          desc: '이탈리아 생면 파스타, 스페인 파에야, 프랑스 비스트로' },
		{ id: '114', grp: 'global', order: 5, tile: true,  name: 'Premium',         ko: '프리미엄',          img: 'image/main/premium.jpg',              desc: '셰프와 함께하는 코스 요리·와인 페어링' },
		{ id: '116', grp: 'global', order: 6, tile: false, name: 'Online Class',    ko: '온라인 클래스',     img: 'main/p_main1.jpg',              desc: '밀키트를 받아 집에서 함께 만드는 실시간 랜선 클래스' },
		{ id: '115', grp: 'global', order: 7, tile: false, name: 'Others',          ko: '기타 세계문화',     img: 'image/main/food.jpg',                 desc: '튀르키예·중동 등 더 넓은 세계의 맛' },
		{ id: '105', grp: 'korean', order: 11, tile: true, name: '한국무용/국악',    ko: '한국무용/국악',     img: 'image/main/culture_bak_06.jpg',       desc: '부채춤과 사물놀이로 만나는 우리 가락' },
		{ id: '100', grp: 'korean', order: 12, tile: true, name: '전통무예',         ko: '전통무예',          img: 'image/main/culture_bak_02.jpg',       desc: '택견과 국궁, 몸으로 배우는 전통' },
		{ id: '102', grp: 'korean', order: 13, tile: true, name: '한식',             ko: '한식',              img: 'image/main/culture_bak_04.jpg',       desc: '떡 만들기부터 비빔밥 한 상까지' },
		{ id: '101', grp: 'korean', order: 14, tile: true, name: '전통공예',         ko: '전통공예',          img: 'image/main/culture_bak_01.jpg',       desc: '한지·매듭·도자기, 손으로 만드는 우리 공예' },
		{ id: '104', grp: 'korean', order: 15, tile: true, name: '서화',             ko: '서화',              img: 'image/main/culture_bak_05.jpg',       desc: '민화와 서예, 붓으로 그리는 한국의 멋' },
		{ id: '103', grp: 'korean', order: 16, tile: true, name: '기타',             ko: '기타',              img: 'image/main/culture_bak_03.jpg',       desc: '한복 스냅과 전통 다도' }
	], { version: '1' });

	/* ---------- 장소 (가상 주소) ---------- */
	var P = {
		hongdae:  { name: '마이컬처 홍대 쿠킹스튜디오', addr: '서울 마포구 양화로 00길 12, 3층 (가상 주소)', way: '2호선 홍대입구역 9번 출구 도보 5분' },
		itaewon:  { name: '마이컬처 이태원 키친',       addr: '서울 용산구 이태원로 00길 8, 2층 (가상 주소)', way: '6호선 이태원역 1번 출구 도보 4분' },
		seongsu:  { name: '마이컬처 성수 아틀리에',     addr: '서울 성동구 연무장길 00, 4층 (가상 주소)',     way: '2호선 성수역 3번 출구 도보 6분' },
		bukchon:  { name: '마이컬처 북촌 한옥공방',     addr: '서울 종로구 북촌로 00길 21 (가상 주소)',       way: '3호선 안국역 2번 출구 도보 8분' },
		namsan:   { name: '마이컬처 남산 전통무예 도장', addr: '서울 중구 소파로 000 (가상 주소)',            way: '4호선 명동역 3번 출구 마을버스 02번' },
		online:   { name: '온라인 (Zoom 실시간)',      addr: '예약 확정 후 접속 링크를 문자로 보내 드려요',   way: '밀키트는 클래스 2일 전까지 도착해요' }
	};

	var APRON = '앞치마 (없으면 대여해 드려요)';
	var COOK_INC = ['재료비 일체', '레시피 카드', '완성 요리 시식 · 포장 용기'];

	/* ---------- 클래스 30개 ----------
	 * days: 운영 요일 (0=일 ~ 6=토), times: 시작 시각, duration: 분, joined: 누적 참여 인원(인기순 기준)
	 */
	var classes = [
		{ id: 1, cate: '110', country: '베트남', title: '베트남 하노이 쌀국수 & 분짜 쿠킹 클래스', thumb: 'image/main/food.jpg', images: ['image/main/food.jpg', 'main/sub1.jpg', 'image/main/Asia_0804.jpg'],
			summary: '하노이 출신 강사와 사골 육수 쌀국수, 숯불 향 분짜를 처음부터 끝까지 만들어요.',
			intro: ['하노이 골목 식당에서 먹던 바로 그 맛! 육수를 우리는 향신료 볶기부터 고기 완자 굽기, 느억짬 소스 비율까지 강사님의 가족 레시피를 그대로 배워요.', '완성한 쌀국수와 분짜는 함께 둘러앉아 시식하고, 남은 소스는 병에 담아 가져갈 수 있어요.'],
			duration: 150, capacity: 10, price: 59000, rating: 4.9, reviewCount: 214, joined: 1820, level: '입문', pick: true, tags: ['금주의 Pick', '외국인 강사'],
			instructor: { name: '응우옌 티 마이', from: '베트남 하노이', career: '한국 생활 9년 차 · 前 하노이 쿠킹스쿨 강사', intro: '"엄마가 끓여 주던 쌀국수를 한국 친구들에게 알려 주고 싶어 시작했어요. 한국어 수업이라 편하게 질문하세요!"' },
			place: P.hongdae, materials: [APRON, '머리끈'], includes: COOK_INC,
			curriculum: [{ min: 15, title: '인사 & 베트남 식문화 이야기', desc: '하노이 아침 풍경과 쌀국수의 역사' }, { min: 50, title: '쌀국수 육수 · 고명 만들기', desc: '향신료 볶기, 육수 간 맞추기' }, { min: 50, title: '분짜 고기 완자 · 느억짬 소스', desc: '숯불 향 내는 팬 굽기 요령' }, { min: 35, title: '플레이팅 & 함께 시식', desc: '소스는 병에 담아 포장' }],
			days: [2, 4, 6, 0], times: ['11:00', '15:30'] },
		{ id: 2, cate: '110', country: '태국', title: '태국 그린커리 & 똠양꿍 쿠킹 클래스', thumb: 'main/p_main1.jpg', images: ['main/p_main1.jpg', 'main/sub2.jpg', 'image/main/Asia.jpg'],
			summary: '레스토랑에서 먹던 똠양꿍을 내가 직접! 커리 페이스트부터 손으로 빻아 만들어요.',
			intro: ['레몬그라스·갈랑갈·카피르 라임 잎으로 커리 페이스트를 절구에 직접 빻아 그린커리를 만들고, 새우 듬뿍 똠양꿍까지 완성해요.', '맵기는 개인 취향에 맞춰 조절할 수 있고, 한국 마트에서 재료 고르는 법도 알려 드려요.'],
			duration: 150, capacity: 10, price: 62000, rating: 4.8, reviewCount: 187, joined: 1640, level: '입문', pick: true, tags: ['금주의 Pick', '외국인 강사'],
			instructor: { name: '솜차이 분미', from: '태국 방콕', career: '방콕 호텔 레스토랑 출신 · 한국 거주 7년', intro: '"태국 음식은 맵고, 시고, 달고, 짠 맛의 균형이에요. 그 균형을 직접 맞춰 보는 재미를 알려 드릴게요."' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 20, title: '태국 허브 & 향신료 알아보기', desc: '레몬그라스·갈랑갈 향 맡아 보기' }, { min: 45, title: '그린커리 페이스트 빻기', desc: '절구로 직접 빻는 페이스트' }, { min: 50, title: '그린커리 · 똠양꿍 조리', desc: '맵기 조절 요령' }, { min: 35, title: '시식 & 레시피 정리', desc: '' }],
			days: [1, 3, 5, 6], times: ['11:00', '16:00'] },
		{ id: 3, cate: '110', country: '인도', title: '인도 버터치킨 커리 & 갈릭 난', thumb: 'image/main/Asia_0804.jpg', images: ['image/main/Asia_0804.jpg', 'image/main/Asia.jpg'],
			summary: '향신료 블렌딩으로 만드는 진한 버터치킨 커리와 팬에 굽는 쫄깃한 갈릭 난.',
			intro: ['가람 마살라를 직접 섞어 보고, 요거트에 재운 닭고기로 부드러운 버터치킨 커리를 만들어요.', '오븐 없이 프라이팬으로 굽는 갈릭 난 반죽법도 배워 집에서도 쉽게 따라 할 수 있어요.'],
			duration: 140, capacity: 8, price: 55000, rating: 4.7, reviewCount: 96, joined: 980, level: '입문', tags: ['외국인 강사'],
			instructor: { name: '라훌 샤르마', from: '인도 뉴델리', career: '인도 가정식 연구가 · 한국 거주 6년', intro: '"향신료는 어렵지 않아요. 순서만 알면 집에서도 인도 식당 맛이 나요."' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 20, title: '향신료 블렌딩', desc: '나만의 가람 마살라' }, { min: 60, title: '버터치킨 커리', desc: '요거트 마리네이드 · 토마토 그레이비' }, { min: 40, title: '갈릭 난 반죽 · 굽기', desc: '' }, { min: 20, title: '시식', desc: '' }],
			days: [2, 4, 6], times: ['12:00', '17:00'] },
		{ id: 4, cate: '110', country: '대만', title: '대만 야시장 간식 — 지파이 & 흑당 버블티', thumb: 'image/main/Asia.jpg', images: ['image/main/Asia.jpg', 'image/main/food.jpg'],
			summary: '타이베이 야시장 대표 간식 지파이(대왕 닭튀김)와 흑당 타피오카 버블티 만들기.',
			intro: ['오향 가루로 밑간한 닭가슴살을 넓게 펴 바삭하게 튀겨 내는 지파이, 흑당을 졸여 직접 만드는 타피오카 펄까지!', '야시장 문화와 대만 여행 꿀팁은 덤이에요.'],
			duration: 120, capacity: 12, price: 45000, rating: 4.6, reviewCount: 73, joined: 760, level: '입문', tags: ['외국인 강사', '디저트'],
			instructor: { name: '린 위팅', from: '대만 타이베이', career: '대만 관광청 서포터즈 출신 · 한국 거주 5년', intro: '"야시장 음식은 함께 만들고 바로 먹어야 제맛이에요!"' },
			place: P.hongdae, materials: [APRON], includes: ['재료비 일체', '버블티 컵 · 빨대', '레시피 카드'],
			curriculum: [{ min: 15, title: '대만 야시장 이야기', desc: '' }, { min: 50, title: '지파이 밑간 · 튀기기', desc: '' }, { min: 35, title: '흑당 타피오카 펄 · 버블티', desc: '' }, { min: 20, title: '시식 & 포장', desc: '' }],
			days: [3, 5, 6, 0], times: ['13:00', '18:30'] },
		{ id: 5, cate: '111', country: '멕시코', title: '멕시코 타코 & 과카몰리 파티', thumb: 'image/main/America_Oceania_0804.jpg', images: ['image/main/America_Oceania_0804.jpg', 'main/p_main2.jpg'],
			summary: '옥수수 토르티야를 직접 눌러 굽고, 알 파스토르 타코와 과카몰리·살사를 만들어요.',
			intro: ['마사 반죽으로 토르티야를 직접 눌러 구워 보고, 파인애플을 곁들인 알 파스토르 돼지고기 타코를 만들어요.', '아보카도를 으깨 만드는 과카몰리와 살사 로하 두 가지 소스로 나만의 타코 플레이트를 완성해요.'],
			duration: 140, capacity: 12, price: 52000, rating: 4.8, reviewCount: 158, joined: 1430, level: '입문', tags: ['외국인 강사', '파티'],
			instructor: { name: '카를로스 멘데스', from: '멕시코 과달라하라', career: '타케리아 운영 경력 · 한국 거주 8년', intro: '"타코는 혼자 먹는 음식이 아니에요. 같이 싸 먹으면서 친구가 되는 음식이죠!"' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 15, title: '멕시코 식문화 & 칠리 이야기', desc: '' }, { min: 40, title: '토르티야 반죽 · 굽기', desc: '' }, { min: 50, title: '알 파스토르 · 과카몰리 · 살사', desc: '' }, { min: 35, title: '타코 파티 & 시식', desc: '' }],
			days: [2, 5, 6, 0], times: ['12:00', '17:30'] },
		{ id: 6, cate: '111', country: '페루', title: '페루 세비체 & 퀴노아 샐러드', thumb: 'main/p_main2.jpg', images: ['main/p_main2.jpg', 'image/main/America_Oceania_0804.jpg'],
			summary: '라임에 익히는 신선한 흰살생선 세비체와 고소한 퀴노아 샐러드로 가볍게 즐기는 남미 요리.',
			intro: ['불을 쓰지 않고 라임즙으로 생선을 익히는 페루 국민 요리 세비체를 배워요. 레체 데 티그레 소스 비율이 맛의 핵심!', '함께 만드는 퀴노아 샐러드는 도시락 메뉴로도 좋아요.'],
			duration: 110, capacity: 8, price: 49000, rating: 4.7, reviewCount: 61, joined: 540, level: '입문', tags: ['외국인 강사', '건강식'],
			instructor: { name: '루시아 키스페', from: '페루 리마', career: '리마 요리학교 졸업 · 한국 거주 4년', intro: '"페루는 미식의 나라예요. 상큼한 세비체로 그 매력을 느껴 보세요."' },
			place: P.seongsu, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 15, title: '페루 요리와 감자 이야기', desc: '' }, { min: 45, title: '세비체 · 레체 데 티그레', desc: '' }, { min: 30, title: '퀴노아 샐러드', desc: '' }, { min: 20, title: '시식', desc: '' }],
			days: [3, 6], times: ['11:00', '15:00'] },
		{ id: 7, cate: '111', country: '호주', title: '호주식 브런치 — 아보카도 스매시 & 플랫화이트', thumb: 'image/main/America_Oceania_0804.jpg', images: ['image/main/America_Oceania_0804.jpg', 'main/p_main2.jpg'],
			summary: '멜버른 카페처럼! 수란 올린 아보카도 스매시 토스트와 라테 아트 플랫화이트.',
			intro: ['완벽한 수란 만드는 법, 사워도우 토스트에 어울리는 아보카도 스매시 레시피를 배워요.', '에스프레소 머신으로 우유 스티밍과 간단한 하트 라테 아트에도 도전해요.'],
			duration: 120, capacity: 8, price: 48000, rating: 4.6, reviewCount: 52, joined: 480, level: '입문', tags: ['외국인 강사', '브런치'],
			instructor: { name: '엠마 클라크', from: '호주 멜버른', career: '멜버른 카페 바리스타 출신 · 한국 거주 5년', intro: '"주말 아침을 멜버른처럼 보내는 법을 알려 드릴게요."' },
			place: P.seongsu, materials: [APRON], includes: ['재료비 일체', '원두 샘플 100g', '레시피 카드'],
			curriculum: [{ min: 15, title: '호주 카페 문화', desc: '' }, { min: 45, title: '수란 · 아보카도 스매시 토스트', desc: '' }, { min: 40, title: '플랫화이트 & 라테 아트', desc: '' }, { min: 20, title: '브런치 타임', desc: '' }],
			days: [6, 0], times: ['10:00', '13:30'] },
		{ id: 8, cate: '112', country: '모로코', title: '모로코 치킨 타진 & 쿠스쿠스', thumb: 'image/main/Africa.jpg', images: ['image/main/Africa.jpg', 'image/main/food.jpg'],
			summary: '고깔 모양 타진 냄비로 천천히 익히는 레몬 올리브 치킨과 포슬포슬 쿠스쿠스.',
			intro: ['라스 엘 하누트 향신료와 절인 레몬, 올리브를 넣고 타진 냄비에 천천히 익히는 모로코 대표 가정식이에요.', '민트 티를 높이서 따르는 모로코식 티 세리머니로 마무리해요.'],
			duration: 150, capacity: 8, price: 58000, rating: 4.8, reviewCount: 84, joined: 690, level: '초급', tags: ['외국인 강사', 'NEW'],
			instructor: { name: '유세프 벤나니', from: '모로코 페스', career: '모로코 리야드 셰프 출신 · 한국 거주 6년', intro: '"타진은 기다림의 요리예요. 기다리는 동안 모로코 이야기를 들려 드릴게요."' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 20, title: '모로코 향신료 시장 이야기', desc: '' }, { min: 70, title: '치킨 타진 조리', desc: '절인 레몬 · 올리브' }, { min: 30, title: '쿠스쿠스 찌기', desc: '' }, { min: 30, title: '민트 티 세리머니 & 시식', desc: '' }],
			days: [2, 4, 6], times: ['11:30', '16:30'] },
		{ id: 9, cate: '112', country: '에티오피아', title: '에티오피아 커피 세리머니 & 핸드드립', thumb: 'image/main/mid_banner_mobile_02.jpg', images: ['image/main/mid_banner_mobile_02.jpg', 'image/main/Africa.jpg'],
			summary: '생두를 팬에 직접 볶아 제베나 포트로 내리는 커피의 고향, 에티오피아의 커피 의식.',
			intro: ['에티오피아에서는 손님을 맞을 때 생두를 볶는 것부터 시작해요. 볶는 향을 나누고 세 번에 걸쳐 커피를 마시는 의식을 체험해요.', '산지별 원두 비교 시음과 핸드드립 기초도 함께 배워요.'],
			duration: 100, capacity: 10, price: 39000, rating: 4.7, reviewCount: 47, joined: 410, level: '입문', tags: ['외국인 강사', '커피'],
			instructor: { name: '하나 테스파예', from: '에티오피아 아디스아바바', career: '커피 큐그레이더 · 한국 거주 5년', intro: '"커피는 대화를 위한 음료예요. 천천히, 함께 마셔요."' },
			place: P.seongsu, materials: ['없음'], includes: ['원두 · 생두 일체', '원두 선물 50g'],
			curriculum: [{ min: 20, title: '커피의 고향 이야기', desc: '' }, { min: 40, title: '생두 볶기 · 제베나 추출', desc: '' }, { min: 40, title: '산지별 시음 · 핸드드립', desc: '' }],
			days: [3, 5, 0], times: ['14:00', '19:00'] },
		{ id: 10, cate: '113', country: '이탈리아', title: '이탈리아 생면 파스타 & 바질 페스토', thumb: 'main/m_main2.jpg', images: ['main/m_main2.jpg', 'image/main/Europe.jpg', 'main/p_main2.jpg'],
			summary: '밀가루와 달걀만으로 반죽해 탈리아텔레·파르팔레를 빚고, 생바질 페스토를 곁들여요.',
			intro: ['볼로냐식 생면 반죽을 손으로 치대고 밀대로 밀어 탈리아텔레와 하트 모양 파르팔레를 만들어요.', '절구에 빻는 생바질 페스토와 버터 세이지 소스, 두 가지 맛으로 완성해요.'],
			duration: 150, capacity: 10, price: 65000, rating: 4.9, reviewCount: 241, joined: 1950, level: '입문', tags: ['외국인 강사', '베스트'],
			instructor: { name: '마르코 로시', from: '이탈리아 볼로냐', career: '볼로냐 트라토리아 3대째 · 한국 거주 10년', intro: '"할머니에게 배운 반죽을 한국에서 알려 드리게 됐어요. 반죽은 손이 기억해요!"' },
			place: P.hongdae, materials: [APRON, '머리끈'], includes: COOK_INC,
			curriculum: [{ min: 15, title: '이탈리아 지역별 파스타', desc: '' }, { min: 50, title: '생면 반죽 · 밀기 · 성형', desc: '탈리아텔레 · 파르팔레' }, { min: 45, title: '바질 페스토 · 버터 세이지 소스', desc: '' }, { min: 40, title: '삶기 · 시식', desc: '' }],
			days: [2, 3, 5, 6, 0], times: ['11:00', '15:30', '19:00'] },
		{ id: 11, cate: '113', country: '스페인', title: '스페인 해산물 파에야 & 타파스 3종', thumb: 'image/main/Europe.jpg', images: ['image/main/Europe.jpg', 'image/main/Europe_0804.jpg'],
			summary: '사프란 향 가득한 발렌시아식 해산물 파에야와 감바스·토르티야·판 콘 토마테.',
			intro: ['넓은 파에야 팬에 사프란과 해산물을 넣고, 바닥에 눌어붙은 소카라트까지 제대로 만드는 법을 배워요.', '스페인 바(bar)에서 즐기는 타파스 세 가지를 곁들여 한 상을 차려요.'],
			duration: 160, capacity: 10, price: 68000, rating: 4.8, reviewCount: 112, joined: 920, level: '초급', tags: ['외국인 강사'],
			instructor: { name: '하비에르 가르시아', from: '스페인 발렌시아', career: '발렌시아 파에야 대회 입상 · 한국 거주 7년', intro: '"파에야는 젓지 않는 게 비밀이에요. 그 순간을 같이 기다려요."' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 15, title: '스페인 바 문화', desc: '' }, { min: 45, title: '타파스 3종', desc: '감바스 · 토르티야 · 판 콘 토마테' }, { min: 70, title: '해산물 파에야', desc: '소카라트 만들기' }, { min: 30, title: '시식', desc: '' }],
			days: [4, 6, 0], times: ['12:00', '17:00'] },
		{ id: 12, cate: '113', country: '프랑스', title: '프랑스 비스트로 — 키슈 로렌 & 어니언 수프', thumb: 'image/main/Europe_0804.jpg', images: ['image/main/Europe_0804.jpg', 'image/main/Europe.jpg'],
			summary: '바삭한 타르트 반죽의 키슈 로렌과 캐러멜라이즈 양파로 끓이는 그라탱 어니언 수프.',
			intro: ['버터 타르트 반죽부터 직접 만들어 베이컨·치즈 키슈 로렌을 구워요.', '양파를 한 시간 가까이 볶아 내는 깊은 맛의 어니언 수프는 그뤼에르 치즈를 올려 오븐에 마무리해요.'],
			duration: 170, capacity: 8, price: 69000, rating: 4.7, reviewCount: 68, joined: 560, level: '초급', tags: ['외국인 강사'],
			instructor: { name: '클레르 베르나르', from: '프랑스 리옹', career: '리옹 비스트로 수셰프 출신 · 한국 거주 6년', intro: '"리옹은 미식의 수도예요. 소박하지만 깊은 비스트로의 맛을 함께 만들어요."' },
			place: P.seongsu, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 40, title: '타르트 반죽', desc: '' }, { min: 60, title: '어니언 수프', desc: '캐러멜라이즈' }, { min: 50, title: '키슈 굽기', desc: '' }, { min: 20, title: '시식', desc: '' }],
			days: [3, 6], times: ['11:00', '16:00'] },
		{ id: 13, cate: '113', country: '영국', title: '영국 홈베이킹 — 스콘 & 쇼트브레드', thumb: 'main/m_main1.jpg', images: ['main/m_main1.jpg', 'image/main/Europe_0804.jpg'],
			summary: '애프터눈 티에 빠질 수 없는 스콘과 버터 쇼트브레드 쿠키를 구워 티 타임까지.',
			intro: ['요크 출신 강사와 버터를 손으로 비벼 만드는 정통 스콘, 별·하트 모양 쇼트브레드를 구워요.', '클로티드 크림과 잼을 곁들여 영국식 티 타임을 즐기고, 구운 쿠키는 선물 상자에 담아 가요.'],
			duration: 130, capacity: 12, price: 47000, rating: 4.8, reviewCount: 131, joined: 1210, level: '입문', tags: ['외국인 강사', '베이킹'],
			instructor: { name: '올리비아 브라운', from: '영국 요크', career: '홈베이킹 블로거 · 한국 거주 8년', intro: '"베이킹은 정확함과 즐거움의 조화예요. 실패해도 맛있으니 걱정 마세요!"' },
			place: P.hongdae, materials: [APRON], includes: ['재료비 일체', '선물 상자', '홍차 티 타임'],
			curriculum: [{ min: 40, title: '스콘 반죽 · 성형', desc: '' }, { min: 40, title: '쇼트브레드 반죽 · 모양 찍기', desc: '' }, { min: 50, title: '굽기 & 애프터눈 티', desc: '' }],
			days: [1, 3, 6, 0], times: ['10:30', '14:30'] },
		{ id: 14, cate: '114', country: '지중해', title: '셰프스 테이블 — 지중해 7코스 디너', thumb: 'image/main/premium.jpg', images: ['image/main/premium.jpg', 'main/p_main2.jpg'],
			summary: '셰프 바로 앞 카운터석에서 조리 과정을 보며 즐기는 소수 정예 7코스 디너.',
			intro: ['그리스·이탈리아·스페인의 지중해 식재료로 구성한 7코스를 셰프가 눈앞에서 조리하고 설명해 드려요.', '코스 중 두 가지는 직접 플레이팅에 참여하며, 웰컴 드링크가 포함되어 있어요.'],
			duration: 180, capacity: 6, price: 150000, rating: 4.9, reviewCount: 38, joined: 260, level: '누구나', tags: ['프리미엄', '소수 정예'],
			instructor: { name: '니코스 파파스', from: '그리스 아테네', career: '파인다이닝 헤드셰프 15년 · 한국 거주 4년', intro: '"좋은 재료와 좋은 사람, 그것이 지중해 식탁의 전부예요."' },
			place: P.seongsu, materials: ['없음'], includes: ['7코스 디너', '웰컴 드링크', '코스 메뉴 카드'],
			curriculum: [{ min: 20, title: '웰컴 드링크 & 지중해 식재료 소개', desc: '' }, { min: 120, title: '7코스 디너', desc: '그중 2코스는 직접 플레이팅' }, { min: 40, title: '디저트 & 셰프와의 대화', desc: '' }],
			days: [5, 6], times: ['18:30'] },
		{ id: 15, cate: '114', country: '프랑스', title: '소믈리에와 함께하는 와인 페어링 프렌치 코스', thumb: 'image/main/premium.jpg', images: ['image/main/premium.jpg', 'image/main/Europe_0804.jpg'],
			summary: '프렌치 4코스와 코스마다 어울리는 와인 4종, 페어링 원리를 쉽게 배워요.',
			intro: ['코스별로 와인을 바꿔 마시며 산도·당도·바디감이 음식과 어떻게 어울리는지 소믈리에가 쉽게 설명해 드려요.', '집에서 와인 고르는 법과 라벨 읽는 법도 알려 드려요. (만 19세 이상)'],
			duration: 150, capacity: 8, price: 135000, rating: 4.8, reviewCount: 29, joined: 190, level: '누구나', tags: ['프리미엄', '성인'],
			instructor: { name: '앙투안 르루', from: '프랑스 파리', career: '소믈리에 · 와인 바 운영 · 한국 거주 9년', intro: '"와인은 어렵지 않아요. 맛있게 마시는 법부터 시작해요."' },
			place: P.seongsu, materials: ['신분증 (성인 확인)'], includes: ['프렌치 4코스', '페어링 와인 4종'],
			curriculum: [{ min: 20, title: '와인 기초 & 라벨 읽기', desc: '' }, { min: 110, title: '4코스 & 페어링', desc: '' }, { min: 20, title: 'Q&A', desc: '' }],
			days: [4, 6], times: ['19:00'] },
		{ id: 16, cate: '115', country: '튀르키예', title: '튀르키예 치킨 케밥 & 바클라바', thumb: 'image/main/food.jpg', images: ['image/main/food.jpg', 'image/main/Africa.jpg'],
			summary: '요거트 소스에 재운 치킨 케밥과 얇은 필로 반죽을 겹겹이 쌓은 꿀 디저트 바클라바.',
			intro: ['이스탄불 길거리의 치킨 되네르 케밥을 팬으로 재현하고, 직접 구운 피데 빵에 싸 먹어요.', '견과류와 시럽을 듬뿍 넣은 바클라바는 튀르키예식 차이와 함께 즐겨요.'],
			duration: 140, capacity: 10, price: 54000, rating: 4.6, reviewCount: 44, joined: 380, level: '입문', tags: ['외국인 강사'],
			instructor: { name: '메흐메트 일디즈', from: '튀르키예 이스탄불', career: '케밥 전문점 운영 경력 · 한국 거주 6년', intro: '"튀르키예 사람들은 손님에게 차를 세 잔 대접해요. 오늘 세 잔 드릴게요!"' },
			place: P.itaewon, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 50, title: '치킨 케밥 · 피데', desc: '' }, { min: 60, title: '바클라바', desc: '' }, { min: 30, title: '차이 & 시식', desc: '' }],
			days: [2, 5, 0], times: ['12:00', '16:30'] },
		{ id: 17, cate: '116', country: '태국', title: '[온라인] 랜선 쿠킹 — 태국 팟타이 밀키트 클래스', thumb: 'main/p_main1.jpg', images: ['main/p_main1.jpg', 'main/sub2.jpg'],
			summary: '집으로 배송된 밀키트로 강사와 실시간 Zoom 수업! 2인분 팟타이를 함께 만들어요.',
			intro: ['클래스 2일 전까지 2인분 밀키트(쌀국수면·타마린드 소스·새우 등)가 집으로 배송돼요.', '노트북이나 태블릿만 있으면 어디서든 참여할 수 있고, 수업 녹화본도 7일간 다시 볼 수 있어요.'],
			duration: 80, capacity: 20, price: 35000, rating: 4.7, reviewCount: 122, joined: 1380, level: '입문', tags: ['온라인', '밀키트'],
			instructor: { name: '솜차이 분미', from: '태국 방콕', career: '방콕 호텔 레스토랑 출신 · 한국 거주 7년', intro: '"화면 너머로도 웍 냄새가 나도록 열심히 알려 드릴게요!"' },
			place: P.online, materials: ['프라이팬 또는 웍', '노트북 · 태블릿'], includes: ['2인분 밀키트 배송', '녹화본 7일 다시보기'],
			curriculum: [{ min: 10, title: '접속 · 재료 확인', desc: '' }, { min: 50, title: '팟타이 함께 만들기', desc: '' }, { min: 20, title: '완성 사진 공유 & Q&A', desc: '' }],
			days: [1, 3, 5], times: ['20:00'] },
		{ id: 18, cate: '105', country: '한국', title: '부채춤 원데이 클래스 — 한복 입고 춤추기', thumb: 'image/main/culture_bak_06.jpg', images: ['image/main/culture_bak_06.jpg', 'image/main/culture_bak_03.jpg'],
			summary: '무용 한복을 입고 부채 펴기·접기부터 꽃 모양 대형까지, 짧은 부채춤 한 소절을 완성해요.',
			intro: ['국립 무용단 출신 강사와 기본 호흡과 디딤새를 익히고, 부채를 펴고 접는 동작으로 한 소절을 완성해요.', '마지막에는 단체 대형으로 영상 촬영을 해 드려요.'],
			duration: 120, capacity: 12, price: 42000, rating: 4.8, reviewCount: 76, joined: 640, level: '입문', tags: ['한복 대여', '영상 촬영'],
			instructor: { name: '한가람', from: '서울', career: '한국무용 전공 · 前 무용단 단원', intro: '"몸으로 느끼는 우리 장단, 어렵지 않아요. 처음 오신 분도 다 해내세요."' },
			place: P.bukchon, materials: ['편한 바지', '양말'], includes: ['무용 한복 · 부채 대여', '단체 영상'],
			curriculum: [{ min: 20, title: '호흡 · 디딤새', desc: '' }, { min: 50, title: '부채 기본 동작', desc: '' }, { min: 50, title: '한 소절 완성 & 촬영', desc: '' }],
			days: [2, 4, 6], times: ['11:00', '15:00'] },
		{ id: 19, cate: '105', country: '한국', title: '사물놀이 장구 — 굿거리 장단 배우기', thumb: 'image/main/culture_bak_06.jpg', images: ['image/main/culture_bak_06.jpg'],
			summary: '장구 하나로 굿거리·자진모리 장단을 배우고, 마지막엔 꽹과리·북·징과 합주해요.',
			intro: ['장구 잡는 법, 궁편·열편 치는 법부터 시작해 굿거리와 자진모리 장단을 익혀요.', '수업 끝에는 강사님 꽹과리 리드에 맞춰 다 함께 사물놀이 합주를 해요. 스트레스가 확 풀려요!'],
			duration: 90, capacity: 10, price: 35000, rating: 4.7, reviewCount: 58, joined: 470, level: '입문', tags: ['악기 대여'],
			instructor: { name: '박두레', from: '전북 남원', career: '풍물 전수자 · 사물놀이 공연 20년', intro: '"장단은 심장 박동 같은 거예요. 금방 몸이 기억해요."' },
			place: P.bukchon, materials: ['없음'], includes: ['장구 대여', '장단 악보'],
			curriculum: [{ min: 20, title: '장구 잡는 법', desc: '' }, { min: 40, title: '굿거리 · 자진모리', desc: '' }, { min: 30, title: '사물놀이 합주', desc: '' }],
			days: [3, 6, 0], times: ['14:00', '17:00'] },
		{ id: 20, cate: '100', country: '한국', title: '택견 기초 & 전통 무예 이야기', thumb: 'image/main/culture_bak_02.jpg', images: ['image/main/culture_bak_02.jpg'],
			summary: '유네스코 인류무형문화유산 택견! 품밟기와 발질 기본기를 배우는 1시간 30분.',
			intro: ['춤추듯 부드러운 품밟기와 활갯짓, 기본 발질을 배우고 짝 겨루기 맛보기까지 해 봐요.', '외국인 친구와 함께 오기 좋은 클래스로, 영어 설명도 가능해요.'],
			duration: 90, capacity: 15, price: 30000, rating: 4.6, reviewCount: 41, joined: 350, level: '입문', tags: ['도복 대여', '영어 가능'],
			instructor: { name: '윤결', from: '충북 충주', career: '택견 전수자 · 생활체육 지도자', intro: '"택견은 상대를 다치게 하지 않는 무예예요. 웃으면서 배워요."' },
			place: P.namsan, materials: ['편한 운동복'], includes: ['도복 대여', '체험 수료증'],
			curriculum: [{ min: 15, title: '택견의 역사', desc: '' }, { min: 45, title: '품밟기 · 활갯짓 · 발질', desc: '' }, { min: 30, title: '짝 겨루기 맛보기', desc: '' }],
			days: [2, 4, 6, 0], times: ['10:00', '16:00'] },
		{ id: 21, cate: '100', country: '한국', title: '국궁 — 전통 활쏘기 체험', thumb: 'image/main/culture_bak_02.jpg', images: ['image/main/culture_bak_02.jpg', 'image/main/culture_bak_03.jpg'],
			summary: '각궁을 잡고 과녁을 향해! 사법(射法) 예절과 자세를 배우고 직접 활을 쏴 봐요.',
			intro: ['활터 예절과 활 잡는 법, 깍지 끼는 법을 배우고 연습용 활로 30m 과녁 쏘기에 도전해요.', '야외 클래스라 우천 시 실내 활터로 옮겨 진행해요.'],
			duration: 120, capacity: 8, price: 45000, rating: 4.9, reviewCount: 63, joined: 420, level: '입문', tags: ['야외', '장비 대여'],
			instructor: { name: '이활', from: '서울', career: '국궁 5단 · 전통 활쏘기 지도 12년', intro: '"활시위를 당기는 순간, 마음이 고요해져요."' },
			place: P.namsan, materials: ['편한 복장', '운동화'], includes: ['활 · 화살 · 깍지 대여', '체험 기념 화살촉'],
			curriculum: [{ min: 20, title: '활터 예절 · 장비 소개', desc: '' }, { min: 40, title: '자세 · 빈 활 당기기', desc: '' }, { min: 60, title: '과녁 쏘기', desc: '' }],
			days: [3, 6, 0], times: ['10:00', '14:00'] },
		{ id: 22, cate: '102', country: '한국', title: '궁중 떡 만들기 — 송편 · 꿀떡 · 바람떡', thumb: 'image/main/culture_bak_04.jpg', images: ['image/main/culture_bak_04.jpg', 'image/main/mid_banner_mobile_02.jpg'],
			summary: '오색 천연 가루로 물들인 반죽을 빚어 송편·꿀떡·바람떡 세 가지 떡을 만들어요.',
			intro: ['쑥·단호박·백년초 등 천연 재료로 반죽에 색을 입히고, 깨·꿀·팥 소를 넣어 세 가지 떡을 빚어요.', '찜기에서 갓 쪄 낸 떡은 전통 다과상으로 맛보고, 나머지는 떡 상자에 담아 가요.'],
			duration: 120, capacity: 12, price: 45000, rating: 4.9, reviewCount: 177, joined: 1520, level: '입문', tags: ['외국인 동반 추천', '선물 포장'],
			instructor: { name: '정다온', from: '경기 수원', career: '떡 제조 기능사 · 궁중 병과 연구 15년', intro: '"떡은 나누는 음식이에요. 예쁘게 빚어서 소중한 사람과 나눠 드세요."' },
			place: P.bukchon, materials: [APRON], includes: ['재료비 일체', '떡 선물 상자', '레시피 카드'],
			curriculum: [{ min: 20, title: '떡의 종류와 의미', desc: '' }, { min: 60, title: '반죽 물들이기 · 빚기', desc: '' }, { min: 40, title: '찌기 · 다과상 시식', desc: '' }],
			days: [2, 3, 5, 6, 0], times: ['11:00', '15:00'] },
		{ id: 23, cate: '102', country: '한국', title: '비빔밥 & 잡채 한 상 차리기', thumb: 'image/main/culture_bak_04.jpg', images: ['image/main/culture_bak_04.jpg'],
			summary: '오방색 나물 비빔밥과 잡채, 된장국까지 — 외국인 친구에게 대접하기 좋은 한식 한 상.',
			intro: ['다섯 가지 색의 나물을 각각 무치고 볶아 비빔밥을 담고, 탱탱한 잡채와 된장국까지 한 상을 차려요.', '외국인 참가자를 위한 영어 레시피 카드도 준비되어 있어요.'],
			duration: 140, capacity: 12, price: 49000, rating: 4.8, reviewCount: 143, joined: 1260, level: '입문', tags: ['영어 가능'],
			instructor: { name: '서한솔', from: '전북 전주', career: '한식 조리 기능장 · 한식 세계화 강사', intro: '"전주에서 배운 비빔밥의 정석을 알려 드릴게요."' },
			place: P.hongdae, materials: [APRON], includes: COOK_INC,
			curriculum: [{ min: 50, title: '오방색 나물 만들기', desc: '' }, { min: 40, title: '잡채 · 된장국', desc: '' }, { min: 50, title: '한 상 차림 & 시식', desc: '' }],
			days: [1, 3, 4, 6], times: ['11:00', '17:00'] },
		{ id: 24, cate: '101', country: '한국', title: '한지 공예 — 은은한 한지 조명 만들기', thumb: 'image/main/culture_bak_05.jpg', images: ['image/main/culture_bak_05.jpg', 'image/main/culture_bak_01.jpg'],
			summary: '전주 전통 한지를 겹겹이 붙여 은은한 빛이 퍼지는 무드등을 만들어요.',
			intro: ['닥나무로 만든 전통 한지의 특징을 알아보고, 대나무 살 틀에 한지를 붙여 나만의 조명을 완성해요.', '꽃잎·나뭇잎을 넣어 무늬를 내는 법도 배워요. LED 전구가 포함되어 있어 바로 쓸 수 있어요.'],
			duration: 120, capacity: 10, price: 48000, rating: 4.8, reviewCount: 92, joined: 730, level: '입문', tags: ['완성품 증정'],
			instructor: { name: '오누리', from: '전북 전주', career: '한지 공예 작가 · 공방 운영 11년', intro: '"한지는 천 년을 가는 종이예요. 오늘 만든 조명도 오래오래 쓰세요."' },
			place: P.bukchon, materials: ['없음'], includes: ['재료비 · LED 전구', '포장 상자'],
			curriculum: [{ min: 20, title: '한지 이야기', desc: '' }, { min: 70, title: '틀 짜기 · 한지 붙이기', desc: '' }, { min: 30, title: '무늬 넣기 · 마무리', desc: '' }],
			days: [2, 4, 6, 0], times: ['11:00', '15:00'] },
		{ id: 25, cate: '101', country: '한국', title: '전통 매듭 — 노리개 & 매듭 팔찌', thumb: 'image/main/culture_bak_03.jpg', images: ['image/main/culture_bak_03.jpg', 'image/main/culture_bak_01.jpg'],
			summary: '도래매듭·국화매듭을 배워 한복에 다는 노리개와 매일 하는 매듭 팔찌를 만들어요.',
			intro: ['명주실로 기본 매듭인 도래매듭과 국화매듭을 익히고, 술을 달아 노리개를 완성해요.', '남은 시간에는 같은 매듭으로 커플 팔찌를 만들어 가져가요.'],
			duration: 120, capacity: 10, price: 42000, rating: 4.7, reviewCount: 55, joined: 430, level: '입문', tags: ['완성품 증정'],
			instructor: { name: '권보람', from: '서울', career: '매듭장 이수자 · 공예 강사 9년', intro: '"한 올 한 올 엮다 보면 마음까지 정리돼요."' },
			place: P.bukchon, materials: ['없음'], includes: ['명주실 · 장식 재료', '노리개 포장'],
			curriculum: [{ min: 30, title: '도래매듭 · 국화매듭', desc: '' }, { min: 60, title: '노리개 완성', desc: '' }, { min: 30, title: '매듭 팔찌', desc: '' }],
			days: [3, 5, 6], times: ['13:00', '16:30'] },
		{ id: 26, cate: '101', country: '한국', title: '도자기 물레 체험 — 나만의 찻잔', thumb: 'image/main/mid_banner_mobile.jpg', images: ['image/main/mid_banner_mobile.jpg', 'image/main/culture_bak_01.jpg'],
			summary: '물레를 돌려 찻잔·그릇을 빚고, 유약을 골라 구우면 3주 뒤 택배로 받아요.',
			intro: ['흙 반죽(꼬박밀기)부터 물레 중심 잡기, 컵 모양 올리기까지 강사가 1:1로 도와 드려요.', '완성품은 초벌·재벌을 거쳐 약 3주 뒤 택배로 보내 드려요. (택배비 포함)'],
			duration: 120, capacity: 6, price: 55000, rating: 4.9, reviewCount: 118, joined: 880, level: '입문', tags: ['소수 정예', '택배 배송'],
			instructor: { name: '남궁도', from: '경기 이천', career: '도예가 · 이천 도자기 공방 운영', intro: '"흙은 정직해요. 마음이 급하면 흙도 흔들려요. 천천히 해 봐요."' },
			place: P.seongsu, materials: ['더러워져도 되는 옷'], includes: ['흙 · 유약 · 소성비', '완성품 택배'],
			curriculum: [{ min: 20, title: '흙 반죽', desc: '' }, { min: 70, title: '물레 성형', desc: '찻잔 2개' }, { min: 30, title: '굽 깎기 · 유약 고르기', desc: '' }],
			days: [2, 4, 5, 6, 0], times: ['10:30', '14:00', '17:30'] },
		{ id: 27, cate: '104', country: '한국', title: '민화 그리기 — 모란도 부채', thumb: 'image/main/culture_bak_05.jpg', images: ['image/main/culture_bak_05.jpg'],
			summary: '부귀를 뜻하는 모란을 전통 안료로 채색해 합죽선 부채에 그려요.',
			intro: ['밑그림을 옮기는 초본 작업부터 분채로 바림하는 채색법까지, 민화의 기본을 하루에 경험해요.', '그림 실력이 없어도 괜찮아요. 완성한 부채는 그대로 가져가요.'],
			duration: 150, capacity: 10, price: 46000, rating: 4.8, reviewCount: 66, joined: 500, level: '입문', tags: ['완성품 증정'],
			instructor: { name: '송하린', from: '서울', career: '민화 작가 · 개인전 6회', intro: '"민화는 복을 비는 그림이에요. 그리는 동안 좋은 일만 생각하세요."' },
			place: P.bukchon, materials: ['없음'], includes: ['합죽선 · 안료 · 붓'],
			curriculum: [{ min: 20, title: '민화 이야기', desc: '' }, { min: 40, title: '초본 옮기기', desc: '' }, { min: 90, title: '채색 · 바림', desc: '' }],
			days: [3, 6, 0], times: ['10:30', '14:30'] },
		{ id: 28, cate: '104', country: '한국', title: '서예 & 한글 캘리그라피 — 내 이름 쓰기', thumb: 'image/main/culture_bak_05.jpg', images: ['image/main/culture_bak_05.jpg', 'image/main/culture_bak_03.jpg'],
			summary: '먹을 갈고 붓을 잡는 법부터, 한글 이름과 좋아하는 문장을 캘리그라피로 써요.',
			intro: ['서예의 기본 획을 연습하고, 한글 캘리그라피로 내 이름(외국인은 한글 이름 지어 드려요)을 써요.', '마지막에는 엽서와 족자에 작품을 남겨 가져가요.'],
			duration: 90, capacity: 12, price: 32000, rating: 4.7, reviewCount: 49, joined: 390, level: '입문', tags: ['외국인 동반 추천'],
			instructor: { name: '백도윤', from: '경북 안동', career: '서예가 · 캘리그라피 강사 10년', intro: '"글씨는 사람을 닮아요. 오늘은 나를 닮은 글씨를 찾아봐요."' },
			place: P.bukchon, materials: ['없음'], includes: ['붓 · 먹 · 화선지', '엽서 · 미니 족자'],
			curriculum: [{ min: 20, title: '먹 갈기 · 붓 잡기', desc: '' }, { min: 30, title: '기본 획 연습', desc: '' }, { min: 40, title: '이름 · 문장 쓰기', desc: '' }],
			days: [2, 4, 6], times: ['11:00', '15:00', '18:00'] },
		{ id: 29, cate: '103', country: '한국', title: '한복 입고 고궁 산책 & 스냅 촬영', thumb: 'image/main/culture_bak_03.jpg', images: ['image/main/culture_bak_03.jpg', 'image/main/culture_bak_06.jpg'],
			summary: '전통 한복을 골라 입고 머리 장식까지, 포토그래퍼와 고궁을 걸으며 스냅 사진을 남겨요.',
			intro: ['당의·철릭 등 50여 벌 중에서 마음에 드는 한복을 고르고 댕기·뒤꽂이로 머리 장식을 해 드려요.', '포토그래퍼와 고궁을 산책하며 촬영한 보정본 10컷을 3일 안에 보내 드려요.'],
			duration: 150, capacity: 6, price: 69000, rating: 4.9, reviewCount: 102, joined: 610, level: '누구나', tags: ['한복 대여', '보정본 10컷'],
			instructor: { name: '문하늘', from: '서울', career: '한복 스타일리스트 · 스냅 포토그래퍼', intro: '"가장 예쁜 각도는 제가 찾아 드릴게요. 편하게 걸어만 주세요."' },
			place: P.bukchon, materials: ['편한 신발'], includes: ['한복 · 소품 대여', '고궁 입장료', '보정본 10컷'],
			curriculum: [{ min: 30, title: '한복 고르기 · 머리 장식', desc: '' }, { min: 90, title: '고궁 산책 & 촬영', desc: '' }, { min: 30, title: '사진 고르기 · 반납', desc: '' }],
			days: [1, 2, 3, 4, 5, 6, 0], times: ['10:00', '13:30'] },
		{ id: 30, cate: '103', country: '한국', title: '전통 다도 & 다식 만들기', thumb: 'image/main/mid_banner_mobile_02.jpg', images: ['image/main/mid_banner_mobile_02.jpg', 'image/main/culture_bak_04.jpg'],
			summary: '한옥 다실에서 우리 녹차를 우려 마시는 다도 예절과 송화·흑임자 다식 만들기.',
			intro: ['찻잔을 데우고 물을 식혀 녹차를 우리는 행다법을 배우고, 손님을 대접하는 예절을 익혀요.', '다식판에 송화·흑임자 반죽을 눌러 꽃무늬 다식을 만들어 차와 함께 즐겨요.'],
			duration: 100, capacity: 8, price: 38000, rating: 4.8, reviewCount: 87, joined: 650, level: '입문', tags: ['한옥 다실'],
			instructor: { name: '차윤서', from: '전남 보성', career: '차 문화 지도사 · 다례 강사 13년', intro: '"차 한 잔의 여유, 오늘은 시계를 보지 마세요."' },
			place: P.bukchon, materials: ['없음'], includes: ['녹차 · 다식 재료', '녹차 선물 티백'],
			curriculum: [{ min: 20, title: '차의 역사 · 다구 소개', desc: '' }, { min: 40, title: '행다법 · 예절', desc: '' }, { min: 40, title: '다식 만들기 · 티 타임', desc: '' }],
			days: [2, 3, 5, 6, 0], times: ['11:00', '15:00'] }
	];
	MockDB.define('myculture.classes', classes, { version: '1' });

	/* ---------- 금주의 Pick 배너 (메인 원래 이미지 2장) ---------- */
	MockDB.define('myculture.picks', [
		{ id: 1, order: 1, classId: 1, img: 'main/sub1.jpg', alt: '꼭 먹어봐야 할 베트남 하노이 요리' },
		{ id: 2, order: 2, classId: 2, img: 'main/sub2.jpg', alt: '태국요리 — 레스토랑에서 먹던 똠양꿍을 내가 직접' }
	], { version: '1' });

	/* ---------- 후기 (클래스마다 3개) ---------- */
	var NAMES = ['김민지', '이서준', '박지우', 'Sarah K.', '최하은', '정도현', 'Tom W.', '강유나', '윤시우', '한지민', 'Yuki T.', '오세린', '임재현', '서다인', 'Lena M.', '조은호'];
	var POOL = [
		'강사님이 한국어를 너무 잘하셔서 깜짝 놀랐어요. 설명이 친절하고 재미있었어요!',
		'재료 손질이 미리 되어 있어서 초보도 부담 없이 따라 할 수 있었어요.',
		'친구랑 둘이 갔는데 분위기가 좋아서 금방 다른 참가자들과도 친해졌어요.',
		'집에 와서 레시피 카드 보고 다시 만들어 봤는데 똑같이 맛있게 됐어요 :)',
		'시간 가는 줄 몰랐어요. 다음에는 다른 나라 클래스도 들어 보려고요.',
		'공간이 깔끔하고 도구도 1인 1세트라 편했어요. 강력 추천합니다.',
		'외국인 친구 데리고 갔는데 둘 다 너무 만족했어요. 영어 설명도 해 주셨어요.',
		'생각보다 양이 많아서 포장까지 해 왔어요. 가성비 최고!',
		'그 나라 문화 이야기를 같이 들려주셔서 여행 다녀온 기분이었어요.',
		'처음엔 어려워 보였는데 강사님이 하나하나 봐 주셔서 완성할 수 있었어요.',
		'사진 찍기 좋은 포인트가 많아요. 결과물이 예뻐서 SNS에 자랑했어요.',
		'주차가 조금 불편했지만 수업 자체는 정말 만족스러웠어요.'
	];
	var reviews = [], rid = 1;
	classes.forEach(function (c) {
		for (var k = 0; k < 3; k++) {
			var n = c.id * 3 + k;
			reviews.push({
				id: rid++,
				classId: c.id,
				name: NAMES[n % NAMES.length],
				rating: (n % 5 === 0) ? 4 : 5,
				body: POOL[(c.id * 5 + k * 7) % POOL.length],
				date: Mock.rel(-((c.id * 7 + k * 11) % 50) - 2)
			});
		}
	});
	MockDB.define('myculture.reviews', reviews, { version: '1' });

	/* ---------- 예약 (예시 3건 — 이 브라우저의 예약 내역으로 보여 준다) ---------- */
	function nextDay(fromRel, days) {
		for (var i = fromRel; i < fromRel + 14; i++) {
			var d = Mock.toDate(Mock.rel(i));
			if (days.indexOf(d.getDay()) >= 0) return Mock.rel(i);
		}
		return Mock.rel(fromRel);
	}
	function prevDay(fromRel, days) {
		for (var i = fromRel; i > fromRel - 14; i--) {
			var d = Mock.toDate(Mock.rel(i));
			if (days.indexOf(d.getDay()) >= 0) return Mock.rel(i);
		}
		return Mock.rel(fromRel);
	}
	function yymmdd(rel) { return Mock.date(Mock.rel(rel), 'YYMMDD'); }
	var c10 = classes[9], c23 = classes[22], c22 = classes[21];
	MockDB.define('myculture.bookings', [
		{ id: 'MC' + yymmdd(-3) + '0417', classId: c10.id, title: c10.title, date: nextDay(6, c10.days), time: c10.times[1], people: 2, price: c10.price, total: c10.price * 2,
			name: '이데모', phone: '010-0000-1234', email: 'demo@example.com', request: '둘 다 파스타는 처음이에요. 잘 부탁드려요!', status: '예약확정', createdAt: Mock.rel(-3, '21:14') },
		{ id: 'MC' + yymmdd(-20) + '2381', classId: c23.id, title: c23.title, date: prevDay(-12, c23.days), time: c23.times[0], people: 1, price: c23.price, total: c23.price,
			name: '이데모', phone: '010-0000-1234', email: 'demo@example.com', request: '', status: '예약확정', createdAt: Mock.rel(-20, '09:42') },
		{ id: 'MC' + yymmdd(-9) + '5520', classId: c22.id, title: c22.title, date: nextDay(10, c22.days), time: c22.times[0], people: 3, price: c22.price, total: c22.price * 3,
			name: '이데모', phone: '010-0000-1234', email: 'demo@example.com', request: '', status: '예약취소', createdAt: Mock.rel(-9, '13:05'), canceledAt: Mock.rel(-7, '10:20'), cancelReason: '일정 변경' }
	], { version: '1' });
})();

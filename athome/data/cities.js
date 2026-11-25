/*
 * AthomeTrip 가상 데이터 — 카테고리 · 여행지(도시) · 메인 배너
 * 이미지 경로는 athome/ 폴더 기준 (페이지에서는 ATH.img() 로 '../' 를 붙여 씀)
 */
MockDB.define('athome.categories', [
	{ id: 'pass',  name: '티켓/패스', menu: '입장권·패스', icon: 'image/main/m_icon_1.png', order: 1 },
	{ id: 'show',  name: '공연예매',  menu: '공연예매',    icon: 'image/main/m_icon_2.png', order: 2 },
	{ id: 'guide', name: '가이드투어', menu: '가이드투어',  icon: 'image/main/m_icon_3.png', order: 3 },
	{ id: 'snap',  name: '스냅촬영',  menu: '스냅촬영',    icon: 'image/main/m_icon_4.png', order: 4 },
	{ id: 'hotel', name: '호텔',      menu: '숙소예약',    icon: 'image/main/m_icon_5.png', order: 5 },
	{ id: 'trans', name: '이동·교통', menu: '이동·교통',   icon: 'image/main/m_icon_6.png', order: 6 },
	{ id: 'usim',  name: '미국유심',  menu: '미국유심',    icon: 'image/main/m_icon_7.png', order: 7 }
], { version: '1' });

MockDB.define('athome.cities', [
	{ id: 'ny',   name: '뉴욕',        en: 'New York',      region: 'east',    img: 'image/product/newyork.jpg',  order: 1 },
	{ id: 'sf',   name: '샌프란시스코', en: 'San Francisco', region: 'west',    img: 'image/product/sanfran.jpg',  order: 2 },
	{ id: 'lv',   name: '라스베이거스', en: 'Las Vegas',     region: 'west',    img: 'image/product/lasvegas.jpg', order: 3 },
	{ id: 'la',   name: '로스앤젤레스', en: 'Los Angeles',   region: 'west',    img: 'image/product/la.jpg',       order: 4 },
	{ id: 'orl',  name: '올랜도',      en: 'Orlando',       region: 'east',    img: 'image/product/orlando.jpg',  order: 5 },
	{ id: 'chi',  name: '시카고',      en: 'Chicago',       region: 'east',    img: 'image/product/chicago.jpg',  order: 6 },
	{ id: 'hnl',  name: '하와이',      en: 'Honolulu',      region: 'pacific', img: 'image/main/main_best2.jpg',  order: 7 },
	{ id: 'maui', name: '마우이',      en: 'Maui',          region: 'pacific', img: 'FileData/good/20210326_2B48888658DC6044.jpg', order: 8 },
	{ id: 'mia',  name: '마이애미',    en: 'Miami',         region: 'east',    img: 'image/main/main_best4.jpg',  order: 9 },
	{ id: 'san',  name: '샌디에이고',  en: 'San Diego',     region: 'west',    img: 'image/main/main_best3.jpg',  order: 10 },
	{ id: 'gum',  name: '괌',          en: 'Guam',          region: 'pacific', img: 'image/main/main_best5.jpg',  order: 11 },
	{ id: 'spn',  name: '사이판',      en: 'Saipan',        region: 'pacific', img: 'FileData/good/20210419_52B7C6C3C0B7492C.jpg', order: 12 }
], { version: '1' });

/* 지역 레이어의 권역 구분 (컬렉션이 아니라 고정값) */
window.ATHOME_REGIONS = [
	{ id: 'east',    name: '미동부' },
	{ id: 'west',    name: '미서부' },
	{ id: 'pacific', name: '하와이·괌·사이판' }
];

MockDB.define('athome.banners', [
	{ id: 1, title: '뉴욕 브로드웨이 뮤지컬', text: '할인된 가격! 좋은좌석에서 공연의 감동을 경험해 보세요', img: 'image/main/main1.jpg', link: { city: 'ny', cate: 'show' } },
	{ id: 2, title: '캘리포니아 1번 국도 드라이브', text: '태평양 해안 절벽을 따라 달리는 미서부 대표 코스, 한국어 가이드와 함께', img: 'FileData/hotel/20210115_D2AD4DD0D02803D5.jpg', link: { city: 'sf', cate: 'guide' } },
	{ id: 3, title: '하와이 바다 액티비티', text: '하나우마 베이 스노클링부터 노스쇼어 일주까지 한 번에', img: 'FileData/good/20210331_E66A48A518365881.jpg', link: { city: 'hnl' } }
], { version: '1' });

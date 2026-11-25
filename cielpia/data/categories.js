/*
 * Cielpia 가상 데이터 — 강의 분류 (3단계)
 *  depth 1 : 메인 아이콘 6개 (pic 클래스·아이콘 이미지는 원래 마크업 그대로)
 *  depth 2 : 호버 하위메뉴 (id = 원래 마크업의 data-idx)
 *  depth 3 : 하위메뉴 오른쪽 영역 (group 단위로 공통 — 몬테소리 5영역은 모든 단계에 공통)
 */
MockDB.define('cielpia.categories', [
	/* ---------- depth 1 ---------- */
	{ id: 'monte',    depth: 1, order: 1, name: '몬테소리',       pic: 'pic1', icon: 'cate1', desc: '일상생활·감각·언어·수학·문화 다섯 영역의 몬테소리 교구 활동' },
	{ id: 'health',   depth: 1, order: 2, name: '건강',           pic: 'pic2', icon: 'cate2', desc: '몸을 움직이고 바른 습관을 기르는 신체·생활 교육' },
	{ id: 'art',      depth: 1, order: 3, name: '문화/예술',      pic: 'pic3', icon: 'cate3', desc: '미술·음악·동화 구연으로 키우는 감성과 표현력' },
	{ id: 'global',   depth: 1, order: 4, name: '글로벌리더',     pic: 'pic5', icon: 'cate5', desc: '원어민 선생님과 노래·그림책으로 만나는 첫 외국어', nationPopup: true },
	{ id: 'coding',   depth: 1, order: 5, name: '코딩',           pic: 'pic6', icon: 'cate6', desc: '순서·규칙·반복을 놀이로 익히는 유아 코딩' },
	{ id: 'explorer', depth: 1, order: 6, name: '탐험가 프로그램', pic: 'pic7', icon: 'cate7', desc: '자연 관찰과 과학 실험으로 호기심을 키우는 탐험 활동' },

	/* ---------- depth 2 (id = data-idx) ---------- */
	{ id: '9',  depth: 2, parent: 'monte', order: 1, name: '유아 Lv.1', ageText: '만 3~4세' },
	{ id: '10', depth: 2, parent: 'monte', order: 2, name: '유아 Lv.2', ageText: '만 4~5세' },
	{ id: '11', depth: 2, parent: 'monte', order: 3, name: '유아 Lv.3', ageText: '만 5~6세' },
	{ id: '13', depth: 2, parent: 'monte', order: 4, name: '초등 Lv.1', ageText: '만 6~7세' },
	{ id: '14', depth: 2, parent: 'monte', order: 5, name: '초등 Lv.2', ageText: '만 7~9세' },
	{ id: '4',  depth: 2, parent: 'health',   order: 1, name: '공통' },
	{ id: '5',  depth: 2, parent: 'art',      order: 1, name: '공통' },
	{ id: '7',  depth: 2, parent: 'global',   order: 1, name: '공통' },
	{ id: '8',  depth: 2, parent: 'coding',   order: 1, name: '공통' },
	{ id: '12', depth: 2, parent: 'explorer', order: 1, name: '공통' },

	/* ---------- depth 3 (group 공통 영역) ---------- */
	{ id: 'life',    depth: 3, group: 'monte', order: 1, name: '일상생활' },
	{ id: 'sense',   depth: 3, group: 'monte', order: 2, name: '감각' },
	{ id: 'lang',    depth: 3, group: 'monte', order: 3, name: '언어' },
	{ id: 'math',    depth: 3, group: 'monte', order: 4, name: '수학' },
	{ id: 'culture', depth: 3, group: 'monte', order: 5, name: '문화' },

	{ id: 'body',   depth: 3, group: 'health', order: 1, name: '신체놀이' },
	{ id: 'yoga',   depth: 3, group: 'health', order: 2, name: '키즈요가' },
	{ id: 'food',   depth: 3, group: 'health', order: 3, name: '바른 식습관' },
	{ id: 'safety', depth: 3, group: 'health', order: 4, name: '생활안전' },

	{ id: 'draw',  depth: 3, group: 'art', order: 1, name: '미술·공예' },
	{ id: 'music', depth: 3, group: 'art', order: 2, name: '음악' },
	{ id: 'story', depth: 3, group: 'art', order: 3, name: '동화·연극' },

	{ id: 'en', depth: 3, group: 'global', order: 1, name: '영어' },
	{ id: 'zh', depth: 3, group: 'global', order: 2, name: '중국어' },
	{ id: 'ja', depth: 3, group: 'global', order: 3, name: '일본어' },
	{ id: 'fr', depth: 3, group: 'global', order: 4, name: '프랑스어' },
	{ id: 'es', depth: 3, group: 'global', order: 5, name: '스페인어' },

	{ id: 'unplug', depth: 3, group: 'coding', order: 1, name: '언플러그드' },
	{ id: 'block',  depth: 3, group: 'coding', order: 2, name: '블록코딩' },
	{ id: 'robot',  depth: 3, group: 'coding', order: 3, name: '로봇' },

	{ id: 'nature',  depth: 3, group: 'explorer', order: 1, name: '자연탐험' },
	{ id: 'science', depth: 3, group: 'explorer', order: 2, name: '과학실험' },
	{ id: 'job',     depth: 3, group: 'explorer', order: 3, name: '직업체험' }
], { version: '1' });

/* 글로벌리더 국가 팝업 (원래 '국가1~5' 자리) — 국기는 이미지 대신 CSS 로 그림 */
MockDB.define('cielpia.nations', [
	{ id: 'us', order: 1, name: '미국',   lang: '영어',     area: 'en', greet: 'Hello!' },
	{ id: 'cn', order: 2, name: '중국',   lang: '중국어',   area: 'zh', greet: '你好!' },
	{ id: 'jp', order: 3, name: '일본',   lang: '일본어',   area: 'ja', greet: 'こんにちは!' },
	{ id: 'fr', order: 4, name: '프랑스', lang: '프랑스어', area: 'fr', greet: 'Bonjour!' },
	{ id: 'es', order: 5, name: '스페인', lang: '스페인어', area: 'es', greet: '¡Hola!' }
], { version: '1' });

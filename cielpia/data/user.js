/*
 * Cielpia 가상 데이터 — 데모 학부모 계정의 자녀 · 수강신청 · 찜
 *  - 로그인은 데모에서 지원하지 않으므로 '가상 학부모' 한 명이 로그인한 상태로 가정
 *  - 수강신청(enrollments)·찜(wishes)은 화면에서 추가·변경하면 localStorage 에 저장됨
 */
MockDB.define('cielpia.children', [
	{ id: 1, name: '김하늘', age: 5, gender: '여', avatar: 'cate1' },
	{ id: 2, name: '김바다', age: 3, gender: '남', avatar: 'cate5' }
], { version: '1' });

(function () {
	function no(days, seq) { return 'CP' + Mock.date(Mock.rel(days), 'YYMMDD') + seq; }
	MockDB.define('cielpia.enrollments', [
		{ id: no(-12, '0417'), lectureId: 21, childId: 1, price: 45000, payMethod: 'card', status: '수강중',
			createdAt: Mock.rel(-12, '20:14'), endAt: Mock.rel(78), done: [1, 2, 3], lastAt: Mock.rel(-1, '19:40') },
		{ id: no(-30, '0128'), lectureId: 1, childId: 2, price: 0, payMethod: 'free', status: '수강중',
			createdAt: Mock.rel(-30, '10:02'), endAt: Mock.rel(60), done: [1, 2], lastAt: Mock.rel(-4, '09:15') },
		{ id: no(-45, '0903'), lectureId: 14, childId: 1, price: 0, payMethod: 'free', status: '수강완료',
			createdAt: Mock.rel(-45, '21:30'), endAt: Mock.rel(45), done: [1, 2, 3, 4, 5], lastAt: Mock.rel(-20, '21:05') }
	], { version: '1' });
})();

MockDB.define('cielpia.wishes', [
	{ id: 1, lectureId: 9, createdAt: Mock.rel(-6, '13:20') },
	{ id: 2, lectureId: 29, createdAt: Mock.rel(-2, '08:45') }
], { version: '1' });

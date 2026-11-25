/*
 * Cielpia 소개 (intro/cielpia_intro.html) — 원래 확장자 없는 라우트 /intro/cielpia_intro
 *  - 숫자(강의·선생님·수강생·평균 평점)와 6가지 영역 카드를 가상 데이터에서 계산해 보여 줌
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var lecs = MockDB.all('cielpia.lectures');
	var students = lecs.reduce(function (a, l) { return a + l.students; }, 0);
	var avg = lecs.reduce(function (a, l) { return a + l.rating; }, 0) / (lecs.length || 1);

	$('#cpNumbers').html(
		'<li><b>' + lecs.length + '</b><span>온라인 강의</span></li>' +
		'<li><b>' + MockDB.count('cielpia.teachers') + '</b><span>전문 선생님</span></li>' +
		'<li><b>' + Mock.num(students) + '</b><span>누적 수강생(가상)</span></li>' +
		'<li><b>' + avg.toFixed(1) + '</b><span>평균 평점</span></li>');

	$('#cpFeatures').html(CP.groups().map(function (g) {
		var n = lecs.filter(function (l) { return l.group === g.id; }).length;
		var areas = CP.areas(g.id).map(function (a) { return a.name; }).join(' · ');
		return '<a class="cp-feature" href="' + CP.listUrl({ cate: g.id }) + '">' +
			'<img src="../image/web/main/' + g.icon + '.png" alt="" />' +
			'<div><h4>' + esc(g.name) + '<em>강의 ' + n + '개</em></h4><p>' + esc(g.desc) + '</p><p style="color:#1b79ee;font-size:13px">' + esc(areas) + '</p></div></a>';
	}).join(''));
})(jQuery);

/*
 * MyCultureis 데모 — 메인 (main/pure_main.html)
 *  금주의 Pick 배너와 '한국에서 느끼는 외쿡' · '한국! 어디까지 알고있니?' 타일을 데이터에서 그린다.
 *  원래 마크업(.swiper-slide > a > img, li > a > div.tit)을 그대로 쓰고, 타일 배경은 원래 CSS(nth-child)가 입힌다.
 *  이 스크립트는 슬라이더 초기화 스크립트보다 먼저(동기로) 실행돼야 한다 → 렌더링 후 Swiper 초기화.
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;

	/* 금주의 Pick */
	var picks = MockDB.all(MC.C.pick).sort(function (a, b) { return a.order - b.order; });
	$('.pc_recomm .swiper-wrapper').html(picks.map(function (p) {
		var c = MC.cls(p.classId) || {};
		return '<div class="swiper-slide">' +
			'<a href="' + esc(MC.link.detail(p.classId)) + '" title="' + esc(c.title || '') + '">' +
				'<img src="' + esc(MC.img(p.img)) + '" alt="' + esc(p.alt || c.title || '') + '" />' +
			'</a>' +
		'</div>';
	}).join(''));

	/* 타일 — 카테고리에 클래스 수를 title 로 붙여 둔다 */
	function tiles(selector, grp) {
		var counts = {};
		MockDB.all(MC.C.cls).forEach(function (c) { counts[c.cate] = (counts[c.cate] || 0) + 1; });
		$(selector).html(MC.categories(grp).filter(function (c) { return c.tile; }).map(function (c) {
			return '<li>' +
				'<a href="' + esc(MC.link.list({ b_uid_s: c.id })) + '" title="' + esc(c.name + ' 클래스 ' + (counts[c.id] || 0) + '개 보기') + '">' +
					'<div class="tit">' + esc(c.name) + '</div>' +
				'</a>' +
			'</li>';
		}).join(''));
	}
	tiles('.menu_kor_only ul', 'global');
	tiles('.culture_menu ul', 'korean');
})(jQuery);

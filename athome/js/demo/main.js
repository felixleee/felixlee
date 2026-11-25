/*
 * AthomeTrip 데모 — 메인 화면 렌더링
 * 슬라이더(Swiper)는 원래 pure_main.html 아래쪽 인라인 스크립트가 초기화하므로,
 * 이 파일은 #container 바로 뒤에서 동기로 실행해 '렌더링 → 초기화' 순서를 지킨다.
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	var products = MockDB.all('athome.products');
	function bySales(a, b) { return b.sales - a.sales; }

	/* 3단 배너 */
	$('#mainBanner').html(MockDB.all('athome.banners').map(function (b) {
		return '' +
			'<div class="swiper-slide">' +
				'<a href="' + ATH.href('list', b.link) + '">' +
					'<img src="' + ATH.img(b.img) + '" alt="" />' +
					'<div class="text_wrap">' +
						'<h4>' + Mock.esc(b.title) + '</h4>' +
						'<p>' + Mock.esc(b.text) + '</p>' +
						'<span class="more">둘러보기</span>' +
					'</div>' +
				'</a>' +
			'</div>';
	}).join(''));

	/* 최근 본 상품 — 상세 화면에서 MockDB.setItem('athome.recent') 로 쌓은 기록 */
	var seen = ATH.recent.products();
	if (seen.length) {
		$('#mainSeen').html(seen.map(ATH.seenCard).join(''));
	} else {
		$('#mainSeen').html(
			'<div class="swiper-slide demo_seen_empty">' +
				'<i class="xi-time-o" aria-hidden="true"></i>' +
				'<p class="tit">아직 둘러본 상품이 없어요</p>' +
				'<p class="desc">상품을 보면 여기에 차례로 모여요. <a href="' + ATH.href('list') + '">전체 상품 보기 &gt;</a></p>' +
			'</div>');
		$('.recent_seen').addClass('is_empty');
	}

	/* 앳홈트립's PICK */
	$('#mainPick').html(products.filter(function (p) { return p.pick; }).slice(0, 8).map(function (p) { return ATH.card(p); }).join(''));

	/* 전체 여행지 (도시 12곳) → 목록 도시 필터 */
	$('#mainCity').html(ATH.cities().map(function (c) {
		return '<div class="swiper-slide"><a href="' + ATH.href('list', { city: c.id }) + '"><img src="' + ATH.img(c.img) + '" alt="" /><span>' + Mock.esc(c.name) + '</span></a></div>';
	}).join(''));

	/* 뉴욕 필수여행 Top 10 — 뉴욕 상품을 인기(판매) 순으로 */
	$('#mainTop10').html(products.filter(function (p) { return p.city === 'ny'; }).sort(bySales).slice(0, 10).map(function (p, i) {
		return ATH.card(p, { best: i + 1, statFirst: true });
	}).join(''));

	/* 우리끼리 가이드 투어 */
	$('#mainGuide').html(products.filter(function (p) { return p.cate === 'guide'; }).sort(bySales).slice(0, 8).map(function (p) {
		return ATH.card(p, { statFirst: true });
	}).join(''));
})(jQuery);

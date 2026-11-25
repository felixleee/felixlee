/*
 * Monami France 데모 — 모바일 메인 (main/m_pure_main.html)
 * PC 메인과 같은 데이터로 BEST REVIEW · Where to go · BEST TOUR 를 렌더링한다.
 * </body> 바로 앞에서 동기로 실행되어, 뒤따르는 원래 slick 초기화가 렌더링된 마크업에 적용된다.
 * 상세·예약·후기 화면은 PC 화면으로 연결한다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL;

	var reviews = MockDB.where(C.reviews, function (r) { return r.best > 0; }).sort(function (a, b) { return a.best - b.best; });
	$('#dmBestReview').html(D.tplAll('tpl-best-review', reviews, function (r) {
		var t = D.tour(r.tourId) || {};
		return { href: D.url.review(r.id), image: D.img(r.image || t.image), title: r.title, excerpt: D.br(r.summary || D.cut(r.content, 50)) };
	}));

	$('#dmWhere').html(D.tplAll('tpl-where', D.countries('mSort'), function (c) {
		return { href: D.url.list({ country: c.id }), image: D.img(c.mImage || c.image), en: c.en, ko: c.ko };
	}));

	var best = MockDB.where(C.tours, function (t) { return t.best > 0; }).sort(function (a, b) { return a.best - b.best; });
	$('#dmBestTour').html(D.tplAll('tpl-best-tour', best, function (t) {
		return { href: D.url.tour(t.id), book: D.url.book(t.id), image: D.img(t.mImage || t.image), name: t.name };
	}));
})(jQuery, window.Demo);

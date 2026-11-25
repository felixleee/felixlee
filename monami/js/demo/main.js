/*
 * Monami France 데모 — PC 메인 (main/pure_main.html)
 * BEST REVIEW · Where to go · BEST TOUR · 공지 4건을 가상 데이터로 렌더링한다.
 * 이 스크립트는 슬라이더 초기화 스크립트보다 먼저(본문 중간에서 동기로) 실행되어야
 * 원래 slick / bxSlider 초기화 코드가 렌더링된 마크업에 그대로 적용된다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL;

	// BEST REVIEW — best 순서대로
	var reviews = MockDB.where(C.reviews, function (r) { return r.best > 0; }).sort(function (a, b) { return a.best - b.best; });
	$('#dmBestReview').html(D.tplAll('tpl-best-review', reviews, function (r) {
		var t = D.tour(r.tourId) || {};
		return {
			href: D.url.review(r.id),
			image: D.img(r.image || t.image),
			title: r.title,
			excerpt: D.br(r.summary || D.cut(r.content, 60))
		};
	}));

	// Where to go — 국가별 투어 목록으로
	$('#dmWhere').html(D.tplAll('tpl-where', D.countries('sort'), function (c) {
		return { href: D.url.list({ country: c.id }), image: D.img(c.image), en: c.en, ko: c.ko };
	}));
	// 이미지 위를 덮는 글자 상자(.txt)를 눌러도 이동 (bxSlider 가 만든 복제 슬라이드 포함)
	$('#dmWhere').on('click', '.txt', function () {
		var href = $(this).siblings('a').attr('href');
		if (href) location.href = href;
	});

	// BEST TOUR — 옆 탭(_2/_3)에는 이전/다음 투어 이름
	var best = MockDB.where(C.tours, function (t) { return t.best > 0; }).sort(function (a, b) { return a.best - b.best; });
	$('#dmBestTour').html(D.tplAll('tpl-best-tour', best, function (t, i) {
		var n = best.length;
		return {
			href: D.url.tour(t.id),
			book: D.url.book(t.id),
			image: D.img(t.image),
			name: t.name,
			summary: D.br(t.summary),
			time: t.time,
			daysText: t.daysText,
			prevName: best[(i - 1 + n) % n].name,
			nextName: best[(i + 1) % n].name
		};
	}));

	// 공지 — 최근 4건
	var notices = MockDB.all(C.notices).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; }).slice(0, 4);
	$('#dmNotice').html(D.tplAll('tpl-notice', notices, function (n) {
		return {
			href: D.url.notice(n.id),
			title: n.title,
			cate: D.NOTICE_CATE[n.cate] || '공지',
			short: D.cut(n.title, 19),
			date: Mock.date(n.createdAt)
		};
	}));
})(jQuery, window.Demo);

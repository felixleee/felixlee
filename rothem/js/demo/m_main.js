/*
 * 로뎀투어 데모 — 모바일 메인 (main/m_pure_main.html)
 *  - 인기상품 BEST 6 · 단체/소그룹 추천 탭을 PC 와 같은 가상 데이터로 렌더링
 *  - 상품을 누르면 PC 상세(good/detail.html)로 이동
 */
(function ($) {
	'use strict';

	function labelSpans(list) {
		return (list || []).map(function (t) { return '<span>' + Mock.esc(t) + '</span>'; }).join('');
	}
	function base(g) {
		return { href: RD.goodUrl(g.id), thumb: g.thumb, title: g.title, price: Mock.num(RD.minPrice(g)) };
	}

	/* 인기상품 BEST 6 */
	function renderBest() {
		var $ul = $('.Best .product_list'), tpl = RD.tplOf('tpl-m-best-item');
		var best = MockDB.where('rothem.goods', function (g) { return g.best; }).sort(function (a, b) { return a.best - b.best; }).slice(0, 6);
		if (!best.length) { $ul.html('<li class="rd-m-empty">' + RD.empty('준비 중인 베스트 상품이 없어요') + '</li>'); return; }
		$ul.html(best.map(function (g, i) {
			return RD.tpl(tpl, $.extend(base(g), {
				cls: i === 0 ? 'first' : '',
				rank: g.best,
				tag: g.tag ? '<span class="blue">' + Mock.esc(g.tag) + '</span>' : '',
				labels: labelSpans(g.labels)
			}));
		}).join(''));
	}

	/* 단체 & 소그룹 추천 — 탭을 누르면 해당 테마 추천 상품을 불러온다 */
	var $tabs = $('.tab_choice li'), $list = $('#ajax_recomm .product_list_wide'), seq = 0;
	function renderRecommend(idx) {
		var th = RD.THEMES[idx] || RD.THEMES[0], my = ++seq, tpl = RD.tplOf('tpl-m-recom-item');
		$tabs.removeClass('on').eq(idx).addClass('on');
		$list.html('<li class="rd-m-loading">' + RD.loading('추천 상품을 불러오는 중이에요…') + '</li>');
		MockApi.list('rothem.goods', { filter: function (g) { return g.theme === th.code && g.recommend; }, sort: 'recommend' }).then(function (res) {
			if (my !== seq) return;
			if (!res.items.length) { $list.html('<li class="rd-m-empty">' + RD.empty('추천 상품을 준비하고 있어요') + '</li>'); return; }
			$list.html(res.items.map(function (g) {
				return RD.tpl(tpl, $.extend(base(g), { labels: labelSpans(g.labels) }));
			}).join('') + '<li class="rd-m-more"><a href="' + Mock.esc(RD.listUrl({ theme: th.code })) + '">' + Mock.esc(th.name) + ' 상품 전체보기 &rsaquo;</a></li>');
		});
	}
	$tabs.on('click', function (e) { e.preventDefault(); renderRecommend($tabs.index(this)); });

	renderBest();
	renderRecommend(0);
})(jQuery);

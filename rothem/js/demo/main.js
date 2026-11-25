/*
 * 로뎀투어 데모 — PC 메인 (main/pure_main.html)
 *  - 베스트 6 · 단체/소그룹 추천 탭 4 · 게시판 2열을 가상 데이터에서 렌더링
 *  - 마크업은 페이지 안 <script type="text/html"> 템플릿(원래 마크업 그대로)을 쓴다
 */
(function ($) {
	'use strict';

	var goods = MockDB.all('rothem.goods');

	function card(g) {
		return { href: RD.goodUrl(g.id), thumb: g.thumb, title: g.title, dep: RD.confirmText(g), price: Mock.num(RD.minPrice(g)) };
	}

	/* 베스트 6 — 3개씩 <ul> 두 줄 */
	function renderBest() {
		var $wrap = $('.m_best_deals_b'), tpl = RD.tplOf('tpl-best-item');
		var best = goods.filter(function (g) { return g.best; }).sort(function (a, b) { return a.best - b.best; }).slice(0, 6);
		$wrap.children('ul, .rd-empty').remove();
		if (!best.length) { $wrap.append(RD.empty('준비 중인 베스트 상품이 없어요')); return; }
		var html = '';
		for (var i = 0; i < best.length; i += 3) {
			html += '<ul>' + best.slice(i, i + 3).map(function (g, j, row) {
				return RD.tpl(tpl, $.extend(card(g), { last: j === row.length - 1 && row.length === 3 ? ' last' : '' }));
			}).join('') + '</ul>';
		}
		$wrap.append(html);
	}

	/* 단체 & 소그룹 추천 — 테마 탭마다 <ul class="m_recom_info"> */
	function renderRecommend() {
		var $box = $('#ajax_recomm'), tpl = RD.tplOf('tpl-recom-item');
		var html = RD.THEMES.map(function (th, i) {
			var list = goods.filter(function (g) { return g.theme === th.code && g.recommend; })
				.sort(function (a, b) { return a.recommend - b.recommend; }).slice(0, 3);
			var items = list.length ? list.map(function (g, j) {
				return RD.tpl(tpl, $.extend(card(g), { cls: j === list.length - 1 ? 'last' : '' }));
			}).join('') : '<li class="rd-recom-empty">' + RD.empty('추천 상품을 준비하고 있어요') + '</li>';
			return '<ul class="m_recom_info' + (i === 0 ? ' on' : '') + '">' + items + '</ul>';
		}).join('');
		$box.html(html);

		// 탭 아래 '전체보기' — 탭을 바꾸면 해당 테마 목록으로
		var $more = $('#rdRecomMore');
		function setMore(i) {
			var th = RD.THEMES[i] || RD.THEMES[0];
			$more.attr('href', RD.listUrl({ theme: th.code })).find('b').text(th.name);
		}
		setMore(0);
		$('.recom_tab li').on('click', function () { setMore($('.recom_tab li').index(this)); });
	}

	/* 게시판 2열 — 최근 5건 */
	function renderBoard(bd, sel) {
		var $ul = $(sel), tpl = RD.tplOf('tpl-bbs-item');
		var rows = MockDB.where('rothem.posts', function (p) { return p.bd === bd; })
			.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0; }).slice(0, 5);
		$ul.html(rows.length ? rows.map(function (p) {
			return RD.tpl(tpl, { href: RD.viewUrl(bd, p.id), title: p.title, date: Mock.date(p.createdAt, 'YYYY-MM-DD') });
		}).join('') : '<li class="rd-bbs-empty">등록된 글이 없어요</li>');
	}

	renderBest();
	renderRecommend();
	renderBoard('REVIEW', '#rdMainReview');
	renderBoard('ONLINE', '#rdMainOnline');
})(jQuery);

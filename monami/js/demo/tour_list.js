/*
 * Monami France 데모 — 투어 목록 (tour/list.html?country=&type=&region=&q=&sort=&page=)
 * 국가 탭 · 종류 · 지역 · 검색어 · 정렬 · 페이지를 주소에 남겨 새로고침/뒤로가기에도 유지한다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL, SIZE = 9;
	var countries = D.countries('sort');
	var SORTS = ['sort', '-sales', '-rating', 'priceAdult', '-priceAdult'];

	var state = {
		country: Mock.qs('country') || '',
		type: Mock.qs('type') || '',
		region: Mock.qs('region') || '',
		q: Mock.qs('q') || Mock.qs('g_title_s') || '',
		sort: Mock.qs('sort') || 'sort',
		page: parseInt(Mock.qs('page'), 10) || 1
	};
	if (!D.country(state.country)) state.country = '';
	if (!D.TYPE[state.type]) state.type = '';
	if (SORTS.indexOf(state.sort) < 0) state.sort = 'sort';

	var $list = $('#tlList'), $pager = $('#tlPager');

	// 평점·후기 수·국가 이름을 붙인 행 (정렬·검색용)
	function rows() {
		return MockDB.all(C.tours).map(function (t) {
			var st = D.reviewStat(t.id), c = D.country(t.country) || {};
			t.rating = st.avg; t.reviewCount = st.count;
			t.countryKo = c.ko || ''; t.countryEn = c.en || ''; t.typeLabel = D.TYPE[t.type];
			return t;
		});
	}
	function filterFn(ignoreCountry) {
		return function (t) {
			return (ignoreCountry || !state.country || t.country === state.country) &&
				(!state.type || t.type === state.type) &&
				(!state.region || t.region === state.region);
		};
	}
	var FIELDS = ['name', 'region', 'summary', 'intro', 'countryKo', 'countryEn', 'typeLabel', 'guide'];

	/* ---------- 조건 UI ---------- */
	function renderCountryTabs() {
		// 탭 옆 숫자 = 지금 고른 종류·검색어 기준 국가별 투어 수
		var all = MockApi.query(rows(), { filter: function (t) { return !state.type || t.type === state.type; }, keyword: state.q, fields: FIELDS }).items;
		var h = '<button type="button" data-v="" role="tab"><span class="en">All</span><span class="ko">전체<em>' + all.length + '</em></span></button>';
		countries.forEach(function (c) {
			var n = all.filter(function (t) { return t.country === c.id; }).length;
			h += '<button type="button" data-v="' + c.id + '" role="tab"><span class="en">' + Mock.esc(c.en) + '</span><span class="ko">' + Mock.esc(c.ko) + '<em>' + n + '</em></span></button>';
		});
		$('#tlCountry').html(h).find('button').each(function () {
			var on = $(this).attr('data-v') === state.country;
			$(this).toggleClass('on', on).attr('aria-selected', on ? 'true' : 'false');
		});
	}
	function renderRegions() {
		if (!state.country) { $('#tlRegionRow').hide(); state.region = ''; return; }
		var regions = [];
		MockDB.where(C.tours, function (t) { return t.country === state.country; }).forEach(function (t) {
			if (regions.indexOf(t.region) < 0) regions.push(t.region);
		});
		if (regions.indexOf(state.region) < 0) state.region = '';
		$('#tlRegion').html(['<button type="button" data-v="">전체</button>'].concat(regions.map(function (r) {
			return '<button type="button" data-v="' + Mock.esc(r) + '">' + Mock.esc(r) + '</button>';
		})).join(''));
		$('#tlRegionRow').show();
		$('#tlRegion button').each(function () { $(this).toggleClass('on', $(this).attr('data-v') === state.region); });
	}
	function renderHead() {
		var c = D.country(state.country), title = (c ? c.ko + ' ' : '') + (state.type ? D.TYPE[state.type] : (c ? '투어' : '전체 투어'));
		$('#dmPageTitle').text(title);
		document.title = title + ' :: 모나미프랑스 · LJY Port (실제 운영되는 페이지가 아닙니다)';
		var loc = ' <i class="xi-angle-right-min"></i> <a href="list.html">투어</a>';
		if (state.type) loc += ' <i class="xi-angle-right-min"></i> <a href="' + Mock.url('list.html', { type: state.type }) + '">' + D.TYPE[state.type] + '</a>';
		if (c) loc += ' <i class="xi-angle-right-min"></i> <strong>' + Mock.esc(c.ko) + '</strong>';
		$('#dmLoc').html('<a href="../main/pure_main.html"><i class="xi-home"></i> Home</a>' + loc);
		$('#tlType button').each(function () { $(this).toggleClass('on', $(this).attr('data-v') === state.type); });
		$('#tlSearch [name=q]').val(state.q);
		$('#tlSort').val(state.sort);
	}

	/* ---------- 목록 ---------- */
	function load(scroll) {
		renderCountryTabs();
		renderRegions();
		renderHead();
		D.syncQuery({ country: state.country, type: state.type, region: state.region, q: state.q, sort: state.sort === 'sort' ? '' : state.sort, page: state.page > 1 ? state.page : '' });
		D.loading($list, '투어를 불러오는 중이에요…');
		$pager.empty();
		$('#tlCount').html('&nbsp;');
		if (scroll) $('html, body').animate({ scrollTop: $('.dm-listhead').offset().top - 120 }, 250);

		MockApi.resolve(function () {
			return MockApi.query(rows(), { filter: filterFn(), keyword: state.q, fields: FIELDS, sort: [state.sort, 'sort'], page: state.page, size: SIZE });
		}).then(render, function (e) { D.fail($list, e); });
	}

	function render(res) {
		state.page = res.page;
		var head = '총 <strong>' + res.total + '</strong>개의 투어';
		if (state.q) head += ' · <span class="dm-kw">“' + Mock.esc(state.q) + '”</span> 검색 결과';
		$('#tlCount').html(head);
		if (!res.total) {
			D.empty($list, state.q ? '“' + state.q + '”에 맞는 투어가 없어요. 다른 검색어나 조건으로 찾아보세요.' : '조건에 맞는 투어가 없어요.',
				'<button type="button" class="dm-btn" id="tlReset">조건 초기화</button>');
			return;
		}
		$list.html('<div class="dm-grid">' + D.tplAll('tpl-tour-card', res.items, function (t) {
			return {
				href: D.url.tour(t.id), book: D.url.book(t.id), image: D.img(t.image), name: t.name,
				typeLabel: t.typeLabel, countryEn: t.countryEn, region: t.region,
				bestBadge: t.best ? '<span class="dm-best">BEST ' + t.best + '</span>' : '',
				summary: D.oneLine(t.summary), time: t.time, duration: t.duration, daysText: t.daysText,
				price: D.won(t.priceAdult),
				stars: t.reviewCount ? D.stars(t.rating) : '',
				rateText: t.reviewCount ? t.rating.toFixed(1) + ' · 후기 ' + t.reviewCount + '개' : '첫 후기를 기다려요'
			};
		}) + '</div>');
		D.pager($pager, res, function (p) { state.page = p; load(true); });
	}

	/* ---------- 이벤트 ---------- */
	$('#tlCountry').on('click', 'button', function () {
		state.country = $(this).attr('data-v'); state.region = ''; state.page = 1; load();
	});
	$('#tlType').on('click', 'button', function () { state.type = $(this).attr('data-v'); state.page = 1; load(); });
	$('#tlRegion').on('click', 'button', function () { state.region = $(this).attr('data-v'); state.page = 1; load(); });
	$('#tlSort').on('change', function () { state.sort = $(this).val(); state.page = 1; load(); });
	$('#tlSearch').on('submit', function (e) {
		e.preventDefault();
		state.q = $.trim($(this).find('[name=q]').val()); state.page = 1; load();
	});
	$list.on('click', '#tlReset', function () {
		state = { country: '', type: '', region: '', q: '', sort: 'sort', page: 1 }; load();
	});

	load();
})(jQuery, window.Demo);

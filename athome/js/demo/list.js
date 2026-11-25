/*
 * AthomeTrip 데모 — 상품 목록 (good/list.html)
 * 주소 값: city · region · cate · q · sort(popular|low|high|rating) · page
 *          + 통합검색에서 넘어온 kind · date · checkin · checkout · adult · child · room (상세로 그대로 넘김)
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	var SIZE = 12;
	var SORTS = [
		{ id: 'popular', name: '인기순', sort: ['-sales'] },
		{ id: 'low', name: '낮은 가격순', sort: ['price', '-sales'] },
		{ id: 'high', name: '높은 가격순', sort: ['-price', '-sales'] },
		{ id: 'rating', name: '평점순', sort: ['-rating', '-reviews'] }
	];
	var KEYS = ['city', 'region', 'cate', 'q', 'sort', 'page', 'kind', 'date', 'checkin', 'checkout', 'adult', 'child', 'room'];

	var st = {};
	KEYS.forEach(function (k) { st[k] = Mock.qs(k) || ''; });
	if (!SORTS.some(function (s) { return s.id === st.sort; })) st.sort = 'popular';
	st.page = parseInt(st.page, 10) || 1;

	var regions = window.ATHOME_REGIONS || [];
	function regionName(id) { var r = regions.filter(function (x) { return x.id === id; })[0]; return r ? r.name : ''; }

	var all = MockDB.all('athome.products');
	var reqSeq = 0;

	/* ---------- 조건 ---------- */
	function matcher(s, skip) {
		var kw = $.trim(s.q || '').toLowerCase();
		return function (p) {
			if (skip !== 'city') {
				if (s.city && p.city !== s.city) return false;
				if (!s.city && s.region) { var c = ATH.city(p.city); if (!c || c.region !== s.region) return false; }
			}
			if (skip !== 'cate' && s.cate && p.cate !== s.cate) return false;
			if (kw) {
				var hay = [p.title, p.sub, ATH.cityName(p.city), ATH.cateName(p.cate), (ATH.city(p.city) || {}).en].join(' ').toLowerCase();
				if (hay.indexOf(kw) < 0) return false;
			}
			return true;
		};
	}

	/** 상세로 넘길 검색 값 (날짜·인원) */
	function passParams() {
		var o = {};
		['date', 'checkin', 'checkout', 'adult', 'child', 'room'].forEach(function (k) { if (st[k]) o[k] = st[k]; });
		return o;
	}

	function syncUrl() {
		var o = {};
		KEYS.forEach(function (k) { if (st[k] && !(k === 'sort' && st[k] === 'popular') && !(k === 'page' && st[k] === 1)) o[k] = st[k]; });
		try { history.replaceState(null, '', Mock.url(location.pathname.split('/').pop(), o)); } catch (e) { /* file:// 등에서 막히면 주소만 그대로 */ }
	}

	/* ---------- 머리말 · 필터 ---------- */
	function renderHead() {
		var parts = [];
		if (st.city) parts.push(ATH.cityName(st.city));
		else if (st.region) parts.push(regionName(st.region));
		if (st.cate) parts.push(ATH.cateName(st.cate));
		var title = parts.length ? parts.join(' · ') : '전체 상품';
		$('#listTitle').html(Mock.esc(title) + (st.q ? '<small>‘' + Mock.esc(st.q) + '’ 검색 결과</small>' : ''));
		$('#listLoc').text(title);
		document.title = title + ' - AthomeTrip | LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$('#listKw').val(st.q);

		// 도시 칩 (개수는 다른 조건 기준)
		var byCity = all.filter(matcher(st, 'city'));
		var cityHtml = '<li><button type="button" data-city="" class="' + (!st.city && !st.region ? 'on' : '') + '">전체<span class="n">' + byCity.length + '</span></button></li>';
		if (st.region && !st.city) cityHtml += '<li><button type="button" class="on" data-region="' + Mock.esc(st.region) + '">' + Mock.esc(regionName(st.region)) + ' 전체</button></li>';
		cityHtml += ATH.cities().map(function (c) {
			var n = byCity.filter(function (p) { return p.city === c.id; }).length;
			return '<li><button type="button" data-city="' + c.id + '" class="' + (st.city === c.id ? 'on' : '') + '">' + Mock.esc(c.name) + '<span class="n">' + n + '</span></button></li>';
		}).join('');
		$('#cityChips').html(cityHtml);

		var byCate = all.filter(matcher(st, 'cate'));
		$('#cateChips').html('<li><button type="button" data-cate="" class="' + (!st.cate ? 'on' : '') + '">전체<span class="n">' + byCate.length + '</span></button></li>' +
			ATH.categories().map(function (c) {
				var n = byCate.filter(function (p) { return p.cate === c.id; }).length;
				return '<li><button type="button" data-cate="' + c.id + '" class="' + (st.cate === c.id ? 'on' : '') + '">' + Mock.esc(c.name) + '<span class="n">' + n + '</span></button></li>';
			}).join(''));

		$('#listSort').html(SORTS.map(function (s) {
			return '<li><button type="button" data-sort="' + s.id + '" class="' + (st.sort === s.id ? 'on' : '') + '" aria-pressed="' + (st.sort === s.id) + '">' + s.name + '</button></li>';
		}).join(''));

		// 통합검색 조건 (날짜·인원 — 상품을 거르지 않고 상세 예약 칸에 미리 채워 줌)
		var chips = [];
		if (st.q) chips.push(['q', '검색어 ‘' + st.q + '’']);
		if (st.date) chips.push(['date', '출발일 ' + ATH.dateText(st.date)]);
		if (st.checkin && st.checkout) chips.push(['checkin', ATH.dateText(st.checkin) + ' ~ ' + ATH.dateText(st.checkout) + ' · ' + ATH.nights(st.checkin, st.checkout) + '박']);
		if (st.adult) chips.push(['adult', '성인 ' + st.adult + (+st.child > 0 ? ' · 소아 ' + st.child : '') + (+st.room > 0 ? ' · 객실 ' + st.room : '')]);
		if (chips.length) {
			$('#listCond').html('<span class="lbl"><i class="xi-search"></i> 검색 조건</span>' + chips.map(function (c) {
				return '<span class="chip">' + Mock.esc(c[1]) + '<button type="button" data-drop="' + c[0] + '" aria-label="' + Mock.esc(c[1]) + ' 조건 빼기"><i class="xi-close-min"></i></button></span>';
			}).join('') + '<button type="button" class="demo_link reset" data-drop="all">조건 모두 지우기</button>').prop('hidden', false);
		} else {
			$('#listCond').empty().prop('hidden', true);
		}
	}

	/* ---------- 목록 ---------- */
	function renderPaging(res) {
		if (res.pages <= 1) { $('#listPaging').empty(); return; }
		var r = Mock.pageRange(res.page, res.pages, 5);
		var h = '<span><button type="button" class="pg_btn" data-page="' + (res.page - 1) + '"' + (res.page <= 1 ? ' disabled' : '') + ' aria-label="이전 페이지"><i class="xi-angle-left"></i></button></span><ul>';
		r.list.forEach(function (n) {
			h += '<li class="' + (n === res.page ? 'on' : '') + '"><button type="button" class="pg_btn" data-page="' + n + '"' + (n === res.page ? ' aria-current="page"' : '') + '>' + n + '</button></li>';
		});
		h += '</ul><span><button type="button" class="pg_btn" data-page="' + (res.page + 1) + '"' + (res.page >= res.pages ? ' disabled' : '') + ' aria-label="다음 페이지"><i class="xi-angle-right"></i></button></span>';
		$('#listPaging').html(h);
	}

	function load(scroll) {
		renderHead();
		syncUrl();
		var seq = ++reqSeq;
		var $grid = $('#listGrid');
		if ($grid.children('.demo_item').length) $grid.addClass('is_loading');
		else $grid.html(ATH.loadingHtml('상품을 불러오는 중이에요'));
		$('#listCount').html('총 <strong>-</strong>개');

		MockApi.list('athome.products', {
			filter: matcher(st),
			sort: SORTS.filter(function (s) { return s.id === st.sort; })[0].sort,
			page: st.page,
			size: SIZE
		}).then(function (res) {
			if (seq !== reqSeq) return;      // 그 사이 조건이 바뀌었으면 버림
			$grid.removeClass('is_loading');
			st.page = res.page;
			$('#listCount').html('총 <strong>' + res.total + '</strong>개');
			if (!res.total) {
				$grid.html(ATH.emptyHtml('조건에 맞는 상품이 없어요', '여행지나 카테고리를 바꾸거나 검색어를 지워 보세요.',
					'<button type="button" class="demo_btn line sm" data-drop="all">조건 초기화</button>'));
				$('#listPaging').empty();
				return;
			}
			var pp = passParams();
			$grid.html(res.items.map(function (p) { return ATH.card(p, { wrap: 'demo_item', params: pp }); }).join(''));
			renderPaging(res);
			if (scroll) $('html, body').animate({ scrollTop: $('.demo_toolbar').offset().top - 20 }, 250);
		}, function (err) {
			$grid.removeClass('is_loading').html(ATH.emptyHtml('목록을 불러오지 못했어요', err && err.message));
		});
	}

	/* ---------- 이벤트 ---------- */
	$(function () {
		ATH.bindLike('#listGrid');

		$('#cityChips').on('click', 'button', function () {
			st.city = $(this).data('city') || '';
			st.region = st.city ? '' : ($(this).data('region') || '');
			st.page = 1; load();
		});
		$('#cateChips').on('click', 'button', function () { st.cate = $(this).data('cate') || ''; st.page = 1; load(); });
		$('#listSort').on('click', 'button', function () { st.sort = $(this).data('sort'); st.page = 1; load(); });
		$('#listPaging').on('click', 'button[data-page]', function () {
			var n = parseInt($(this).data('page'), 10);
			if (n && n !== st.page) { st.page = n; load(true); }
		});
		$('#listKwForm').on('submit', function () { st.q = $.trim($('#listKw').val()); st.page = 1; load(); return false; });
		$(document).on('click', '[data-drop]', function () {
			var k = $(this).data('drop');
			if (k === 'all') KEYS.forEach(function (x) { st[x] = ''; });
			else if (k === 'checkin') { st.checkin = ''; st.checkout = ''; }
			else if (k === 'adult') { st.adult = ''; st.child = ''; st.room = ''; }
			else st[k] = '';
			st.sort = st.sort || 'popular';
			st.page = 1; load();
		});

		load();
	});
})(jQuery);

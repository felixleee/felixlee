/*
 * 로뎀투어 데모 — 상품 목록 (good/list.html)
 *  ?theme=exodus|paul|reform|holyland &course= &country= &month=YYYY-MM &sort= &page= &g_title_s=(헤더 검색어)
 *  - 테마 탭 · 코스 · 국가 · 출발월 필터, 정렬, 페이징, 로딩 표시, 결과 없음
 */
(function ($) {
	'use strict';

	var SIZE = 6;
	var SORTS = { rec: ['_rank', 'id'], price: ['_min', 'id'], '-price': ['-_min', 'id'], dep: ['_dep', '_min'], days: ['days', '_min'] };
	var state = {
		theme: Mock.qs('theme') || '',
		course: Mock.qs('course') || '',
		country: Mock.qs('country') || '',
		month: Mock.qs('month') || '',
		sort: SORTS[Mock.qs('sort')] ? Mock.qs('sort') : 'rec',
		page: parseInt(Mock.qs('page'), 10) || 1,
		g_title_s: (Mock.qs('g_title_s') || '').replace(RD.SEARCH_HINT, '').trim()
	};
	if (state.course && !RD.course(state.course)) state.course = '';
	if (state.course && !state.theme) state.theme = RD.course(state.course).theme;
	if (state.theme && !RD.theme(state.theme)) state.theme = '';

	var $list = $('#rdGoodsList'), $paging = $('#rdPaging'), $total = $('#rdTotal'), seq = 0;

	/* ---------- 필터 UI ---------- */
	function buildStatic() {
		$('#rdCountry').append(RD.COUNTRIES.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''));
		var d = new Date(), html = '';
		d.setDate(1);
		for (var i = 0; i < 6; i++) {
			var t = new Date(d.getFullYear(), d.getMonth() + i, 1);
			html += '<option value="' + Mock.date(t, 'YYYY-MM') + '">' + Mock.date(t, 'YYYY년 MM월') + '</option>';
		}
		$('#rdMonth').append(html);
	}

	function syncUI() {
		var th = RD.theme(state.theme), cs = RD.course(state.course);
		// 탭
		$('#rdThemeTab').html(['<li class="' + (!state.theme ? 'on' : '') + '"><a href="#" data-theme="">전체</a></li>'].concat(RD.THEMES.map(function (t) {
			return '<li class="' + (t.code === state.theme ? 'on' : '') + '"><a href="#" data-theme="' + t.code + '">' + Mock.esc(t.name) + '</a></li>';
		})).join(''));
		// 코스
		$('#rdCourse').html(th ? ['<a href="#" data-course="" class="' + (!state.course ? 'on' : '') + '">' + Mock.esc(th.name) + ' 전체</a>'].concat(th.courses.map(function (c) {
			return '<a href="#" data-course="' + c.code + '" class="' + (c.code === state.course ? 'on' : '') + '">' + Mock.esc(c.name) + '</a>';
		})).join('') : '');
		// 제목 · 위치
		$('#rdListTitle').text(cs ? cs.name : th ? th.name : '전체 여행상품');
		$('#rdListDesc').text(th ? th.desc : '출애굽 · 바울여정 · 종교개혁지 · 성지완전일주, 로뎀투어의 모든 성지순례 상품입니다.');
		$('#rdLocTheme').html(th ? '<a href="' + RD.listUrl({ theme: th.code }) + '">' + Mock.esc(th.name) + '</a>' : '<strong>여행상품</strong>');
		$('#rdLocCourse').html(cs ? '<span class="sep">&gt;</span><strong>' + Mock.esc(cs.name) + '</strong>' : '');
		if (th && !cs) $('#rdLocTheme').html('<strong>' + Mock.esc(th.name) + '</strong>');
		$('body').attr('data-gnb', th ? th.name : '');
		$('#gnb_re .menu > li > a').removeClass('on').filter(function () { return th && $(this).text() === th.name; }).addClass('on');
		document.title = (cs ? cs.name : th ? th.name : '여행상품') + ' | 로뎀투어 - LJY Port :: 실제 운영되는 페이지가 아닙니다';
		// 폼
		$('#rdCountry').val(state.country);
		$('#rdMonth').val(state.month);
		$('#rdKw').val(state.g_title_s);
		$('#rdSort a').removeClass('on').filter('[data-sort="' + state.sort + '"]').addClass('on');
	}

	/* ---------- 조회 ---------- */
	function decorate(g) {
		var open = RD.upcoming(g).filter(RD.isOpen);
		g._min = RD.minPrice(g);
		g._dep = open.length ? open[0].date : '9999-12-31';
		g._rank = g.best ? g.best : g.recommend ? 10 + g.recommend : 100;
		g._seats = open.length ? open[0].seats : 0;
		return g;
	}
	function matches(g) {
		if (state.theme && g.theme !== state.theme) return false;
		if (state.course && g.course !== state.course) return false;
		if (state.country && (g.countries || []).indexOf(state.country) < 0) return false;
		if (state.month && !RD.upcoming(g).some(function (d) { return RD.isOpen(d) && d.date.indexOf(state.month) === 0; })) return false;
		if (state.g_title_s) {
			var text = RD.searchText(g);
			return state.g_title_s.toLowerCase().split(/\s+/).every(function (w) { return text.indexOf(w) >= 0; });
		}
		return true;
	}
	function hl(text) {
		var out = Mock.esc(text);
		if (!state.g_title_s) return out;
		state.g_title_s.split(/\s+/).forEach(function (w) {
			if (!w) return;
			var re = new RegExp('(' + Mock.esc(w).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
			out = out.replace(re, '<mark class="rd-hl">$1</mark>');
		});
		return out;
	}

	function row(g) {
		var th = RD.theme(g.theme), cs = RD.course(g.course), logo = RD.airLogo(g.airline), href = Mock.esc(RD.goodUrl(g.id));
		return '<li class="rd-goods">' +
			'<a class="rd-goods-thumb" href="' + href + '"><img src="' + Mock.esc(g.thumb) + '" alt="" />' +
			(g.best ? '<span class="rd-best">BEST<b>' + g.best + '</b></span>' : '') + '</a>' +
			'<div class="rd-goods-info">' +
				'<p><span class="rd-chip">' + Mock.esc(th ? th.name : '') + '</span><span class="rd-chip line">' + Mock.esc(cs ? cs.name : '') + '</span> ' +
				(g.labels || []).map(function (l) { return '<span class="rd-label">' + Mock.esc(l) + '</span>'; }).join('') + '</p>' +
				'<h3><a href="' + href + '">' + hl(g.title) + '</a></h3>' +
				'<p class="rd-goods-point">' + Mock.esc((g.points || [])[0] || '') + '</p>' +
				'<ul class="rd-goods-meta">' +
					'<li>' + (logo ? '<img src="' + logo + '" alt="" />' : '<i class="fa fa-plane"></i>') + Mock.esc(g.airline) + '</li>' +
					'<li><i class="fa fa-calendar"></i>' + RD.period(g) + '</li>' +
					'<li><i class="fa fa-map-marker"></i>' + Mock.esc(g.from) + ' 출발 · ' + Mock.esc(RD.countriesText(g)) + '</li>' +
				'</ul>' +
				'<p class="rd-goods-dep">' + Mock.esc(RD.confirmText(g)) + '</p>' +
			'</div>' +
			'<div class="rd-goods-price">' +
				'<strong class="price">' + Mock.num(g._min) + '<span>원~</span></strong>' +
				'<span class="seat">' + (g._seats ? '가장 빠른 출발 잔여 <em>' + g._seats + '석</em>' : '예약 가능한 출발일 없음') + '</span>' +
				'<a class="rd-btn sm" href="' + href + '">상세보기</a>' +
			'</div>' +
		'</li>';
	}

	function load() {
		var my = ++seq;
		syncUI();
		RD.replaceQuery({ theme: state.theme, course: state.course, country: state.country, month: state.month, sort: state.sort === 'rec' ? '' : state.sort, page: state.page > 1 ? state.page : '', g_title_s: state.g_title_s });
		$list.html('<li>' + RD.loading('상품을 불러오는 중이에요…') + '</li>');
		$paging.empty();
		MockApi.resolve(function () {
			var rows = MockDB.all('rothem.goods').map(decorate);
			return MockApi.query(rows, { filter: matches, sort: SORTS[state.sort], page: state.page, size: SIZE });
		}).then(function (res) {
			if (my !== seq) return;
			state.page = res.page;
			$total.html('총 <strong>' + res.total + '</strong>개 상품' +
				(state.g_title_s ? ' · <span class="kw">‘' + Mock.esc(state.g_title_s) + '’</span> 검색 결과 <a href="#" id="rdClearKw">검색어 지우기</a>' : ''));
			if (!res.items.length) {
				$list.html('<li>' + RD.empty('조건에 맞는 상품이 없어요', '필터를 바꾸거나 <a href="list.html">전체 상품</a>을 확인해 보세요. 원하는 일정은 <a href="../cmm/inquiry_travel.html?BD_CD=QNA">단체 맞춤 견적</a>으로도 만들어 드려요.') + '</li>');
				return;
			}
			$list.html(res.items.map(row).join(''));
			$paging.html(RD.pager(res));
		}, function (err) {
			$list.html('<li>' + RD.empty('목록을 불러오지 못했어요', Mock.esc(err.message)) + '</li>');
		});
	}

	/* ---------- 이벤트 ---------- */
	$('#rdThemeTab').on('click', 'a', function (e) {
		e.preventDefault();
		state.theme = $(this).attr('data-theme'); state.course = ''; state.page = 1; load();
	});
	$('#rdCourse').on('click', 'a', function (e) {
		e.preventDefault();
		state.course = $(this).attr('data-course'); state.page = 1; load();
	});
	$('#rdCountry, #rdMonth').on('change', function () {
		state.country = $('#rdCountry').val(); state.month = $('#rdMonth').val(); state.page = 1; load();
	});
	$('#rdFilter').on('submit', function (e) {
		e.preventDefault();
		state.country = $('#rdCountry').val(); state.month = $('#rdMonth').val(); state.g_title_s = $.trim($('#rdKw').val()); state.page = 1;
		$('form[name=top_search_frm] input[name=g_title_s]').val(state.g_title_s || RD.SEARCH_HINT);
		load();
	});
	$('#rdFilterReset').on('click', function (e) {
		e.preventDefault();
		state = { theme: '', course: '', country: '', month: '', sort: 'rec', page: 1, g_title_s: '' };
		$('form[name=top_search_frm] input[name=g_title_s]').val(RD.SEARCH_HINT);
		load();
	});
	$total.on('click', '#rdClearKw', function (e) {
		e.preventDefault();
		state.g_title_s = ''; state.page = 1;
		$('form[name=top_search_frm] input[name=g_title_s]').val(RD.SEARCH_HINT);
		load();
	});
	$('#rdSort').on('click', 'a', function (e) {
		e.preventDefault();
		state.sort = $(this).attr('data-sort'); state.page = 1; load();
	});
	$paging.on('click', 'a[data-page]', function (e) {
		e.preventDefault();
		state.page = parseInt($(this).attr('data-page'), 10) || 1;
		load();
		$('html, body').scrollTop($('#rdList').offset().top - 10);
	});
	// GNB 의 테마 · 코스 링크는 같은 화면이라 다시 읽지 않고 바로 반영
	$('#gnb_re').on('click', 'a[href*="list.html?"]', function (e) {
		var q = this.getAttribute('href').split('?')[1] || '';
		e.preventDefault();
		state = { theme: Mock.qs('theme', q) || '', course: Mock.qs('course', q) || '', country: '', month: '', sort: 'rec', page: 1, g_title_s: '' };
		$('.menu_box').addClass('none');
		load();
	});

	buildStatic();
	load();
})(jQuery);

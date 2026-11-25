/*
 * Cielpia 강의 목록 (content/lecture_list.html?cate=&area=&age=&price=&sort=&page=)
 *  - cate : 1단계 분류 id(monte·health…) 또는 2단계 data-idx(9·10…)
 *  - area : 3단계 영역 id (life·sense… / en·zh…)
 *  - 카테고리·단계·영역·연령·수강료 필터, 정렬(인기·최신·평점), 결과 수, 페이징 — 주소와 동기화
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var SIZE = 8;
	var SORTS = { pop: ['-students', '-rating'], 'new': ['-createdAt'], rate: ['-rating', '-reviews'] };
	var AGES = [{ v: '', t: '전체' }, { v: '3', t: '만 3세' }, { v: '4', t: '만 4세' }, { v: '5', t: '만 5세' }, { v: '6', t: '만 6세 이상' }];
	var PRICES = [{ v: '', t: '전체' }, { v: 'free', t: '무료' }, { v: 'paid', t: '유료' }];

	var st = {
		cate: Mock.qs('cate') || '',
		area: Mock.qs('area') || '',
		age: Mock.qs('age') || '',
		price: Mock.qs('price') || '',
		sort: SORTS[Mock.qs('sort')] ? Mock.qs('sort') : 'pop',
		page: parseInt(Mock.qs('page'), 10) || 1
	};
	var reqSeq = 0;

	function scope() { return CP.resolveCate(st.cate); } // { group, level }

	function matchBase(l, s, skip) {
		if (s.group && l.group !== s.group) return false;
		if (s.level && skip !== 'level' && l.level !== s.level) return false;
		return true;
	}
	function matches(l) {
		var s = scope();
		if (!matchBase(l, s)) return false;
		if (st.area && l.area !== st.area) return false;
		if (st.age) {
			var a = Number(st.age);
			if (a >= 6 ? l.ageMax < 6 : (l.ageMin > a || l.ageMax < a)) return false;
		}
		if (st.price === 'free' && l.price > 0) return false;
		if (st.price === 'paid' && !l.price) return false;
		return true;
	}

	function chip(k, v, label, on, extra) {
		return '<button type="button" class="cp-chip' + (on ? ' is-on' : '') + '" data-k="' + k + '" data-v="' + esc(v) + '" aria-pressed="' + !!on + '">' + label + (extra || '') + '</button>';
	}

	function renderHead() {
		var s = scope(), g = CP.cate(s.group), lv = CP.cate(s.level), ar = CP.cate(st.area);
		var title = g ? g.name + (lv && lv.name !== '공통' ? ' ' + lv.name : '') : (st.price === 'free' ? '무료 강의' : (st.sort === 'rate' ? '추천 수업' : '전체 강의'));
		$('#cpTitle').text(title + (ar ? ' · ' + ar.name : ''));
		$('#cpDesc').text(g ? g.desc + (lv && lv.ageText ? ' (' + lv.ageText + ')' : '') :
			(st.sort === 'rate' && !st.price ? '수강생 평점이 높은 수업부터 보여 드려요.' : '유치원생과 부모님을 위한 씨엘피아의 모든 강의를 한눈에 모았어요.'));
		document.title = $('#cpTitle').text() + ' | LJY Port :: 실제 운영되는 페이지가 아닙니다';

		var loc = ['<a href="../main/pure_main.html">홈</a>', '<a href="' + CP.listUrl({}) + '">강의</a>'];
		if (g) loc.push('<a href="' + CP.listUrl({ cate: g.id }) + '">' + esc(g.name) + '</a>');
		if (lv && lv.name !== '공통') loc.push('<a href="' + CP.listUrl({ cate: lv.id }) + '">' + esc(lv.name) + '</a>');
		if (ar) loc.push(esc(ar.name));
		$('#cpLocation').html(loc.join('<i class="xi-angle-right-min" aria-hidden="true"></i>'));

		// 1단계 분류 탭 (메인 아이콘 이미지 재사용)
		$('#cpCateTabs').html(
			'<a href="' + CP.listUrl({}) + '" data-cate="" role="tab" aria-selected="' + !s.group + '"' + (s.group ? '' : ' class="is-on"') + '><span class="cp-all-ico">ALL</span>전체</a>' +
			CP.groups().map(function (gg) {
				var on = gg.id === s.group;
				return '<a href="' + CP.listUrl({ cate: gg.id }) + '" data-cate="' + gg.id + '" role="tab" aria-selected="' + on + '"' + (on ? ' class="is-on"' : '') + '>' +
					'<img src="../image/web/main/' + gg.icon + (on ? '_blue' : '') + '.png" alt="" />' + esc(gg.name) + '</a>';
			}).join('')
		);

		// 필터
		var rows = [];
		if (g) {
			var levels = CP.levels(g.id);
			if (levels.length > 1) {
				rows.push('<div class="cp-filter-row"><dt>단계</dt><dd class="cp-chips">' + chip('level', '', '전체', !s.level) +
					levels.map(function (x) { return chip('level', x.id, esc(x.name), x.id === s.level, x.ageText ? '<em>' + esc(x.ageText) + '</em>' : ''); }).join('') + '</dd></div>');
			}
			var all = MockDB.where('cielpia.lectures', function (l) { return matchBase(l, s); });
			var areaRow = chip('area', '', '전체', !st.area, '<em>' + all.length + '</em>') +
				CP.areas(g.id).map(function (a) {
					var n = all.filter(function (l) { return l.area === a.id; }).length;
					return chip('area', a.id, esc(a.name), a.id === st.area, '<em>' + n + '</em>');
				}).join('');
			var note = '';
			if (g.nationPopup) {
				var nation = MockDB.getItem('cielpia.nation', null);
				if (nation) note = '<p class="cp-filter-note">메인에서 고른 나라: <b>' + esc(nation.name) + ' · ' + esc(nation.lang) + '</b></p>';
			}
			rows.push('<div class="cp-filter-row"><dt>영역</dt><dd><div class="cp-chips">' + areaRow + '</div>' + note + '</dd></div>');
		}
		rows.push('<div class="cp-filter-row"><dt>연령</dt><dd class="cp-chips">' + AGES.map(function (a) { return chip('age', a.v, a.t, a.v === st.age); }).join('') + '</dd></div>');
		rows.push('<div class="cp-filter-row"><dt>수강료</dt><dd class="cp-chips">' + PRICES.map(function (p) { return chip('price', p.v, p.t, p.v === st.price); }).join('') + '</dd></div>');
		$('#cpFilter').html(rows.join(''));

		$('#cpSort button').each(function () {
			var on = $(this).attr('data-sort') === st.sort;
			$(this).toggleClass('is-on', on).attr('aria-pressed', on);
		});
	}

	function syncUrl() {
		var url = Mock.url('lecture_list.html', { cate: st.cate, area: st.area, age: st.age, price: st.price, sort: st.sort === 'pop' ? '' : st.sort, page: st.page > 1 ? st.page : '' });
		try { history.replaceState(null, '', url); } catch (e) { /* file:// 제한 등 */ }
	}

	function hasFilter() { return !!(st.cate || st.area || st.age || st.price); }

	function load() {
		renderHead();
		syncUrl();
		var my = ++reqSeq;
		$('#cpList').html(CP.loading());
		$('#cpPaging').empty();
		$('#cpTotal').html('검색 중…');
		MockApi.list('cielpia.lectures', { filter: matches, sort: SORTS[st.sort], page: st.page, size: SIZE }).then(function (res) {
			if (my !== reqSeq) return;
			st.page = res.page;
			$('#cpTotal').html('총 <b>' + res.total + '</b>개 강의' + (hasFilter() ? '<a href="' + CP.listUrl({}) + '" class="cp-reset" data-reset>필터 초기화</a>' : ''));
			if (!res.total) {
				$('#cpList').html(CP.empty('조건에 맞는 강의가 없어요', '연령이나 수강료 조건을 바꾸거나 다른 영역을 골라 보세요.',
					'<button type="button" class="cp-btn cp-btn-blue" data-reset>필터 초기화</button>'));
				return;
			}
			$('#cpList').html('<ul class="cp-grid">' + res.items.map(function (l) { return CP.card(l); }).join('') + '</ul>');
			$('#cpPaging').html(CP.paging(res));
		}).catch(function (e) {
			$('#cpList').html(CP.empty('강의를 불러오지 못했어요', e.message));
		});
	}

	/* ---------- 이벤트 ---------- */
	$('#cpCateTabs').on('click', 'a', function (e) {
		e.preventDefault();
		st.cate = $(this).attr('data-cate');
		st.area = ''; st.page = 1;
		load();
	});
	$('#cpFilter').on('click', '.cp-chip', function () {
		var k = $(this).attr('data-k'), v = $(this).attr('data-v');
		if (k === 'level') { st.cate = v || scope().group; st.area = st.area; }
		else st[k] = v;
		st.page = 1;
		load();
	});
	$('#cpSort').on('click', 'button', function () {
		st.sort = $(this).attr('data-sort');
		st.page = 1;
		load();
	});
	$('#cpPaging').on('click', 'button[data-page]', function () {
		st.page = Number($(this).attr('data-page'));
		load();
		$('html, body').animate({ scrollTop: $('#cpTotal').offset().top - 20 }, 200);
	});
	$(document).on('click', '[data-reset]', function (e) {
		e.preventDefault();
		st = { cate: '', area: '', age: '', price: '', sort: st.sort, page: 1 };
		load();
	});
	// 다른 화면에서 찜·수강이 바뀌면 다시 그림
	MockDB.on('cielpia.wishes', function (src) { if (src === 'remote') load(); });

	load();
})(jQuery);

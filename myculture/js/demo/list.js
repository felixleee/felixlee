/*
 * MyCultureis 데모 — 클래스 목록 (good/list.html)
 *  주소: list.html?b_uid_s=<카테고리>  |  ?grp=global|korean  (+ &sort=pop|rating|low|high &q=검색어 &page=n)
 *  필터(문화 구분 탭 · 카테고리 칩) · 검색 · 정렬 · 결과 수 · 페이징, 로딩 표시와 '결과 없음' 상태.
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var SIZE = 9;
	var SORTS = {
		pop: ['-joined'],
		rating: ['-rating', '-reviewCount'],
		low: ['price', '-joined'],
		high: ['-price', '-joined']
	};

	var cate0 = MC.category(Mock.qs('b_uid_s'));
	var state = {
		cate: cate0 ? cate0.id : '',
		grp: cate0 ? cate0.grp : (MC.GRP[Mock.qs('grp')] ? Mock.qs('grp') : ''),
		sort: SORTS[Mock.qs('sort')] ? Mock.qs('sort') : 'pop',
		q: (Mock.qs('q') || '').trim(),
		page: parseInt(Mock.qs('page'), 10) || 1
	};
	var seq = 0;

	function syncUrl() {
		var url = Mock.url('list.html', {
			b_uid_s: state.cate,
			grp: state.cate ? '' : state.grp,
			sort: state.sort === 'pop' ? '' : state.sort,
			q: state.q,
			page: state.page > 1 ? state.page : ''
		});
		try { history.replaceState(null, '', url); } catch (e) { /* file:// 일부 브라우저 */ }
	}

	function renderHead() {
		var cate = MC.category(state.cate);
		var title, desc, img, loc = '<a href="../main/pure_main.html">HOME</a>';
		if (cate) {
			title = cate.name; desc = cate.desc; img = cate.img;
			loc += '<span class="sep">&gt;</span><a href="' + esc(MC.link.list({ grp: cate.grp })) + '">' + MC.GRP[cate.grp] + '</a><span class="sep">&gt;</span>' + esc(cate.name);
		} else if (state.grp) {
			title = MC.GRP[state.grp] + ' 클래스';
			desc = state.grp === 'global' ? '하루만에 경험하는 갓성비 세계여행 (feat. 나보다 한국어가 유창한 외국인)' : '라떼도 몰랐던 전통문화, 이제는 제대로 알아보자';
			img = state.grp === 'global' ? 'image/main/Europe_0804.jpg' : 'image/main/culture_bak_06.jpg';
			loc += '<span class="sep">&gt;</span>' + MC.GRP[state.grp];
		} else {
			title = '전체 클래스'; desc = '하루만에 경험하는 세계문화'; img = 'image/main/premium.jpg';
			loc += '<span class="sep">&gt;</span>전체 클래스';
		}
		$('#mcTop').css('background-image', 'url("' + MC.img(img) + '")');
		$('#mcTitle').text(title);
		$('#mcDesc').text(desc);
		$('#mcLoc').html(loc);
		document.title = title + ' | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';

		$('#mcGrpTabs button').each(function () {
			$(this).attr('aria-selected', String($(this).data('grp') === state.grp || ($(this).data('grp') === '' && !state.grp)));
		});

		var all = MockDB.all(MC.C.cls), counts = {};
		all.forEach(function (c) { counts[c.cate] = (counts[c.cate] || 0) + 1; });
		var cats = MC.categories(state.grp || null);
		var total = state.grp ? all.filter(function (c) { var k = MC.category(c.cate); return k && k.grp === state.grp; }).length : all.length;
		$('#mcChips').html(
			'<button type="button" data-cate="" aria-pressed="' + (!state.cate) + '">전체<em>' + total + '</em></button>' +
			cats.map(function (k) {
				return '<button type="button" data-cate="' + esc(k.id) + '" aria-pressed="' + (k.id === state.cate) + '">' + esc(k.name) + '<em>' + (counts[k.id] || 0) + '</em></button>';
			}).join('')
		);
		$('#mcSort').val(state.sort);
		$('#mcQ').val(state.q);
	}

	function load() {
		var my = ++seq;
		renderHead();
		syncUrl();
		$('#mcResult').html(MC.loading('클래스를 불러오는 중이에요…'));
		$('#mcPaging').empty();
		$('#mcCount').html('&nbsp;');

		var grp = state.grp, cate = state.cate;
		MockApi.list(MC.C.cls, {
			filter: function (c) {
				if (cate) return c.cate === cate;
				if (grp) { var k = MC.category(c.cate); return !!k && k.grp === grp; }
				return true;
			},
			keyword: state.q,
			fields: ['title', 'country', 'summary', 'tags', 'instructor.name'],
			sort: SORTS[state.sort],
			page: state.page,
			size: SIZE
		}).then(function (res) {
			if (my !== seq) return;            // 그새 조건이 바뀌었으면 버린다
			state.page = res.page;
			syncUrl();
			$('#mcCount').html('총 <b>' + res.total + '</b>개 클래스' + (state.q ? ' · \'' + esc(state.q) + '\' 검색 결과' : ''));
			if (!res.total) {
				$('#mcResult').html(MC.empty(
					state.q ? '\'' + esc(state.q) + '\'에 맞는 클래스가 없어요.<br>다른 검색어나 카테고리로 찾아보세요.' : '이 카테고리에는 아직 열린 클래스가 없어요.',
					'<button type="button" class="mc-btn" id="mcReset">필터 초기화</button>'
				));
				return;
			}
			$('#mcResult').html('<ul class="mc-cards">' + res.items.map(MC.card).join('') + '</ul>');
			$('#mcPaging').html(MC.pager(res));
		}).catch(function (e) {
			$('#mcResult').html(MC.empty('목록을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.'));
			console.error(e);
		});
	}

	function scrollToList() {
		var top = $('#mcGrpTabs').offset().top - 90;
		if ($(window).scrollTop() > top) $('html, body').stop().animate({ scrollTop: top }, 200);
	}

	$('#mcGrpTabs').on('click', 'button', function () {
		state.grp = $(this).data('grp') || '';
		state.cate = '';
		state.page = 1;
		load();
	});
	$('#mcChips').on('click', 'button', function () {
		var id = String($(this).data('cate') || '');
		var k = MC.category(id);
		state.cate = id;
		if (k) state.grp = k.grp;
		state.page = 1;
		load();
	});
	$('#mcSort').on('change', function () { state.sort = this.value; state.page = 1; load(); });
	$('#mcSearch').on('submit', function (e) {
		e.preventDefault();
		state.q = $.trim($('#mcQ').val());
		state.page = 1;
		load();
	});
	$('#mcPaging').on('click', 'button[data-page]', function () {
		state.page = +$(this).data('page');
		load();
		scrollToList();
	});
	$('#mcResult').on('click', '#mcReset', function () {
		state = { cate: '', grp: '', sort: 'pop', q: '', page: 1 };
		load();
	});

	load();
})(jQuery);

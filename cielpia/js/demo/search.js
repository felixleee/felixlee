/*
 * Cielpia 강의 검색 (content/search.html?q=) — 원래 GET /search
 *  - 강의명 · 선생님 · 태그 · 소개 · 분류/영역 이름에서 찾고(띄어쓰기로 나눈 단어 모두 포함), 정렬·페이징
 *  - 메인/서브라인 검색폼은 공통 스크립트가 이 화면으로 보내고, 이 화면의 검색폼은 제자리에서 다시 검색
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var SIZE = 8;
	var SORTS = { pop: ['-students', '-rating'], 'new': ['-createdAt'], rate: ['-rating', '-reviews'] };
	var KEYWORDS = ['몬테소리', '요가', '영어', '과학', '동화', '코딩', '수학', '이수아', '무료'];
	var st = { q: $.trim(Mock.qs('q') || ''), sort: SORTS[Mock.qs('sort')] ? Mock.qs('sort') : 'pop', page: parseInt(Mock.qs('page'), 10) || 1 };
	var reqSeq = 0;

	$('#cpKeywords').html('<span>추천 검색어</span>' + KEYWORDS.map(function (k) {
		return '<a href="' + Mock.url('search.html', { q: k }) + '" data-q="' + esc(k) + '">' + esc(k) + '</a>';
	}).join(''));

	function haystack(l) {
		var g = CP.cate(l.group), a = CP.cate(l.area), lv = CP.cate(l.level);
		return [l.title, l.teacherName, (l.tags || []).join(' '), l.summary, g && g.name, a && a.name, lv && lv.name, l.price ? '' : '무료']
			.join(' ').toLowerCase();
	}

	function load() {
		$('#cpQ').val(st.q);
		document.title = (st.q ? '‘' + st.q + '’ 검색 결과' : '강의 검색') + ' | LJY Port :: 실제 운영되는 페이지가 아닙니다';
		try { history.replaceState(null, '', Mock.url('search.html', { q: st.q, sort: st.sort === 'pop' ? '' : st.sort, page: st.page > 1 ? st.page : '' })); } catch (e) { /* 무시 */ }
		$('#cpSort button').each(function () { var on = $(this).attr('data-sort') === st.sort; $(this).toggleClass('is-on', on).attr('aria-pressed', on); });
		$('#cpPaging').empty();

		if (!st.q) {
			$('#cpTotal').html('검색어를 입력하면 강의명·선생님·태그에서 찾아 드려요');
			$('#cpList').html(CP.empty('검색어를 입력해 주세요', '위의 추천 검색어를 눌러 봐도 좋아요.'));
			return;
		}
		var words = st.q.toLowerCase().split(/\s+/).filter(Boolean);
		var my = ++reqSeq;
		$('#cpTotal').html('검색 중…');
		$('#cpList').html(CP.loading('‘' + st.q + '’ 강의를 찾는 중이에요'));
		MockApi.list('cielpia.lectures', {
			filter: function (l) { var h = haystack(l); return words.every(function (w) { return h.indexOf(w) >= 0; }); },
			sort: SORTS[st.sort], page: st.page, size: SIZE
		}).then(function (res) {
			if (my !== reqSeq) return;
			st.page = res.page;
			$('#cpTotal').html('‘<b style="color:#1b79ee;font-size:inherit">' + esc(st.q) + '</b>’ 검색 결과 <b>' + res.total + '</b>건');
			if (!res.total) {
				$('#cpList').html(CP.empty('‘' + st.q + '’에 맞는 강의가 없어요', '맞춤법을 확인하거나 더 짧은 단어로 검색해 보세요. 추천 검색어도 눌러 보세요.',
					'<a class="cp-btn cp-btn-blue" href="' + CP.listUrl({}) + '">전체 강의 보기</a>'));
				return;
			}
			$('#cpList').html('<ul class="cp-grid">' + res.items.map(function (l) { return CP.card(l, { q: words.length === 1 ? st.q : '' }); }).join('') + '</ul>');
			$('#cpPaging').html(CP.paging(res));
		});
	}

	// 이 화면의 검색폼은 페이지 이동 없이 제자리 검색 (공통 처리보다 먼저 가로챔)
	$('#cpSearchForm').on('submit', function (e) {
		e.preventDefault();
		e.stopPropagation();
		var v = $.trim($('#cpQ').val());
		if (!v) { $(this).find('.cp-search-alert').text('검색어를 입력하세요'); $('#cpQ').trigger('focus'); return; }
		$(this).find('.cp-search-alert').text('');
		st.q = v; st.page = 1;
		load();
	});
	$('#cpKeywords').on('click', 'a[data-q]', function (e) {
		e.preventDefault();
		st.q = $(this).attr('data-q'); st.page = 1;
		$('.cp-search-alert').text('');
		load();
	});
	$('#cpSort').on('click', 'button', function () { st.sort = $(this).attr('data-sort'); st.page = 1; load(); });
	$('#cpPaging').on('click', 'button[data-page]', function () { st.page = Number($(this).attr('data-page')); load(); });

	load();
})(jQuery);

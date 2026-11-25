/*
 * Monami France 데모 — 여행후기 목록 (review/list.html?tourId=&sort=&q=&page=&new=)
 * 방금 쓴 후기(?new=id)는 테두리로 강조한다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL, SIZE = 9;
	var SORTS = ['-createdAt', '-rating', '-views'];
	var state = {
		tourId: Mock.qs('tourId') || '',
		sort: Mock.qs('sort') || '-createdAt',
		q: Mock.qs('q') || '',
		page: parseInt(Mock.qs('page'), 10) || 1
	};
	var newId = Mock.qs('new');
	if (!D.tour(state.tourId)) state.tourId = '';
	if (SORTS.indexOf(state.sort) < 0) state.sort = '-createdAt';

	var $list = $('#rvList'), $pager = $('#rvPager');

	// 투어 선택 상자 — 후기가 있는 투어 먼저, 후기 수 표시
	var tours = MockDB.all(C.tours).sort(function (a, b) { return a.sort - b.sort; });
	$('#rvTour').append(tours.map(function (t) {
		return '<option value="' + t.id + '">' + Mock.esc(t.name) + ' (' + D.reviewStat(t.id).count + ')</option>';
	}).join(''));

	function summary() {
		var rows = MockDB.where(C.reviews, function (r) { return !state.tourId || String(r.tourId) === String(state.tourId); });
		var avg = rows.length ? rows.reduce(function (s, r) { return s + r.rating; }, 0) / rows.length : 0;
		$('#rvAvg').text(rows.length ? avg.toFixed(1) : '-');
		$('#rvAvgStars').html(rows.length ? D.stars(avg) : '');
		var t = D.tour(state.tourId);
		$('#rvTotal').text((t ? t.name + ' ' : '전체 ') + '후기 ' + rows.length + '개');
		$('#rvWrite').attr('href', D.url.write({ tourId: state.tourId }));
		$('#dmPageTitle').text(t ? t.name + ' 후기' : '여행후기');
	}

	function load(scroll) {
		$('#rvTour').val(state.tourId);
		$('#rvSort').val(state.sort);
		$('#rvSearch [name=q]').val(state.q);
		summary();
		D.syncQuery({ tourId: state.tourId, sort: state.sort === '-createdAt' ? '' : state.sort, q: state.q, page: state.page > 1 ? state.page : '', 'new': newId });
		D.loading($list, '후기를 불러오는 중이에요…');
		$pager.empty();
		$('#rvCount').html('&nbsp;');
		if (scroll) $('html, body').animate({ scrollTop: $('.dm-rv-filter').offset().top - 120 }, 250);

		MockApi.list(C.reviews, {
			filter: { tourId: state.tourId }, keyword: state.q, fields: ['title', 'content', 'author'],
			sort: [state.sort, '-createdAt'], page: state.page, size: SIZE
		}).then(render, function (e) { D.fail($list, e); });
	}

	function render(res) {
		state.page = res.page;
		$('#rvCount').html('총 <strong>' + res.total + '</strong>개의 후기' + (state.q ? ' · <span class="dm-kw">“' + Mock.esc(state.q) + '”</span> 검색 결과' : ''));
		if (!res.total) {
			D.empty($list, state.q ? '“' + state.q + '”이(가) 들어간 후기가 없어요.' : '아직 이 투어의 후기가 없어요. 첫 후기를 남겨 주세요!',
				'<a class="dm-btn dm-btn-primary" href="' + D.url.write({ tourId: state.tourId }) + '">후기 쓰기</a> <button type="button" class="dm-btn" id="rvReset">전체 후기 보기</button>');
			return;
		}
		$list.html('<div class="dm-grid dm-rgrid">' + D.tplAll('tpl-review-card', res.items, function (r) {
			var t = D.tour(r.tourId) || {};
			var isNew = String(r.id) === String(newId);
			return {
				cls: isNew ? 'is-new' : '', href: D.url.review(r.id), image: D.img(r.image || t.image), tourName: t.name || '투어',
				newBadge: isNew || D.dayOffset(r.createdAt) >= -3 ? '<span class="dm-best dm-badge-new">NEW</span>' : '',
				stars: D.stars(r.rating), title: r.title, excerpt: D.cut(r.content, 80),
				author: r.author, date: Mock.date(r.createdAt, 'YYYY.MM.DD'), views: Mock.num(r.views)
			};
		}) + '</div>');
		D.pager($pager, res, function (p) { state.page = p; load(true); });
	}

	$('#rvTour').on('change', function () { state.tourId = $(this).val(); state.page = 1; load(); });
	$('#rvSort').on('change', function () { state.sort = $(this).val(); state.page = 1; load(); });
	$('#rvSearch').on('submit', function (e) { e.preventDefault(); state.q = $.trim($(this).find('[name=q]').val()); state.page = 1; load(); });
	$list.on('click', '#rvReset', function () { state = { tourId: '', sort: '-createdAt', q: '', page: 1 }; load(); });

	if (newId && MockDB.find(C.reviews, newId)) Mock.toast('후기를 등록했어요. 소중한 후기 고마워요!', { type: 'success' });
	load();
})(jQuery, window.Demo);

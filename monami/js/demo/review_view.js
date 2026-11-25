/*
 * Monami France 데모 — 여행후기 상세 (review/view.html?id=)
 * 조회수 +1 (같은 탭에서 다시 열면 늘리지 않음), 이전/다음 글은 최신순 기준
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var id = Mock.qs('id');

	D.loading($('#rvState'), '후기를 불러오는 중이에요…');
	MockApi.get(C.reviews, id).then(function (r) {
		var key = 'monami.viewed.review.' + r.id, seen = false;
		try { seen = !!sessionStorage.getItem(key); sessionStorage.setItem(key, '1'); } catch (e) { /* 비공개 창 */ }
		if (!seen) r = MockDB.update(C.reviews, r.id, { views: (Number(r.views) || 0) + 1 }) || r;
		render(r);
	}, function () {
		$('#dmPageTitle').text('후기를 찾을 수 없어요');
		D.empty($('#rvState'), '찾는 후기가 없거나 삭제되었어요.', '<a class="dm-btn dm-btn-primary" href="list.html">후기 목록</a>');
	});

	function render(r) {
		var t = D.tour(r.tourId) || {};
		$('#rvState').empty();
		$('#rvView').show();
		document.title = r.title + ' :: 여행후기 :: 모나미프랑스 · LJY Port (실제 운영되는 페이지가 아닙니다)';
		$('#dmPageTitle').text((t.name || '') + ' 후기');
		$('#rvTourTag').text(t.name || '투어');
		$('#rvTitle').text(r.title);
		$('#rvStars').html(D.stars(r.rating) + ' ' + r.rating + '.0');
		$('#rvAuthor').text(r.author);
		$('#rvDate').text('작성 ' + Mock.date(r.createdAt, 'YYYY.MM.DD HH:mm'));
		$('#rvTravel').text(r.travelDate ? '여행 ' + Mock.date(r.travelDate, 'YYYY.MM.DD') : '').toggle(!!r.travelDate);
		$('#rvViews').text('조회 ' + Mock.num(r.views));
		$('#rvBody').html('<img src="' + D.img(r.image || t.image) + '" alt="">' + D.paras(r.content));
		if (t.id) {
			$('#rvTourBox').html('<img src="' + D.img(t.image) + '" alt=""><div><strong>' + Mock.esc(t.name) + '</strong><p>' + Mock.esc(t.time + ' · ' + t.daysText + ' · 성인 ' + D.won(t.priceAdult)) + '</p></div>' +
				'<div class="btns"><a class="dm-btn dm-btn-sm" href="' + D.url.tour(t.id) + '">투어 보기</a><a class="dm-btn dm-btn-sm dm-btn-primary dm-btn-book" href="' + D.url.book(t.id) + '">Booking Now</a></div>');
		} else $('#rvTourBox').hide();
		$('#rvList').attr('href', D.url.reviews({ tourId: Mock.qs('from') === 'tour' ? r.tourId : '' }));
		$('#rvWriteBtn').attr('href', D.url.write({ tourId: r.tourId }));

		// 이전/다음 — 최신순 목록에서 앞뒤 글
		var all = MockDB.all(C.reviews).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : b.id - a.id; });
		var i = -1;
		all.forEach(function (x, k) { if (String(x.id) === String(r.id)) i = k; });
		function row(label, icon, x) {
			return '<li><span class="lbl"><i class="' + icon + '"></i>' + label + '</span>' +
				(x ? '<a href="' + D.url.review(x.id) + '">' + Mock.esc(x.title) + '</a><span class="date">' + Mock.date(x.createdAt, 'YYYY.MM.DD') + '</span>' : '<span class="none">' + label + ' 후기가 없어요</span>') + '</li>';
		}
		$('#rvPrevNext').html(row('이전 글', 'xi-angle-up-min', all[i - 1]) + row('다음 글', 'xi-angle-down-min', all[i + 1]));
	}
})(jQuery, window.Demo);

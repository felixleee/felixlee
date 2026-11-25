/*
 * Monami France 데모 — 뉴스 & 공지사항 상세 (notice/view.html?id=)
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var id = Mock.qs('id');

	D.loading($('#ntState'), '글을 불러오는 중이에요…');
	MockApi.get(C.notices, id).then(function (n) {
		var key = 'monami.viewed.notice.' + n.id, seen = false;
		try { seen = !!sessionStorage.getItem(key); sessionStorage.setItem(key, '1'); } catch (e) { /* 비공개 창 */ }
		if (!seen) n = MockDB.update(C.notices, n.id, { views: (Number(n.views) || 0) + 1 }) || n;
		render(n);
	}, function () {
		D.empty($('#ntState'), '찾는 글이 없거나 삭제되었어요.', '<a class="dm-btn dm-btn-primary" href="list.html">목록으로</a>');
	});

	function render(n) {
		$('#ntState').empty();
		$('#ntView').show();
		document.title = n.title + ' :: 모나미프랑스 · LJY Port (실제 운영되는 페이지가 아닙니다)';
		$('#ntCateTag').text(D.NOTICE_CATE[n.cate] || '공지');
		$('#ntTitle').text(n.title);
		$('#ntDate').text('작성 ' + Mock.date(n.createdAt, 'YYYY.MM.DD'));
		$('#ntViews').text('조회 ' + Mock.num(n.views));
		$('#ntBody').html(D.paras(n.content));
		$('#ntListBtn').attr('href', D.url.notices({ cate: Mock.qs('cate') || '' }));

		var all = MockDB.all(C.notices).sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; });
		var i = -1;
		all.forEach(function (x, k) { if (String(x.id) === String(n.id)) i = k; });
		function row(label, icon, x) {
			return '<li><span class="lbl"><i class="' + icon + '"></i>' + label + '</span>' +
				(x ? '<a href="' + D.url.notice(x.id) + '">[' + (D.NOTICE_CATE[x.cate] || '공지') + '] ' + Mock.esc(x.title) + '</a><span class="date">' + Mock.date(x.createdAt, 'YYYY.MM.DD') + '</span>' : '<span class="none">' + label + '이 없어요</span>') + '</li>';
		}
		$('#ntPrevNext').html(row('이전 글', 'xi-angle-up-min', all[i - 1]) + row('다음 글', 'xi-angle-down-min', all[i + 1]));
	}
})(jQuery, window.Demo);

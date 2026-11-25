/*
 * Monami France 데모 — 뉴스 & 공지사항 목록 (notice/list.html?cate=&q=&page=)
 * 고정 공지(top)는 첫 페이지 맨 위에 '공지' 표시로 한 번 더 보여 준다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL, SIZE = 10;
	var state = { cate: Mock.qs('cate') || '', q: Mock.qs('q') || '', page: parseInt(Mock.qs('page'), 10) || 1 };
	if (!D.NOTICE_CATE[state.cate]) state.cate = '';
	var $list = $('#ntList'), $pager = $('#ntPager');

	function rowHtml(n, numLabel, isTop) {
		return '<tr class="' + (isTop ? 'is-top' : '') + '">' +
			'<td>' + numLabel + '</td>' +
			'<td><span class="dm-badge cate-' + n.cate + '">' + (D.NOTICE_CATE[n.cate] || '공지') + '</span></td>' +
			'<td class="subj"><a href="' + D.url.notice(n.id) + '">' + Mock.esc(n.title) + '</a>' + (D.dayOffset(n.createdAt) >= -7 ? ' <span class="dm-badge dm-badge-new">N</span>' : '') + '</td>' +
			'<td>' + Mock.date(n.createdAt, 'YYYY.MM.DD') + '</td>' +
			'<td>' + Mock.num(n.views) + '</td></tr>';
	}

	function load() {
		$('#ntCate button').each(function () { $(this).toggleClass('on', $(this).attr('data-v') === state.cate); });
		$('#ntSearch [name=q]').val(state.q);
		$('#dmPageTitle').html(state.cate === 'news' ? '모나미 News' : state.cate === 'notice' ? '공지사항' : '뉴스 &amp; 공지사항');
		D.syncQuery({ cate: state.cate, q: state.q, page: state.page > 1 ? state.page : '' });
		$list.html('<tr><td colspan="5"><div class="dm-state dm-loading"><span class="dm-spin"></span>공지를 불러오는 중이에요…</div></td></tr>');
		$pager.empty();

		MockApi.list(C.notices, { filter: { cate: state.cate }, keyword: state.q, fields: ['title', 'content'], sort: '-createdAt', page: state.page, size: SIZE })
			.then(function (res) {
				state.page = res.page;
				if (!res.total) {
					$list.html('<tr><td colspan="5"><div class="dm-state dm-empty"><i class="xi-info-o"></i><p>' +
						(state.q ? '“' + Mock.esc(state.q) + '”이(가) 들어간 글이 없어요.' : '등록된 글이 없어요.') +
						'</p><button type="button" class="dm-btn" id="ntReset">전체 글 보기</button></div></td></tr>');
					return;
				}
				var h = '';
				if (res.page === 1 && !state.q) {
					MockDB.where(C.notices, function (n) { return n.top && (!state.cate || n.cate === state.cate); })
						.sort(function (a, b) { return a.createdAt < b.createdAt ? 1 : -1; })
						.forEach(function (n) { h += rowHtml(n, '<span class="dm-badge dm-badge-fill">공지</span>', true); });
				}
				res.items.forEach(function (n, i) { h += rowHtml(n, res.total - (res.page - 1) * res.size - i, false); });
				$list.html(h);
				D.pager($pager, res, function (p) { state.page = p; load(); $('html, body').scrollTop($('.dm-board').offset().top - 140); });
			}, function (e) { $list.html('<tr><td colspan="5"></td></tr>'); D.fail($list.find('td'), e); });
	}

	$('#ntCate').on('click', 'button', function () { state.cate = $(this).attr('data-v'); state.page = 1; load(); });
	$('#ntSearch').on('submit', function (e) { e.preventDefault(); state.q = $.trim($(this).find('[name=q]').val()); state.page = 1; load(); });
	$list.on('click', '#ntReset', function () { state = { cate: '', q: '', page: 1 }; load(); });
	load();
})(jQuery, window.Demo);

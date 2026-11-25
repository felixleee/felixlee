/*
 * 로뎀투어 데모 — 게시판 목록 (cmm/index.html?BD_CD=)
 *  NOTICE · REVIEW · ONLINE · COLUMN · PRESS (표) / GRP101 (갤러리) / FAQ (펼침) / QNA (비밀글 + 상태)
 *  ?sf=title|content|name &sw=검색어 &page= &cate=(FAQ) &new=(방금 등록한 글 번호)
 */
(function ($) {
	'use strict';

	var bd = (Mock.qs('BD_CD') || 'NOTICE').toUpperCase();
	if (!RD.BOARDS[bd]) bd = 'NOTICE';
	var B = RD.BOARDS[bd];
	var SIZE = B.type === 'photo' ? 9 : 10;
	var state = { sf: Mock.qs('sf') || 'title', sw: Mock.qs('sw') || '', page: parseInt(Mock.qs('page'), 10) || 1, cate: Mock.qs('cate') || '' };
	var newId = Mock.qs('new');
	var mine = MockDB.getItem('rothem.myQna', []).map(String);
	var $board = $('#rdBoard'), $paging = $('#rdPaging'), seq = 0;

	/* 머리 */
	document.title = B.name + ' | 로뎀투어 - LJY Port :: 실제 운영되는 페이지가 아닙니다';
	$('#rdBoardTitle').text(B.name);
	$('#rdLocBoard').text(B.name);
	$('#rdBoardDesc').text(B.desc);
	$('#rdSf').val(state.sf);
	$('#rdSw').val(state.sw);
	$('#rdSearch').append('<input type="hidden" name="BD_CD" value="' + bd + '" />');
	if (B.type === 'faq') $('#rdSf option[value=name]').remove();
	if (bd === 'REVIEW') $('#rdBoardBtns').html('<a class="rd-btn" href="' + Mock.esc(Mock.url('write.html', { BD_CD: 'REVIEW' })) + '"><i class="fa fa-pencil"></i>후기 쓰기</a>');
	if (bd === 'QNA') $('#rdBoardBtns').html('<a class="rd-btn orange" href="' + Mock.esc(RD.inquiryUrl()) + '"><i class="fa fa-pencil"></i>상담 신청</a>');

	function isNew(p) { return (Date.now() - Mock.toDate(p.createdAt).getTime()) < 3 * 86400000; }
	function newMark(p) { return isNew(p) ? '<span class="rd-new">N</span>' : ''; }
	function viewUrl(p) { return RD.viewUrl(bd, p.id); }

	/* 표 */
	function table(res) {
		var qna = B.type === 'qna', review = bd === 'REVIEW';
		var cols = qna ? '<col style="width:70px"><col><col style="width:150px"><col style="width:80px"><col style="width:100px"><col style="width:90px">'
			: review ? '<col style="width:70px"><col><col style="width:100px"><col style="width:80px"><col style="width:100px"><col style="width:60px">'
			: '<col style="width:70px"><col><col style="width:110px"><col style="width:100px"><col style="width:60px">';
		var head = qna ? '<th scope="col">번호</th><th scope="col">제목</th><th scope="col">교회 · 단체</th><th scope="col">작성자</th><th scope="col">등록일</th><th scope="col">상태</th>'
			: review ? '<th scope="col">번호</th><th scope="col">제목</th><th scope="col">별점</th><th scope="col">작성자</th><th scope="col">등록일</th><th scope="col">조회</th>'
			: '<th scope="col">번호</th><th scope="col">제목</th><th scope="col">작성자</th><th scope="col">등록일</th><th scope="col">조회</th>';
		var startNo = res.total - (res.page - 1) * res.size;
		var body = res.items.map(function (p, i) {
			var me = mine.indexOf(String(p.id)) >= 0;
			var cls = (p.notice ? 'is-notice' : '') + (me ? ' is-mine' : '') + (String(p.id) === String(newId) ? ' is-flash' : '');
			var no = p.notice ? '공지' : startNo - i;
			var subj = '<a href="' + Mock.esc(viewUrl(p)) + '">' + (p.secret ? '<i class="fa fa-lock" aria-label="비밀글"></i>' : '') + Mock.esc(p.title) + '</a>' + newMark(p) + (me ? ' <span class="rd-help" style="display:inline">· 내 글</span>' : '');
			if (qna) return '<tr class="' + cls + '"><td class="no">' + no + '</td><td class="subj">' + subj + '</td><td>' + Mock.esc(p.church || '-') + '</td><td>' + Mock.esc(RD.mask(p.name)) + '</td><td>' + Mock.date(p.createdAt, 'YYYY-MM-DD') + '</td><td>' + RD.badge(p.status || '접수') + '</td></tr>';
			if (review) return '<tr class="' + cls + '"><td class="no">' + no + '</td><td class="subj">' + subj + '</td><td>' + RD.stars(p.rating) + '</td><td>' + Mock.esc(RD.mask(p.name)) + '</td><td>' + Mock.date(p.createdAt, 'YYYY-MM-DD') + '</td><td>' + Mock.num(p.hits) + '</td></tr>';
			return '<tr class="' + cls + '"><td class="no">' + no + '</td><td class="subj">' + subj + '</td><td>' + Mock.esc(p.name) + '</td><td>' + Mock.date(p.createdAt, 'YYYY-MM-DD') + '</td><td>' + Mock.num(p.hits) + '</td></tr>';
		}).join('');
		return '<table class="rd-board"><caption>' + Mock.esc(B.name) + ' 목록</caption><colgroup>' + cols + '</colgroup><thead><tr>' + head + '</tr></thead><tbody>' + body + '</tbody></table>';
	}

	/* 갤러리 */
	function photo(res) {
		return '<ul class="rd-photo">' + res.items.map(function (p) {
			var img = (p.images || [])[0];
			return '<li><a href="' + Mock.esc(viewUrl(p)) + '">' +
				'<span class="thumb">' + (img ? '<img src="' + Mock.esc(img) + '" alt="" />' : '') + '<em><i class="fa fa-camera"></i> ' + (p.images || []).length + '</em></span>' +
				'<span class="tit">' + Mock.esc(p.title) + newMark(p) + '</span></a>' +
				'<p class="meta">' + Mock.date(p.createdAt, 'YYYY.MM.DD') + ' · 조회 ' + Mock.num(p.hits) + '</p></li>';
		}).join('') + '</ul>';
	}

	/* FAQ */
	function faq(res) {
		return '<ul class="rd-faq">' + res.items.map(function (p, i) {
			return '<li' + (i === 0 && state.sw ? ' class="on"' : '') + '>' +
				'<button type="button" class="q" aria-expanded="' + (i === 0 && state.sw ? 'true' : 'false') + '"><b>Q</b><span class="cate">' + Mock.esc(p.cate) + '</span><span class="t">' + Mock.esc(p.title) + '</span></button>' +
				'<div class="a"><b>A</b><div>' + RD.paras(p.content) + '</div></div></li>';
		}).join('') + '</ul>';
	}
	function faqCates() {
		if (B.type !== 'faq') return;
		var cates = [];
		MockDB.where('rothem.posts', function (p) { return p.bd === 'FAQ'; }).forEach(function (p) { if (cates.indexOf(p.cate) < 0) cates.push(p.cate); });
		$board.before('<div class="rd-faq-cate" id="rdFaqCate">' + ['<a href="#" data-cate="">전체</a>'].concat(cates.map(function (c) { return '<a href="#" data-cate="' + Mock.esc(c) + '">' + Mock.esc(c) + '</a>'; })).join('') + '</div>');
		$('#rdFaqCate').on('click', 'a', function (e) {
			e.preventDefault();
			state.cate = $(this).attr('data-cate'); state.page = 1; load();
		});
	}

	function load() {
		var my = ++seq;
		$('#rdFaqCate a').removeClass('on').filter('[data-cate="' + state.cate + '"]').addClass('on');
		RD.replaceQuery({ BD_CD: bd, sf: state.sw ? state.sf : '', sw: state.sw, cate: state.cate, page: state.page > 1 ? state.page : '' });
		$board.html(RD.loading());
		$paging.empty();
		MockApi.list('rothem.posts', {
			filter: function (p) { return p.bd === bd && (!state.cate || p.cate === state.cate); },
			keyword: state.sw, fields: [state.sf === 'content' ? 'content' : state.sf === 'name' ? 'name' : 'title'],
			sort: B.type === 'faq' ? 'id' : ['-notice', '-createdAt'],
			page: state.page, size: SIZE
		}).then(function (res) {
			if (my !== seq) return;
			state.page = res.page;
			$('#rdTotal').html('전체 <strong>' + res.total + '</strong>건' + (state.sw ? ' · ‘' + Mock.esc(state.sw) + '’ 검색 결과 <a href="#" id="rdClear" style="color:#999;text-decoration:underline;font-size:12px">검색 지우기</a>' : ''));
			if (!res.items.length) {
				$board.html(RD.empty(state.sw ? '검색 결과가 없어요' : '등록된 글이 없어요', state.sw ? '다른 검색어로 찾아보세요.' : ''));
				return;
			}
			$board.html(B.type === 'photo' ? photo(res) : B.type === 'faq' ? faq(res) : table(res));
			$paging.html(RD.pager(res));
			if (newId) {
				var $row = $board.find('tr.is-flash');
				if ($row.length) $('html, body').scrollTop($row.offset().top - 200);
			}
		});
	}

	$('#rdSearch').on('submit', function (e) {
		e.preventDefault();
		state.sf = $('#rdSf').val(); state.sw = $.trim($('#rdSw').val()); state.page = 1; newId = null; load();
	});
	$('#rdTotal').on('click', '#rdClear', function (e) {
		e.preventDefault();
		state.sw = ''; $('#rdSw').val(''); state.page = 1; load();
	});
	$paging.on('click', 'a[data-page]', function (e) {
		e.preventDefault();
		state.page = parseInt($(this).attr('data-page'), 10) || 1; load();
		$('html, body').scrollTop($('.rd-content').offset().top - 10);
	});
	$board.on('click', '.rd-faq .q', function () {
		var $li = $(this).closest('li').toggleClass('on');
		$(this).attr('aria-expanded', $li.hasClass('on') ? 'true' : 'false');
	});

	if (newId) Mock.toast(bd === 'QNA' ? '상담 신청이 접수되었어요. 담당자가 곧 연락드릴게요.' : '글을 등록했어요', { type: 'success' });
	faqCates();
	load();
})(jQuery);

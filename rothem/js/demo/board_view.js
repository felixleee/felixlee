/*
 * 로뎀투어 데모 — 게시글 보기 (cmm/view.html?BD_CD=&id=)
 *  - 조회수 +1, 이전글/다음글(같은 게시판 · 목록 순서), 후기는 별점 · 상품 연결, 갤러리는 사진
 *  - 단체문의(QNA)는 비밀글: 내가 이 브라우저에서 쓴 글이거나 휴대폰 뒤 4자리가 맞아야 내용을 보여 준다
 */
(function ($) {
	'use strict';

	var bd = (Mock.qs('BD_CD') || '').toUpperCase(), id = Mock.qs('id');
	var B = RD.BOARDS[bd], $box = $('#rdView');

	function order(list) {
		return list.sort(function (a, b) {
			if (!!a.notice !== !!b.notice) return a.notice ? -1 : 1;
			return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
		});
	}

	function body(p) {
		var h = '';
		if (bd === 'REVIEW' && p.goodId) {
			var g = MockDB.find('rothem.goods', p.goodId);
			if (g) h += '<a class="rd-view-good" href="' + Mock.esc(RD.goodUrl(g.id)) + '"><img src="' + Mock.esc(g.thumb) + '" alt="" /><p><small>후기 상품</small>' + Mock.esc(g.title) + '</p><span class="rd-btn sm line">상품 보기</span></a>';
		}
		if (bd === 'ONLINE' && p.goodId) {
			var g2 = MockDB.find('rothem.goods', p.goodId);
			if (g2) h += '<a class="rd-view-good" href="' + Mock.esc(RD.goodUrl(g2.id)) + '"><img src="' + Mock.esc(g2.thumb) + '" alt="" /><p><small>이 여정의 실제 상품</small>' + Mock.esc(g2.title) + '</p><span class="rd-btn sm line">상품 보기</span></a>';
		}
		if (p.images && p.images.length) h += '<div class="rd-view-imgs">' + p.images.map(function (src) { return '<img src="' + Mock.esc(src) + '" alt="" />'; }).join('') + '</div>';
		if (bd === 'QNA') {
			var th = RD.theme(p.theme), g3 = p.goodId ? MockDB.find('rothem.goods', p.goodId) : null;
			h += '<table class="rd-qna-info"><tbody>' +
				'<tr><th scope="row">교회 · 단체</th><td>' + Mock.esc(p.church || '-') + '</td><th scope="row">담당자</th><td>' + Mock.esc(p.name) + '</td></tr>' +
				'<tr><th scope="row">희망 테마</th><td>' + Mock.esc(th ? th.name : '미정') + '</td><th scope="row">희망 출발</th><td>' + (p.month ? Mock.date(p.month + '-01', 'YYYY년 MM월') : '-') + '</td></tr>' +
				'<tr><th scope="row">예상 인원</th><td>' + (p.people ? p.people + '명' : '-') + '</td><th scope="row">관심 상품</th><td>' + (g3 ? '<a href="' + Mock.esc(RD.goodUrl(g3.id)) + '">' + Mock.esc(g3.title) + '</a>' : '-') + '</td></tr>' +
			'</tbody></table>';
		}
		h += RD.paras(p.content);
		if (bd === 'QNA') {
			h += p.answer
				? '<div class="rd-answer"><h4><i class="fa fa-comments"></i> ' + Mock.esc(p.answer.name) + ' 답변<small>' + Mock.date(p.answer.createdAt, 'YYYY.MM.DD HH:mm') + '</small></h4>' + RD.paras(p.answer.content) + '</div>'
				: '<div class="rd-answer wait"><h4><i class="fa fa-clock-o"></i> 담당자가 확인하고 있어요</h4><p>단체 상담 담당자가 2영업일 안에 남겨 주신 연락처로 견적과 일정을 안내해 드립니다.</p></div>';
		}
		return h;
	}

	function prevNext(p) {
		var list = order(MockDB.where('rothem.posts', function (x) { return x.bd === bd; }));
		var i = -1;
		list.forEach(function (x, k) { if (String(x.id) === String(p.id)) i = k; });
		var older = list[i + 1], newer = list[i - 1];
		function li(label, icon, x, cls) {
			return '<li class="' + cls + '"><b><i class="fa fa-angle-' + icon + '"></i>' + label + '</b>' +
				(x ? '<a href="' + Mock.esc(RD.viewUrl(bd, x.id)) + '">' + (x.secret ? '<i class="fa fa-lock"></i> ' : '') + Mock.esc(x.title) + '</a><em>' + Mock.date(x.createdAt, 'YYYY-MM-DD') + '</em>' : '<span>' + label + '이 없어요</span><em></em>') + '</li>';
		}
		// 게시판 관례: ▲ 다음글(더 최근) / ▼ 이전글(더 오래된)
		return '<ul class="rd-prevnext">' + li('다음글', 'up', newer, 'is-next') + li('이전글', 'down', older, 'is-prev') + '</ul>';
	}

	function buttons() {
		var right = bd === 'REVIEW' ? '<a class="rd-btn" href="' + Mock.esc(Mock.url('write.html', { BD_CD: 'REVIEW' })) + '"><i class="fa fa-pencil"></i>후기 쓰기</a>'
			: bd === 'QNA' ? '<a class="rd-btn orange" href="' + Mock.esc(RD.inquiryUrl()) + '"><i class="fa fa-pencil"></i>상담 신청</a>' : '';
		return '<div class="rd-view-btns"><a class="rd-btn line" href="' + Mock.esc(RD.boardUrl(bd)) + '"><i class="fa fa-list"></i>목록</a><span>' + right + '</span></div>';
	}

	function render(p, unlocked) {
		var locked = p.secret && !unlocked;
		$box.html(
			'<div class="rd-view-head">' +
				'<h3>' + (p.secret ? '<i class="fa fa-lock" aria-label="비밀글"></i>' : '') + Mock.esc(p.title) + '</h3>' +
				'<p class="rd-view-meta">' +
					'<span><b>작성자</b>' + Mock.esc(bd === 'QNA' || bd === 'REVIEW' ? RD.mask(p.name) : p.name) + '</span>' +
					'<span><b>등록일</b>' + Mock.date(p.createdAt, 'YYYY.MM.DD HH:mm') + '</span>' +
					(bd === 'QNA' ? '<span><b>상태</b>' + RD.badge(p.status || '접수') + '</span>' : '<span><b>조회</b>' + Mock.num(p.hits) + '</span>') +
					(bd === 'REVIEW' ? '<span><b>별점</b>' + RD.stars(p.rating) + '</span>' : '') +
					(bd === 'FAQ' ? '<span><b>분류</b>' + Mock.esc(p.cate) + '</span>' : '') +
				'</p>' +
			'</div>' +
			(locked
				? '<div class="rd-lock"><i class="fa fa-lock" aria-hidden="true"></i><p>비밀글이에요. 작성할 때 입력한 휴대폰 번호 뒤 4자리를 입력하면 볼 수 있어요.</p>' +
					'<form id="rdUnlock" novalidate><div class="rd-field"><input type="text" id="rdPin" inputmode="numeric" maxlength="4" placeholder="휴대폰 뒤 4자리" aria-label="휴대폰 번호 뒤 4자리" /></div><button type="submit" class="rd-btn">확인</button></form>' +
					'<p class="rd-help">데모 안내: 예시 상담글의 휴대폰 번호는 010-0000-1201 ~ 1206 입니다.</p></div>'
				: '<div class="rd-view-body">' + body(p) + '</div>') +
			prevNext(p) + buttons()
		);
	}

	if (!B || !id) {
		$('#rdBoardTitle').text('게시판');
		$box.html(RD.empty('게시글 주소가 올바르지 않아요', '<a href="index.html?BD_CD=NOTICE">공지사항</a>으로 이동해 보세요.'));
		return;
	}
	document.title = B.name + ' | 로뎀투어 - LJY Port :: 실제 운영되는 페이지가 아닙니다';
	$('#rdBoardTitle').text(B.name);
	$('#rdLocBoard').text(B.name).attr('href', RD.boardUrl(bd));
	$box.html(RD.loading('글을 불러오는 중이에요…'));

	MockApi.get('rothem.posts', id).then(function (p) {
		if (p.bd !== bd) throw new Error('다른 게시판 글');
		var mine = MockDB.getItem('rothem.myQna', []).map(String).indexOf(String(p.id)) >= 0;
		var unlocked = mine || MockDB.getItem('rothem.unlocked', []).map(String).indexOf(String(p.id)) >= 0;
		if (!p.secret || unlocked) p = MockDB.update('rothem.posts', p.id, { hits: (p.hits || 0) + 1 }) || p;
		render(p, unlocked);
		if (Mock.qs('new')) Mock.toast('글을 등록했어요', { type: 'success' });

		$box.on('submit', '#rdUnlock', function (e) {
			e.preventDefault();
			var pin = $.trim($('#rdPin').val());
			var $f = $(this);
			if (!/^\d{4}$/.test(pin)) { RD.showErrors($f, [{ el: '#rdPin', msg: '숫자 4자리를 입력해 주세요.' }]); return; }
			if (String(p.phone || '').replace(/\D/g, '').slice(-4) !== pin) { RD.showErrors($f, [{ el: '#rdPin', msg: '번호가 맞지 않아요.' }]); return; }
			var list = MockDB.getItem('rothem.unlocked', []);
			list.push(p.id);
			MockDB.setItem('rothem.unlocked', list);
			render(p, true);
		});
	}).then(null, function (err) {
		if (err && err.status !== 404 && err.message !== '다른 게시판 글') console.error(err);
		$box.html(RD.empty('글을 찾을 수 없어요', '삭제되었거나 주소가 잘못되었어요. <a href="' + Mock.esc(RD.boardUrl(bd)) + '">목록</a>으로 돌아가 주세요.'));
	});
})(jQuery);

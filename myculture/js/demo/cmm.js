/*
 * MyCultureis 데모 — 고객센터 (cmm/index.html)
 *  ?BD_CD=NOTICE                 마이컬처뉴스 목록 (검색 · 페이징, '공지' 고정)   &MODE=view&idx=n  상세(조회수 +1, 이전/다음 글)
 *  ?BD_CD=FAQ                    분류 탭 · 검색 · 아코디언
 *  ?BD_CD=QNA                    1:1 문의 목록 (상태: 답변대기/답변완료)          &MODE=view&idx=n  문의 · 답변
 *  ?BD_CD=QNA&MODE=write         문의 글쓰기 → 검증 → 저장 → 목록 맨 위에 '답변대기' 로 표시
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var $root = $('#mcBoard');
	var BD = { NOTICE: '마이컬처뉴스', FAQ: 'FAQ', QNA: '1:1 문의' };
	var N = 'myculture.notices', F = 'myculture.faqs', Q = 'myculture.qnas';
	var bd = BD[(Mock.qs('BD_CD') || '').toUpperCase()] ? Mock.qs('BD_CD').toUpperCase() : 'NOTICE';
	var mode = (Mock.qs('MODE') || '').toLowerCase();
	var SIZE = 10;

	$('.mc-cmmtabs a').each(function () { $(this).toggleClass('is-on', $(this).data('bd') === bd).attr('aria-current', $(this).data('bd') === bd ? 'page' : null); });
	document.title = BD[bd] + ' | 고객센터 | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';

	function replaceUrl(params) {
		try { history.replaceState(null, '', Mock.url('index.html', $.extend({ BD_CD: bd }, params))); } catch (e) { /* 무시 */ }
	}
	function searchForm(id, q, ph) {
		return '<form class="mc-search" id="' + id + '" role="search"><label for="' + id + 'Q" class="mc-sr">검색어</label>' +
			'<input type="search" id="' + id + 'Q" value="' + esc(q || '') + '" placeholder="' + ph + '" maxlength="30"><button type="submit">검색</button></form>';
	}

	/* ================= 마이컬처뉴스 ================= */
	function noticeList(page, q) {
		replaceUrl({ q: q, page: page > 1 ? page : '' });
		$root.html('<div class="mc-toolbar"><p class="mc-count" id="ntCount">&nbsp;</p>' + searchForm('ntSearch', q, '제목 · 내용 검색') + '</div><div id="ntList">' + MC.loading() + '</div><div id="ntPaging"></div>');
		var pins = q ? [] : MockDB.where(N, function (r) { return r.pin; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; });
		MockApi.list(N, {
			filter: q ? null : function (r) { return !r.pin; },
			keyword: q, fields: ['title', 'body', 'cate'],
			sort: ['-date', '-id'], page: page, size: SIZE
		}).then(function (res) {
			$('#ntCount').html('총 <b>' + (res.total + pins.length) + '</b>건' + (q ? ' · \'' + esc(q) + '\' 검색 결과' : ''));
			if (!res.total && !pins.length) {
				$('#ntList').html(MC.empty('\'' + esc(q) + '\'에 맞는 글이 없어요.', '<a class="mc-btn" href="index.html?BD_CD=NOTICE">전체 목록</a>'));
				return;
			}
			var start = res.total - (res.page - 1) * res.size;
			var rows = pins.map(function (r) { return row(r, '<span class="mc-pin">공지</span>', true); })
				.concat(res.items.map(function (r, i) { return row(r, String(start - i), false); }));
			$('#ntList').html('<table class="mc-table"><caption>마이컬처뉴스 목록</caption><colgroup><col style="width:80px"><col style="width:110px"><col><col style="width:120px"><col style="width:80px"></colgroup>' +
				'<thead><tr><th scope="col">번호</th><th scope="col">분류</th><th scope="col">제목</th><th scope="col">작성일</th><th scope="col">조회</th></tr></thead><tbody>' + rows.join('') + '</tbody></table>');
			$('#ntPaging').html(MC.pager(res));
		});
		function row(r, no, pin) {
			return '<tr' + (pin ? ' class="is-pin"' : '') + '><td class="mc-tno' + (pin ? ' is-pin' : '') + '">' + no + '</td>' +
				'<td class="mc-tcate mc-td">' + esc(r.cate) + '</td>' +
				'<td class="mc-tl"><a href="' + esc(MC.link.cmm('NOTICE', { MODE: 'view', idx: r.id })) + '">' + esc(r.title) + '</a></td>' +
				'<td class="mc-td">' + Mock.date(r.date, 'YYYY.MM.DD') + '</td><td class="mc-td"><span class="mc-mo">조회 </span>' + Mock.num(r.views) + '</td></tr>';
		}
		$root.off('.nt').on('submit.nt', '#ntSearch', function (e) { e.preventDefault(); noticeList(1, $.trim($('#ntSearchQ').val())); })
			.on('click.nt', '#ntPaging button[data-page]', function () { noticeList(+$(this).data('page'), q); });
	}

	function noticeView(idx) {
		$root.html(MC.loading());
		MockApi.get(N, idx).then(function (r) {
			MockDB.update(N, r.id, { views: (r.views || 0) + 1 });
			var list = MockDB.all(N).sort(function (a, b) { return (b.pin - a.pin) || (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id - a.id); });
			var i = list.map(function (x) { return x.id; }).indexOf(r.id), prev = list[i - 1], next = list[i + 1];
			document.title = r.title + ' | 마이컬처뉴스 | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
			$root.html(
				'<div class="mc-view-head"><span class="mc-tcate">' + esc(r.cate) + '</span><h3>' + esc(r.title) + '</h3>' +
				'<p><span>마이컬처이즈</span><span>' + Mock.date(r.date, 'YYYY.MM.DD') + '</span><span>조회 ' + Mock.num((r.views || 0) + 1) + '</span></p></div>' +
				'<div class="mc-view-body">' + r.body + '</div>' +   // 본문은 데이터 파일에서 만든 고정 HTML
				'<ul class="mc-prevnext">' +
					'<li><span>이전 글</span>' + (prev ? '<a href="' + esc(MC.link.cmm('NOTICE', { MODE: 'view', idx: prev.id })) + '">' + esc(prev.title) + '</a>' : '<em style="color:#aaa">없음</em>') + '</li>' +
					'<li><span>다음 글</span>' + (next ? '<a href="' + esc(MC.link.cmm('NOTICE', { MODE: 'view', idx: next.id })) + '">' + esc(next.title) + '</a>' : '<em style="color:#aaa">없음</em>') + '</li>' +
				'</ul>' +
				'<div class="mc-btns"><a class="mc-btn" href="index.html?BD_CD=NOTICE">목록</a></div>'
			);
		}).catch(function () {
			$root.html(MC.empty('글을 찾을 수 없어요.', '<a class="mc-btn" href="index.html?BD_CD=NOTICE">목록으로</a>'));
		});
	}

	/* ================= FAQ ================= */
	function faq(cate, q) {
		var cats = [];
		MockDB.all(F).forEach(function (r) { if (cats.indexOf(r.cate) < 0) cats.push(r.cate); });
		replaceUrl({ cate: cate, q: q });
		$root.html(
			'<div class="mc-chips" id="fqTabs" role="group" aria-label="FAQ 분류" style="border:0;padding-top:0">' +
				['전체'].concat(cats).map(function (c) {
					return '<button type="button" data-cate="' + esc(c === '전체' ? '' : c) + '" aria-pressed="' + ((cate || '전체') === c) + '">' + esc(c) + '</button>';
				}).join('') +
			'</div>' +
			'<div class="mc-toolbar" style="margin-top:4px"><p class="mc-count" id="fqCount">&nbsp;</p>' + searchForm('fqSearch', q, '궁금한 내용을 검색해 보세요') + '</div>' +
			'<div id="fqList">' + MC.loading() + '</div>' +
			'<div class="mc-ask"><p><b>찾는 답이 없나요?</b>1:1 문의를 남겨 주시면 영업일 기준 1~2일 안에 답변드려요.</p><a class="mc-btn mc-btn-primary" href="' + esc(MC.link.cmm('QNA', { MODE: 'write' })) + '">1:1 문의하기</a></div>'
		);
		MockApi.list(F, { filter: { cate: cate }, keyword: q, fields: ['q', 'a'], sort: ['cate', 'order'] }).then(function (res) {
			$('#fqCount').html('총 <b>' + res.total + '</b>건');
			if (!res.total) { $('#fqList').html(MC.empty('\'' + esc(q) + '\'에 맞는 질문이 없어요.')); return; }
			$('#fqList').html('<ul class="mc-faq">' + res.items.map(function (r) {
				return '<li><button type="button" class="mc-faq-q" aria-expanded="false" aria-controls="fqA' + r.id + '" id="fqQ' + r.id + '">' +
					'<span class="mc-qmark" aria-hidden="true">Q</span><span class="mc-faq-cate">[' + esc(r.cate) + ']</span><span class="mc-faq-t">' + esc(r.q) + '</span><span class="mc-arrow" aria-hidden="true"></span></button>' +
					'<div class="mc-faq-a" id="fqA' + r.id + '" role="region" aria-labelledby="fqQ' + r.id + '" hidden><span class="mc-amark" aria-hidden="true">A</span><div>' + esc(r.a) + '</div></div></li>';
			}).join('') + '</ul>');
		});
		$root.off('.fq')
			.on('click.fq', '#fqTabs button', function () { faq(String($(this).data('cate') || ''), ''); })
			.on('submit.fq', '#fqSearch', function (e) { e.preventDefault(); faq(cate, $.trim($('#fqSearchQ').val())); })
			.on('click.fq', '.mc-faq-q', function () {
				var open = $(this).attr('aria-expanded') === 'true';
				$(this).attr('aria-expanded', String(!open)).next('.mc-faq-a').prop('hidden', open);
			});
	}

	/* ================= 1:1 문의 ================= */
	function qnaList(page) {
		var fresh = Mock.qs('new');
		replaceUrl({ page: page > 1 ? page : '', 'new': fresh });
		$root.html('<div class="mc-toolbar"><p class="mc-count" id="qaCount">&nbsp;</p><a class="mc-btn mc-btn-primary" id="qaWrite" href="' + esc(MC.link.cmm('QNA', { MODE: 'write' })) + '">문의하기</a></div><div id="qaList">' + MC.loading() + '</div><div id="qaPaging"></div>');
		MockApi.list(Q, { sort: ['-createdAt', '-id'], page: page, size: SIZE }).then(function (res) {
			var wait = MockDB.count(Q, function (r) { return r.status === '답변대기'; });
			$('#qaCount').html('총 <b>' + res.total + '</b>건 · 답변대기 ' + wait + '건');
			if (!res.total) { $('#qaList').html(MC.empty('아직 등록된 문의가 없어요.')); return; }
			var start = res.total - (res.page - 1) * res.size;
			$('#qaList').html('<table class="mc-table"><caption>1:1 문의 목록</caption><colgroup><col style="width:70px"><col style="width:100px"><col><col style="width:100px"><col style="width:110px"><col style="width:96px"></colgroup>' +
				'<thead><tr><th scope="col">번호</th><th scope="col">분류</th><th scope="col">제목</th><th scope="col">작성자</th><th scope="col">작성일</th><th scope="col">상태</th></tr></thead><tbody>' +
				res.items.map(function (r, i) {
					return '<tr class="has-st' + (String(r.id) === String(fresh) ? ' is-new' : '') + '"><td class="mc-tno">' + (start - i) + '</td>' +
						'<td class="mc-tcate mc-tc">' + esc(r.cate) + '</td>' +
						'<td class="mc-tl"><a href="' + esc(MC.link.cmm('QNA', { MODE: 'view', idx: r.id })) + '">' + esc(r.title) + '</a></td>' +
						'<td class="mc-td">' + esc(MC.mask(r.name)) + '</td><td class="mc-td">' + Mock.date(r.createdAt, 'YYYY.MM.DD') + '</td>' +
						'<td class="mc-tst">' + MC.statusBadge(r.status) + '</td></tr>';
				}).join('') + '</tbody></table>');
			$('#qaPaging').html(MC.pager(res));
		});
		$root.off('.qa').on('click.qa', '#qaPaging button[data-page]', function () { qnaList(+$(this).data('page')); });
		if (fresh) {
			try {
				if (!window.sessionStorage.getItem('mc-qna-toast-' + fresh)) {
					window.sessionStorage.setItem('mc-qna-toast-' + fresh, '1');
					Mock.toast('문의를 등록했어요. 영업일 기준 1~2일 안에 답변드려요', { type: 'success' });
				}
			} catch (e) { Mock.toast('문의를 등록했어요', { type: 'success' }); }
		}
	}

	function qnaView(idx) {
		$root.html(MC.loading());
		MockApi.get(Q, idx).then(function (r) {
			document.title = r.title + ' | 1:1 문의 | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
			$root.html(
				'<div class="mc-view-head"><span class="mc-tcate">' + esc(r.cate) + '</span> ' + MC.statusBadge(r.status) + '<h3 style="margin-top:6px">' + esc(r.title) + '</h3>' +
				'<p><span>' + esc(MC.mask(r.name)) + '</span><span>' + Mock.date(r.createdAt, 'YYYY.MM.DD HH:mm') + '</span></p></div>' +
				'<div style="padding-top:24px">' +
					'<div class="mc-qa-card"><div class="mc-qa-head"><span class="mc-qmark">Q</span><b>문의 내용</b></div><div class="mc-qa-body">' + esc(r.body) + '</div></div>' +
					(r.status === '답변완료'
						? '<div class="mc-qa-card is-answer"><div class="mc-qa-head"><span class="mc-amark">A</span><b>마이컬처이즈 답변</b><span>' + Mock.date(r.answeredAt, 'YYYY.MM.DD HH:mm') + '</span></div><div class="mc-qa-body">' + esc(r.answer) + '</div></div>'
						: '<div class="mc-qa-card is-answer"><div class="mc-qa-head"><span class="mc-amark">A</span><b>답변 준비 중이에요</b></div><div class="mc-qa-body">담당자가 확인하고 있어요. 영업일 기준 1~2일 안에 ' + esc(r.email) + ' 로도 알려 드릴게요.</div></div>') +
				'</div>' +
				'<div class="mc-btns"><a class="mc-btn" href="index.html?BD_CD=QNA">목록</a><a class="mc-btn mc-btn-primary" href="' + esc(MC.link.cmm('QNA', { MODE: 'write' })) + '">새 문의하기</a></div>'
			);
		}).catch(function () {
			$root.html(MC.empty('문의를 찾을 수 없어요.', '<a class="mc-btn" href="index.html?BD_CD=QNA">목록으로</a>'));
		});
	}

	function qnaWrite() {
		document.title = '1:1 문의하기 | 고객센터 | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
		var last = MockDB.getItem('myculture.lastBooker', null) || {};
		$root.html(
			'<form id="qaForm" class="mc-box" novalidate>' +
				'<h3>1:1 문의하기 <span>· 표시(*)는 필수 항목이에요</span></h3>' +
				'<div class="mc-row2">' +
					'<div class="mc-field"><label for="qaCate">분류 <em>*</em></label><select id="qaCate"><option value="">분류를 골라 주세요</option><option>예약문의</option><option>클래스문의</option><option>취소/환불</option><option>기타</option></select></div>' +
					'<div class="mc-field"><label for="qaName">이름 <em>*</em></label><input type="text" id="qaName" maxlength="20" value="' + esc(last.name || '') + '"></div>' +
				'</div>' +
				'<div class="mc-row2">' +
					'<div class="mc-field"><label for="qaEmail">이메일 <em>*</em></label><input type="email" id="qaEmail" maxlength="60" placeholder="답변 알림을 받을 이메일" value="' + esc(last.email || '') + '"></div>' +
					'<div class="mc-field"><label for="qaPhone">연락처</label><input type="tel" id="qaPhone" maxlength="13" placeholder="010-0000-0000 (선택)" value="' + esc(last.phone || '') + '"></div>' +
				'</div>' +
				'<div class="mc-field"><label for="qaTitle">제목 <em>*</em></label><input type="text" id="qaTitle" maxlength="50" placeholder="문의 제목을 입력해 주세요"></div>' +
				'<div class="mc-field"><label for="qaBody">내용 <em>*</em></label><textarea id="qaBody" maxlength="1000" style="height:200px" placeholder="예약번호가 있다면 함께 적어 주세요 (10자 이상)"></textarea><p class="mc-counter"><span id="qaCnt">0</span> / 1000</p></div>' +
				'<div class="mc-field"><label class="mc-check"><input type="checkbox" id="qaAgree"> [필수] 문의 답변을 위한 개인정보(이름 · 이메일 · 연락처) 수집 · 이용에 동의해요</label></div>' +
				'<div class="mc-btns"><a class="mc-btn mc-btn-gray" href="index.html?BD_CD=QNA">취소</a><button type="submit" class="mc-btn mc-btn-primary" id="qaSubmit">문의 등록</button></div>' +
			'</form>'
		);
		$root.off('.qw')
			.on('input.qw', '#qaBody', function () { $('#qaCnt').text(this.value.length); })
			.on('input.qw', '#qaPhone', function () {
				var d = this.value.replace(/\D/g, '').slice(0, 11);
				this.value = d.length < 4 ? d : d.length < 8 ? d.slice(0, 3) + '-' + d.slice(3) : d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
			})
			.on('submit.qw', '#qaForm', function (e) {
				e.preventDefault();
				var $btn = $('#qaSubmit');
				if ($btn.prop('disabled')) return;
				var ok = MC.validate($(this), [
					{ el: '#qaCate', test: function (v) { return v ? '' : '분류를 골라 주세요'; } },
					{ el: '#qaName', test: function (v) { return v ? '' : '이름을 입력해 주세요'; } },
					{ el: '#qaEmail', test: function (v) { return !v ? '이메일을 입력해 주세요' : (MC.re.email.test(v) ? '' : '이메일 형식이 아니에요'); } },
					{ el: '#qaPhone', test: function (v) { return !v || MC.re.phone.test(v) ? '' : '휴대폰 번호 형식이 아니에요'; } },
					{ el: '#qaTitle', test: function (v) { return !v ? '제목을 입력해 주세요' : (v.length < 2 ? '제목을 두 글자 이상 입력해 주세요' : ''); } },
					{ el: '#qaBody', test: function (v) { return !v ? '내용을 입력해 주세요' : (v.length < 10 ? '내용을 10자 이상 입력해 주세요 (지금 ' + v.length + '자)' : ''); } },
					{ el: '#qaAgree', test: function (v) { return v ? '' : '개인정보 수집 · 이용에 동의해 주세요'; } }
				]);
				if (!ok) return;
				$btn.prop('disabled', true).text('등록하는 중…');
				MockApi.create(Q, {
					cate: $('#qaCate').val(), title: $.trim($('#qaTitle').val()),
					name: $.trim($('#qaName').val()), email: $.trim($('#qaEmail').val()), phone: $.trim($('#qaPhone').val()),
					body: $.trim($('#qaBody').val()), status: '답변대기', createdAt: Mock.now(), answer: '', answeredAt: '', mine: true
				}).then(function (row) {
					location.href = MC.link.cmm('QNA', { 'new': row.id });
				}).catch(function (err) {
					console.error(err);
					$btn.prop('disabled', false).text('문의 등록');
					Mock.toast('등록하지 못했어요. 다시 시도해 주세요', { type: 'error' });
				});
			});
	}

	/* ---------- 시작 ---------- */
	var page = parseInt(Mock.qs('page'), 10) || 1, idx = Mock.qs('idx');
	if (bd === 'NOTICE') { if (mode === 'view' && idx) noticeView(idx); else noticeList(page, (Mock.qs('q') || '').trim()); }
	else if (bd === 'FAQ') faq(Mock.qs('cate') || '', (Mock.qs('q') || '').trim());
	else if (mode === 'write') qnaWrite();
	else if (mode === 'view' && idx) qnaView(idx);
	else qnaList(page);
})(jQuery);

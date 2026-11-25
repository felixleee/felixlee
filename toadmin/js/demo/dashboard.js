/*!
 * TMS 대시보드 (main/pure_main.html)
 *  - 예약관리 상담기록 : tms.inquiries (TourOffice 고객센터 문의) — 행을 누르면 내용·답변
 *  - 일정관리          : 다가오는 출발 일정 (tms.reservations) — 행을 누르면 예약 상세 창
 *  - 사내게시판        : tms.board
 *  - 상담/예약현황      : 최근 7일 여행·호텔 상담/예약 건수 (tms.inquiries · tms.reservations 에서 계산)
 *  - 회원가입 및 게시판현황, 오늘의 현황 : tms.dailyStats + 위 집계
 *  다른 탭에서 예약·문의가 들어오면 자동으로 다시 계산
 */
(function (w, $) {
	'use strict';
	var T = w.TmsDemo, esc = Mock.esc;
	var $boxes = $('.main_situation0 .flex_box');
	var $consult = $boxes.eq(0).find('table'), $sched = $boxes.eq(1).find('table'), $board = $boxes.eq(2).find('table');
	var $resTbody = $('.main_situation01 .flex_leftBox table tbody'), $memTbody = $('.main_situation01 .flex_rightBox table tbody');
	var $today = $('.main_situation02');

	function clearRows($t) { $t.find('tr').not(':first').remove(); }
	function loadingRow($t, cols) { clearRows($t); $t.find('tr:first').after('<tr class="demo_state_row"><td colspan="' + cols + '"><span class="demo_spinner"></span> 불러오는 중…</td></tr>'); }
	function emptyRow($t, cols, msg) { clearRows($t); $t.find('tr:first').after('<tr class="demo_state_row"><td colspan="' + cols + '">' + esc(msg) + '</td></tr>'); }
	function md(d) { return Mock.date(d, 'MM-DD'); }

	/* ---------- 예약관리 상담기록 ---------- */
	var inqTotal = null;
	function drawConsult() {
		loadingRow($consult, 5);
		return MockApi.list('tms.inquiries', { sort: '-createdAt', size: 30 }).then(function (res) {
			if (inqTotal != null && res.total > inqTotal) Mock.toast('새 상담 문의 ' + (res.total - inqTotal) + '건이 들어왔어요', { type: 'success' });
			inqTotal = res.total;
			if (!res.items.length) return emptyRow($consult, 5, '상담기록이 없습니다.');
			clearRows($consult);
			$consult.find('tr:first').after(res.items.map(function (q, i) {
				var text = q.content + (q.tourTitle ? ' — ' + q.tourTitle : '');
				return '<tr class="demo_click" data-inq="' + esc(q.id) + '" tabindex="0" title="' + esc(text) + '">' +
					'<td>' + (res.total - i) + '</td>' +
					'<td class="t_title demo_ellipsis">' + (q.status === '접수' ? '<span class="demo_tag">' + esc(q.kind) + '</span>' : '<span class="demo_tag is-done">답변완료</span>') + esc(text) + (T.isNew(q) ? ' <span class="demo_new">N</span>' : '') + '</td>' +
					'<td>' + esc(q.name) + '</td><td>' + esc(md(q.notifyDate)) + '</td><td>' + esc(Mock.date(q.createdAt, 'YYYY-MM-DD')) + '</td></tr>';
			}).join(''));
		});
	}
	$consult.on('click keydown', 'tr[data-inq]', function (e) {
		if (e.type === 'keydown' && e.keyCode !== 13) return;
		var q = MockDB.find('tms.inquiries', $(this).attr('data-inq'));
		if (!q) return;
		var dlg = w.to_dialog.html(
			'<table class="t_register" width="100%"><colgroup><col width="120"><col></colgroup><tbody>' +
			'<tr><th>접수번호</th><td>' + esc(q.id) + ' <span class="demo_muted">(' + esc(q.createdAt) + ')</span></td></tr>' +
			'<tr><th>문의자</th><td>' + esc(q.name) + ' / ' + esc(q.phone) + (q.email ? ' / ' + esc(q.email) : '') + '</td></tr>' +
			'<tr><th>구분</th><td>' + esc(q.kind) + (q.tourTitle ? ' · ' + esc(q.tourTitle) : '') + '</td></tr>' +
			'<tr><th>희망일·인원</th><td>' + (q.wishDate ? esc(q.wishDate) : '-') + ' / ' + (q.pax ? q.pax + '명' : '-') + '</td></tr>' +
			'<tr><th>문의 내용</th><td style="white-space:pre-line;">' + esc(q.content) + '</td></tr>' +
			'<tr><th>답변</th><td><textarea id="inq_answer" rows="4" style="width:100%;box-sizing:border-box;" aria-label="답변">' + esc(q.answer || '') + '</textarea></td></tr>' +
			'</tbody></table><div class="btn_wrap_C mt15"><a href="javascript:;" class="Bbtn red" id="inq_save">답변완료 처리</a></div>',
			'상담 문의 - ' + q.id, 720, 520);
		$('#' + dlg).on('click', '#inq_save', function () {
			var ans = $.trim($('#inq_answer').val());
			if (!ans) { Mock.toast('답변 내용을 입력해 주세요', { type: 'error' }); return; }
			MockApi.update('tms.inquiries', q.id, { answer: ans, status: '답변완료', answeredAt: Mock.now(), answeredBy: T.admin }).then(function () {
				w.to_dialog.close(dlg);
				Mock.toast('답변완료로 처리했어요', { type: 'success' });
			});
		});
	});

	/* ---------- 일정관리 (다가오는 출발) ---------- */
	function drawSched() {
		loadingRow($sched, 4);
		var today = Mock.rel(0);
		return MockApi.list('tms.reservations', {
			filter: function (r) { return r.departDate >= today && ['취소요청', '취소완료'].indexOf(r.status) < 0; },
			sort: ['departDate', 'createdAt'], size: 20
		}).then(function (res) {
			if (!res.items.length) return emptyRow($sched, 4, '다가오는 출발 일정이 없습니다.');
			clearRows($sched);
			$sched.find('tr:first').after(res.items.map(function (r, i) {
				var dday = Math.round((Mock.toDate(r.departDate) - Mock.toDate(today)) / 86400000);
				var title = '[' + Mock.date(r.departDate, 'MM-DD(ddd)') + (r.kind === 'hotel' ? ' 체크인' : ' 출발') + '] ' + r.tourTitle + ' — ' + r.customer.name + (TourRes.paxTotal(r) > 1 ? ' 외 ' + (TourRes.paxTotal(r) - 1) + '명' : '');
				return '<tr class="demo_click" data-res="' + esc(r.id) + '" tabindex="0" title="' + esc(title) + '">' +
					'<td>' + (i + 1) + '</td>' +
					'<td class="t_title demo_ellipsis"><span class="demo_tag' + (dday <= 3 ? ' is-hot' : '') + '">D-' + dday + '</span>' + esc(title) +
					' <span style="color:' + (TourRes.COLOR[r.status] || '#999') + ';font-weight:normal;">(' + esc(r.status) + ')</span></td>' +
					'<td>' + (r.manager ? esc(r.manager) : '<span class="demo_muted">미배정</span>') + '</td><td>' + esc(Mock.date(r.createdAt, 'YYYY-MM-DD')) + '</td></tr>';
			}).join(''));
		});
	}
	$sched.on('click keydown', 'tr[data-res]', function (e) {
		if (e.type === 'keydown' && e.keyCode !== 13) return;
		var rid = $(this).attr('data-res');
		w.to_dialog.iframe('good_res_edit.html?res_no=' + rid, '여행상품예약 수정 - ' + rid, '1400', '700', true, true, 'yes');
	});

	/* ---------- 사내게시판 ---------- */
	function drawBoard() {
		loadingRow($board, 4);
		return MockApi.list('tms.board', { sort: ['-notice', '-createdAt'], size: 10 }).then(function (res) {
			if (!res.items.length) return emptyRow($board, 4, '게시물이 없습니다.');
			clearRows($board);
			$board.find('tr:first').after(res.items.map(function (p) {
				return '<tr class="demo_click" data-post="' + p.id + '" tabindex="0">' +
					'<td>' + (p.notice ? '<span class="demo_tag is-hot">공지</span>' : p.id) + '</td>' +
					'<td class="t_title demo_ellipsis">' + esc(p.title) + (T.isNew(p) ? ' <span class="demo_new">N</span>' : '') + '</td>' +
					'<td>' + esc(p.writer) + '</td><td>' + esc(Mock.date(p.createdAt, 'YYYY-MM-DD')) + '</td></tr>';
			}).join(''));
		});
	}
	$board.on('click keydown', 'tr[data-post]', function (e) {
		if (e.type === 'keydown' && e.keyCode !== 13) return;
		var p = MockDB.find('tms.board', $(this).attr('data-post'));
		if (!p) return;
		w.to_dialog.html('<p class="demo_muted">' + esc(p.writer) + ' · ' + esc(p.createdAt) + ' · 조회 ' + p.hits + '</p>' +
			'<div class="demo_post">' + esc(p.content).replace(/\n/g, '<br>') + '</div>', p.title, 640, 360);
	});

	/* ---------- 상담/예약현황 · 회원가입 및 게시판현황 · 오늘의 현황 ---------- */
	function drawStats() {
		return MockApi.resolve(function () {
			var days = [];
			for (var i = 0; i < 7; i++) days.push(Mock.rel(-i));
			var inq = MockDB.all('tms.inquiries'), res = MockDB.all('tms.reservations'), stats = MockDB.all('tms.dailyStats');
			function cnt(list, d, kind, isRes) {
				return list.filter(function (x) {
					var k = isRes ? (x.kind === 'hotel' ? '호텔' : '여행') : (x.kind === '호텔' ? '호텔' : '여행');
					return String(x.createdAt).slice(0, 10) === d && k === kind;
				}).length;
			}
			var month = Mock.rel(0).slice(0, 7);
			return {
				rows: days.map(function (d) {
					var s = stats.filter(function (x) { return x.date === d; })[0] || { join: 0, login: 0, qna: [0, 0], review: 0, notice: 0 };
					return { d: d, tc: cnt(inq, d, '여행'), tr: cnt(res, d, '여행', true), hc: cnt(inq, d, '호텔'), hr: cnt(res, d, '호텔', true), s: s };
				}),
				join: { today: (stats.filter(function (x) { return x.date === Mock.rel(0); })[0] || {}).join || 0,
					month: stats.filter(function (x) { return x.date.slice(0, 7) === month; }).reduce(function (a, x) { return a + x.join; }, 0),
					total: (w.TMS_BASE_MEMBERS || 0) + stats.reduce(function (a, x) { return a + x.join; }, 0) },
				month: Number(month.slice(5))
			};
		}).then(function (o) {
			$resTbody.html(o.rows.map(function (r) {
				function n(v) { return v ? '<b class="c_red">' + v + '</b>' : '0'; }
				return '\n\t\t\t    \t<tr>\n\t\t\t\t<td>' + Mock.date(r.d, 'MM.DD') + '</td>\n\t\t\t\t<td>' + n(r.tc) + '</td>\n\t\t\t\t<td>' + n(r.tr) + '</td>\n\t\t\t\t\t\t\t\t<td>' + n(r.hc) + '</td>\n\t\t\t\t<td>' + n(r.hr) + '</td>\n\t    \t</tr>';
			}).join('') + '\n\t\t\t\t\t');
			$memTbody.html(o.rows.map(function (r) {
				return '\n\t\t\t\t\t\t<tr>\n\t\t\t\t<td>' + Mock.date(r.d, 'MM.DD') + '</td>\n\t\t\t\t<td>' + r.s.join + '</td>\n\t\t\t\t<td>' + r.s.login + '</td>\n\t\t\t\t<td>' + r.s.qna[0] + '/' + r.s.qna[1] + '</td>\n\t\t\t\t<td>' + r.s.review + '</td>\n\t\t\t\t<td>' + r.s.notice + '</td>\n\t\t\t</tr>';
			}).join('') + '\n\t\t\t\t\t');
			var t = o.rows[0];
			var $dl = $today.find('dl');
			$dl.eq(0).find('dd').eq(0).html('상담 : <b id="dash_today_consult">' + (t.tc + t.hc) + '</b>건');
			$dl.eq(0).find('dd').eq(1).html('예약 : <b id="dash_today_res">' + (t.tr + t.hr) + '</b>건');
			$dl.eq(1).find('dd').eq(0).text('오늘의가입고객 : ' + o.join.today + '명');
			$dl.eq(1).find('dd').eq(1).text(o.month + '월의가입고객 : ' + o.join.month + '명');
			$dl.eq(1).find('dd').eq(2).text('총가입고객 : ' + Mock.num(o.join.total) + '명');
		});
	}

	function all() { drawConsult(); drawSched(); drawBoard(); drawStats(); }

	var timers = {};
	function later(key, fn) { clearTimeout(timers[key]); timers[key] = setTimeout(fn, 80); }
	MockDB.on('tms.reservations', function () { later('r', function () { drawSched(); drawStats(); }); });
	MockDB.on('tms.inquiries', function () { later('q', function () { drawConsult(); drawStats(); }); });
	MockDB.on('tms.board', function () { later('b', drawBoard); });

	all();
})(window, jQuery);

/*
 * Cielpia 내 강의실 (mypage/my_class.html?open=주문번호)
 *  - 신청한 강의 목록(수강 중 / 수강 완료)과 진도율, 찜한 강의
 *  - 강의의 [차시 보기] → 차시 목록, '수강 완료' 체크 → 진도율 즉시 갱신 (cielpia.enrollments.done)
 *  - 차시 [재생] → 영상 자리표시 모달, 모달에서 바로 완료 처리
 *  - 학습자(자녀) 선택: 헤더의 자녀선택 팝업(원래 POST /setting/set_child)과 연결
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var $panel = $('#cpPanel');
	var st = { tab: 'ing', open: Mock.qs('open') || '' };

	function childOk(e) { var c = CP.currentChild(); return !c || String(e.childId) === String(c); }
	function enrollments() {
		return MockDB.where('cielpia.enrollments', childOk).sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
	}
	function isDone(e) { return e.status === '수강완료'; }
	function dday(e) {
		var ms = Mock.toDate(e.endAt) - Mock.toDate(Mock.rel(0));
		var d = Math.round(ms / 86400000);
		return d >= 0 ? 'D-' + d : '기간 만료';
	}

	function renderSummary() {
		var c = CP.currentChild() ? MockDB.find('cielpia.children', CP.currentChild()) : null;
		$('#cpLearner').text(c ? CP.childLabel(c) : '전체 자녀');
		var list = enrollments(), ing = list.filter(function (e) { return !isDone(e); }), done = list.filter(isDone);
		var wishN = MockDB.count('cielpia.wishes');
		var avg = list.length ? Math.round(list.reduce(function (a, e) { return a + CP.progress(e).pct; }, 0) / list.length) : 0;
		$('#cpStats').html(
			'<li class="cp-stat"><b>' + ing.length + '</b><span>수강 중</span></li>' +
			'<li class="cp-stat"><b>' + done.length + '</b><span>수강 완료</span></li>' +
			'<li class="cp-stat"><b>' + avg + '<small style="font-size:18px">%</small></b><span>평균 진도율</span></li>' +
			'<li class="cp-stat"><b>' + wishN + '</b><span>찜한 강의</span></li>');
		var counts = { ing: ing.length, done: done.length, wish: wishN };
		$('.cp-mytabs button').each(function () {
			var t = $(this).attr('data-tab');
			$(this).toggleClass('is-on', t === st.tab).attr('aria-selected', t === st.tab).find('em').text(counts[t]);
		});
	}

	function datesText(e) {
		return '신청 ' + Mock.date(e.createdAt, 'YYYY.MM.DD') + ' · 수강 기간 ~' + Mock.date(e.endAt, 'YYYY.MM.DD') + ' (' + dday(e) + ')' +
			(e.lastAt ? ' · 최근 학습 ' + Mock.date(e.lastAt, 'MM.DD HH:mm') : '');
	}
	function progressHtml(e, l) {
		var p = CP.progress(e, l);
		return '<div class="cp-progress" role="progressbar" aria-label="진도율" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + p.pct + '"><span style="width:' + p.pct + '%"></span></div>' +
			'<p class="cp-progress-txt">진도율 <b>' + p.pct + '%</b> · ' + p.done + '/' + p.total + '차시 완료</p>';
	}
	function nextLesson(e, l) {
		for (var i = 0; i < l.curriculum.length; i++) if ((e.done || []).indexOf(l.curriculum[i].no) < 0) return l.curriculum[i];
		return l.curriculum[0];
	}

	function enrCard(e) {
		var l = CP.lecture(e.lectureId);
		if (!l) return '';
		var c = MockDB.find('cielpia.children', e.childId), open = st.open === String(e.id), nx = nextLesson(e, l), complete = isDone(e);
		return '<div class="cp-enr' + (open ? ' is-open' : '') + (complete ? ' is-complete' : '') + '" data-enr="' + esc(e.id) + '" id="enr-' + esc(e.id) + '">' +
			'<div class="cp-enr-top">' +
				'<a class="cp-enr-thumb" href="' + CP.viewUrl(l.id) + '"><img src="' + CP.img(l.thumb) + '" alt="" /></a>' +
				'<div class="cp-enr-info">' +
					'<span class="cp-status' + (complete ? ' is-done' : '') + '">' + esc(e.status) + '</span> ' +
					'<span class="cp-enr-meta">학습자 <b>' + esc(c ? c.name : '-') + '</b> · ' + esc(CP.pathText(l, true)) + '</span>' +
					'<h4><a href="' + CP.viewUrl(l.id) + '">' + esc(l.title) + '</a></h4>' +
					'<p class="cp-enr-meta cp-enr-dates">' + datesText(e) + '</p>' +
					'<div class="cp-enr-prog">' + progressHtml(e, l) + '</div>' +
				'</div>' +
				'<div class="cp-enr-act">' +
					'<button type="button" class="cp-btn cp-btn-sm cp-btn-blue" data-toggle aria-expanded="' + open + '">' + (open ? '차시 닫기' : '차시 보기') + '</button>' +
					'<button type="button" class="cp-btn cp-btn-sm cp-btn-line" data-play="' + nx.no + '">' + (complete ? '다시 보기' : '이어 보기 · ' + nx.no + '차시') + '</button>' +
				'</div>' +
			'</div>' +
			'<div class="cp-lessons"><ul>' + l.curriculum.map(function (ls) {
				var d = (e.done || []).indexOf(ls.no) >= 0, cid = 'chk-' + e.id + '-' + ls.no;
				return '<li class="cp-lesson' + (d ? ' is-done' : '') + '" data-no="' + ls.no + '">' +
					'<span class="cp-lesson-no">' + ls.no + '차시</span>' +
					'<span class="cp-lesson-tit">' + esc(ls.title) + '<small>' + ls.min + '분</small></span>' +
					'<button type="button" class="cp-lesson-play" data-play="' + ls.no + '"><i class="xi-play" aria-hidden="true"></i> 재생</button>' +
					'<label class="cp-check" for="' + cid + '"><input type="checkbox" id="' + cid + '" data-lesson="' + ls.no + '"' + (d ? ' checked' : '') + ' />수강 완료</label>' +
				'</li>';
			}).join('') + '</ul></div>' +
		'</div>';
	}

	function renderPanel() {
		renderSummary();
		if (st.tab === 'wish') {
			var ws = MockDB.all('cielpia.wishes').sort(function (a, b) { return String(b.createdAt).localeCompare(String(a.createdAt)); });
			var lecs = ws.map(function (w) { return CP.lecture(w.lectureId); }).filter(Boolean);
			$panel.html(lecs.length ? '<ul class="cp-grid">' + lecs.map(function (l) { return CP.card(l); }).join('') + '</ul>'
				: CP.empty('찜한 강의가 없어요', '강의 카드의 하트를 누르면 여기에 모여요.', '<a class="cp-btn cp-btn-blue" href="' + CP.listUrl({}) + '">강의 둘러보기</a>'));
			return;
		}
		var list = enrollments().filter(function (e) { return st.tab === 'done' ? isDone(e) : !isDone(e); });
		if (!list.length) {
			var who = CP.currentChild() ? $('#cpLearner').text() + ' 학습자의 ' : '';
			$panel.html(st.tab === 'done'
				? CP.empty(who + '수강을 마친 강의가 아직 없어요', '차시를 모두 \'수강 완료\'로 체크하면 여기로 옮겨져요.')
				: CP.empty(who + '수강 중인 강의가 없어요', '마음에 드는 강의를 찾아 수강신청해 보세요. 무료 강의도 있어요.',
					'<a class="cp-btn cp-btn-blue" href="' + CP.listUrl({}) + '">강의 둘러보기</a> <a class="cp-btn" href="' + CP.listUrl({ price: 'free' }) + '">무료 강의</a>'));
			return;
		}
		$panel.html(list.map(enrCard).join(''));
	}

	function refreshCard(id) {
		var e = MockDB.find('cielpia.enrollments', id), l = e && CP.lecture(e.lectureId);
		if (!l) return;
		var $c = $panel.find('[data-enr="' + id + '"]');
		$c.find('.cp-enr-prog').html(progressHtml(e, l));
		$c.find('.cp-enr-dates').text(datesText(e));
		$c.toggleClass('is-complete', isDone(e));
		$c.find('.cp-status').text(e.status).toggleClass('is-done', isDone(e));
		var nx = nextLesson(e, l);
		$c.find('.cp-enr-act [data-play]').attr('data-play', nx.no).text(isDone(e) ? '다시 보기' : '이어 보기 · ' + nx.no + '차시');
		renderSummary();
	}

	/** 차시 완료 체크 저장 */
	function setLesson(id, no, checked) {
		var e = MockDB.find('cielpia.enrollments', id), l = CP.lecture(e.lectureId);
		var done = (e.done || []).filter(function (n) { return n !== no; });
		if (checked) done.push(no);
		done.sort(function (a, b) { return a - b; });
		var wasDone = isDone(e);
		var status = done.length >= l.lessons ? '수강완료' : '수강중';
		var $in = $panel.find('#chk-' + id + '-' + no).prop('disabled', true);
		return MockApi.update('cielpia.enrollments', id, { done: done, status: status, lastAt: Mock.now() }).then(function (row) {
			$in.prop('disabled', false).prop('checked', checked).closest('.cp-lesson').toggleClass('is-done', checked);
			refreshCard(id);
			var p = CP.progress(row, l);
			if (!wasDone && isDone(row)) Mock.toast('「' + l.title + '」 수강을 모두 마쳤어요! (수강 완료 탭에서 볼 수 있어요)', { type: 'success', duration: 3200 });
			else Mock.toast(no + '차시 ' + (checked ? '수강 완료' : '완료 취소') + ' · 진도율 ' + p.pct + '%', { type: checked ? 'success' : '' });
			return row;
		}).catch(function (er) {
			$in.prop('disabled', false).prop('checked', !checked);
			Mock.toast('저장하지 못했어요: ' + er.message, { type: 'error' });
		});
	}

	function openPlayer(id, no) {
		var e = MockDB.find('cielpia.enrollments', id), l = CP.lecture(e.lectureId), ls = l.curriculum[no - 1];
		var d = (e.done || []).indexOf(no) >= 0;
		var $m = CP.modal(
			'<div class="cp-player is-playing" id="cpModalPlayer"><img src="' + CP.img(l.thumb) + '" alt="" />' +
				'<div class="cp-player-ov"><p>▶ ' + ls.no + '차시 · ' + esc(ls.title) + ' (' + ls.min + '분)<small>영상 재생 영역 — 데모 자리표시</small></p><div class="cp-player-bar"><span></span></div></div>' +
			'</div>' +
			'<div class="cp-modal-body"><h3>' + esc(l.title) + '</h3><p>' + ls.no + '차시를 다 봤다면 수강 완료로 표시해 주세요. 진도율에 바로 반영돼요.</p>' +
				'<div class="cp-modal-btns">' +
					(ls.no > 1 ? '<button type="button" class="cp-btn cp-btn-sm cp-btn-gray" data-mplay="' + (ls.no - 1) + '">이전 차시</button>' : '') +
					(ls.no < l.lessons ? '<button type="button" class="cp-btn cp-btn-sm cp-btn-gray" data-mplay="' + (ls.no + 1) + '">다음 차시</button>' : '') +
					(d ? '<button type="button" class="cp-btn cp-btn-sm" disabled>수강 완료됨</button>'
						: '<button type="button" class="cp-btn cp-btn-sm cp-btn-blue" data-mdone>수강 완료로 표시</button>') +
				'</div></div>');
		$m.on('click', '[data-mplay]', function () { openPlayer(id, Number($(this).attr('data-mplay'))); });
		$m.on('click', '[data-mdone]', function () {
			var $b = $(this).prop('disabled', true).text('저장 중…');
			setLesson(id, no, true).then(function () { $b.text('수강 완료됨'); });
		});
	}

	/* ---------- 이벤트 ---------- */
	$('.cp-mytabs').on('click', 'button', function () { st.tab = $(this).attr('data-tab'); renderPanel(); });
	$panel.on('click', '[data-toggle]', function () {
		var $c = $(this).closest('.cp-enr').toggleClass('is-open');
		var open = $c.hasClass('is-open');
		st.open = open ? $c.attr('data-enr') : '';
		$(this).attr('aria-expanded', open).text(open ? '차시 닫기' : '차시 보기');
	});
	$panel.on('change', 'input[data-lesson]', function () {
		setLesson($(this).closest('.cp-enr').attr('data-enr'), Number($(this).attr('data-lesson')), this.checked);
	});
	$panel.on('click', '[data-play]', function () {
		openPlayer($(this).closest('.cp-enr').attr('data-enr'), Number($(this).attr('data-play')));
	});
	$(document).on('cp:child', renderPanel);
	$(document).on('cp:wish', function () { if (st.tab === 'wish') renderPanel(); else renderSummary(); });
	MockDB.on('cielpia.enrollments', function (src) { if (src === 'remote') renderPanel(); });

	/* ---------- 시작 (?open= 이면 해당 강의를 펼쳐서 보여 줌) ---------- */
	MockApi.resolve(function () { return enrollments(); }).then(function () {
		if (st.open) {
			var e = MockDB.find('cielpia.enrollments', st.open);
			if (e) {
				if (!childOk(e)) { MockDB.setItem('cielpia.child', ''); $('#child_idx_all').prop('checked', true); }
				st.tab = isDone(e) ? 'done' : 'ing';
			}
		}
		renderPanel();
		var $t = st.open ? $('#enr-' + st.open) : $();
		if ($t.length) $('html, body').animate({ scrollTop: $t.offset().top - 20 }, 300);
	});
})(jQuery);

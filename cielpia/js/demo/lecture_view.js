/*
 * Cielpia 강의 상세 (content/lecture_view.html?id=)
 *  - 소개 · 커리큘럼(맛보기 차시는 재생 영역 자리표시) · 강사 · 준비물 · 함께 보면 좋은 강의
 *  - 수강신청: 유료 → lecture_apply.html?id= / 무료 → 바로 신청 후 완료 화면(lecture_apply.html?order=)
 *  - 찜하기 (공통 [data-wish] 처리)
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var id = Mock.qs('id');
	var $view = $('#cpView');
	var lec = null;

	function sep() { return '<i class="xi-angle-right-min" aria-hidden="true"></i>'; }

	function render(l) {
		lec = l;
		var g = CP.cate(l.group), lv = CP.cate(l.level), ar = CP.cate(l.area), t = CP.teacher(l.teacher) || {};
		var enr = CP.enrollment(l.id), wished = CP.wished(l.id);
		var previews = l.curriculum.filter(function (c) { return c.preview; });
		var first = previews[0] || l.curriculum[0];
		document.title = l.title + ' | LJY Port :: 실제 운영되는 페이지가 아닙니다';

		var loc = '<a href="../main/pure_main.html">홈</a>' + sep() + '<a href="' + CP.listUrl({}) + '">강의</a>' + sep() +
			'<a href="' + CP.listUrl({ cate: g.id }) + '">' + esc(g.name) + '</a>' +
			(lv && lv.name !== '공통' ? sep() + '<a href="' + CP.listUrl({ cate: lv.id }) + '">' + esc(lv.name) + '</a>' : '') +
			(ar ? sep() + '<a href="' + CP.listUrl({ cate: lv ? lv.id : g.id, area: ar.id }) + '">' + esc(ar.name) + '</a>' : '');

		var btn;
		if (enr) btn = '<a class="cp-btn cp-btn-blue cp-btn-lg" href="' + Mock.url('../mypage/my_class.html', { open: enr.id }) + '"><i class="xi-play" aria-hidden="true"></i>내 강의실에서 이어보기</a>';
		else if (!l.price) btn = '<button type="button" class="cp-btn cp-btn-blue cp-btn-lg" id="cpEnrollFree">무료 수강신청</button>';
		else btn = '<a class="cp-btn cp-btn-blue cp-btn-lg" href="' + Mock.url('lecture_apply.html', { id: l.id }) + '">수강신청</a>';

		var prog = enr ? CP.progress(enr, l) : null;

		var html =
			'<p class="cp-location">' + loc + '</p>' +
			'<div class="cp-view-top">' +
				'<div class="cp-view-media">' +
					'<div class="cp-player" id="cpPlayer">' +
						'<img src="' + CP.img(l.thumb) + '" alt="" />' +
						'<div class="cp-player-ov">' +
							'<button type="button" class="cp-play" data-preview="' + first.no + '" title="맛보기 재생"><i class="xi-play" aria-hidden="true"></i><span class="cp-blind">맛보기 재생</span></button>' +
							'<p id="cpPlayerTxt">맛보기 ' + first.no + '차시 · ' + esc(first.title) + '<small>재생 버튼을 누르면 맛보기 영상 자리표시가 재생돼요</small></p>' +
							'<div class="cp-player-bar"><span></span></div>' +
						'</div>' +
					'</div>' +
					'<p class="cp-view-media-note">※ 데모 화면이라 실제 영상 대신 재생 영역만 보여 줘요.</p>' +
				'</div>' +
				'<div class="cp-view-info">' +
					'<div class="cp-badges"><span class="cp-badge cp-g-' + l.group + '">' + esc(g.name) + '</span>' +
						(CP.pathText(l) ? '<span class="cp-badge" style="background:#eef8ff;color:#1b79ee">' + esc(CP.pathText(l)) + '</span>' : '') +
						(l.price ? '' : '<span class="cp-badge cp-free">무료</span>') + '</div>' +
					'<h2 class="cp-view-title">' + esc(l.title) + '</h2>' +
					'<p class="cp-view-sum">' + esc(l.summary) + '</p>' +
					'<p class="cp-view-rate">' + CP.stars(l.rating) + '<b>' + l.rating.toFixed(1) + '</b>(후기 ' + Mock.num(l.reviews) + '개) · 수강생 ' + Mock.num(l.students) + '명</p>' +
					'<dl class="cp-dl">' +
						'<dt>강사</dt><dd><a href="#secTeacher" class="cp-jump" style="color:#333">' + esc(l.teacherName) + '</a> <small style="color:#888">' + esc(t.title || '') + '</small></dd>' +
						'<dt>대상 연령</dt><dd>' + CP.ageText(l) + (lv && lv.ageText && lv.name !== '공통' ? ' (' + esc(lv.name) + ')' : '') + '</dd>' +
						'<dt>구성</dt><dd>' + l.lessons + '차시 · 총 ' + CP.minText(l.totalMin) + ' · 맛보기 ' + previews.length + '개</dd>' +
						'<dt>수강 기간</dt><dd>신청일로부터 90일</dd>' +
						'<dt>준비물</dt><dd>' + esc(l.materials[0]) + (l.materials.length > 1 ? ' 외 ' + (l.materials.length - 1) + '개' : '') + '</dd>' +
					'</dl>' +
					'<div class="cp-price-box"><span>수강료</span><strong' + (l.price ? '' : ' class="is-free"') + '>' + CP.price(l.price) + '</strong></div>' +
					'<div class="cp-view-btns">' + btn +
						'<button type="button" class="cp-btn cp-btn-lg cp-wish-btn' + (wished ? ' is-on' : '') + '" data-wish="' + l.id + '" aria-pressed="' + wished + '">' +
							'<i class="' + (wished ? 'xi-heart' : 'xi-heart-o') + '" aria-hidden="true"></i><span class="cp-wish-txt">' + (wished ? '찜 완료' : '찜하기') + '</span></button>' +
					'</div>' +
					(enr ? '<p class="cp-view-enrolled"><i class="xi-check-circle" aria-hidden="true"></i> 이미 ' + (enr.status === '수강완료' ? '수강을 마친' : '수강 중인') + ' 강의예요 · 진도율 ' + prog.pct + '% (' + prog.done + '/' + prog.total + '차시)</p>' : '') +
				'</div>' +
			'</div>' +

			'<div class="cp-tabs" role="tablist">' +
				'<a href="#secIntro" class="is-on">강의 소개</a><a href="#secCur">커리큘럼</a><a href="#secTeacher">강사 소개</a><a href="#secMat">준비물</a>' +
			'</div>' +

			'<section class="cp-sec" id="secIntro"><h3>강의 소개</h3>' +
				'<p class="cp-sec-txt">' + esc(l.intro) + '</p>' +
				'<ul class="cp-points">' + l.points.map(function (p, i) { return '<li><b>' + (i + 1) + '</b>' + esc(p) + '</li>'; }).join('') + '</ul>' +
				'<div class="cp-tags">' + l.tags.map(function (tg) { return '<a href="' + Mock.url('search.html', { q: tg }) + '">#' + esc(tg) + '</a>'; }).join('') + '</div>' +
			'</section>' +

			'<section class="cp-sec" id="secCur"><h3>커리큘럼<small>' + l.lessons + '차시 · 총 ' + CP.minText(l.totalMin) + '</small></h3>' +
				'<ul class="cp-cur">' + l.curriculum.map(function (c) {
					var act = c.preview
						? '<button type="button" class="cp-cur-pv" data-preview="' + c.no + '"><i class="xi-play" aria-hidden="true"></i>맛보기</button>'
						: (enr ? '<a class="cp-cur-lock" href="' + Mock.url('../mypage/my_class.html', { open: enr.id }) + '" style="color:#1b79ee">강의실에서</a>'
							: '<span class="cp-cur-lock"><i class="xi-lock-o" aria-hidden="true"></i> 신청 후</span>');
					return '<li' + (c.preview ? ' class="is-preview"' : '') + '><span class="cp-cur-no">' + c.no + '차시</span><span class="cp-cur-tit">' + esc(c.title) + '</span>' +
						'<span class="cp-cur-min">' + c.min + '분</span><span class="cp-cur-act">' + act + '</span></li>';
				}).join('') + '</ul>' +
			'</section>' +

			'<section class="cp-sec" id="secTeacher"><h3>강사 소개</h3>' +
				'<div class="cp-teacher"><div class="cp-avatar" aria-hidden="true">' + esc((t.name || '').charAt(0)) + '</div><div>' +
					'<h4>' + esc(t.name) + '<small>' + esc(t.title) + '</small></h4>' +
					'<p>' + esc(t.intro) + '</p>' +
					'<ul>' + (t.career || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('') + '</ul>' +
				'</div></div>' +
			'</section>' +

			'<section class="cp-sec" id="secMat"><h3>준비물<small>집에 있는 물건으로 대신해도 괜찮아요</small></h3>' +
				'<ul class="cp-materials">' + l.materials.map(function (m) { return '<li><i class="xi-check" aria-hidden="true"></i>' + esc(m) + '</li>'; }).join('') + '</ul>' +
			'</section>' +

			'<section class="cp-sec" id="secRelated"><h3>함께 보면 좋은 강의</h3><div id="cpRelated">' + CP.loading('추천 강의를 고르는 중이에요') + '</div></section>';

		$view.html(html);
		loadRelated(l);
	}

	function loadRelated(l) {
		MockApi.list('cielpia.lectures', {
			filter: function (x) { return x.group === l.group && x.id !== l.id; },
			sort: ['-students'], size: 4
		}).then(function (res) {
			$('#cpRelated').html(res.total ? '<ul class="cp-grid">' + res.items.map(function (x) { return CP.card(x); }).join('') + '</ul>'
				: CP.empty('같은 분류의 다른 강의가 아직 없어요', '', '<a class="cp-btn cp-btn-blue" href="' + CP.listUrl({}) + '">전체 강의 보기</a>'));
		});
	}

	/* ---------- 맛보기 재생 자리표시 ---------- */
	$view.on('click', '[data-preview]', function () {
		var no = Number($(this).attr('data-preview'));
		var c = lec.curriculum[no - 1];
		var $p = $('#cpPlayer');
		$p.removeClass('is-playing');
		void $p[0].offsetWidth; // 애니메이션 다시 시작
		$p.addClass('is-playing');
		$('#cpPlayerTxt').html('▶ 맛보기 ' + c.no + '차시 · ' + esc(c.title) + ' (' + c.min + '분)<small>맛보기 영상 재생 영역 — 데모 자리표시</small>');
		if ($p.offset().top < $(window).scrollTop()) $('html, body').animate({ scrollTop: $p.offset().top - 20 }, 250);
	});
	$view.on('animationend', '.cp-player-bar span', function () {
		var enr = CP.enrollment(lec.id);
		$('#cpPlayer').removeClass('is-playing');
		$('#cpPlayerTxt').html('맛보기가 끝났어요<small>' + (enr ? '전체 차시는 내 강의실에서 볼 수 있어요' : '전체 ' + lec.lessons + '차시는 수강신청 후 볼 수 있어요') + '</small>');
	});

	/* ---------- 탭 이동 ---------- */
	$view.on('click', '.cp-tabs a, a.cp-jump', function (e) {
		var $t = $($(this).attr('href'));
		if (!$t.length) return;
		e.preventDefault();
		$('html, body').animate({ scrollTop: $t.offset().top - 56 }, 250);
	});
	$(window).on('scroll', function () {
		var y = $(window).scrollTop() + 90, cur = 'secIntro';
		['secIntro', 'secCur', 'secTeacher', 'secMat'].forEach(function (s) { var $s = $('#' + s); if ($s.length && $s.offset().top <= y) cur = s; });
		$('.cp-tabs a').each(function () { $(this).toggleClass('is-on', $(this).attr('href') === '#' + cur); });
	});

	/* ---------- 무료 강의 바로 신청 ---------- */
	$view.on('click', '#cpEnrollFree', function () {
		var $b = $(this).prop('disabled', true).html('<span class="cp-spin" aria-hidden="true"></span>신청 중…');
		var child = CP.currentChild() || (CP.children()[0] || {}).id;
		MockApi.create('cielpia.enrollments', {
			id: Mock.uid('CP'), lectureId: lec.id, childId: child, price: 0, payMethod: 'free', status: '수강중',
			createdAt: Mock.now(), endAt: Mock.date(Mock.addDays(new Date(), 90)), done: [], lastAt: ''
		}).then(function (row) {
			window.location.href = Mock.url('lecture_apply.html', { order: row.id });
		}).catch(function (e) {
			$b.prop('disabled', false).text('무료 수강신청');
			Mock.toast('신청하지 못했어요: ' + e.message, { type: 'error' });
		});
	});

	/* ---------- 불러오기 ---------- */
	if (!id) {
		$view.html(CP.empty('강의를 찾을 수 없어요', '주소에 강의 번호가 없어요.', '<a class="cp-btn cp-btn-blue" href="lecture_list.html">강의 목록으로</a>'));
		return;
	}
	MockApi.get('cielpia.lectures', id).then(render).catch(function () {
		$view.html(CP.empty('강의를 찾을 수 없어요', '삭제되었거나 주소가 잘못되었어요.', '<a class="cp-btn cp-btn-blue" href="lecture_list.html">강의 목록으로</a>'));
	});
})(jQuery);

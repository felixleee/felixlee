/*
 * MyCultureis 데모 — 클래스 상세 (good/detail.html?id=)
 *  소개 · 커리큘럼 · 강사 · 장소 · 유의사항 · 후기, 함께 보면 좋은 클래스
 *  예약 박스: 달력(예약 가능일·마감일) → 시간 슬롯(잔여 인원·마감임박·마감) → 인원 → 금액 → reserve.html 로 이동
 *  (reserve.html 에서 '변경'으로 돌아오면 &date=&time=&people= 로 고른 값을 다시 채운다)
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var $root = $('#mcDetail');
	var cls = null;
	var sel = { date: null, time: null, people: Math.max(1, parseInt(Mock.qs('people'), 10) || 1) };
	var view = null; // { y, m } 달력에 보이는 달

	function li(arr) { return (arr || []).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join(''); }

	function render(c) {
		var cate = MC.category(c.cate) || {};
		var reviews = MockDB.where(MC.C.review, function (r) { return String(r.classId) === String(c.id); })
			.sort(function (a, b) { return a.date < b.date ? 1 : -1; });
		var related = MockDB.where(MC.C.cls, function (x) { return x.id !== c.id && x.cate === c.cate; })
			.concat(MockDB.where(MC.C.cls, function (x) { var k = MC.category(x.cate); return x.id !== c.id && x.cate !== c.cate && k && k.grp === cate.grp; }))
			.sort(function (a, b) { return (a.cate === c.cate ? 0 : 1) - (b.cate === c.cate ? 0 : 1) || b.joined - a.joined; })
			.slice(0, 4);

		document.title = c.title + ' | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';

		var h = '';
		h += '<p class="mc-loc"><a href="../main/pure_main.html">HOME</a><span class="sep">&gt;</span>' +
			'<a href="' + esc(MC.link.list({ grp: cate.grp })) + '">' + esc(MC.GRP[cate.grp] || '') + '</a><span class="sep">&gt;</span>' +
			'<a href="' + esc(MC.link.list({ b_uid_s: cate.id })) + '">' + esc(cate.name || '') + '</a></p>';

		/* 상단: 사진 + 기본 정보 */
		h += '<div class="mc-dtop">' +
			'<div class="mc-gallery">' +
				'<div class="mc-gmain"><img id="mcGMain" src="' + esc(MC.img(c.images[0] || c.thumb)) + '" alt="' + esc(c.title) + '"></div>' +
				(c.images.length > 1 ? '<ul class="mc-gthumbs">' + c.images.map(function (src, i) {
					return '<li><button type="button" data-src="' + esc(MC.img(src)) + '" aria-label="사진 ' + (i + 1) + ' 보기"' + (i === 0 ? ' aria-current="true"' : '') + '><img src="' + esc(MC.img(src)) + '" alt=""></button></li>';
				}).join('') + '</ul>' : '') +
			'</div>' +
			'<div class="mc-dinfo">' +
				'<p class="mc-meta"><span class="mc-cate">' + esc(cate.name || '') + '</span><span class="mc-country">' + esc(c.country) + '</span></p>' +
				'<h2 class="mc-dtit">' + esc(c.title) + '</h2>' +
				'<p class="mc-dsum">' + esc(c.summary) + '</p>' +
				'<p class="mc-drate">' + MC.stars(c.rating) + '<b>' + c.rating.toFixed(1) + '</b><span>후기 ' + Mock.num(c.reviewCount) + '개 · 누적 참여 ' + Mock.num(c.joined) + '명</span></p>' +
				'<dl class="mc-dspec">' +
					'<div><dt>소요 시간</dt><dd>' + MC.duration(c.duration) + '</dd></div>' +
					'<div><dt>정원</dt><dd>최대 ' + c.capacity + '명 (최소 3명 진행)</dd></div>' +
					'<div><dt>난이도</dt><dd>' + esc(c.level) + ' · 한국어 수업</dd></div>' +
					'<div><dt>운영 요일</dt><dd>' + MC.daysText(c.days) + ' (' + c.times.join(', ') + ')</dd></div>' +
					'<div><dt>장소</dt><dd>' + esc(c.place.name) + '</dd></div>' +
				'</dl>' +
				'<p class="mc-dprice"><span>1인</span><strong>' + Mock.won(c.price) + '</strong></p>' +
				(c.tags && c.tags.length ? '<ul class="mc-tags">' + c.tags.map(function (t) { return '<li>#' + esc(t) + '</li>'; }).join('') + '</ul>' : '') +
				'<a href="#mcBook" class="mc-btn mc-btn-primary mc-btn-block" id="mcJump">날짜 선택하고 예약하기</a>' +
			'</div>' +
		'</div>';

		/* 본문 + 예약 박스 */
		h += '<div class="mc-dmain">' +
			'<div class="mc-dcontent">' +
				'<nav class="mc-dtabs" aria-label="상세 정보 메뉴">' +
					'<a href="#secIntro" class="is-on">소개</a><a href="#secCurri">커리큘럼</a><a href="#secTeacher">강사</a><a href="#secPlace">장소</a><a href="#secReview">후기</a>' +
				'</nav>' +
				'<section class="mc-sec" id="secIntro"><h3>클래스 소개</h3>' +
					c.intro.map(function (p) { return '<p class="mc-txt">' + esc(p) + '</p>'; }).join('') +
					'<div class="mc-incl"><div><h4>포함 사항</h4><ul>' + li(c.includes) + '</ul></div><div><h4>준비물</h4><ul>' + li(c.materials) + '</ul></div></div>' +
				'</section>' +
				'<section class="mc-sec" id="secCurri"><h3>커리큘럼 <em>' + MC.duration(c.duration) + '</em></h3><ol class="mc-curri">' +
					c.curriculum.map(function (s) {
						return '<li><b>' + esc(s.title) + '</b><span class="mc-min">' + s.min + '분</span>' + (s.desc ? '<p>' + esc(s.desc) + '</p>' : '') + '</li>';
					}).join('') +
				'</ol></section>' +
				'<section class="mc-sec" id="secTeacher"><h3>강사 소개</h3><div class="mc-teacher">' +
					'<div class="mc-avatar" aria-hidden="true">' + esc(c.instructor.name.charAt(0)) + '</div>' +
					'<div><b>' + esc(c.instructor.name) + '</b><span class="mc-from">' + esc(c.instructor.from) + '</span>' +
					'<p class="mc-career">' + esc(c.instructor.career) + '</p><blockquote>' + esc(c.instructor.intro) + '</blockquote></div>' +
				'</div></section>' +
				'<section class="mc-sec" id="secPlace"><h3>장소 안내</h3><dl class="mc-dl">' +
					'<div><dt>장소</dt><dd>' + esc(c.place.name) + '</dd></div>' +
					'<div><dt>주소</dt><dd>' + esc(c.place.addr) + '</dd></div>' +
					'<div><dt>오시는 길</dt><dd>' + esc(c.place.way) + '</dd></div>' +
				'</dl></section>' +
				'<section class="mc-sec" id="secNotice"><h3>유의사항</h3><ul class="mc-notice-list">' +
					'<li>클래스 전날 자정까지 예약할 수 있어요. (당일 예약 불가)</li>' +
					'<li>3일 전까지 취소하면 전액, 2일 전 ~ 1일 전은 50% 환불되며 당일 취소는 환불되지 않아요.</li>' +
					'<li>최소 인원(3명)이 모이지 않으면 하루 전 문자로 안내하고 전액 환불해 드려요.</li>' +
					'<li>알레르기가 있으면 예약할 때 요청사항에 적어 주세요.</li>' +
				'</ul></section>' +
				'<section class="mc-sec" id="secReview"><h3>후기 <em>' + Mock.num(c.reviewCount) + '</em></h3>' +
					'<div class="mc-rvsum"><strong>' + c.rating.toFixed(1) + '</strong><div>' + MC.stars(c.rating) + '<p>후기 ' + Mock.num(c.reviewCount) + '개 중 최근 ' + reviews.length + '개</p></div></div>' +
					(reviews.length ? '<ul class="mc-reviews">' + reviews.map(function (r) {
						return '<li><div class="mc-rv-head">' + MC.stars(r.rating) + '<b>' + esc(MC.mask(r.name)) + '</b><span>' + Mock.date(r.date, 'YYYY.MM.DD') + '</span></div><p>' + esc(r.body) + '</p></li>';
					}).join('') + '</ul>' : MC.empty('아직 후기가 없어요.')) +
				'</section>' +
			'</div>' +
			'<aside class="mc-book" id="mcBook" aria-label="예약">' +
				'<h3>날짜 · 시간 선택</h3>' +
				'<div class="mc-cal" id="mcCal"></div>' +
				'<div class="mc-slots" id="mcSlots" aria-live="polite"></div>' +
				'<div class="mc-people"><div>인원<small id="mcPeopleHint">1인 ' + Mock.won(c.price) + '</small></div>' +
					'<div class="mc-stepper"><button type="button" id="mcMinus" aria-label="인원 줄이기">−</button>' +
					'<input type="text" id="mcPeople" value="1" readonly aria-label="인원"><button type="button" id="mcPlus" aria-label="인원 늘리기">+</button></div></div>' +
				'<div class="mc-total"><span>총 금액</span><strong id="mcTotal"></strong></div>' +
				'<button type="button" class="mc-btn mc-btn-primary mc-btn-block" id="mcGoReserve">예약하기</button>' +
				'<p class="mc-book-note">· 예약 가능 기간: 내일부터 ' + MC.OPEN_TO + '일 후까지<br>· 다음 단계에서 예약자 정보를 입력하면 예약이 확정돼요</p>' +
			'</aside>' +
		'</div>';

		if (related.length) {
			h += '<section class="mc-related"><h3>함께 보면 좋은 클래스</h3><ul class="mc-cards is-4">' + related.map(MC.card).join('') + '</ul></section>';
		}
		$root.html(h);
	}

	/* ---------- 달력 ---------- */
	function monthInfo(y, m) {
		var first = new Date(y, m, 1), last = new Date(y, m + 1, 0);
		return { first: first, days: last.getDate(), start: first.getDay() };
	}
	function ymd(y, m, d) { return Mock.date(new Date(y, m, d)); }

	function renderCal() {
		var today = Mock.toDate(Mock.rel(0)), maxD = Mock.toDate(Mock.rel(MC.OPEN_TO));
		var info = monthInfo(view.y, view.m);
		var canPrev = view.y > today.getFullYear() || (view.y === today.getFullYear() && view.m > today.getMonth());
		var canNext = view.y < maxD.getFullYear() || (view.y === maxD.getFullYear() && view.m < maxD.getMonth());
		var h = '<div class="mc-cal-head">' +
			'<button type="button" data-move="-1" aria-label="이전 달"' + (canPrev ? '' : ' disabled') + '>‹</button>' +
			'<strong>' + view.y + '. ' + ('0' + (view.m + 1)).slice(-2) + '</strong>' +
			'<button type="button" data-move="1" aria-label="다음 달"' + (canNext ? '' : ' disabled') + '>›</button></div>' +
			'<table><caption>' + view.y + '년 ' + (view.m + 1) + '월 예약 달력</caption><thead><tr>' + MC.DAYNAME.map(function (d) { return '<th scope="col">' + d + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
		for (var i = 0; i < info.start; i++) h += '<td></td>';
		for (var d = 1; d <= info.days; d++) {
			var date = ymd(view.y, view.m, d), cls2 = '', label = '', attr = ' disabled';
			if (MC.isOpenDate(cls, date)) {
				var slots = MC.slots(cls, date), open = slots.filter(function (s) { return !s.closed; });
				if (open.length) { cls2 = 'is-open'; label = '예약'; attr = ' data-date="' + date + '"'; }
				else { cls2 = 'is-full'; label = '마감'; }
			}
			if (date === sel.date) cls2 += ' is-sel';
			if (date === Mock.rel(0)) cls2 += ' is-today';
			h += '<td><button type="button" class="' + $.trim(cls2) + '"' + attr + ' aria-label="' + (view.m + 1) + '월 ' + d + '일' + (label ? ' ' + label : '') + '"' + (date === sel.date ? ' aria-pressed="true"' : '') + '>' + d + (label ? '<small>' + label + '</small>' : '') + '</button></td>';
			if ((info.start + d) % 7 === 0 && d < info.days) h += '</tr><tr>';
		}
		var rest = (7 - (info.start + info.days) % 7) % 7;
		for (var j = 0; j < rest; j++) h += '<td></td>';
		h += '</tr></tbody></table>' +
			'<p class="mc-cal-legend"><span><i style="background:#f6eff8"></i>예약 가능</span><span><i style="background:#7b318e"></i>선택</span><span style="color:#d9364a">마감</span></p>';
		$('#mcCal').html(h);
	}

	function renderSlots() {
		var $s = $('#mcSlots');
		if (!sel.date) { $s.html('<p class="mc-hint">달력에서 날짜를 골라 주세요</p>'); return; }
		var slots = MC.slots(cls, sel.date);
		$s.html('<h4>' + Mock.date(sel.date, 'MM월 DD일 (ddd)') + ' 시간 선택</h4>' + slots.map(function (s) {
			var left = s.closed ? '마감' : (s.few ? '마감임박 · ' : '') + '잔여 ' + s.left + '석';
			return '<button type="button" class="mc-slot' + (s.few ? ' is-few' : '') + '" data-time="' + s.time + '"' +
				(s.closed ? ' disabled' : '') + ' aria-pressed="' + (s.time === sel.time) + '">' +
				'<span>' + s.time + ' ~ ' + s.end + '</span><span class="mc-left">' + left + '</span></button>';
		}).join(''));
	}

	function maxPeople() {
		if (sel.date && sel.time) return MC.seats(cls, sel.date, sel.time).left;
		return cls.capacity;
	}
	function renderPeople() {
		var max = Math.max(1, maxPeople());
		if (sel.people > max) sel.people = max;
		$('#mcPeople').val(sel.people);
		$('#mcMinus').prop('disabled', sel.people <= 1);
		$('#mcPlus').prop('disabled', sel.people >= max);
		$('#mcPeopleHint').text('1인 ' + Mock.won(cls.price) + (sel.time ? ' · 최대 ' + max + '명' : ''));
		$('#mcTotal').text(Mock.won(cls.price * sel.people));
	}

	function selectDate(date) {
		sel.date = date;
		var slots = MC.slots(cls, date);
		var keep = slots.filter(function (s) { return s.time === sel.time && !s.closed; })[0];
		var open = slots.filter(function (s) { return !s.closed; });
		sel.time = keep ? keep.time : (open.length === 1 ? open[0].time : null);
		renderCal(); renderSlots(); renderPeople();
	}

	function bindBooking() {
		$root.on('click', '.mc-cal-head button[data-move]', function () {
			var m = view.m + (+$(this).data('move'));
			view = { y: view.y + Math.floor(m / 12), m: (m % 12 + 12) % 12 };
			renderCal();
		});
		$root.on('click', '.mc-cal td button[data-date]', function () { selectDate($(this).data('date')); });
		$root.on('click', '.mc-slot', function () {
			if (this.disabled) return;
			sel.time = $(this).data('time');
			renderSlots(); renderPeople();
		});
		$root.on('click', '#mcMinus', function () { if (sel.people > 1) { sel.people--; renderPeople(); } });
		$root.on('click', '#mcPlus', function () {
			if (sel.people < maxPeople()) { sel.people++; renderPeople(); }
			else Mock.toast('이 시간은 최대 ' + maxPeople() + '명까지 예약할 수 있어요');
		});
		$root.on('click', '#mcGoReserve', function () {
			if (!sel.date) { Mock.toast('예약할 날짜를 골라 주세요', { type: 'error' }); $('#mcCal').get(0).scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
			if (!sel.time) { Mock.toast('시간을 골라 주세요', { type: 'error' }); $('#mcSlots').get(0).scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
			var s = MC.seats(cls, sel.date, sel.time);
			if (s.left < sel.people) { Mock.toast('남은 자리가 부족해요 (잔여 ' + s.left + '석)', { type: 'error' }); renderSlots(); renderPeople(); return; }
			location.href = MC.link.reserve({ id: cls.id, date: sel.date, time: sel.time, people: sel.people });
		});
		$root.on('click', '.mc-gthumbs button', function () {
			$('#mcGMain').attr('src', $(this).data('src'));
			$('.mc-gthumbs button').removeAttr('aria-current');
			$(this).attr('aria-current', 'true');
		});
		$root.on('click', '#mcJump', function (e) {
			e.preventDefault();
			$('html, body').stop().animate({ scrollTop: $('#mcBook').offset().top - 90 }, 300);
		});
		$root.on('click', '.mc-dtabs a', function (e) {
			e.preventDefault();
			var $t = $($(this).attr('href'));
			$('.mc-dtabs a').removeClass('is-on');
			$(this).addClass('is-on');
			if ($t.length) $('html, body').stop().animate({ scrollTop: $t.offset().top - 125 }, 300);
		});
		// 다른 탭에서 예약·초기화가 일어나면 잔여 인원을 다시 계산
		$(document).on('mc:bookings', function () { renderCal(); renderSlots(); renderPeople(); });
	}

	function init(c) {
		cls = c;
		render(c);
		// 예약 화면에서 '변경'으로 돌아온 경우 고른 값 복원, 아니면 가장 가까운 예약 가능일을 미리 고른다
		var qd = Mock.qs('date'), qt = Mock.qs('time');
		var start = (qd && MC.isOpenDate(c, qd)) ? qd : MC.firstOpenDate(c);
		var base = Mock.toDate(start || Mock.rel(1));
		view = { y: base.getFullYear(), m: base.getMonth() };
		if (qt) sel.time = qt;
		bindBooking();
		if (start) selectDate(start); else { renderCal(); renderSlots(); renderPeople(); }
	}

	var id = Mock.qs('id');
	if (!id) {
		$root.html(MC.empty('클래스를 찾을 수 없어요.', '<a class="mc-btn" href="list.html">클래스 목록 보기</a>'));
		return;
	}
	$root.html(MC.loading('클래스 정보를 불러오는 중이에요…'));
	MockApi.get(MC.C.cls, id).then(init).catch(function (e) {
		if (e && e.status === 404) $root.html(MC.empty('클래스를 찾을 수 없어요. 종료되었거나 주소가 잘못되었을 수 있어요.', '<a class="mc-btn" href="list.html">클래스 목록 보기</a>'));
		else { $root.html(MC.empty('정보를 불러오지 못했어요.')); console.error(e); }
	});
})(jQuery);

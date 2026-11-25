/*
 * MyCultureis 데모 — 모든 화면이 함께 쓰는 도우미 (MC.*)
 *  - 링크 만들기, 카테고리·클래스 조회, 잔여 인원 계산, 카드·페이징·로딩·결과 없음 마크업
 *  - 햄버거 메뉴(사이트맵) 팝업: 원래는 sitemap.html 을 ajax 로 불러왔지만 file:// 에서는 막히므로
 *    같은 마크업을 여기서 만들어 Magnific Popup 'inline' 으로 연다.
 *  - 새 화면(body.mc-sub)에서는 메인의 헤더 동작(언어 메뉴·맨 위로·사이트맵)을 initChrome() 으로 붙인다.
 * 불러오는 순서: jQuery → mock-api.js → data/classes.js (→ data/board.js) → 이 파일 → 화면 스크립트
 */
(function ($) {
	'use strict';

	var MC = window.MC = window.MC || {};
	var C = { cate: 'myculture.categories', cls: 'myculture.classes', book: 'myculture.bookings', review: 'myculture.reviews', pick: 'myculture.picks' };
	MC.C = C;

	/* 모든 화면이 myculture/ 아래 한 단계 폴더(main·good·cmm·mypage)에 있으므로 '../' 가 myculture 루트 */
	MC.base = '../';
	MC.img = function (p) { return p ? MC.base + p : MC.base + 'image/common/no_img_text.png'; };

	MC.link = {
		main: function () { return MC.base + 'main/pure_main.html'; },
		list: function (params) { return Mock.url(MC.base + 'good/list.html', params); },
		detail: function (id) { return Mock.url(MC.base + 'good/detail.html', { id: id }); },
		reserve: function (params) { return Mock.url(MC.base + 'good/reserve.html', params); },
		complete: function (no) { return Mock.url(MC.base + 'good/complete.html', { no: no }); },
		mypage: function (params) { return Mock.url(MC.base + 'mypage/reservation.html', params); },
		cmm: function (bd, params) { return Mock.url(MC.base + 'cmm/index.html', $.extend({ BD_CD: bd }, params)); }
	};

	/* ---------- 카테고리 · 클래스 ---------- */
	MC.GRP = { global: '세계문화', korean: '한국문화' };
	MC.categories = function (grp) {
		var rows = MockDB.all(C.cate).sort(function (a, b) { return a.order - b.order; });
		return grp ? rows.filter(function (r) { return r.grp === grp; }) : rows;
	};
	MC.category = function (id) { return id == null ? null : MockDB.find(C.cate, id); };
	MC.cls = function (id) { return id == null || id === '' ? null : MockDB.find(C.cls, id); };

	MC.duration = function (min) {
		var h = Math.floor(min / 60), m = min % 60;
		return (h ? h + '시간' : '') + (h && m ? ' ' : '') + (m ? m + '분' : '');
	};
	MC.endTime = function (time, min) {
		var hm = String(time).split(':'), t = (+hm[0]) * 60 + (+hm[1] || 0) + (min || 0);
		return ('0' + Math.floor(t / 60) % 24).slice(-2) + ':' + ('0' + t % 60).slice(-2);
	};
	MC.stars = function (rating) {
		var w = Math.max(0, Math.min(100, (Number(rating) || 0) / 5 * 100));
		return '<span class="mc-stars" role="img" aria-label="별점 ' + rating + '점"><span style="width:' + w + '%"></span></span>';
	};
	MC.mask = function (name) {
		name = String(name || '').trim();
		if (/^[A-Za-z]/.test(name)) return name.slice(0, 2) + '***';   // 영문 이름: 앞 두 글자만
		if (name.length <= 1) return name;
		if (name.length === 2) return name.charAt(0) + '*';
		return name.charAt(0) + new Array(name.length - 1).join('*') + name.charAt(name.length - 1);
	};

	/* ---------- 예약 가능 날짜 · 시간 슬롯 · 잔여 인원 ---------- */
	MC.OPEN_FROM = 1;   // 내일부터 (당일 예약 불가)
	MC.OPEN_TO = 60;    // 60일 뒤까지

	function hash(s) {
		var h = 2166136261;
		for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul ? Math.imul(h, 16777619) : (h * 16777619) | 0; }
		return h >>> 0;
	}
	function dayDiff(dateStr) {
		var d = Mock.toDate(dateStr), t = Mock.toDate(Mock.rel(0));
		return Math.round((d - t) / 864e5);
	}
	MC.dayDiff = dayDiff;

	/** 이 데모 이전에 이미 차 있던 자리 (날짜·시간으로 정해지는 고정값 — 매번 같은 값) */
	MC.preBooked = function (cls, date, time) {
		var h = hash(cls.id + '|' + date + '|' + time) % 100;
		if (h < 12) return cls.capacity;                         // 약 12% 는 이미 마감
		return Math.floor(h / 100 * cls.capacity * 0.85);
	};
	/** myculture.bookings 에서 예약확정 상태인 인원 합계 */
	MC.bookedPeople = function (classId, date, time) {
		return MockDB.where(C.book, function (b) {
			return String(b.classId) === String(classId) && b.date === date && b.time === time && b.status === '예약확정';
		}).reduce(function (s, b) { return s + (Number(b.people) || 0); }, 0);
	};
	MC.seats = function (cls, date, time) {
		var cap = cls.capacity, left = Math.max(0, cap - MC.preBooked(cls, date, time) - MC.bookedPeople(cls.id, date, time));
		return { capacity: cap, left: left, closed: left <= 0, few: left > 0 && left <= 2 };
	};
	MC.isOpenDate = function (cls, date) {
		var diff = dayDiff(date);
		return diff >= MC.OPEN_FROM && diff <= MC.OPEN_TO && cls.days.indexOf(Mock.toDate(date).getDay()) >= 0;
	};
	MC.slots = function (cls, date) {
		if (!MC.isOpenDate(cls, date)) return [];
		return cls.times.map(function (t) { return $.extend({ time: t, end: MC.endTime(t, cls.duration) }, MC.seats(cls, date, t)); });
	};
	MC.firstOpenDate = function (cls) {
		for (var i = MC.OPEN_FROM; i <= MC.OPEN_TO; i++) {
			var d = Mock.rel(i);
			if (MC.slots(cls, d).some(function (s) { return !s.closed; })) return d;
		}
		return null;
	};
	MC.DAYNAME = ['일', '월', '화', '수', '목', '금', '토'];
	MC.daysText = function (days) {
		var order = [1, 2, 3, 4, 5, 6, 0];
		if (days.length === 7) return '매일';
		return order.filter(function (d) { return days.indexOf(d) >= 0; }).map(function (d) { return MC.DAYNAME[d]; }).join(' · ');
	};

	/* ---------- 예약 상태 ---------- */
	MC.bookingStatus = function (b) {
		if (b.status === '예약취소') return '예약취소';
		return b.date < Mock.rel(0) ? '이용완료' : '예약확정';
	};
	MC.canCancel = function (b) { return b.status === '예약확정' && b.date > Mock.rel(0); };
	MC.statusBadge = function (label) {
		var cls = { '예약확정': 'ok', '이용완료': 'done', '예약취소': 'cancel', '답변완료': 'ok', '답변대기': 'wait' }[label] || 'done';
		return '<span class="mc-status mc-status-' + cls + '">' + Mock.esc(label) + '</span>';
	};
	MC.refundText = function (b) {
		var d = dayDiff(b.date);
		if (d >= 3) return '클래스 3일 전까지라 전액 환불돼요.';
		if (d >= 1) return '클래스 ' + d + '일 전이라 결제 금액의 50%가 환불돼요.';
		return '당일 취소는 환불되지 않아요.';
	};

	/* ---------- 공통 마크업 ---------- */
	MC.loading = function (text) {
		return '<div class="mc-loading" role="status" aria-live="polite"><span class="mc-spin" aria-hidden="true"></span>' + Mock.esc(text || '불러오는 중이에요…') + '</div>';
	};
	MC.empty = function (msg, extra) {
		return '<div class="mc-empty"><span class="mc-empty-ico" aria-hidden="true">!</span><p>' + msg + '</p>' + (extra || '') + '</div>';
	};
	/** res = MockApi.list 결과. 페이지 버튼은 data-page 를 가진 button */
	MC.pager = function (res) {
		if (!res || res.pages <= 1) return '';
		var r = Mock.pageRange(res.page, res.pages, 5), h = '<nav class="mc-paging" aria-label="페이지">';
		h += '<button type="button" class="mc-pg-arrow" data-page="' + Math.max(1, res.page - 1) + '"' + (res.page <= 1 ? ' disabled' : '') + ' aria-label="이전 페이지"><i class="xi-angle-left"></i><span class="mc-sr">이전</span></button>';
		r.list.forEach(function (n) {
			h += n === res.page
				? '<strong aria-current="page">' + n + '</strong>'
				: '<button type="button" data-page="' + n + '">' + n + '</button>';
		});
		h += '<button type="button" class="mc-pg-arrow" data-page="' + Math.min(res.pages, res.page + 1) + '"' + (res.page >= res.pages ? ' disabled' : '') + ' aria-label="다음 페이지"><i class="xi-angle-right"></i><span class="mc-sr">다음</span></button>';
		return h + '</nav>';
	};
	MC.card = function (c) {
		var cate = MC.category(c.cate) || {};
		var badge = c.pick ? '<span class="mc-badge">금주의 Pick</span>' : (c.tags && c.tags.indexOf('NEW') >= 0 ? '<span class="mc-badge mc-badge-new">NEW</span>' : '');
		return '<li class="mc-card"><a href="' + Mock.esc(MC.link.detail(c.id)) + '">' +
			'<div class="mc-thumb"><img src="' + Mock.esc(MC.img(c.thumb)) + '" alt="" loading="lazy">' + badge + '</div>' +
			'<div class="mc-cbody">' +
				'<p class="mc-meta"><span class="mc-cate">' + Mock.esc(cate.name || '') + '</span>' + (c.country && c.country !== '한국' ? '<span class="mc-country">' + Mock.esc(c.country) + '</span>' : '') + '</p>' +
				'<h3 class="mc-ctit">' + Mock.esc(c.title) + '</h3>' +
				'<p class="mc-info"><span>' + MC.duration(c.duration) + '</span><span>최대 ' + c.capacity + '명</span></p>' +
				'<div class="mc-cfoot"><span class="mc-rate"><b class="mc-star-ico" aria-hidden="true">★</b> ' + c.rating.toFixed(1) + ' <em>(' + Mock.num(c.reviewCount) + ')</em></span>' +
				'<strong class="mc-price">' + Mock.won(c.price) + '</strong></div>' +
			'</div></a></li>';
	};

	/* ---------- 폼 검증 ---------- */
	MC.re = {
		phone: /^01[016789]-?\d{3,4}-?\d{4}$/,
		email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
	};
	MC.fieldError = function ($field, msg) {
		var $row = $field.closest('.mc-field');
		$row.addClass('is-error').find('.mc-err').remove();
		$row.append('<p class="mc-err" role="alert">' + Mock.esc(msg) + '</p>');
		$field.attr('aria-invalid', 'true');
	};
	MC.clearErrors = function ($form) {
		$form.find('.mc-field').removeClass('is-error').find('.mc-err').remove();
		$form.find('[aria-invalid]').removeAttr('aria-invalid');
	};
	/** rules: [{ el: '#name', test: fn(value, $el) → 오류문구|'' }]  → 첫 오류 칸에 포커스, 통과하면 true */
	MC.validate = function ($form, rules) {
		MC.clearErrors($form);
		var first = null;
		rules.forEach(function (r) {
			var $el = $form.find(r.el), v = $el.is(':checkbox') ? $el.prop('checked') : $.trim($el.val() || '');
			var msg = r.test(v, $el);
			if (msg) { MC.fieldError($el, msg); if (!first) first = $el; }
		});
		if (first) {
			first.trigger('focus');
			var top = first.closest('.mc-field').offset().top - 110;
			$('html, body').stop().animate({ scrollTop: Math.max(0, top) }, 200);
			Mock.toast('입력 내용을 확인해 주세요', { type: 'error' });
			return false;
		}
		return true;
	};

	/* ---------- 사이트맵 팝업 (sitemap.html 과 같은 마크업) ---------- */
	MC.sitemapHtml = function () {
		function menu(c) {
			return '<div class="menu"><h2>' + Mock.esc(c.name) + '</h2><ul><li><a href="' + Mock.esc(MC.link.list({ b_uid_s: c.id })) + '">' + Mock.esc(c.name) + '</a></li></ul></div>';
		}
		var global = MC.categories('global'), korean = MC.categories('korean');
		// 원래 사이트맵 순서: … Premium, Others, Online Class (Online Class 는 원래 CSS 에서 숨김)
		var siteOrder = { '115': 6, '116': 7 };
		global.sort(function (a, b) { return (siteOrder[a.id] || a.order) - (siteOrder[b.id] || b.order); });
		return '<div class="sitemap_wrap mfp-hide" id="mcSitemap">' +
			'<div class="sitemap">' +
				'<p class="sitemap_logo"><img src="' + MC.base + 'FileData/logo/logo.png" alt="마이컬처이즈"></p>' +
				'<div class="kor_design global_tab"><span class="tit_navi">세계문화  &gt;</span>' + global.map(menu).join('') + '<div class="clear"></div></div>' +
				'<div class="kor_design korean_tab english_tab"><span class="tit_navi">한국문화  &gt;</span>' + korean.map(menu).join('') + '</div>' +
				'<div class="menu kor_cmnbd eng_cmnbd"><span class="tit_navi">고객센터  &gt;</span><h2>커뮤니티</h2><ul>' +
					'<li><a href="' + MC.link.cmm('NOTICE') + '">마이컬처뉴스</a></li>' +
					'<li><a href="' + MC.link.cmm('FAQ') + '">FAQ</a></li>' +
					'<li><a href="' + Mock.esc(MC.link.cmm('QNA', { MODE: 'write', flag: 'cs' })) + '">1:1 문의</a></li>' +
					'<li><a href="' + MC.link.mypage() + '">예약확인</a></li>' +
				'</ul></div>' +
			'</div>' +
			'<button title="Close (Esc)" type="button" class="mfp-close">×</button>' +
		'</div>';
	};

	/* ---------- 새 화면의 헤더 동작 (메인 인라인 스크립트와 같은 동작) ---------- */
	MC.initChrome = function () {
		$('#gnb ul.top_nav li').hover(
			function () { $(this).find('.det_menu').stop(true, true).slideDown('fast'); },
			function () { $(this).find('.det_menu').stop(true, true).slideUp('fast'); }
		);
		if ($.fn.magnificPopup) {
			$('.simple-ajax-popup-align-top').magnificPopup({
				type: 'inline', items: { src: '#mcSitemap' },
				alignTop: true, overflowY: 'hidden', fixedContentPos: false, mainClass: 'mfp-fade'
			});
		}
	};

	window.goTop = window.goTop || function () {
		$('html, body').animate({ scrollTop: 0 }, 500, 'swing');
		return false;
	};

	$(function () {
		if (!document.getElementById('mcSitemap')) $('body').append(MC.sitemapHtml());
		if ($('body').hasClass('mc-sub')) MC.initChrome();
		// 다른 탭에서 데모 데이터를 초기화하면 이 화면도 다시 그리도록
		MockDB.on(C.book, function (src) { if (src === 'reset' || src === 'remote') $(document).trigger('mc:bookings'); });
	});
})(jQuery);

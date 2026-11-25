/*
 * Monami France 데모 — 공통 도우미 (모든 페이지)
 *  - 템플릿 렌더링, 링크 주소, 별점·가격·날짜, 운영요일 계산
 *  - 로딩/결과 없음 표시, 페이지 번호, 폼 검증, 인원 선택(+/-)
 *  - 오른쪽 QUICK 메뉴의 '최근 본 투어'
 *  - 새 화면(body.dm-sub)의 헤더·QUICK 메뉴 동작 (메인은 원래 인라인 스크립트를 그대로 씀)
 * 필요: jQuery, mock/mock-api.js, data/*.js
 */
(function ($, w) {
	'use strict';

	var D = w.Demo = {};
	var COL = D.COL = {
		tours: 'monami.tours', countries: 'monami.countries', reviews: 'monami.reviews',
		notices: 'monami.notices', faqs: 'monami.faqs', bookings: 'monami.bookings'
	};

	D.TYPE = { guide: '가이드투어', custom: '단독맞춤투어', museum: '박물관투어' };
	D.NOTICE_CATE = { notice: '공지', news: '뉴스' };
	D.FAQ_CATE = { booking: '예약/결제', tour: '투어 이용', refund: '취소/환불', etc: '기타' };
	D.WEEK = ['일', '월', '화', '수', '목', '금', '토'];
	D.BOOK_FROM = 2;    // 오늘부터 며칠 뒤부터 예약 가능
	D.BOOK_UNTIL = 120; // 며칠 뒤까지 예약 가능

	/* ---------- 문자열 ---------- */
	D.esc = Mock.esc;
	D.img = function (p) { return p ? '../' + p : '../image/common/no_img_text.png'; };
	D.br = function (s) { return Mock.esc(s).replace(/\r?\n/g, '<br />'); };
	D.paras = function (s) {
		return String(s || '').split(/\r?\n\s*\r?\n/).map(function (p) { return '<p>' + D.br(p) + '</p>'; }).join('');
	};
	D.cut = function (s, n) {
		s = String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
		return s.length > n ? s.slice(0, n) + '...' : s;
	};
	D.oneLine = function (s) { return String(s || '').replace(/\s*\r?\n\s*/g, ' '); };

	/* 템플릿 — {{키}} 는 이스케이프, {{{키}}} 는 그대로. src 는 <script type="text/html" id> 의 id 또는 문자열 */
	D.tpl = function (src, data) {
		var el = document.getElementById(src);
		var html = el ? el.innerHTML : src;
		return html.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}|\{\{\s*([\w.]+)\s*\}\}/g, function (m, raw, key) {
			var v = (raw || key).split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, data);
			if (v == null) v = '';
			return raw ? String(v) : Mock.esc(v);
		});
	};
	D.tplAll = function (src, rows, map) {
		return rows.map(function (r, i) { return D.tpl(src, map ? map(r, i) : r); }).join('');
	};

	/* ---------- 주소 (모든 화면이 monami/<폴더>/ 한 단계 아래에 있음) ---------- */
	D.url = {
		main: '../main/pure_main.html',
		list: function (p) { return Mock.url('../tour/list.html', p); },
		tour: function (id) { return '../tour/detail.html?id=' + encodeURIComponent(id); },
		book: function (id, p) { return Mock.url('../tour/booking.html', $.extend({ id: id }, p || {})); },
		complete: function (no) { return '../tour/complete.html?no=' + encodeURIComponent(no); },
		lookup: function (p) { return Mock.url('../tour/lookup.html', p); },
		reviews: function (p) { return Mock.url('../review/list.html', p); },
		review: function (id) { return '../review/view.html?id=' + encodeURIComponent(id); },
		write: function (p) { return Mock.url('../review/write.html', p); },
		notices: function (p) { return Mock.url('../notice/list.html', p); },
		notice: function (id) { return '../notice/view.html?id=' + encodeURIComponent(id); },
		faq: function (p) { return Mock.url('../notice/faq.html', p); }
	};

	/* ---------- 데이터 ---------- */
	D.tour = function (id) { return id == null || id === '' ? null : MockDB.find(COL.tours, id); };
	D.country = function (id) { return id ? MockDB.find(COL.countries, id) : null; };
	D.countries = function (key) {
		key = key || 'sort';
		return MockDB.all(COL.countries).sort(function (a, b) { return a[key] - b[key]; });
	};
	D.reviewStat = function (tourId) {
		var rows = MockDB.where(COL.reviews, function (r) { return String(r.tourId) === String(tourId); });
		var sum = rows.reduce(function (s, r) { return s + (Number(r.rating) || 0); }, 0);
		return { count: rows.length, avg: rows.length ? Math.round(sum / rows.length * 10) / 10 : 0 };
	};
	D.stars = function (n) {
		var out = '<span class="dm-stars" title="별점 ' + n + '점">';
		for (var i = 1; i <= 5; i++) out += '<i class="' + (i <= Math.round(n) ? 'xi-star' : 'xi-star-o') + '"></i>';
		return out + '</span>';
	};
	D.won = function (n) { return Mock.won(n); };
	D.dateKo = function (d) { return Mock.date(d, 'YYYY.MM.DD (ddd)'); };
	D.mask = function (name) {
		name = String(name || '').trim();
		if (name.length <= 1) return name;
		if (name.length === 2) return name.charAt(0) + '*';
		return name.charAt(0) + new Array(name.length - 1).join('*') + name.charAt(name.length - 1);
	};

	/* ---------- 운영요일 · 날짜 ---------- */
	D.isOpenDay = function (tour, d) { return !!tour && tour.days.indexOf(Mock.toDate(d).getDay()) >= 0; };
	D.dayOffset = function (d) {
		var t = Mock.toDate(Mock.date(d)), today = Mock.toDate(Mock.rel(0));
		return Math.round((t - today) / 86400000);
	};
	D.canBook = function (tour, ymd) {
		if (!tour || !/^\d{4}-\d{2}-\d{2}$/.test(String(ymd || ''))) return false;
		var off = D.dayOffset(ymd);
		return off >= D.BOOK_FROM && off <= D.BOOK_UNTIL && D.isOpenDay(tour, ymd);
	};
	D.firstOpenDay = function (tour) {
		for (var i = D.BOOK_FROM; i <= D.BOOK_UNTIL; i++) if (D.isOpenDay(tour, Mock.rel(i))) return Mock.rel(i);
		return '';
	};
	/* 취소 환불 규정 — 10일 전 100%, 9~4일 전 50%, 3일 전~당일 0% */
	D.refundRate = function (ymd) {
		var off = D.dayOffset(ymd);
		return off >= 10 ? 100 : off >= 4 ? 50 : 0;
	};
	D.REFUND_TEXT = '투어일 기준 10일 전까지 전액 환불 · 9일~4일 전 50% 환불 · 3일 전~당일 취소와 노쇼는 환불 불가';

	/* jQuery UI 달력 — 운영요일만 고를 수 있게 */
	D.datepicker = function ($el, tour, onSelect, extra) {
		// 입력칸이면 포커스뿐 아니라 클릭해도 달력을 연다 (이미 포커스가 있는 상태에서 다시 누를 때)
		if ($el.is('input')) $el.on('click', function () { $el.datepicker('show'); });
		return $el.datepicker($.extend({
			dateFormat: 'yy-mm-dd',
			minDate: D.BOOK_FROM, maxDate: D.BOOK_UNTIL,
			firstDay: 0, showMonthAfterYear: true, yearSuffix: '년',
			monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			monthNamesShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
			dayNamesMin: D.WEEK, dayNames: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
			prevText: '이전 달', nextText: '다음 달',
			beforeShowDay: function (date) {
				var ok = tour.days.indexOf(date.getDay()) >= 0;
				return [ok, ok ? 'dm-open' : 'dm-closed', ok ? '예약 가능' : '운영하지 않는 요일'];
			},
			onSelect: function (txt) { if (onSelect) onSelect(txt); }
		}, extra || {}));
	};

	/* ---------- 인원 선택 (+/-) ---------- */
	/* <div class="dm-qty" data-name="adults"><button class="dm-qty-btn" data-d="-1">-</button><input><button data-d="1">+</button></div> */
	D.qty = function ($root, opt) {
		var $in = $root.find('input');
		function set(v) {
			v = Math.max(opt.min, Math.min(opt.max(), parseInt(v, 10) || 0));
			$in.val(v);
			$root.find('[data-d="-1"]').prop('disabled', v <= opt.min);
			$root.find('[data-d="1"]').prop('disabled', v >= opt.max());
			return v;
		}
		$root.on('click', '.dm-qty-btn', function () {
			var before = parseInt($in.val(), 10) || 0, after = set(before + Number($(this).attr('data-d')));
			if (after === before && Number($(this).attr('data-d')) > 0 && opt.onLimit) opt.onLimit();
			if (opt.onChange) opt.onChange(after);
		});
		set(opt.value);
		return { get: function () { return parseInt($in.val(), 10) || 0; }, set: function (v) { var r = set(v); if (opt.onChange) opt.onChange(r); return r; }, refresh: function () { set($in.val()); } };
	};

	/* ---------- 목록 상태 ---------- */
	D.loading = function ($el, msg) {
		$el.html('<div class="dm-state dm-loading" role="status"><span class="dm-spin" aria-hidden="true"></span>' + Mock.esc(msg || '불러오는 중이에요…') + '</div>');
	};
	D.empty = function ($el, msg, actionHtml) {
		$el.html('<div class="dm-state dm-empty"><i class="xi-info-o" aria-hidden="true"></i><p>' + Mock.esc(msg || '결과가 없어요.') + '</p>' + (actionHtml || '') + '</div>');
	};
	D.fail = function ($el, err) {
		D.empty($el, (err && err.message) || '데이터를 불러오지 못했어요.', '<a class="dm-btn" href="' + D.url.main + '">메인으로</a>');
	};

	/* 페이지 번호 — res = MockApi.list 결과, go(page) */
	D.pager = function ($el, res, go) {
		if (!res || res.pages <= 1) { $el.empty(); return; }
		var r = Mock.pageRange(res.page, res.pages, 5), h = '';
		h += '<button type="button" data-p="1" ' + (res.page === 1 ? 'disabled' : '') + ' aria-label="처음"><i class="xi-angle-left-min"></i><i class="xi-angle-left-min"></i></button>';
		h += '<button type="button" data-p="' + r.prev + '" ' + (!r.hasPrev ? 'disabled' : '') + ' aria-label="이전"><i class="xi-angle-left-min"></i></button>';
		r.list.forEach(function (p) { h += '<button type="button" data-p="' + p + '" class="' + (p === res.page ? 'on' : '') + '">' + p + '</button>'; });
		h += '<button type="button" data-p="' + r.next + '" ' + (!r.hasNext ? 'disabled' : '') + ' aria-label="다음"><i class="xi-angle-right-min"></i></button>';
		h += '<button type="button" data-p="' + res.pages + '" ' + (res.page === res.pages ? 'disabled' : '') + ' aria-label="끝"><i class="xi-angle-right-min"></i><i class="xi-angle-right-min"></i></button>';
		$el.html('<div class="dm-pager">' + h + '</div>');
		$el.find('button').on('click', function () { var p = Number($(this).attr('data-p')); if (p !== res.page) go(p); });
	};

	/* 주소창 검색어 갱신 (뒤로 가기 해도 조건 유지) */
	D.syncQuery = function (params) {
		try { w.history.replaceState(null, '', Mock.url(location.pathname.split('/').pop(), params)); } catch (e) { /* file:// 일부 환경 */ }
	};

	/* 받침에 맞는 조사 — D.josa('이름', '을', '를') → '이름을' */
	D.josa = function (word, a, b) {
		var ch = String(word).charCodeAt(String(word).length - 1);
		if (ch < 0xAC00 || ch > 0xD7A3) return word + a + '(' + b + ')';
		return word + ((ch - 0xAC00) % 28 ? a : b);
	};

	/* ---------- 폼 검증 ---------- */
	/* rules: [{ name, label, required, min, pattern, msg, check: function(v, $form){ return '오류문구' | '' } }] */
	D.validate = function ($form, rules) {
		var first = null;
		$form.find('.dm-err').remove();
		$form.find('.dm-invalid').removeClass('dm-invalid');
		rules.forEach(function (r) {
			var $f = $form.find('[name="' + r.name + '"]'), v, msg = '';
			if ($f.is(':checkbox')) v = $f.is(':checked') ? 'y' : '';
			else if ($f.is(':radio')) v = $f.filter(':checked').val() || '';
			else v = $.trim($f.val() || '');
			if (r.required && !v) msg = r.msg || (D.josa(r.label, '을', '를') + ' ' + ($f.is('select') || $f.is(':radio') || $f.is(':checkbox') ? '선택' : '입력') + '해 주세요.');
			else if (v && r.min && v.length < r.min) msg = D.josa(r.label, '은', '는') + ' ' + r.min + '자 이상 입력해 주세요.';
			else if (v && r.pattern && !r.pattern.test(v)) msg = r.patternMsg || (r.label + ' 형식이 올바르지 않아요.');
			else if (r.check) msg = r.check(v, $form) || '';
			if (msg) {
				var $anchor = $form.find('[data-err-for="' + r.name + '"]');
				if (!$anchor.length) $anchor = $f.last().closest('td, .dm-field');
				$anchor.append('<p class="dm-err" role="alert">' + Mock.esc(msg) + '</p>');
				$f.addClass('dm-invalid');
				if (!first) first = $f.first();
			}
		});
		if (first) {
			var top = first.closest('tr, .dm-field').offset();
			if (top) $('html, body').animate({ scrollTop: Math.max(0, top.top - 140) }, 250);
			if (!first.is(':checkbox, :radio') && !first.prop('readonly')) first.focus();
			Mock.toast('입력하지 않았거나 잘못된 항목이 있어요', { type: 'error' });
			return false;
		}
		return true;
	};

	/* ---------- 최근 본 투어 (QUICK 메뉴) ---------- */
	var RECENT = 'monami.recentTours';
	D.pushRecent = function (id) {
		var list = (MockDB.getItem(RECENT, []) || []).filter(function (x) { return String(x) !== String(id); });
		list.unshift(id);
		MockDB.setItem(RECENT, list.slice(0, 6));
	};
	D.renderRecent = function () {
		var $box = $('#quick_good_list');
		if (!$box.length) return;
		var tours = (MockDB.getItem(RECENT, []) || []).map(D.tour).filter(Boolean).slice(0, 4);
		var h = '<p class="tit">최근 본 투어</p>';
		if (!tours.length) h += '<p class="dm-recent-empty">아직 본 투어가 없어요</p>';
		else {
			h += '<ul class="dm-recent">' + tours.map(function (t) {
				return '<li><a href="' + D.url.tour(t.id) + '" title="' + Mock.esc(t.name) + '"><img src="' + D.img(t.image) + '" alt="" /><span>' + Mock.esc(t.name) + '</span></a></li>';
			}).join('') + '</ul>';
		}
		$box.html(h);
	};

	/* ---------- 새 화면의 헤더 · QUICK 메뉴 (메인의 인라인 스크립트와 같은 동작) ---------- */
	D.initLayout = function () {
		if ($.fn.bxSlider && $('.bxslider2').length) {
			$('.bxslider2').bxSlider({ mode: 'vertical', auto: true, autoStart: true, controls: false, autoHover: true, pagerSelector: '.pager_02' });
		}
		var $sidebar = $('.sidebar');
		var $opener = $sidebar.find('.opener').on('click', function () {
			$sidebar.toggleClass('open');
			if ($sidebar.hasClass('open')) $sidebar.stop(true).animate({ right: '0' }, 300, 'easeInBack');
			else $sidebar.stop(true).animate({ right: '-236' }, 300, 'easeOutBack');
		});
		$('.toBottom').on('click', function () { $('html, body').animate({ scrollTop: $('.footer').offset().top }, 600); });
		$('ul.handle li.kakao').on('mouseover', function () { $(this).addClass('kakao_on'); }).on('mouseleave', function () { $(this).removeClass('kakao_on'); });
		$('#gnb span').first().addClass('start');

		var gnbTop = $('#gnb_c').offset();
		$(w).on('scroll', function () {
			if (!gnbTop) return;
			if ($(document).scrollTop() > gnbTop.top) {
				$('#gnb_c').addClass('_fix');
				$('.gnb_wrap, .gnb_wrap span a, .gnb_wrap a.gnb_go_home').addClass('move');
			} else {
				$('#gnb_c').removeClass('_fix');
				$('.gnb_wrap, .gnb_wrap span a, .gnb_wrap a.gnb_go_home').removeClass('move');
			}
		});
		$('.gnb_wrap > span').hover(function () { $(this).find('ul.snb2').stop().fadeToggle(300); });
		$('ul.top_right > li').hover(function () { $(this).find('ul.tr_ddmenu').stop().fadeToggle(300); });
		$('.search-open').on('click', function () { $('.search-inline').addClass('search-visible'); $('#g_title_s').focus(); });
		$('.search-close').on('click', function () { $('.search-inline').removeClass('search-visible'); });
		void $opener;
	};

	if (typeof w.goTop !== 'function') {
		w.goTop = function () { $('html, body').animate({ scrollTop: 0 }, 500, 'swing'); return false; };
	}

	$(function () {
		D.renderRecent();
		if ($('body').hasClass('dm-sub')) D.initLayout();
		// 헤더 검색 — 빈 검색어는 막기
		$(document).on('submit', '#top_search_frm', function () {
			if (!$.trim($(this).find('[name="g_title_s"]').val())) { Mock.toast('검색어를 입력해 주세요'); return false; }
		});
	});
})(jQuery, window);

/*!
 * TourOffice 데모 공통 — 모든 화면(메인·목록·상세·예약·조회·문의)에서 씀
 *  - 상품 카드 가격 표기, 글자 자르기, 주소 만들기
 *  - 헤더 검색 레이어의 지역 목록 (원래 /include/search_area_ajax.html 을 .load() 하던 부분을 데이터로 대체)
 *  - 퀵메뉴 '오늘본상품' (최근 본 상품)
 *  - 목록 로딩/결과 없음, 페이징, 폼 오류 표시
 * 필요: jQuery, mock/mock-api.js, mock/shared/touroffice-tours.js
 */
(function (w, $) {
	'use strict';

	var D = w.ToDemo = {};
	var esc = Mock.esc;

	/** 무통장입금 안내용 가상 계좌 (실제 계좌 아님) */
	D.BANK = { bank: '데모은행', no: '000-000000-00-000', holder: '(주)투어오피스' };

	/* ---------- 상품 ---------- */
	D.img = function (t) { return '../' + t.thumb; };
	D.detailUrl = function (t) {
		return (t.kind === 'hotel' ? '../hotel/hotel_detail.html' : '../good/tour_detail.html') + '?id=' + t.id;
	};
	D.listUrl = function (params) {
		var hotel = String(params && params.b_uid_s) === '69';
		return Mock.url(hotel ? '../hotel/hotel_list.html' : '../good/tour_list.html', params || {});
	};
	/** 화면 폭 기준 자르기 (한글 2, 그 밖 1) — 원래 서버가 '...' 을 붙이던 표기 */
	D.cut = function (s, max) {
		s = s == null ? '' : String(s);
		var wsum = 0, out = '';
		for (var i = 0; i < s.length; i++) {
			var ch = s.charAt(i), cw = /[ᄀ-ᇿ㄰-㆏가-힯　-〿＀-￯]/.test(ch) ? 2 : 1;
			if (wsum + cw > max) return out.replace(/\s+$/, '') + '...';
			wsum += cw; out += ch;
		}
		return out;
	};
	/** 가격 표기 — 투어: '199,000<span class="text1">원</span> ~ ' / 요금문의,  숙소: '150,000원' / 문의 */
	D.priceHtml = function (t, quote) {
		var q = quote || '"';
		if (t.kind === 'hotel') return t.price == null ? '문의' : Mock.num(t.price) + '원';
		if (t.price == null) return '<span class=' + q + 'txt_price' + q + '>요금문의</span>';
		return Mock.num(t.price) + '<span class=' + q + 'text1' + q + '>원</span> ~ ';
	};
	D.period = function (t) {
		if (t.kind === 'hotel') return '1박 기준';
		if (t.type === 'ticket') return '공연 관람';
		if (!t.nights) return '당일';
		return t.nights + '박' + t.days + '일';
	};
	D.cateTrail = function (t) {
		var parts = [{ name: t.cate1, url: D.listUrl({ b_uid_s: t.b_uid }) }];
		if (t.cate2) parts.push({ name: t.cate2, url: D.listUrl({ b_uid_s: t.b_uid, m_uid_s: t.m_uid }) });
		return parts;
	};
	/** 앞으로의 출발일 중 예약 가능한 첫 날 */
	D.nextDep = function (t) {
		var today = Mock.rel(0);
		var list = (t.deps || []).filter(function (d) { return d.date > today; });
		for (var i = 0; i < list.length; i++) if (TourRes.seatInfo(t, list[i]).state !== '마감') return list[i];
		return list[0] || null;
	};

	/* ---------- 최근 본 상품 (퀵메뉴 오늘본상품) ---------- */
	var RECENT_KEY = 'touroffice.recent';
	D.recent = function () { return MockDB.getItem(RECENT_KEY, [1021, 1005]); };
	D.addRecent = function (id) {
		var list = D.recent().filter(function (x) { return String(x) !== String(id); });
		list.unshift(Number(id));
		MockDB.setItem(RECENT_KEY, list.slice(0, 10));
		todayPage = 0;
		D.renderToday();
	};
	var todayPage = 0;
	D.renderToday = function () {
		var $ul = $('#taday_list dd ul');
		if (!$ul.length) return;
		var items = D.recent().map(function (id) { return MockDB.find('touroffice.tours', id); }).filter(Boolean);
		var pages = Math.max(1, Math.ceil(items.length / 2));
		todayPage = Math.min(Math.max(todayPage, 0), pages - 1);
		var html = items.slice(todayPage * 2, todayPage * 2 + 2).map(function (t) {
			return '<li><a href="' + D.detailUrl(t) + '"><img src="' + esc(D.img(t)) + '" width="64" height="53" title="' + esc(t.title) + '"></a></li>';
		}).join('');
		$ul.html(html || '<li class="demo_today_empty">본 상품이 없어요</li>');
	};
	// 원래 퀵메뉴 이전/다음 버튼이 부르던 함수 (정의가 없어 오류가 나던 부분)
	w.get_today_good = function (dir) {
		todayPage += dir === 'prev' ? -1 : 1;
		D.renderToday();
	};

	/* ---------- 검색 레이어: 지역 목록 ---------- */
	function areaKindOf(target) { return /hotel/.test(target) ? 'hotel' : 'tour'; }
	D.renderAreaA = function (areaKind, target) {
		var $box = $('#' + target);
		if (!$box.length) return;
		var areas = TourOfficeData.areas(areaKindOf(target));
		$box.find('.left_scrolling').html('<ul class="mainCate">' + areas.map(function (a) {
			return '<li data-area="' + esc(a.code) + '" style="cursor:pointer;">' + esc(a.name) + '</li>';
		}).join('') + '</ul>');
		var cur = $box.find("input[name='areaa_cd_s']").val();
		if (!areas.some(function (a) { return a.code === cur; })) cur = areas.length ? areas[0].code : '';
		D.renderAreaB(cur, areaKind, target);
	};
	D.renderAreaB = function (aCode, areaKind, target) {
		var $box = $('#' + target);
		var area = TourOfficeData.areas(areaKindOf(target)).filter(function (a) { return a.code === aCode; })[0];
		$box.find('.mainCate li').removeClass('on').filter(function () { return $(this).attr('data-area') === aCode; }).addClass('on');
		$box.find('.scrolling_area').html(area ? '<div class="city_wrap"><ul>' + area.cities.map(function (c) {
			return '<li><a href="javascript:;" data-area="' + esc(area.code) + '" data-city="' + esc(c) + '">' + esc(c) + '</a></li>';
		}).join('') + '</ul></div>' : '');
	};
	$(document).on('click', '.location_wrap .mainCate li', function () {
		var target = $(this).closest('ul[id]').attr('id');
		if (typeof w.getAreaB === 'function') w.getAreaB($(this).attr('data-area'), w.areaKind || 'oversea', target);
	});
	$(document).on('click', '.location_wrap .city_wrap a', function () {
		var target = $(this).closest('ul[id]').attr('id');
		var a = $(this).attr('data-area'), c = $(this).attr('data-city');
		if (typeof w.setArea === 'function') w.setArea(a, c, c, w.areaKind || 'oversea', target);
	});

	/* ---------- 목록 상태 ---------- */
	D.stateHtml = function (kind, msg, tag) {
		tag = tag || 'div';
		var icon = kind === 'loading' ? '<span class="demo_spinner" aria-hidden="true"></span>' : '<i class="xi-search"></i>';
		return '<' + tag + ' class="demo_state demo_state_' + kind + '">' + icon + '<span>' + esc(msg) + '</span></' + tag + '>';
	};
	/** .paging 마크업 (기존 사이트 스타일) */
	D.pagerHtml = function (page, pages) {
		if (pages <= 1) return '';
		var r = Mock.pageRange(page, pages, 5), h = '';
		h += '<a href="javascript:;" data-page="1" class="demo_pg" title="처음">&laquo;</a>';
		h += '<a href="javascript:;" data-page="' + Math.max(1, page - 1) + '" class="demo_pg" title="이전">&lsaquo;</a>';
		r.list.forEach(function (n) { h += n === page ? '<strong>' + n + '</strong>' : '<a href="javascript:;" data-page="' + n + '">' + n + '</a>'; });
		h += '<a href="javascript:;" data-page="' + Math.min(pages, page + 1) + '" class="demo_pg" title="다음">&rsaquo;</a>';
		h += '<a href="javascript:;" data-page="' + pages + '" class="demo_pg" title="마지막">&raquo;</a>';
		return h;
	};

	/* ---------- 폼 ---------- */
	D.formatPhone = function (v) {
		var d = String(v || '').replace(/\D/g, '').slice(0, 11);
		if (d.length < 4) return d;
		if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
		if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
		return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
	};
	$(document).on('input', 'input.demo_phone', function () {
		var v = D.formatPhone(this.value);
		if (v !== this.value) this.value = v;
	});
	D.RE = {
		name: /^[가-힣a-zA-Z\s]{2,20}$/,
		phone: /^01[016789]-\d{3,4}-\d{4}$/,
		email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/,
		date: /^\d{4}-\d{2}-\d{2}$/
	};
	/** 오류 표시 — $el 은 input/select, msg 가 없으면 지움 */
	D.fieldError = function ($el, msg) {
		var $wrap = $el.closest('.demo_field');
		$wrap.find('.demo_err').remove();
		$el.toggleClass('demo_invalid', !!msg).attr('aria-invalid', msg ? 'true' : null);
		if (msg) $wrap.append('<p class="demo_err" role="alert">' + esc(msg) + '</p>');
	};
	D.clearErrors = function ($form) {
		$form.find('.demo_err').remove();
		$form.find('.demo_invalid').removeClass('demo_invalid').removeAttr('aria-invalid');
	};

	$(function () { D.renderToday(); });
})(window, jQuery);

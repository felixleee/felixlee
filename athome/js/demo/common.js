/*
 * AthomeTrip 데모 공통 — 상품 카드 템플릿 · 주소 · 최근 본 상품 · 장바구니 · 예약 초안
 * 모든 화면(main/, good/, mypage/)이 athome/ 바로 아래 한 단계 폴더에 있어서 루트 경로는 '../' 하나로 통일한다.
 * 의존: jQuery, mock/mock-api.js, data/cities.js, data/products.js
 */
(function (w, $) {
	'use strict';

	var ATH = w.ATH = {};
	ATH.base = '../';

	/* ---------- 경로 ---------- */
	ATH.img = function (p) {
		if (!p) return ATH.base + 'image/main/main1.jpg';
		return /^(https?:|data:)/.test(p) ? p : ATH.base + p;
	};
	ATH.pages = {
		main: 'main/pure_main.html',
		list: 'good/list.html',
		detail: 'good/tour_detail.html',
		cart: 'good/cart.html',
		reserve: 'good/reserve.html',
		complete: 'good/reserve_complete.html',
		mylist: 'mypage/reserve_list.html',
		myview: 'mypage/reserve_view.html'
	};
	ATH.href = function (name, params) { return Mock.url(ATH.base + ATH.pages[name], params); };
	ATH.detailHref = function (id) { return ATH.href('detail', { id: id }); };

	/* ---------- 카테고리 · 도시 ---------- */
	var cateMap = {}, cityMap = {};
	ATH.categories = function () { return MockDB.all('athome.categories').sort(function (a, b) { return a.order - b.order; }); };
	ATH.cities = function () { return MockDB.all('athome.cities').sort(function (a, b) { return a.order - b.order; }); };
	ATH.categories().forEach(function (c) { cateMap[c.id] = c; });
	ATH.cities().forEach(function (c) { cityMap[c.id] = c; });
	ATH.cate = function (id) { return cateMap[id] || null; };
	ATH.city = function (id) { return cityMap[id] || null; };
	ATH.cateName = function (id) { return cateMap[id] ? cateMap[id].name : ''; };
	ATH.cityName = function (id) { return id === 'us' ? '미국 전역' : (cityMap[id] ? cityMap[id].name : ''); };
	ATH.label = function (p) { return ATH.cateName(p.cate) + ' · ' + ATH.cityName(p.city); };

	/* ---------- 금액 · 날짜 ---------- */
	ATH.num = function (n) { return Mock.num(n); };
	ATH.won = function (n) { return Mock.won(n); };
	ATH.isHotel = function (p) { return p && p.cate === 'hotel'; };
	ATH.today = function () { return Mock.rel(0); };
	ATH.dateText = function (d) { return d ? Mock.date(d, 'YYYY.MM.DD (ddd)') : ''; };
	ATH.nights = function (a, b) {
		if (!a || !b) return 0;
		return Math.round((Mock.toDate(b) - Mock.toDate(a)) / 86400000);
	};
	ATH.optText = function (opts) {
		return (opts || []).filter(function (o) { return o.qty > 0; }).map(function (o) { return o.name + ' × ' + o.qty; }).join(', ');
	};
	ATH.itemDateText = function (it) {
		if (it.endDate) return ATH.dateText(it.date) + ' ~ ' + ATH.dateText(it.endDate) + ' (' + it.nights + '박)';
		return ATH.dateText(it.date);
	};

	/* ---------- 상품 카드 (메인의 원래 마크업을 그대로 템플릿으로) ---------- */
	var STAR = '<span class="h_star"><img src="' + ATH.base + 'image/hotel_level/star05.svg" alt=""></span>';
	ATH.ratingText = function (p) { return ' ' + p.rating.toFixed(1) + ' (' + ATH.num(p.reviews) + ')'; };

	/** <p class="price_area"> 안쪽 */
	ATH.priceInner = function (p, opt) {
		opt = opt || {};
		var h = '';
		if (p.orig && p.price != null) h += '<span class="original">' + ATH.num(p.orig) + '</span> ';
		h += p.price == null
			? '<span class="price"><span class=\'txt_price\'>요금문의</span></span>'
			: '<span class="price">' + ATH.num(p.price) + '원</span>';
		h += opt.amountSpan ? '<span class="amount"> / ' + Mock.esc(p.unit) + '</span>' : ' / ' + Mock.esc(p.unit);
		return h;
	};

	/**
	 * PICK · Top10 · 가이드투어 · 목록 카드
	 * opt.best: 순위(BEST n) / opt.statFirst: 즉시사용 뱃지를 가격 앞에 (Top10·가이드투어 원래 순서)
	 * opt.wrap: 바깥 div 클래스 / opt.params: 상세 주소에 덧붙일 값 (검색한 날짜·인원)
	 */
	ATH.card = function (p, opt) {
		opt = opt || {};
		var title = Mock.esc(p.title);
		var stat = p.instant ? '<p class="stat_icon"><i class="xi-lightning"></i>즉시사용</p>' : '';
		var price = '<p class="price_area">' + ATH.priceInner(p) + '</p>';
		var href = Mock.esc(ATH.href('detail', $.extend({ id: p.id }, opt.params || {})));
		return '' +
			'<div class="' + (opt.wrap || 'swiper-slide') + '">' +
				'<div class="m_best_info">' +
					'<span class="like_mark"><i class="xi-heart-o"></i></span>' +
					'<a href="' + href + '">' +
						'<div class="img_rel">' +
							'<img src="' + ATH.img(p.img) + '" alt="' + title + '" />' +
							(opt.best ? '<p class="best_box"><span>BEST ' + opt.best + '</span></p>' : '') +
						'</div>' +
						'<div class="context">' +
							'<p class="category">' + Mock.esc(ATH.label(p)) + '</p>' +
							'<p class="tit">' + title + '</p>' +
							'<span class="h_info">' + STAR + ATH.ratingText(p) + '</span>' +
							(opt.statFirst ? stat + price : price + stat) +
						'</div>' +
					'</a>' +
				'</div>' +
			'</div>';
	};

	/** 메인 '최근 본 상품' 카드 */
	ATH.seenCard = function (p) {
		return '' +
			'<div class="swiper-slide">' +
				'<a class="seen_link" href="' + ATH.detailHref(p.id) + '">' +
					'<div class="img"><img src="' + ATH.img(p.img) + '" alt="" /></div>' +
					'<div class="context">' +
						'<p class="category">' + Mock.esc(ATH.label(p)) + '</p>' +
						'<p class="tit">' + Mock.esc(p.title) + '</p>' +
						'<span class="h_info">' + STAR + ATH.ratingText(p) + '</span>' +
						'<p class="price_area">' + ATH.priceInner(p, { amountSpan: true }) + '</p>' +
					'</div>' +
				'</a>' +
			'</div>';
	};

	/* ---------- 최근 본 상품 ---------- */
	ATH.recent = {
		key: 'athome.recent',
		ids: function () { var v = MockDB.getItem(this.key, []); return Array.isArray(v) ? v : []; },
		push: function (id) {
			var ids = this.ids().filter(function (x) { return String(x) !== String(id); });
			ids.unshift(Number(id));
			MockDB.setItem(this.key, ids.slice(0, 10));
		},
		products: function () {
			return this.ids().map(function (id) { return MockDB.find('athome.products', id); }).filter(Boolean);
		}
	};

	/* ---------- 장바구니 · 예약 초안 ---------- */
	ATH.cart = {
		count: function () { return MockDB.count('athome.cart'); },
		add: function (item) { item.addedAt = Mock.now(); return MockDB.insert('athome.cart', item); }
	};
	/** 상세 '예약하기' 또는 장바구니에서 고른 상품을 예약 화면으로 넘기는 값 */
	ATH.checkout = {
		key: 'athome.checkout',
		set: function (draft) { MockDB.setItem(this.key, draft); },
		get: function () { return MockDB.getItem(this.key, null); },
		clear: function () { MockDB.removeItem(this.key); }
	};
	ATH.updateCartBadge = function () {
		var n = ATH.cart.count();
		$('.demo_cart_cnt').text(n ? n : '').toggle(n > 0);
	};

	/* ---------- 예약 상태 ---------- */
	/** 화면에 보여 줄 상태 — 예약확정인데 이용일이 지났으면 '이용완료' */
	ATH.orderStatus = function (o) {
		if (o.status === '예약확정') {
			var last = (o.items || []).reduce(function (m, it) { var d = it.endDate || it.date; return d > m ? d : m; }, '');
			if (last && last < ATH.today()) return '이용완료';
		}
		return o.status;
	};
	ATH.statusClass = function (s) {
		return { '예약대기': 'wait', '예약확정': 'ok', '이용완료': 'done', '취소요청': 'cancel_req', '취소완료': 'cancel' }[s] || 'wait';
	};
	ATH.statusBadge = function (s) { return '<span class="demo_status ' + ATH.statusClass(s) + '">' + Mock.esc(s) + '</span>'; };
	ATH.canCancel = function (o) {
		var s = ATH.orderStatus(o);
		return s === '예약대기' || s === '예약확정';
	};

	/* ---------- 화면 도우미 ---------- */
	ATH.loadingHtml = function (text) {
		return '<div class="demo_loading" role="status"><span class="demo_spinner" aria-hidden="true"></span>' + Mock.esc(text || '불러오는 중이에요') + '</div>';
	};
	ATH.emptyHtml = function (title, desc, btn) {
		return '<div class="demo_empty"><i class="xi-info-o" aria-hidden="true"></i><p class="tit">' + Mock.esc(title) + '</p>' +
			(desc ? '<p class="desc">' + Mock.esc(desc) + '</p>' : '') + (btn || '') + '</div>';
	};

	// 좋아요(하트) — 메인은 원래 인라인 스크립트가 처리하고, 나머지 화면은 여기서 같은 모양으로 처리
	ATH.bindLike = function (scope) {
		$(scope || document).on('click', '.like_mark', function () {
			var on = !$(this).hasClass('color_on');
			$(this).toggleClass('color_on', on).html(on ? "<i class='xi-heart' style='color:#ff6f61;'></i>" : "<i class='xi-heart-o'></i>");
		});
	};

	$(function () { ATH.updateCartBadge(); });
	MockDB.on('athome.cart', function () { ATH.updateCartBadge(); });
})(window, jQuery);

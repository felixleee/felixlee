/*
 * AthomeTrip 데모 — 상품 상세 (good/tour_detail.html?id=)
 * 이미지 · 별점/후기 · 설명 · 포함/불포함 · 이용 방법 · 옵션(성인/아동 등) + 날짜 + 수량 → 총액
 * 예약하기 → 예약 초안(MockDB.setItem 'athome.checkout') → reserve.html
 * 장바구니 → athome.cart 컬렉션
 * 상세를 열면 '최근 본 상품'(MockDB.setItem 'athome.recent') 에 기록
 * 주소로 넘어온 date / checkin·checkout / adult·child·room 은 예약 칸에 미리 채운다.
 * 의존: jQuery, moment, lightpick, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	var p = null, picker = null, qty = {};

	function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '☆'; return s; }

	/* ---------- 렌더링 ---------- */
	function render(prod, reviews) {
		p = prod;
		var hotel = ATH.isHotel(p);
		var imgs = [p.img].concat(p.imgs || []).filter(function (v, i, a) { return v && a.indexOf(v) === i; });
		var city = ATH.city(p.city);

		document.title = p.title + ' - AthomeTrip | LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$('#detailLoc').html(
			'<a href="' + ATH.href('list', { city: city ? p.city : '' }) + '">' + Mock.esc(ATH.cityName(p.city)) + '</a><i class="xi-angle-right-min"></i>' +
			'<a href="' + ATH.href('list', { city: city ? p.city : '', cate: p.cate }) + '">' + Mock.esc(ATH.cateName(p.cate)) + '</a>');

		var info = [
			['xi-time-o', hotel ? '체크인·아웃' : '소요 시간', p.duration],
			['xi-maker', hotel ? '위치' : '만나는 곳', p.meet],
			['xi-translate', '안내 언어', p.lang && p.lang !== '-' ? p.lang : '해당 없음'],
			['xi-check-circle-o', '확정 방식', p.instant ? '결제 즉시 확정' : '현지 확인 후 확정 (24시간 이내)']
		];
		var avg = reviews.length ? reviews.reduce(function (s, r) { return s + r.rating; }, 0) / reviews.length : p.rating;

		var main = '' +
			'<div class="demo_gallery">' +
				'<div class="demo_gallery_main"><span class="like_mark"><i class="xi-heart-o"></i></span><img id="galMain" src="' + ATH.img(imgs[0]) + '" alt="' + Mock.esc(p.title) + '" /></div>' +
				(imgs.length > 1 ? '<ul class="demo_gallery_thumbs">' + imgs.map(function (im, i) {
					return '<li><button type="button" class="' + (i === 0 ? 'on' : '') + '" data-src="' + ATH.img(im) + '" aria-label="사진 ' + (i + 1) + '"><img src="' + ATH.img(im) + '" alt="" /></button></li>';
				}).join('') + '</ul>' : '') +
			'</div>' +
			'<div class="demo_detail_head">' +
				'<p class="category">' + Mock.esc(ATH.label(p)) + '</p>' +
				'<h2 class="demo_detail_tit">' + Mock.esc(p.title) + '</h2>' +
				'<p class="demo_detail_sub">' + Mock.esc(p.sub) + '</p>' +
				'<div class="demo_detail_meta">' +
					'<span class="h_star"><img src="' + ATH.base + 'image/hotel_level/star05.svg" alt="별점 ' + p.rating + '"></span>' +
					'<strong>' + p.rating.toFixed(1) + '</strong><a href="#dReview">후기 ' + ATH.num(p.reviews) + '개</a>' +
					(p.instant ? '<span class="demo_badge instant"><i class="xi-lightning"></i>즉시사용</span>' : '<span class="demo_badge">확정 대기 상품</span>') +
				'</div>' +
			'</div>' +
			'<ul class="demo_info_icons">' + info.map(function (x) {
				return '<li><i class="' + x[0] + '" aria-hidden="true"></i><div><strong>' + x[1] + '</strong>' + Mock.esc(x[2]) + '</div></li>';
			}).join('') + '</ul>' +
			'<ul class="demo_tabs_anchor">' +
				'<li><a href="#dDesc" class="on">상품 설명</a></li><li><a href="#dInc">포함/불포함</a></li><li><a href="#dHow">이용 방법</a></li><li><a href="#dReview">후기</a></li>' +
			'</ul>' +
			'<section class="demo_sec" id="dDesc"><h3>상품 설명</h3>' +
				'<p class="lead">' + Mock.esc(p.sub) + '. ' + Mock.esc(ATH.cityName(p.city)) + ' 여행에서 많이 찾는 ' + Mock.esc(ATH.cateName(p.cate)) + ' 상품으로, 앳홈트립 현지 직영 팀이 예약부터 이용까지 한국어로 안내해 드려요.</p>' +
				'<ul class="demo_points">' + (p.points || []).map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul>' +
			'</section>' +
			'<section class="demo_sec" id="dInc"><h3>포함 / 불포함</h3><div class="demo_inc">' +
				'<div><h4>포함 사항</h4><ul class="inc">' + (p.includes || []).map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul></div>' +
				'<div><h4>불포함 사항</h4><ul class="exc">' + (p.excludes || []).map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul></div>' +
			'</div></section>' +
			'<section class="demo_sec" id="dHow"><h3>이용 방법</h3>' +
				'<ol class="demo_steps">' + (p.howto || []).map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ol>' +
				'<h4>취소·환불 규정</h4><ul class="demo_notice">' + (p.notice || []).map(function (t) { return '<li>' + Mock.esc(t) + '</li>'; }).join('') + '</ul>' +
			'</section>' +
			'<section class="demo_sec" id="dReview"><h3>여행자 후기</h3>' +
				'<div class="demo_review_sum"><span class="score">' + p.rating.toFixed(1) + '</span><div><span class="h_star"><img src="' + ATH.base + 'image/hotel_level/star05.svg" alt=""></span><p>후기 ' + ATH.num(p.reviews) + '개 · 최근 후기 평균 ' + avg.toFixed(1) + '점</p></div></div>' +
				(reviews.length ? '<ul class="demo_reviews">' + reviews.map(function (r) {
					return '<li><div class="who"><strong>' + Mock.esc(r.name) + '</strong><span class="stars" aria-label="' + r.rating + '점">' + stars(r.rating) + '</span><span>' + Mock.date(r.createdAt, 'YYYY.MM.DD') + '</span></div><p>' + Mock.esc(r.text) + '</p></li>';
				}).join('') + '</ul>' : '<p class="demo_help">아직 후기가 없어요.</p>') +
				'<p style="margin-top:14px"><button type="button" class="demo_btn line sm" onclick="Mock.notInDemo(\'후기 전체 보기\')">후기 ' + ATH.num(p.reviews) + '개 모두 보기</button></p>' +
			'</section>';

		var book = p.price == null ? renderInquiry() : renderBook();
		$('#detailRoot').html('<div class="demo_detail"><div class="demo_detail_main">' + main + '</div>' + book + '</div>');

		if (p.price != null) {
			$('body').append('<div class="demo_mobile_bar"><p class="p">' + ATH.cateName(p.cate) + '<strong>' + ATH.won(p.price) + ' <small>/ ' + Mock.esc(p.unit) + '~</small></strong></p><button type="button" class="demo_btn primary" id="btnMobileBook">예약하기</button></div>');
		}
		initBook();
		renderRelated();
	}

	function renderInquiry() {
		return '<aside class="demo_book" id="bookBox">' +
			'<div class="demo_inquiry"><strong>요금문의 상품</strong>날짜·인원에 따라 요금이 달라져서 상담 후 예약할 수 있어요. 카카오톡이나 1:1 문의로 원하는 일정을 남겨 주세요.</div>' +
			'<button type="button" class="demo_btn primary big" onclick="Mock.notInDemo(\'1:1 요금 문의\')"><i class="xi-kakaotalk"></i> 1:1 요금 문의</button>' +
		'</aside>';
	}

	function renderBook() {
		var hotel = ATH.isHotel(p);
		var rate = p.orig ? Math.round((1 - p.price / p.orig) * 100) : 0;
		return '<aside class="demo_book" id="bookBox">' +
			'<div class="demo_book_price">' + (p.orig ? '<span class="rate">' + rate + '%</span><span class="original">' + ATH.num(p.orig) + '원</span><br>' : '') +
				'<strong>' + ATH.won(p.price) + '</strong> / ' + Mock.esc(p.unit) + (p.options.length > 1 ? ' ~' : '') + '</div>' +
			'<form id="bookForm" novalidate>' +
				'<div class="demo_field"><label for="bookDate">' + (hotel ? '체크인 ~ 체크아웃' : '이용일') + '<em>*</em></label>' +
					'<input type="text" id="bookDate" readonly placeholder="' + (hotel ? '체크인 · 체크아웃 날짜 선택' : '날짜를 선택하세요') + '" /></div>' +
				'<p class="demo_nights" id="bookNights" hidden></p>' +
				'<div class="demo_field"><span class="lbl">' + (hotel ? '객실 · 객실 수' : '옵션 · 수량') + '<em>*</em></span><ul class="demo_opts">' + p.options.map(function (o) {
					return '<li data-code="' + o.code + '"><div class="name">' + Mock.esc(o.name) + '<span class="p">' + ATH.won(o.price) + '</span></div>' +
						'<div class="demo_qty"><button type="button" class="minus" aria-label="' + Mock.esc(o.name) + ' 빼기">−</button>' +
						'<input type="text" value="0" readonly aria-label="' + Mock.esc(o.name) + ' 수량" />' +
						'<button type="button" class="plus" aria-label="' + Mock.esc(o.name) + ' 더하기">+</button></div></li>';
				}).join('') + '</ul></div>' +
				'<div class="demo_total"><span>총 결제 금액</span><strong id="bookTotal">0원</strong></div>' +
				'<p class="demo_book_err" id="bookErr" role="alert"></p>' +
				'<div class="demo_book_btns"><button type="button" class="demo_btn line" id="btnCart"><i class="xi-cart-o"></i> 장바구니</button><button type="submit" class="demo_btn primary" id="btnBook">예약하기</button></div>' +
				'<p class="demo_cart_done" id="cartDone">장바구니에 담았어요. <a href="' + ATH.href('cart') + '">장바구니 보기 ›</a></p>' +
			'</form>' +
		'</aside>';
	}

	/* ---------- 예약 박스 ---------- */
	function initBook() {
		if (p.price == null) return;
		var hotel = ATH.isHotel(p);
		p.options.forEach(function (o) { qty[o.code] = 0; });

		// 기본 수량: 통합검색 인원 > 첫 옵션 1
		var a = parseInt(Mock.qs('adult'), 10), c = parseInt(Mock.qs('child'), 10), r = parseInt(Mock.qs('room'), 10);
		if (hotel) qty[p.options[0].code] = r > 0 ? r : 1;
		else if (qty.adult != null && a > 0) { qty.adult = a; if (qty.child != null && c > 0) qty.child = c; }
		else qty[p.options[0].code] = 1;

		if (window.Lightpick) {
			var wide = $(window).width() > 768;
			picker = new Lightpick({
				field: document.getElementById('bookDate'),
				singleDate: !hotel,
				format: 'YYYY-MM-DD',
				separator: ' ~ ',
				minDate: moment().add(1, 'days'),
				maxDate: moment().add(1, 'year'),
				minDays: hotel ? 2 : null,
				maxDays: hotel ? 15 : null,
				numberOfMonths: hotel && wide ? 2 : 1,
				numberOfColumns: hotel && wide ? 2 : 1,
				firstDay: 7,
				selectForward: true,
				tooltipNights: hotel,
				hoveringTooltip: hotel,
				autoclose: true,
				onSelect: function () { clearErr(); update(); }
			});
			var d = Mock.qs('date'), ci = Mock.qs('checkin'), co = Mock.qs('checkout');
			var tomorrow = Mock.rel(1), last = Mock.rel(365);
			var ok = function (v) { return /^\d{4}-\d{2}-\d{2}$/.test(v || '') && v >= tomorrow && v <= last; };
			if (hotel && ok(ci) && ok(co) && co > ci) picker.setDateRange(ci, co);
			else if (!hotel && ok(d)) picker.setDate(d);
		}
		update();
	}

	function getDates() {
		if (!picker) return {};
		var s = picker.getStartDate(), e = picker.getEndDate();
		if (ATH.isHotel(p)) return { date: s ? s.format('YYYY-MM-DD') : '', endDate: e ? e.format('YYYY-MM-DD') : '' };
		var d = picker.getDate();
		return { date: d ? d.format('YYYY-MM-DD') : '' };
	}

	function calc() {
		var dt = getDates();
		var nights = ATH.isHotel(p) ? ATH.nights(dt.date, dt.endDate) : 0;
		var opts = p.options.map(function (o) { return { code: o.code, name: o.name, price: o.price, qty: qty[o.code] || 0 }; });
		var sum = opts.reduce(function (s, o) { return s + o.price * o.qty; }, 0) * (ATH.isHotel(p) ? Math.max(nights, 1) : 1);
		return { dt: dt, nights: nights, opts: opts, amount: sum };
	}

	function update() {
		var c = calc();
		$('#bookForm .demo_opts li').each(function () {
			var code = $(this).data('code'), n = qty[code] || 0;
			$(this).find('input').val(n);
			$(this).find('.minus').prop('disabled', n <= 0);
			$(this).find('.plus').prop('disabled', n >= 9);
		});
		$('#bookTotal').text(ATH.won(c.amount));
		if (ATH.isHotel(p)) {
			$('#bookNights').prop('hidden', !c.nights).text(c.nights ? c.nights + '박 기준 요금이에요 (객실 수 × ' + c.nights + '박)' : '');
		}
		$('.demo_mobile_bar strong').html(ATH.won(c.amount || p.price) + (c.amount ? '' : ' <small>/ ' + Mock.esc(p.unit) + '~</small>'));
	}

	function clearErr() { $('#bookErr').removeClass('show').text(''); }
	function showErr(msg) {
		$('#bookErr').text(msg).addClass('show');
		Mock.toast(msg, { type: 'error' });
		var top = $('#bookBox').offset().top - 20;
		if ($(window).scrollTop() > top || $(window).scrollTop() + $(window).height() < top + 200) $('html, body').animate({ scrollTop: top }, 200);
	}

	/** 필수값 검사 → 예약 항목 만들기 (문제 있으면 null) */
	function buildItem() {
		var c = calc();
		if (!c.dt.date) { showErr(ATH.isHotel(p) ? '체크인 날짜를 선택해 주세요' : '이용일을 선택해 주세요'); if (picker) picker.show(); return null; }
		if (ATH.isHotel(p) && !c.dt.endDate) { showErr('체크아웃 날짜를 선택해 주세요'); if (picker) picker.show(); return null; }
		if (c.dt.date < Mock.rel(1) || c.dt.date > Mock.rel(365)) { showErr('예약은 내일부터 1년 안의 날짜로만 할 수 있어요'); return null; }
		var total = c.opts.reduce(function (s, o) { return s + o.qty; }, 0);
		if (!total) { showErr('옵션 수량을 1개 이상 선택해 주세요'); return null; }
		if (qty.child > 0 && qty.adult === 0) { showErr('아동은 성인과 함께 예약해 주세요'); return null; }
		clearErr();
		var item = {
			productId: p.id, title: p.title, img: p.img, cate: p.cate, city: p.city, unit: p.unit, instant: !!p.instant,
			date: c.dt.date, opts: c.opts.filter(function (o) { return o.qty > 0; }), amount: c.amount
		};
		if (ATH.isHotel(p)) { item.endDate = c.dt.endDate; item.nights = c.nights; }
		return item;
	}

	function renderRelated() {
		var all = MockDB.all('athome.products').filter(function (x) { return x.id !== p.id; });
		var rel = all.filter(function (x) { return x.city === p.city; }).sort(function (a, b) { return b.sales - a.sales; });
		if (rel.length < 4) rel = rel.concat(all.filter(function (x) { return x.city !== p.city && x.cate === p.cate; }).sort(function (a, b) { return b.sales - a.sales; }));
		rel = rel.slice(0, 4);
		if (!rel.length) return;
		$('#detailRelated').html('<h3 class="main_h3">함께 보면 좋은 상품</h3><div class="m_best demo_grid">' +
			rel.map(function (x) { return ATH.card(x, { wrap: 'demo_item' }); }).join('') + '</div>').show();
	}

	/* ---------- 이벤트 ---------- */
	$(function () {
		var id = Mock.qs('id');
		$('#detailRoot').html(ATH.loadingHtml('상품 정보를 불러오는 중이에요'));
		ATH.bindLike(document);

		if (!id) {
			$('#detailRoot').html(ATH.emptyHtml('상품 번호가 없어요', '목록에서 상품을 골라 주세요.', '<a class="demo_btn line sm" href="' + ATH.href('list') + '">상품 목록 보기</a>'));
			return;
		}
		Promise.all([
			MockApi.get('athome.products', id),
			MockApi.list('athome.reviews', { filter: { productId: Number(id) }, sort: '-createdAt', size: 4 })
		]).then(function (res) {
			render(res[0], res[1].items);
			ATH.recent.push(res[0].id);
		}, function (err) {
			$('#detailLoc').html('<span>상품 없음</span>');
			$('#detailRoot').html(ATH.emptyHtml(err && err.status === 404 ? '상품을 찾을 수 없어요' : '상품을 불러오지 못했어요',
				'판매가 끝났거나 주소가 잘못되었을 수 있어요.', '<a class="demo_btn line sm" href="' + ATH.href('list') + '">상품 목록 보기</a>'));
		});

		$(document).on('click', '.demo_gallery_thumbs button', function () {
			$('.demo_gallery_thumbs button').removeClass('on');
			$(this).addClass('on');
			$('#galMain').attr('src', $(this).data('src'));
		});
		$(document).on('click', '.demo_tabs_anchor a', function () {
			$('.demo_tabs_anchor a').removeClass('on');
			$(this).addClass('on');
		});
		$(document).on('click', '.demo_opts .plus, .demo_opts .minus', function () {
			var code = $(this).closest('li').data('code');
			qty[code] = Math.max(0, Math.min(9, (qty[code] || 0) + ($(this).hasClass('plus') ? 1 : -1)));
			clearErr();
			update();
		});
		$(document).on('click', '#btnCart', function () {
			var item = buildItem();
			if (!item) return;
			ATH.cart.add(item);
			$('#cartDone').addClass('show');
			Mock.toast('장바구니에 담았어요', { type: 'success' });
		});
		$(document).on('submit', '#bookForm', function () {
			var item = buildItem();
			if (item) {
				ATH.checkout.set({ from: 'direct', items: [item], at: Mock.now() });
				location.href = ATH.href('reserve');
			}
			return false;
		});
		$(document).on('click', '#btnMobileBook', function () {
			$('html, body').animate({ scrollTop: $('#bookBox').offset().top - 10 }, 250);
		});
	});
})(jQuery);

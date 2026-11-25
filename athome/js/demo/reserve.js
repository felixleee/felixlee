/*
 * AthomeTrip 데모 — 예약자 정보 · 결제수단 (good/reserve.html)
 * 예약 초안(MockDB.getItem 'athome.checkout') → 필수값 검사 → 결제 흉내 → athome.orders 에 저장
 * → (장바구니에서 왔으면 담긴 상품 정리) → reserve_complete.html?no=예약번호
 * 실제 결제·카드 번호 입력은 없다 (결제수단은 고르기만).
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	var draft = null;
	var SAMPLE = { name: '김여행', engLast: 'KIM', engFirst: 'YEOHAENG', phone: '010-0000-1234', email: 'traveler@example.com', kakao: '' };
	var RULES = {
		name: { test: function (v) { return /^[가-힣a-zA-Z\s]{2,20}$/.test(v); }, msg: '이름을 2자 이상 입력해 주세요' },
		engLast: { test: function (v) { return /^[A-Za-z]{1,20}$/.test(v); }, msg: '영문 성을 입력해 주세요 (여권과 같게)' },
		engFirst: { test: function (v) { return /^[A-Za-z\s]{1,30}$/.test(v); }, msg: '영문 이름을 입력해 주세요 (여권과 같게)' },
		phone: { test: function (v) { return /^01[016789]-?\d{3,4}-?\d{4}$/.test(v); }, msg: '휴대폰 번호를 확인해 주세요 (예: 010-0000-1234)' },
		email: { test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); }, msg: '이메일 주소를 확인해 주세요' }
	};

	function itemHtml(it) {
		return '<li>' +
			'<div class="thumb"><img src="' + ATH.img(it.img) + '" alt="" /></div>' +
			'<div class="info">' +
				'<p class="category">' + Mock.esc(ATH.cateName(it.cate) + ' · ' + ATH.cityName(it.city)) + '</p>' +
				'<span class="tit">' + Mock.esc(it.title) + '</span>' +
				'<p class="meta"><i class="xi-calendar"></i>' + Mock.esc(ATH.itemDateText(it)) + '</p>' +
				'<p class="meta"><i class="xi-user-o"></i>' + Mock.esc(ATH.optText(it.opts)) + '</p>' +
			'</div>' +
			'<div class="amt">' + ATH.won(it.amount) + '</div>' +
		'</li>';
	}

	function total() { return draft.items.reduce(function (s, it) { return s + it.amount; }, 0); }

	function fill(v) {
		Object.keys(v).forEach(function (k) { $('#reserveForm [name=' + k + ']').val(v[k]); });
		$('#reserveForm .demo_field').removeClass('err');
	}

	function validate() {
		var first = null, ok = true;
		Object.keys(RULES).forEach(function (k) {
			var $in = $('#reserveForm [name=' + k + ']'), v = $.trim($in.val());
			if (k === 'engLast' || k === 'engFirst') { v = v.toUpperCase(); $in.val(v); }
			var bad = !RULES[k].test(v);
			$in.closest('.demo_field').toggleClass('err', bad).find('.demo_err_msg').text(v ? RULES[k].msg : '필수 입력 항목이에요');
			$in.attr('aria-invalid', bad ? 'true' : 'false');
			if (bad) { ok = false; first = first || $in; }
		});
		var pay = $('#reserveForm input[name=payMethod]:checked').val();
		$('#payList').toggleClass('err', !pay);
		$('#payErr').toggle(!pay);
		if (!pay) { ok = false; first = first || $('#payList input').first(); }
		var agree = $('#agree').prop('checked');
		$('#agreeErr').toggle(!agree);
		if (!agree) { ok = false; first = first || $('#agree'); }
		if (!ok) {
			Mock.toast('입력한 내용을 다시 확인해 주세요', { type: 'error' });
			$('html, body').animate({ scrollTop: first.closest('.demo_box').offset().top - 20 }, 200, function () { first.focus(); });
		}
		return ok;
	}

	function submit() {
		if (!validate()) return false;
		var f = $('#reserveForm');
		var val = function (k) { return $.trim(f.find('[name=' + k + ']').val()); };
		var allInstant = draft.items.every(function (it) {
			if (it.instant != null) return it.instant;
			var prod = MockDB.find('athome.products', it.productId); return prod && prod.instant;
		});
		var booker = { name: val('name'), engLast: val('engLast'), engFirst: val('engFirst'), phone: val('phone'), email: val('email'), kakao: val('kakao') };
		var order = {
			id: Mock.uid('AT'),
			status: allInstant ? '예약확정' : '예약대기',
			createdAt: Mock.now(),
			payMethod: f.find('input[name=payMethod]:checked').val(),
			booker: booker,
			memo: val('memo'),
			items: draft.items,
			total: total()
		};
		$('#btnPay').prop('disabled', true);
		$('#processing').addClass('show');
		MockApi.create('athome.orders', order).then(function (saved) {
			if (draft.from === 'cart' && draft.cartIds && draft.cartIds.length) MockDB.remove('athome.cart', draft.cartIds);
			MockDB.setItem('athome.booker', booker);   // 다음 예약 때 미리 채움
			ATH.checkout.clear();
			setTimeout(function () { location.replace(ATH.href('complete', { no: saved.id })); }, 500);
		}, function (err) {
			$('#processing').removeClass('show');
			$('#btnPay').prop('disabled', false);
			Mock.toast('예약을 저장하지 못했어요: ' + (err && err.message), { type: 'error' });
		});
		return false;
	}

	$(function () {
		draft = ATH.checkout.get();
		if (!draft || !draft.items || !draft.items.length) {
			$('#reserveRoot').html('<div class="demo_box">' + ATH.emptyHtml('예약할 상품이 없어요', '상품 상세에서 날짜와 수량을 고른 뒤 [예약하기]를 눌러 주세요.',
				'<a class="demo_btn primary sm" href="' + ATH.href('list') + '">여행 상품 보러 가기</a> <a class="demo_btn line sm" href="' + ATH.href('cart') + '">장바구니</a>') + '</div>');
			return;
		}
		$('#rsvItems').html('<ul class="demo_items">' + draft.items.map(itemHtml).join('') + '</ul>');
		$('#sumCount').text(draft.items.length + '개');
		$('#sumAmount, #sumTotal').text(ATH.won(total()));
		$('#btnPay').text(ATH.won(total()) + ' 결제하기');
		if (draft.from === 'cart') $('#rsvFrom').html('<a href="' + ATH.href('cart') + '">‹ 장바구니로 돌아가기</a>');
		else if (draft.items[0]) $('#rsvFrom').html('<a href="' + ATH.detailHref(draft.items[0].productId) + '">‹ 상품 상세로 돌아가기</a>');

		var saved = MockDB.getItem('athome.booker', null);
		if (saved) fill(saved);

		$('#fillSample').on('click', function () { fill(SAMPLE); Mock.toast('가상 예약자 정보를 채웠어요'); });
		$('#reserveForm').on('submit', submit);
		$('#reserveForm').on('input change', 'input, select, textarea', function () {
			var $fd = $(this).closest('.demo_field');
			if ($fd.hasClass('err') && RULES[this.name] && RULES[this.name].test($.trim(this.value))) $fd.removeClass('err');
			if (this.name === 'payMethod') { $('#payList').removeClass('err'); $('#payErr').hide(); }
			if (this.id === 'agree' && this.checked) $('#agreeErr').hide();
		});
	});
})(jQuery);

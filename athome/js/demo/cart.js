/*
 * AthomeTrip 데모 — 장바구니 (good/cart.html)
 * athome.cart 목록 · 선택/삭제 · 선택 상품 예약하기 → 예약 초안(athome.checkout) → reserve.html
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	var rows = [];

	function selected() {
		var ids = $('#cartRoot .demo_items input.row_chk:checked').map(function () { return String(this.value); }).get();
		return rows.filter(function (r) { return ids.indexOf(String(r.id)) >= 0; });
	}

	function renderSum() {
		var sel = selected();
		var total = sel.reduce(function (s, r) { return s + r.amount; }, 0);
		$('#sumCount').text(sel.length + '개');
		$('#sumAmount').text(ATH.won(total));
		$('#sumTotal').text(ATH.won(total));
		$('#btnCheckout').prop('disabled', !sel.length).text(sel.length ? '선택 상품 ' + sel.length + '개 예약하기' : '예약할 상품을 선택하세요');
		$('#chkAll').prop('checked', sel.length && sel.length === rows.length);
	}

	function render() {
		if (!rows.length) {
			$('#cartRoot').html('<div class="demo_box">' + ATH.emptyHtml('장바구니가 비어 있어요', '마음에 드는 여행 상품을 담아 보세요.',
				'<a class="demo_btn primary sm" href="' + ATH.href('list') + '">여행 상품 보러 가기</a>') + '</div>');
			return;
		}
		var list = rows.map(function (r) {
			return '<li>' +
				'<div class="chk"><input type="checkbox" class="row_chk" value="' + r.id + '" checked aria-label="' + Mock.esc(r.title) + ' 선택" /></div>' +
				'<a class="thumb" href="' + ATH.detailHref(r.productId) + '"><img src="' + ATH.img(r.img) + '" alt="" /></a>' +
				'<div class="info">' +
					'<p class="category">' + Mock.esc(ATH.cateName(r.cate) + ' · ' + ATH.cityName(r.city)) + '</p>' +
					'<a class="tit" href="' + ATH.detailHref(r.productId) + '">' + Mock.esc(r.title) + '</a>' +
					'<p class="meta"><i class="xi-calendar"></i>' + Mock.esc(ATH.itemDateText(r)) + '</p>' +
					'<p class="meta"><i class="xi-user-o"></i>' + Mock.esc(ATH.optText(r.opts)) + '</p>' +
				'</div>' +
				'<div class="amt">' + ATH.won(r.amount) + '<button type="button" class="demo_btn line sm del" data-id="' + r.id + '">삭제</button></div>' +
			'</li>';
		}).join('');
		$('#cartRoot').html(
			'<div class="demo_cols">' +
				'<div class="demo_col_main"><div class="demo_box">' +
					'<div class="demo_cart_head"><label class="demo_check"><input type="checkbox" id="chkAll" checked /> 전체 선택</label>' +
					'<button type="button" class="demo_btn line sm" id="btnDelSel">선택 삭제</button></div>' +
					'<ul class="demo_items has_chk">' + list + '</ul>' +
				'</div></div>' +
				'<aside class="demo_col_side"><div class="demo_box demo_sum">' +
					'<h3 style="font-size:17px;font-weight:600;margin-bottom:12px;color:#343a40">결제 예정 금액</h3>' +
					'<dl><div><dt>선택 상품</dt><dd id="sumCount">0개</dd></div><div><dt>상품 금액</dt><dd id="sumAmount">0원</dd></div><div><dt>할인 금액</dt><dd>0원</dd></div>' +
					'<div class="total"><dt>총 결제 금액</dt><dd id="sumTotal">0원</dd></div></dl>' +
					'<button type="button" class="demo_btn primary big" id="btnCheckout">예약하기</button>' +
					'<p class="demo_help">이용일이 지난 상품은 예약할 수 없어요. 날짜를 바꾸려면 상품을 다시 담아 주세요.</p>' +
				'</div></aside>' +
			'</div>');
		renderSum();
	}

	function load() {
		$('#cartRoot').html(ATH.loadingHtml('장바구니를 불러오는 중이에요'));
		MockApi.list('athome.cart', { sort: '-addedAt' }).then(function (res) {
			rows = res.items;
			render();
		});
	}

	function remove(ids) {
		if (!ids.length) { Mock.toast('삭제할 상품을 선택하세요', { type: 'error' }); return; }
		if (!window.confirm('선택한 상품 ' + ids.length + '개를 장바구니에서 뺄까요?')) return;
		MockApi.remove('athome.cart', ids).then(function () {
			Mock.toast('장바구니에서 뺐어요');
			rows = rows.filter(function (r) { return ids.map(String).indexOf(String(r.id)) < 0; });
			render();
		});
	}

	$(function () {
		load();
		$('#cartRoot')
			.on('change', '#chkAll', function () { $('#cartRoot input.row_chk').prop('checked', this.checked); renderSum(); })
			.on('change', 'input.row_chk', renderSum)
			.on('click', '.del', function () { remove([$(this).data('id')]); })
			.on('click', '#btnDelSel', function () { remove(selected().map(function (r) { return r.id; })); })
			.on('click', '#btnCheckout', function () {
				var sel = selected();
				if (!sel.length) return;
				var past = sel.filter(function (r) { return r.date <= ATH.today(); });
				if (past.length) { Mock.toast('이용일이 지난 상품이 있어요: ' + past[0].title, { type: 'error' }); return; }
				ATH.checkout.set({
					from: 'cart',
					cartIds: sel.map(function (r) { return r.id; }),
					items: sel.map(function (r) { var it = $.extend({}, r); delete it.id; delete it.addedAt; return it; }),
					at: Mock.now()
				});
				location.href = ATH.href('reserve');
			});
	});
})(jQuery);

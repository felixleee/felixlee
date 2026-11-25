/*
 * AthomeTrip 데모 — 예약 완료 (good/reserve_complete.html?no=예약번호)
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	$(function () {
		var no = Mock.qs('no');
		$('#doneRoot').html(ATH.loadingHtml('예약 내용을 확인하는 중이에요'));
		MockApi.get('athome.orders', no || '-').then(function (o) {
			var s = ATH.orderStatus(o), wait = s === '예약대기';
			$('#doneRoot').html(
				'<div class="demo_done_head">' +
					'<i class="' + (wait ? 'xi-time-o' : 'xi-check') + '" aria-hidden="true"></i>' +
					'<h2>' + (wait ? '예약 신청이 접수되었어요' : '예약이 완료되었어요') + '</h2>' +
					'<p>' + (wait ? '현지 확인 후 24시간 안에 예약 확정 메일을 보내 드려요.' : '바우처를 ' + Mock.esc(o.booker.email) + ' 로 보내 드렸어요.') + '<br>예약 내용은 [예약내역]에서 언제든 확인할 수 있어요.</p>' +
					'<div class="demo_done_no">예약번호<strong>' + Mock.esc(o.id) + '</strong></div>' +
				'</div>' +
				'<div class="demo_box"><h3>예약 상품</h3><ul class="demo_items">' + o.items.map(function (it) {
					return '<li><div class="thumb"><img src="' + ATH.img(it.img) + '" alt="" /></div><div class="info">' +
						'<p class="category">' + Mock.esc(ATH.cateName(it.cate) + ' · ' + ATH.cityName(it.city)) + '</p>' +
						'<a class="tit" href="' + ATH.detailHref(it.productId) + '">' + Mock.esc(it.title) + '</a>' +
						'<p class="meta"><i class="xi-calendar"></i>' + Mock.esc(ATH.itemDateText(it)) + '</p>' +
						'<p class="meta"><i class="xi-user-o"></i>' + Mock.esc(ATH.optText(it.opts)) + '</p></div>' +
						'<div class="amt">' + ATH.won(it.amount) + '</div></li>';
				}).join('') + '</ul></div>' +
				'<div class="demo_box"><h3>결제 · 예약자 정보</h3><dl class="demo_kv">' +
					'<div><dt>예약 상태</dt><dd>' + ATH.statusBadge(s) + '</dd></div>' +
					'<div><dt>결제 금액</dt><dd><strong style="color:#ff502a;font-size:17px">' + ATH.won(o.total) + '</strong></dd></div>' +
					'<div><dt>결제 수단</dt><dd>' + Mock.esc(o.payMethod) + ' (데모 — 실제 결제 없음)</dd></div>' +
					'<div><dt>예약 일시</dt><dd>' + Mock.date(o.createdAt, 'YYYY.MM.DD (ddd) HH:mm') + '</dd></div>' +
					'<div><dt>예약자</dt><dd>' + Mock.esc(o.booker.name) + ' (' + Mock.esc(o.booker.engLast + ' ' + o.booker.engFirst) + ')</dd></div>' +
					'<div><dt>연락처</dt><dd>' + Mock.esc(o.booker.phone) + ' · ' + Mock.esc(o.booker.email) + '</dd></div>' +
				'</dl></div>' +
				'<div class="demo_btns_center">' +
					'<a class="demo_btn primary" href="' + ATH.href('myview', { no: o.id }) + '">예약내역 보기</a>' +
					'<a class="demo_btn line" href="' + ATH.href('main') + '">계속 둘러보기</a>' +
				'</div>');
		}, function () {
			$('#doneRoot').html('<div class="demo_box">' + ATH.emptyHtml('예약 정보를 찾을 수 없어요', '예약번호를 확인하거나 예약내역에서 찾아 주세요.',
				'<a class="demo_btn primary sm" href="' + ATH.href('mylist') + '">예약내역 보기</a>') + '</div>');
		});
	});
})(jQuery);

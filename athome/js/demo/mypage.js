/*
 * AthomeTrip 데모 — 예약내역 (mypage/reserve_list.html · mypage/reserve_view.html?no=)
 * 로그인이 없는 데모라 '이 브라우저에서 한 예약' 전체를 내 예약으로 보여 준다.
 * 상세에서 [취소 요청] → 사유 선택 → status '취소요청' 으로 저장
 * 의존: jQuery, mock-api.js, data/*.js, js/demo/common.js
 */
(function ($) {
	'use strict';

	/* ========== 목록 ========== */
	var TABS = [
		{ id: '', name: '전체' },
		{ id: '예약대기', name: '예약대기' },
		{ id: '예약확정', name: '예약확정' },
		{ id: '이용완료', name: '이용완료' },
		{ id: 'cancel', name: '취소' }
	];
	var SIZE = 5;
	var st = { tab: Mock.qs('tab') || '', page: 1 };

	function inTab(o, tab) {
		var s = ATH.orderStatus(o);
		if (!tab) return true;
		if (tab === 'cancel') return s === '취소요청' || s === '취소완료';
		return s === tab;
	}

	function orderRow(o) {
		var first = o.items[0], s = ATH.orderStatus(o);
		var more = o.items.length > 1 ? ' 외 ' + (o.items.length - 1) + '건' : '';
		return '<li>' +
			'<div class="o_head"><span>예약번호 <strong>' + Mock.esc(o.id) + '</strong></span><span>' + Mock.date(o.createdAt, 'YYYY.MM.DD') + ' 예약</span>' + ATH.statusBadge(s) + '</div>' +
			'<a class="o_body" href="' + ATH.href('myview', { no: o.id }) + '">' +
				'<div class="thumb"><img src="' + ATH.img(first.img) + '" alt="" /></div>' +
				'<div class="info"><p class="tit">' + Mock.esc(first.title) + Mock.esc(more) + '</p>' +
					'<p class="meta"><i class="xi-calendar"></i> 이용일 ' + Mock.esc(ATH.itemDateText(first)) + '</p></div>' +
				'<div class="amt">' + ATH.won(o.total) + '</div><i class="xi-angle-right go" aria-hidden="true"></i>' +
			'</a>' +
		'</li>';
	}

	function loadList() {
		var all = MockDB.all('athome.orders');
		$('#myTabs').html(TABS.map(function (t) {
			var n = all.filter(function (o) { return inTab(o, t.id); }).length;
			return '<li><button type="button" data-tab="' + t.id + '" class="' + (st.tab === t.id ? 'on' : '') + '">' + t.name + '<span class="n">' + n + '</span></button></li>';
		}).join(''));
		$('#myList').html(ATH.loadingHtml('예약내역을 불러오는 중이에요'));
		MockApi.list('athome.orders', { filter: function (o) { return inTab(o, st.tab); }, sort: '-createdAt', page: st.page, size: SIZE }).then(function (res) {
			if (!res.total) {
				$('#myList').html('<div class="demo_box">' + ATH.emptyHtml(st.tab ? '해당하는 예약이 없어요' : '아직 예약한 상품이 없어요', '마음에 드는 여행 상품을 찾아 예약해 보세요.',
					'<a class="demo_btn primary sm" href="' + ATH.href('list') + '">여행 상품 보러 가기</a>') + '</div>');
				$('#myPaging').empty();
				return;
			}
			$('#myList').html('<ul class="demo_orders">' + res.items.map(orderRow).join('') + '</ul>');
			if (res.pages > 1) {
				var r = Mock.pageRange(res.page, res.pages, 5);
				$('#myPaging').html('<ul>' + r.list.map(function (n) {
					return '<li class="' + (n === res.page ? 'on' : '') + '"><button type="button" class="pg_btn" data-page="' + n + '">' + n + '</button></li>';
				}).join('') + '</ul>');
			} else $('#myPaging').empty();
		});
	}

	/* ========== 상세 ========== */
	var order = null;

	function renderView() {
		var o = order, s = ATH.orderStatus(o);
		var cancelInfo = '';
		if (s === '취소요청') cancelInfo = '<div class="demo_cancel_info"><strong>취소 요청을 접수했어요.</strong> 현지 확인 후 1~2일 안에 취소·환불 결과를 알려 드려요.<br>사유: ' + Mock.esc(o.cancelReason) + ' · 요청 ' + Mock.date(o.cancelRequestedAt, 'YYYY.MM.DD HH:mm') + '</div>';
		if (s === '취소완료') cancelInfo = '<div class="demo_cancel_info done">취소가 완료된 예약이에요. 결제 수단으로 ' + ATH.won(o.total) + ' 환불이 진행되었어요.<br>사유: ' + Mock.esc(o.cancelReason || '-') + '</div>';

		document.title = '예약 ' + o.id + ' - AthomeTrip | LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$('#viewRoot').html(
			'<div class="demo_view_head"><h2 class="demo_tit">예약 상세</h2>' + ATH.statusBadge(s) + '</div>' +
			cancelInfo +
			'<div class="demo_box"><h3>예약 정보</h3><dl class="demo_kv">' +
				'<div><dt>예약번호</dt><dd><strong>' + Mock.esc(o.id) + '</strong></dd></div>' +
				'<div><dt>예약 일시</dt><dd>' + Mock.date(o.createdAt, 'YYYY.MM.DD (ddd) HH:mm') + '</dd></div>' +
				'<div><dt>예약 상태</dt><dd>' + Mock.esc(s) + (s === '예약대기' ? ' — 현지 확인 후 확정 메일을 보내 드려요' : '') + '</dd></div>' +
			'</dl></div>' +
			'<div class="demo_box"><h3>예약 상품</h3><ul class="demo_items">' + o.items.map(function (it) {
				return '<li><a class="thumb" href="' + ATH.detailHref(it.productId) + '"><img src="' + ATH.img(it.img) + '" alt="" /></a><div class="info">' +
					'<p class="category">' + Mock.esc(ATH.cateName(it.cate) + ' · ' + ATH.cityName(it.city)) + '</p>' +
					'<a class="tit" href="' + ATH.detailHref(it.productId) + '">' + Mock.esc(it.title) + '</a>' +
					'<p class="meta"><i class="xi-calendar"></i>' + Mock.esc(ATH.itemDateText(it)) + '</p>' +
					'<p class="meta"><i class="xi-user-o"></i>' + Mock.esc(ATH.optText(it.opts)) + '</p></div>' +
					'<div class="amt">' + ATH.won(it.amount) + '</div></li>';
			}).join('') + '</ul></div>' +
			'<div class="demo_box"><h3>예약자 정보</h3><dl class="demo_kv">' +
				'<div><dt>이름</dt><dd>' + Mock.esc(o.booker.name) + ' (' + Mock.esc(o.booker.engLast + ' ' + o.booker.engFirst) + ')</dd></div>' +
				'<div><dt>휴대폰</dt><dd>' + Mock.esc(o.booker.phone) + '</dd></div>' +
				'<div><dt>이메일</dt><dd>' + Mock.esc(o.booker.email) + '</dd></div>' +
				(o.booker.kakao ? '<div><dt>카카오톡 ID</dt><dd>' + Mock.esc(o.booker.kakao) + '</dd></div>' : '') +
				'<div><dt>요청사항</dt><dd>' + (o.memo ? Mock.esc(o.memo) : '<span style="color:#a8aeb3">없음</span>') + '</dd></div>' +
			'</dl></div>' +
			'<div class="demo_box"><h3>결제 정보</h3><dl class="demo_kv">' +
				'<div><dt>결제 수단</dt><dd>' + Mock.esc(o.payMethod) + '</dd></div>' +
				'<div><dt>상품 금액</dt><dd>' + ATH.won(o.total) + '</dd></div>' +
				'<div><dt>총 결제 금액</dt><dd><strong style="color:#ff502a;font-size:17px">' + ATH.won(o.total) + '</strong></dd></div>' +
			'</dl></div>' +
			(ATH.canCancel(o) ?
				'<div class="demo_box"><h3>예약 취소</h3><p class="demo_help" style="margin-top:0">취소 수수료는 상품별 취소·환불 규정에 따라 달라요. 요청하면 담당자가 확인 후 처리해 드려요.</p>' +
				'<button type="button" class="demo_btn line sm" id="btnCancelOpen" style="margin-top:12px">취소 요청하기</button>' +
				'<form class="demo_cancel_box" id="cancelBox" novalidate>' +
					'<div class="demo_field"><label for="cancelReason">취소 사유<em>*</em></label><select id="cancelReason" name="reason">' +
						'<option value="">사유를 선택하세요</option><option>여행 일정이 바뀌었어요</option><option>다른 상품으로 다시 예약할게요</option><option>항공편이 취소·변경되었어요</option><option>기타</option></select>' +
						'<p class="demo_err_msg">취소 사유를 선택해 주세요</p></div>' +
					'<div class="demo_field" id="cancelEtcWrap" style="display:none"><label for="cancelEtc">자세한 사유<em>*</em></label><textarea id="cancelEtc" maxlength="200" placeholder="사유를 적어 주세요"></textarea><p class="demo_err_msg">자세한 사유를 적어 주세요</p></div>' +
					'<div style="display:flex;gap:8px"><button type="submit" class="demo_btn primary sm">취소 요청 보내기</button><button type="button" class="demo_btn line sm" id="btnCancelClose">닫기</button></div>' +
				'</form></div>' : '') +
			'<div class="demo_btns_center">' +
				'<a class="demo_btn line" href="' + ATH.href('mylist') + '">목록으로</a>' +
				(s === '예약확정' ? '<button type="button" class="demo_btn primary" onclick="Mock.notInDemo(\'바우처 보기\')">바우처 보기</button>' : '') +
			'</div>');
	}

	function loadView() {
		var no = Mock.qs('no');
		$('#viewRoot').html(ATH.loadingHtml('예약 정보를 불러오는 중이에요'));
		MockApi.get('athome.orders', no || '-').then(function (o) { order = o; renderView(); }, function () {
			$('#viewRoot').html('<div class="demo_box">' + ATH.emptyHtml('예약을 찾을 수 없어요', '예약번호를 확인해 주세요.', '<a class="demo_btn line sm" href="' + ATH.href('mylist') + '">예약내역 목록</a>') + '</div>');
		});
	}

	$(function () {
		if ($('#myList').length) {
			loadList();
			$('#myTabs').on('click', 'button', function () { st.tab = $(this).data('tab') || ''; st.page = 1; loadList(); });
			$('#myPaging').on('click', 'button', function () { st.page = parseInt($(this).data('page'), 10) || 1; loadList(); });
		}
		if ($('#viewRoot').length) {
			loadView();
			$('#viewRoot')
				.on('click', '#btnCancelOpen', function () { $('#cancelBox').addClass('show'); $(this).hide(); $('#cancelReason').focus(); })
				.on('click', '#btnCancelClose', function () { $('#cancelBox').removeClass('show'); $('#btnCancelOpen').show(); })
				.on('change', '#cancelReason', function () {
					$('#cancelEtcWrap').toggle(this.value === '기타');
					if (this.value) $(this).closest('.demo_field').removeClass('err');
				})
				.on('submit', '#cancelBox', function () {
					var reason = $('#cancelReason').val(), etc = $.trim($('#cancelEtc').val());
					$('#cancelReason').closest('.demo_field').toggleClass('err', !reason);
					$('#cancelEtcWrap').toggleClass('err', reason === '기타' && !etc);
					if (!reason || (reason === '기타' && !etc)) { Mock.toast('취소 사유를 확인해 주세요', { type: 'error' }); return false; }
					if (!window.confirm('예약 ' + order.id + ' 의 취소를 요청할까요?')) return false;
					var $btn = $(this).find('button[type=submit]').prop('disabled', true).text('요청 보내는 중…');
					MockApi.update('athome.orders', order.id, {
						status: '취소요청',
						cancelReason: reason === '기타' ? '기타 — ' + etc : reason,
						cancelRequestedAt: Mock.now()
					}).then(function (o) {
						order = o;
						renderView();
						Mock.toast('취소 요청을 접수했어요', { type: 'success' });
						$('html, body').animate({ scrollTop: 0 }, 200);
					}, function (err) {
						$btn.prop('disabled', false).text('취소 요청 보내기');
						Mock.toast('요청하지 못했어요: ' + (err && err.message), { type: 'error' });
					});
					return false;
				});
		}
	});
})(jQuery);

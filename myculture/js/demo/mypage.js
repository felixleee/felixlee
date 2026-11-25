/*
 * MyCultureis 데모 — 예약 확인 · 취소 (mypage/reservation.html [?id=<예약번호>] [&tab=])
 *  - 목록: 예약번호 + 예약자명 조회 폼, 상태 탭(전체/예약확정/이용완료/예약취소), 이 브라우저의 예약 내역
 *  - 상세(?id=): 예약 · 예약자 · 결제 정보, 현재 그 시간의 잔여 인원, 예약 취소(취소하면 잔여 인원이 돌아온다)
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var $root = $('#mcMy');
	var TABS = ['전체', '예약확정', '이용완료', '예약취소'];

	function thumb(b) { var c = MC.cls(b.classId); return MC.img(c ? c.thumb : ''); }

	/* ---------- 목록 ---------- */
	function renderList() {
		var tab = TABS.indexOf(Mock.qs('tab')) >= 0 ? Mock.qs('tab') : '전체';
		document.title = '예약 확인 | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$root.html(
			'<section class="mc-box"><div class="mc-panel-title"><h3>예약번호로 조회</h3></div>' +
				'<form class="mc-lookup" id="mcLookup" novalidate>' +
					'<div class="mc-field"><label for="lkNo">예약번호</label><input type="text" id="lkNo" maxlength="20" placeholder="예: MC2611250123" autocomplete="off"></div>' +
					'<div class="mc-field"><label for="lkName">예약자명</label><input type="text" id="lkName" maxlength="20" placeholder="예약할 때 입력한 이름"></div>' +
					'<button type="submit" class="mc-btn mc-btn-primary">조회하기</button>' +
				'</form>' +
			'</section>' +
			'<div class="mc-panel-title" style="margin-top:40px"><h3>이 브라우저의 예약 내역</h3></div>' +
			'<div class="mc-chips mc-mytabs" id="mcMyTabs" role="group" aria-label="예약 상태" style="border:0;padding:0;margin:0 0 16px"></div>' +
			'<div id="mcMyList">' + MC.loading('예약 내역을 불러오는 중이에요…') + '</div>'
		);
		loadList(tab);
	}

	function loadList(tab) {
		MockApi.list(MC.C.book, { sort: '-createdAt' }).then(function (res) {
			var all = res.items, counts = { '전체': all.length };
			all.forEach(function (b) { var s = MC.bookingStatus(b); counts[s] = (counts[s] || 0) + 1; });
			$('#mcMyTabs').html(TABS.map(function (t) {
				return '<button type="button" data-tab="' + t + '" aria-pressed="' + (t === tab) + '">' + t + '<em>' + (counts[t] || 0) + '</em></button>';
			}).join(''));
			var rows = tab === '전체' ? all : all.filter(function (b) { return MC.bookingStatus(b) === tab; });
			if (!rows.length) {
				$('#mcMyList').html(MC.empty(tab === '전체' ? '아직 예약한 클래스가 없어요.' : '\'' + tab + '\' 상태인 예약이 없어요.',
					'<a class="mc-btn" href="' + esc(MC.link.list()) + '">클래스 둘러보기</a>'));
				return;
			}
			var fresh = Mock.qs('new');
			$('#mcMyList').html('<ul class="mc-mylist">' + rows.map(function (b) {
				var st = MC.bookingStatus(b);
				return '<li' + (b.id === fresh ? ' class="is-new"' : '') + ' data-id="' + esc(b.id) + '">' +
					'<div class="mc-mythumb"><img src="' + esc(thumb(b)) + '" alt=""></div>' +
					'<div class="mc-myinfo">' + MC.statusBadge(st) + '<span class="mc-myno">' + esc(b.id) + '</span>' +
						'<b>' + esc(b.title) + '</b>' +
						'<p><span>' + Mock.date(b.date, 'YYYY.MM.DD (ddd)') + ' ' + esc(b.time) + '</span> · <span>' + b.people + '명 · ' + Mock.won(b.total) + '</span></p></div>' +
					'<div class="mc-myact">' +
						'<a class="mc-btn mc-btn-sm" href="' + esc(MC.link.mypage({ id: b.id })) + '">상세보기</a>' +
						(MC.canCancel(b) ? '<button type="button" class="mc-btn mc-btn-sm mc-btn-gray" data-cancel="' + esc(b.id) + '">예약취소</button>' : '') +
					'</div>' +
				'</li>';
			}).join('') + '</ul>');
		});
	}

	/* ---------- 상세 ---------- */
	function renderView(id) {
		$root.html(MC.loading('예약 내용을 불러오는 중이에요…'));
		MockApi.get(MC.C.book, id).then(function (b) {
			var cls = MC.cls(b.classId);
			var st = MC.bookingStatus(b);
			var seat = cls ? MC.seats(cls, b.date, b.time) : null;
			document.title = '예약 ' + b.id + ' | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
			$root.html(
				'<p style="margin-bottom:14px"><a href="reservation.html" class="mc-btn mc-btn-sm mc-btn-gray">‹ 예약 목록</a></p>' +
				'<section class="mc-box">' +
					'<div class="mc-panel-title"><h3>예약번호 <span style="color:#7b318e">' + esc(b.id) + '</span></h3>' + MC.statusBadge(st) + '</div>' +
					'<div class="mc-rv-cls"><img src="' + esc(thumb(b)) + '" alt=""><div><b><a href="' + esc(MC.link.detail(b.classId)) + '">' + esc(b.title) + '</a></b>' +
						(cls ? '<p class="mc-info" style="margin-top:4px">' + esc(cls.place.name) + '</p>' : '') + '</div></div>' +
					'<dl class="mc-dl">' +
						'<div><dt>일시</dt><dd>' + Mock.date(b.date, 'YYYY.MM.DD (ddd)') + ' ' + esc(b.time) + (cls ? ' ~ ' + MC.endTime(b.time, cls.duration) : '') + '</dd></div>' +
						(cls ? '<div><dt>장소</dt><dd>' + esc(cls.place.addr) + '<br><small style="color:#999">' + esc(cls.place.way) + '</small></dd></div>' : '') +
						'<div><dt>인원</dt><dd>' + b.people + '명</dd></div>' +
						'<div><dt>결제 금액</dt><dd><b>' + Mock.won(b.total) + '</b> (1인 ' + Mock.won(b.price) + ')</dd></div>' +
						'<div><dt>예약일</dt><dd>' + Mock.date(b.createdAt, 'YYYY.MM.DD HH:mm') + '</dd></div>' +
						(b.status === '예약취소' ? '<div><dt>취소일</dt><dd>' + Mock.date(b.canceledAt, 'YYYY.MM.DD HH:mm') + (b.cancelReason ? ' (' + esc(b.cancelReason) + ')' : '') + '</dd></div>' : '') +
					'</dl>' +
					(seat && st !== '이용완료' ? '<p class="mc-seatline' + (seat.few || seat.closed ? ' is-few' : '') + '" id="mcSeatNow">현재 이 시간 남은 자리: ' + seat.left + '석 / 정원 ' + seat.capacity + '명</p>' : '') +
				'</section>' +
				'<section class="mc-box"><h3>예약자 정보</h3><dl class="mc-dl">' +
					'<div><dt>이름</dt><dd>' + esc(b.name) + '</dd></div>' +
					'<div><dt>연락처</dt><dd>' + esc(b.phone) + '</dd></div>' +
					'<div><dt>이메일</dt><dd>' + esc(b.email) + '</dd></div>' +
					'<div><dt>요청사항</dt><dd>' + (b.request ? esc(b.request) : '<span style="color:#aaa">없음</span>') + '</dd></div>' +
				'</dl></section>' +
				'<div class="mc-btns">' +
					(MC.canCancel(b) ? '<button type="button" class="mc-btn mc-btn-gray" data-cancel="' + esc(b.id) + '" id="mcCancel">예약 취소</button>' : '') +
					(st !== '예약확정' ? '<a class="mc-btn mc-btn-primary" href="' + esc(MC.link.detail(b.classId)) + '">다시 예약하기</a>' : '<a class="mc-btn" href="' + esc(MC.link.detail(b.classId)) + '">클래스 보기</a>') +
				'</div>' +
				(MC.canCancel(b) ? '<p class="mc-note" style="text-align:center">' + MC.refundText(b) + '</p>' : '')
			);
		}).catch(function (e) {
			if (!(e && e.status === 404)) console.error(e);
			$root.html(MC.empty('예약번호 ' + esc(id) + ' 에 해당하는 예약이 없어요.', '<a class="mc-btn" href="reservation.html">예약 목록으로</a>'));
		});
	}

	/* ---------- 동작 ---------- */
	$root.on('submit', '#mcLookup', function (e) {
		e.preventDefault();
		var $f = $(this);
		var ok = MC.validate($f, [
			{ el: '#lkNo', test: function (v) { return v ? '' : '예약번호를 입력해 주세요'; } },
			{ el: '#lkName', test: function (v) { return v ? '' : '예약자명을 입력해 주세요'; } }
		]);
		if (!ok) return;
		var no = $.trim($('#lkNo').val()).toUpperCase(), name = $.trim($('#lkName').val());
		var b = MockDB.find(MC.C.book, no);
		if (!b || b.name !== name) {
			MC.fieldError($('#lkNo'), '예약번호와 예약자명이 일치하는 예약이 없어요');
			Mock.toast('일치하는 예약이 없어요', { type: 'error' });
			return;
		}
		location.href = MC.link.mypage({ id: b.id });
	});

	$root.on('click', '#mcMyTabs button', function () {
		var t = $(this).data('tab');
		try { history.replaceState(null, '', Mock.url('reservation.html', { tab: t === '전체' ? '' : t })); } catch (er) { /* 무시 */ }
		$('#mcMyList').html(MC.loading());
		loadList(t);
	});

	$root.on('click', '[data-cancel]', function () {
		var id = String($(this).data('cancel')), b = MockDB.find(MC.C.book, id), $btn = $(this);
		if (!b || !MC.canCancel(b)) return;
		if (!window.confirm('[' + b.title + ']\n' + Mock.date(b.date, 'MM월 DD일 (ddd)') + ' ' + b.time + ' · ' + b.people + '명\n\n예약을 취소할까요?\n' + MC.refundText(b))) return;
		$btn.prop('disabled', true).text('취소하는 중…');
		MockApi.update(MC.C.book, id, { status: '예약취소', canceledAt: Mock.now(), cancelReason: '고객 요청' }).then(function () {
			var cls = MC.cls(b.classId), seat = cls ? MC.seats(cls, b.date, b.time) : null;
			Mock.toast('예약을 취소했어요' + (seat ? ' · 이 시간 남은 자리 ' + seat.left + '석' : ''), { type: 'success' });
			if (Mock.qs('id')) renderView(id); else loadList($('#mcMyTabs button[aria-pressed="true"]').data('tab') || '전체');
		});
	});

	$(document).on('mc:bookings', function () { if (Mock.qs('id')) renderView(Mock.qs('id')); else renderList(); });

	if (Mock.qs('id')) renderView(Mock.qs('id')); else renderList();
})(jQuery);

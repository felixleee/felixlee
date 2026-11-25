/*!
 * TourOffice 상품 상세 — good/tour_detail.html?id= (여행) · hotel/hotel_detail.html?id= (숙소)
 *  여행: 출발일 표(잔여석·출발확정·마감) → 인원 선택 → 금액 계산 → 예약하기
 *  숙소: 객실 선택 → 체크인·박수·객실 수 → 금액 계산 → 예약하기
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $root = $('#demo_detail');
	if (!$root.length) return;

	var id = Mock.qs('id');
	var today = Mock.rel(0);
	var T = null;                                  // 상품
	var S = { dep: null, month: '', adult: 2, child: 0, infant: 0, room: '', checkin: '', nights: 1, rooms: 1 };

	$root.html(D.stateHtml('loading', '상품 정보를 불러오는 중…'));
	if (!id) { notFound(); return; }
	MockApi.get('touroffice.tours', id).then(function (t) { T = t; draw(); }, notFound);

	function notFound() {
		$root.html('<div class="demo_done"><div class="demo_done_icon"><i class="xi-error-o"></i></div><h2>상품을 찾을 수 없어요</h2>' +
			'<p class="demo_muted">판매가 끝났거나 주소가 잘못되었을 수 있어요.</p>' +
			'<div class="demo_btns"><a href="../good/tour_list.html" class="demo_btn">상품 목록</a><a href="../main/pure_main.html" class="demo_btn demo_btn_line">메인으로</a></div></div>');
	}

	function upcoming() { return (T.deps || []).filter(function (d) { return d.date > today; }); }
	function seat(d) { return TourRes.seatInfo(T, d); }
	function badge(state) {
		var cls = state === '출발확정' ? 'is-confirm' : state === '마감' ? 'is-closed' : 'is-open';
		return '<span class="demo_badge ' + cls + '">' + esc(state) + '</span>';
	}
	function transText() {
		if (!T.flight) return T.trans;
		if (T.trans === '항공') return T.flight.airline + ' 항공 (' + T.flight.go + ' / ' + T.flight.back + ')';
		if (/^\d/.test(T.flight.go)) return T.trans + ' (출발 ' + T.flight.go + ' / 복귀 ' + T.flight.back + ')';
		return T.trans + (T.flight.go ? ' (' + T.flight.go + ')' : '');
	}

	/* ---------- 공통 윗부분 ---------- */
	function topHtml() {
		var trail = D.cateTrail(T);
		var loc = '<div class="demo_loc"><a href="../main/pure_main.html"><i class="xi-home"></i> 홈</a>' +
			trail.map(function (x) { return '<span>&gt;</span><a href="' + esc(x.url) + '">' + esc(x.name) + '</a>'; }).join('') + '</div>';
		var rows = [];
		if (T.kind === 'hotel') {
			rows.push(['등급', '<span class="h_star"><img src="../image/hotel_level/' + esc(T.star) + '" alt="" style="vertical-align:middle;height:15px;"></span>']);
			rows.push(['주소', esc(T.address)]);
			rows.push(['체크인/아웃', esc(T.checkin) + ' / ' + esc(T.checkout)]);
			rows.push(['객실 요금', T.rooms.map(function (r) { return esc(r.name) + ' ' + Mock.won(r.price); }).join('<br>')]);
		} else {
			rows.push(['여행기간', esc(D.period(T))]);
			rows.push(['교통', esc(transText())]);
			var d0 = upcoming()[0];
			if (d0) rows.push(['최소출발', d0.min + '명']);
			rows.push(['상품가', T.price == null ? '<span class="demo_red">요금문의</span>' :
				'성인 ' + Mock.won(T.price) + ' / 아동 ' + Mock.won(d0 ? d0.child : null) + ' / 유아 ' + Mock.won(d0 ? d0.infant : null)]);
		}
		var low = T.kind === 'hotel' ? T.rooms.reduce(function (m, r) { return Math.min(m, r.price); }, Infinity) : T.price;
		var priceHtml = low == null || low === Infinity ? '<span class="txt_price">요금문의</span>' : Mock.num(low) + '<span>원~' + (T.kind === 'hotel' ? ' / 1박' : '') + '</span>';
		return loc +
			'<div class="demo_dtop">' +
			'<div class="demo_dphoto"><img src="' + esc(D.img(T)) + '" alt="' + esc(T.title) + '"><span class="demo_dcode">상품코드 ' + esc(T.code) + '</span></div>' +
			'<div class="demo_dinfo">' +
			'<p class="demo_pcate">' + esc([T.cate1, T.cate2, T.country, T.city].filter(Boolean).join(' · ')) + '</p>' +
			'<h2 class="demo_dtitle">' + esc(T.title) + '</h2>' +
			'<p class="demo_dsum">' + esc(String(T.summary).trim()) + '</p>' +
			'<table class="demo_dtable"><tbody>' + rows.map(function (r) { return '<tr><th scope="row">' + r[0] + '</th><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table>' +
			'<div class="demo_dprice">' + priceHtml + '</div>' +
			'</div></div>';
	}

	/* ---------- 여행 ---------- */
	function drawTour() {
		var deps = upcoming();
		var want = Mock.qs('dep') || Mock.qs('departDate');
		if (want) {
			var hit = deps.filter(function (d) { return d.date >= want && seat(d).state !== '마감'; })[0];
			if (hit) S.dep = hit.date;
		}
		var months = [];
		deps.forEach(function (d) { var m = d.date.slice(0, 7); if (months.indexOf(m) < 0) months.push(m); });
		S.month = S.dep ? S.dep.slice(0, 7) : months[0] || '';

		var html = topHtml() +
			'<div class="demo_dbody"><div class="demo_dmain">' +
			'<h3 class="demo_h3" id="sec_dates">출발일 선택<small>날짜를 누르면 오른쪽에서 인원과 금액을 확인할 수 있어요</small></h3>' +
			'<div class="demo_months" id="demo_months">' + months.map(function (m) {
				return '<button type="button" data-month="' + m + '">' + Mock.date(m + '-01', 'YYYY.MM') + '</button>';
			}).join('') + '</div>' +
			'<table class="demo_table demo_deps"><caption>출발일 목록</caption><thead><tr><th scope="col">선택</th><th scope="col">출발일</th><th scope="col">도착일</th><th scope="col" class="demo_m_hide">교통</th><th scope="col">성인 요금</th><th scope="col">잔여석</th><th scope="col">상태</th></tr></thead>' +
			'<tbody id="demo_deps_body"></tbody></table>' +
			'<ul class="demo_dtabs"><li><a href="#sec_plan">일정표</a></li><li><a href="#sec_inc">포함/불포함</a></li><li><a href="#sec_notice">유의사항</a></li></ul>' +
			'<h3 class="demo_h3" id="sec_plan">일정표<small>' + esc(D.period(T)) + '</small></h3>' +
			'<div class="demo_plan">' + T.itinerary.map(function (d) {
				return '<div class="demo_day"><div class="demo_day_no"><strong>' + d.day + '일차</strong><span>' + esc(d.area) + '</span></div>' +
					'<div class="demo_day_body"><h4>' + esc(d.title) + '</h4>' +
					'<ul>' + d.spots.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
					'<p class="demo_day_meta">' + (d.meal ? '<i class="xi-restaurant"></i>' + esc(d.meal) + '<br>' : '') + (d.hotel ? '<i class="xi-hotel"></i>' + esc(d.hotel) : '') + '</p>' +
					'</div></div>';
			}).join('') + '</div>' +
			'<h3 class="demo_h3" id="sec_inc">포함/불포함</h3>' +
			'<div class="demo_inc"><div class="is-in"><h4>포함 사항</h4><ul>' + T.includes.map(function (x) { return '<li><i class="xi-check"></i>' + esc(x) + '</li>'; }).join('') + '</ul></div>' +
			'<div class="is-out"><h4>불포함 사항</h4><ul>' + T.excludes.map(function (x) { return '<li><i class="xi-close"></i>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
			'<h3 class="demo_h3" id="sec_notice">유의사항</h3><p class="demo_notice">' + esc(T.notice) + '</p>' +
			'</div>' +
			'<aside class="demo_dside"><div class="demo_book" id="demo_book">' +
			'<h4>예약하기</h4>' +
			'<dl class="demo_book_date"><dt>출발일</dt><dd id="demo_sel_date">출발일을 선택하세요</dd></dl>' +
			'<ul class="demo_pax" id="demo_pax">' +
			paxRow('adult', '성인', '만 12세 이상') + paxRow('child', '아동', '만 2~11세') + paxRow('infant', '유아', '만 2세 미만 (좌석 없음)') +
			'</ul>' +
			'<dl class="demo_total"><dt>총 금액</dt><dd><strong id="demo_total_amt">0</strong>원</dd></dl>' +
			'<p class="demo_book_msg" id="demo_book_msg" role="status"></p>' +
			'<a href="javascript:;" class="demo_btn demo_btn_red demo_btn_block" id="demo_go_reserve">예약하기</a>' +
			'<a href="' + esc(Mock.url('../site/contact.html', { tour: T.id })) + '" class="demo_btn demo_btn_line demo_btn_block" id="demo_go_ask">상담 문의</a>' +
			'</div></aside></div>';
		$root.html(html);
		drawDeps();
		updateBook();

		$root.on('click', '#demo_months button', function () { S.month = $(this).attr('data-month'); drawDeps(); });
		$root.on('click', '#demo_deps_body tr.is-selectable', function () {
			S.dep = $(this).attr('data-date');
			drawDeps(); updateBook();
		});
		$root.on('click', '#demo_pax button', function () {
			var type = $(this).closest('li').attr('data-type'), d = $(this).hasClass('plus') ? 1 : -1;
			S[type] = Math.max(type === 'adult' ? 1 : 0, Math.min(9, S[type] + d));
			updateBook();
		});
		$root.on('click', '#demo_go_reserve', goReserve);
	}
	function paxRow(type, label, hint) {
		return '<li data-type="' + type + '"><span class="lbl">' + label + '<small>' + hint + '</small></span><span class="unit" data-unit="' + type + '">-</span>' +
			'<div class="demo_cnt"><button type="button" class="minus" aria-label="' + label + ' 줄이기">−</button>' +
			'<input type="text" value="0" readonly aria-label="' + label + ' 인원" id="pax_' + type + '"><button type="button" class="plus" aria-label="' + label + ' 늘리기">+</button></div></li>';
	}
	function drawDeps() {
		$('#demo_months button').removeClass('on').filter('[data-month="' + S.month + '"]').addClass('on');
		var list = upcoming().filter(function (d) { return d.date.slice(0, 7) === S.month; });
		if (!list.length) {
			$('#demo_deps_body').html('<tr class="demo_state_row"><td colspan="7">예정된 출발일이 없어요. 상담 문의로 날짜를 요청해 주세요.</td></tr>');
			return;
		}
		$('#demo_deps_body').html(list.map(function (d) {
			var si = seat(d), closed = si.state === '마감', sel = d.date === S.dep;
			var trans = T.flight ? (T.trans === '항공' ? T.flight.go + ' / ' + T.flight.back : T.trans) : T.trans;
			return '<tr class="' + (closed ? 'is-closed' : 'is-selectable') + (sel ? ' is-selected' : '') + '" data-date="' + d.date + '">' +
				'<td><input type="radio" name="dep" value="' + d.date + '"' + (sel ? ' checked' : '') + (closed ? ' disabled' : '') + ' aria-label="' + Mock.date(d.date, 'MM월 DD일') + ' 출발 선택"></td>' +
				'<td>' + Mock.date(d.date, 'MM.DD (ddd)') + '</td>' +
				'<td>' + Mock.date(d.ret, 'MM.DD (ddd)') + '</td>' +
				'<td class="demo_m_hide">' + esc(trans) + '</td>' +
				'<td class="r">' + (d.price == null ? '요금문의' : Mock.won(d.price)) + '</td>' +
				'<td>' + (closed ? '-' : '<span class="' + (si.left <= 5 ? 'demo_left_few' : '') + '">' + si.left + '석</span>') + '</td>' +
				'<td>' + badge(si.state) + '</td></tr>';
		}).join(''));
	}
	function curDep() { return S.dep ? TourOfficeData.dep(T, S.dep) : null; }
	function updateBook() {
		var d = curDep(), si = d ? seat(d) : null;
		$('#demo_sel_date').html(d ? Mock.date(d.date, 'YYYY.MM.DD (ddd)') + ' 출발<br><span class="demo_muted" style="font-weight:400;font-size:12px;">' + Mock.date(d.ret, 'MM.DD (ddd)') + ' 도착 · ' + badge(si.state) + '</span>' : '출발일을 선택하세요');
		var base = d || upcoming()[0] || {};
		['adult', 'child', 'infant'].forEach(function (k) {
			$('#pax_' + k).val(S[k]);
			$('[data-unit=' + k + ']').text(base.price == null ? '요금문의' : Mock.won(base[k === 'adult' ? 'price' : k]));
		});
		$('#demo_pax li[data-type=adult] .minus').prop('disabled', S.adult <= 1);
		$('#demo_pax li[data-type=child] .minus').prop('disabled', S.child <= 0);
		$('#demo_pax li[data-type=infant] .minus').prop('disabled', S.infant <= 0);
		var msg = '', ok = !!d;
		if (!d) msg = '출발일을 먼저 선택해 주세요.';
		else if (si.state === '마감') { msg = '마감된 출발일이에요.'; ok = false; }
		else if (S.adult + S.child > si.left) { msg = '잔여석(' + si.left + '석)보다 인원이 많아요.'; ok = false; }
		else if (d.price == null) { msg = '요금문의 상품이에요. 상담 문의로 예약을 도와드려요.'; ok = false; }
		var total = d && d.price != null ? S.adult * d.price + S.child * d.child + S.infant * d.infant : 0;
		$('#demo_total_amt').text(Mock.num(total) || '0');
		$('#demo_book_msg').text(msg);
		$('#demo_go_reserve').toggleClass('is-disabled', !ok).attr('aria-disabled', ok ? null : 'true');
		$('#demo_go_ask').attr('href', Mock.url('../site/contact.html', { tour: T.id, date: S.dep || '', pax: S.adult + S.child + S.infant }));
	}
	function goReserve() {
		var d = curDep();
		if (!d) { Mock.toast('출발일을 먼저 선택해 주세요', { type: 'error' }); $('html, body').animate({ scrollTop: $('#sec_dates').offset().top - 90 }, 200); return; }
		var si = seat(d);
		if (si.state === '마감' || d.price == null || S.adult + S.child > si.left) { Mock.toast($('#demo_book_msg').text(), { type: 'error' }); return; }
		location.href = Mock.url('tour_reserve.html', { id: T.id, dep: d.date, adult: S.adult, child: S.child, infant: S.infant });
	}

	/* ---------- 숙소 ---------- */
	function drawHotel() {
		var ci = Mock.qs('checkIn'), co = Mock.qs('checkOut');
		S.checkin = ci && ci > today ? ci : Mock.rel(7);
		if (ci && co && co > ci) S.nights = Math.min(7, Math.round((Mock.toDate(co) - Mock.toDate(ci)) / 86400000));
		S.adult = Math.max(1, parseInt(Mock.qs('adultNum'), 10) || 2);
		S.child = parseInt(Mock.qs('childNum'), 10) || 0;
		S.rooms = Math.max(1, parseInt(Mock.qs('roomNum'), 10) || 1);
		S.room = T.rooms[0].code;
		var nightOpt = '', roomOpt = '';
		for (var n = 1; n <= 7; n++) nightOpt += '<option value="' + n + '">' + n + '박</option>';
		for (var r = 1; r <= 5; r++) roomOpt += '<option value="' + r + '">' + r + '실</option>';
		var html = topHtml() +
			'<div class="demo_dbody"><div class="demo_dmain">' +
			'<h3 class="demo_h3" id="sec_rooms">객실 선택</h3>' +
			'<table class="demo_table demo_rooms"><caption>객실 목록</caption><thead><tr><th scope="col">선택</th><th scope="col" class="l">객실</th><th scope="col">최대 인원</th><th scope="col">1박 요금</th></tr></thead><tbody>' +
			T.rooms.map(function (rm) {
				return '<tr class="is-selectable" data-room="' + rm.code + '"><td><input type="radio" name="room" value="' + rm.code + '" aria-label="' + esc(rm.name) + ' 선택"></td>' +
					'<td class="l"><strong>' + esc(rm.name) + '</strong><span class="demo_muted">조식 불포함 · 무료 취소 (체크인 3일 전까지)</span></td>' +
					'<td>' + rm.max + '명</td><td class="r">' + Mock.won(rm.price) + '</td></tr>';
			}).join('') + '</tbody></table>' +
			'<h3 class="demo_h3">숙소 소개</h3><p class="demo_notice">' + esc(String(T.summary).trim()) + '</p>' +
			'<h3 class="demo_h3">편의시설</h3><ul class="demo_ptags">' + T.facilities.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' +
			'<h3 class="demo_h3">유의사항</h3><p class="demo_notice">체크인 ' + esc(T.checkin) + ' / 체크아웃 ' + esc(T.checkout) + '. 객실 요금은 1박·1실 기준이며, 현장에서 보증금을 요청할 수 있습니다. 체크인 3일 전까지 무료로 취소할 수 있습니다.</p>' +
			'</div>' +
			'<aside class="demo_dside"><div class="demo_book" id="demo_book">' +
			'<h4>숙소 예약</h4>' +
			'<div class="demo_field_inline"><label for="h_checkin">체크인</label><input type="date" id="h_checkin" min="' + Mock.rel(1) + '" value="' + S.checkin + '"></div>' +
			'<div class="demo_field_inline"><label for="h_nights">숙박</label><select id="h_nights">' + nightOpt + '</select></div>' +
			'<div class="demo_field_inline"><label for="h_rooms">객실 수</label><select id="h_rooms">' + roomOpt + '</select></div>' +
			'<ul class="demo_pax" id="demo_pax">' + paxRow('adult', '성인', '만 12세 이상') + paxRow('child', '아동', '만 12세 미만') + '</ul>' +
			'<dl class="demo_book_date"><dt>체크아웃</dt><dd id="demo_sel_date">-</dd></dl>' +
			'<dl class="demo_total"><dt>총 금액</dt><dd><strong id="demo_total_amt">0</strong>원</dd></dl>' +
			'<p class="demo_book_msg" id="demo_book_msg" role="status"></p>' +
			'<a href="javascript:;" class="demo_btn demo_btn_red demo_btn_block" id="demo_go_reserve">예약하기</a>' +
			'<a href="' + esc(Mock.url('../site/contact.html', { tour: T.id })) + '" class="demo_btn demo_btn_line demo_btn_block" id="demo_go_ask">상담 문의</a>' +
			'</div></aside></div>';
		$root.html(html);
		$('#h_nights').val(S.nights);
		$('#h_rooms').val(S.rooms);
		updateHotel();
		$root.on('click', '.demo_rooms tr.is-selectable', function () { S.room = $(this).attr('data-room'); updateHotel(); });
		$root.on('change', '#h_checkin', function () { S.checkin = this.value; updateHotel(); });
		$root.on('change', '#h_nights', function () { S.nights = Number(this.value); updateHotel(); });
		$root.on('change', '#h_rooms', function () { S.rooms = Number(this.value); updateHotel(); });
		$root.on('click', '#demo_pax button', function () {
			var type = $(this).closest('li').attr('data-type'), d = $(this).hasClass('plus') ? 1 : -1;
			S[type] = Math.max(type === 'adult' ? 1 : 0, Math.min(20, S[type] + d));
			updateHotel();
		});
		$root.on('click', '#demo_go_reserve', function () {
			var err = hotelError();
			if (err) { Mock.toast(err, { type: 'error' }); return; }
			location.href = Mock.url('../good/tour_reserve.html', { id: T.id, checkin: S.checkin, nights: S.nights, rooms: S.rooms, room: S.room, adult: S.adult, child: S.child });
		});
	}
	function curRoom() { return T.rooms.filter(function (r) { return r.code === S.room; })[0]; }
	function hotelError() {
		var rm = curRoom();
		if (!rm) return '객실을 선택해 주세요.';
		if (!D.RE.date.test(S.checkin) || S.checkin <= today) return '체크인 날짜는 내일 이후로 골라 주세요.';
		if (S.adult + S.child > rm.max * S.rooms) return '선택한 객실 ' + S.rooms + '실의 최대 인원(' + rm.max * S.rooms + '명)을 넘었어요.';
		return '';
	}
	function updateHotel() {
		var rm = curRoom();
		$('.demo_rooms tr').removeClass('is-selected').find('input').prop('checked', false);
		$('.demo_rooms tr[data-room="' + S.room + '"]').addClass('is-selected').find('input').prop('checked', true);
		$('#pax_adult').val(S.adult); $('#pax_child').val(S.child);
		$('[data-unit]').text('');
		$('#demo_pax li[data-type=adult] .minus').prop('disabled', S.adult <= 1);
		$('#demo_pax li[data-type=child] .minus').prop('disabled', S.child <= 0);
		var co = D.RE.date.test(S.checkin) ? Mock.date(Mock.addDays(S.checkin, S.nights), 'YYYY.MM.DD (ddd)') : '-';
		$('#demo_sel_date').text(co);
		var err = hotelError();
		$('#demo_total_amt').text(rm ? Mock.num(rm.price * S.nights * S.rooms) : '0');
		$('#demo_book_msg').text(err);
		$('#demo_go_reserve').toggleClass('is-disabled', !!err);
	}

	function draw() {
		D.addRecent(T.id);
		document.title = T.title + ' :: ' + document.title;
		if (T.kind === 'hotel') drawHotel(); else drawTour();
		// 다른 탭에서 예약·취소가 생기면 잔여석 다시 계산
		MockDB.on('tms.reservations', function (src) { if (src !== 'local' && T.kind !== 'hotel') { drawDeps(); updateBook(); } });
	}
})(jQuery);

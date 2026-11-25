/*!
 * TourOffice 예약 입력 — good/tour_reserve.html
 *  여행: ?id=&dep=&adult=&child=&infant=      숙소: ?id=&checkin=&nights=&rooms=&room=&adult=&child=
 *  예약자·여행자 정보, 약관 동의, 결제수단(흉내) → 검증 → tms.reservations 에 '예약접수' 로 저장 → 완료 화면
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $root = $('#demo_reserve');
	if (!$root.length) return;

	var Q = {};
	['id', 'dep', 'adult', 'child', 'infant', 'checkin', 'nights', 'rooms', 'room'].forEach(function (k) { Q[k] = Mock.qs(k) || ''; });
	var pax = { adult: Math.max(1, parseInt(Q.adult, 10) || 1), child: Math.max(0, parseInt(Q.child, 10) || 0), infant: Math.max(0, parseInt(Q.infant, 10) || 0) };
	var T, DEP, ROOM, nights, rooms, amount, lines = [];
	var today = Mock.rel(0);

	$root.html(D.stateHtml('loading', '예약 정보를 확인하는 중…'));
	MockApi.get('touroffice.tours', Q.id).then(function (t) { T = t; prepare(); }, function () { fail('예약할 상품을 찾을 수 없어요.'); });

	function fail(msg, back) {
		$root.html('<div class="demo_done"><div class="demo_done_icon"><i class="xi-error-o"></i></div><h2>예약을 진행할 수 없어요</h2>' +
			'<p class="demo_muted">' + esc(msg) + '</p><div class="demo_btns">' +
			(back ? '<a href="' + esc(back) + '" class="demo_btn">다시 선택하기</a>' : '<a href="tour_list.html" class="demo_btn">상품 목록</a>') +
			'<a href="../main/pure_main.html" class="demo_btn demo_btn_line">메인으로</a></div></div>');
	}

	function prepare() {
		var back = D.detailUrl(T);
		if (T.kind === 'hotel') {
			ROOM = (T.rooms || []).filter(function (r) { return r.code === Q.room; })[0];
			nights = Math.min(7, Math.max(1, parseInt(Q.nights, 10) || 1));
			rooms = Math.min(5, Math.max(1, parseInt(Q.rooms, 10) || 1));
			if (!ROOM) return fail('객실을 다시 선택해 주세요.', back);
			if (!D.RE.date.test(Q.checkin) || Q.checkin <= today) return fail('체크인 날짜가 올바르지 않아요.', back);
			if (pax.adult + pax.child > ROOM.max * rooms) return fail('객실 최대 인원을 넘었어요.', back);
			pax.infant = 0;
			amount = ROOM.price * nights * rooms;
			lines = [[ROOM.name + ' × ' + rooms + '실 × ' + nights + '박', amount]];
		} else {
			DEP = TourOfficeData.dep(T, Q.dep);
			if (!DEP || DEP.date <= today) return fail('출발일을 다시 선택해 주세요.', back);
			if (DEP.price == null) return fail('요금문의 상품은 상담 문의로 예약을 도와드려요.', Mock.url('../site/contact.html', { tour: T.id, date: DEP.date }));
			var si = TourRes.seatInfo(T, DEP);
			if (si.state === '마감' || pax.adult + pax.child > si.left) return fail('선택한 출발일의 좌석이 부족해요 (잔여 ' + si.left + '석).', back);
			amount = pax.adult * DEP.price + pax.child * DEP.child + pax.infant * DEP.infant;
			lines = [['성인 ' + pax.adult + '명 × ' + Mock.won(DEP.price), pax.adult * DEP.price]];
			if (pax.child) lines.push(['아동 ' + pax.child + '명 × ' + Mock.won(DEP.child), pax.child * DEP.child]);
			if (pax.infant) lines.push(['유아 ' + pax.infant + '명 × ' + Mock.won(DEP.infant), pax.infant * DEP.infant]);
		}
		draw();
	}

	function travelerTypes() {
		var out = [], i;
		if (T.kind === 'hotel') { for (i = 0; i < rooms; i++) out.push(i === 0 ? '대표 투숙객' : (i + 1) + '번 객실 투숙객'); return out; }
		for (i = 0; i < pax.adult; i++) out.push('성인');
		for (i = 0; i < pax.child; i++) out.push('아동');
		for (i = 0; i < pax.infant; i++) out.push('유아');
		return out;
	}

	function field(id, label, type, attrs, cls) {
		return '<div class="demo_field ' + (cls || '') + '"><label class="demo_lbl" for="' + id + '">' + label + '</label>' +
			'<input type="' + type + '" id="' + id + '" name="' + id + '" ' + (attrs || '') + '></div>';
	}

	function draw() {
		document.title = '예약하기 :: ' + document.title;
		var hotel = T.kind === 'hotel';
		var when = hotel
			? Mock.date(Q.checkin, 'YYYY.MM.DD (ddd)') + ' ~ ' + Mock.date(Mock.addDays(Q.checkin, nights), 'YYYY.MM.DD (ddd)') + ' · ' + nights + '박 ' + rooms + '실'
			: Mock.date(DEP.date, 'YYYY.MM.DD (ddd)') + ' 출발 ~ ' + Mock.date(DEP.ret, 'MM.DD (ddd)') + ' 도착 · ' + D.period(T);
		var who = '성인 ' + pax.adult + '명' + (pax.child ? ', 아동 ' + pax.child + '명' : '') + (pax.infant ? ', 유아 ' + pax.infant + '명' : '');
		var types = travelerTypes();
		var html = '<div class="demo_loc"><a href="../main/pure_main.html"><i class="xi-home"></i> 홈</a><span>&gt;</span><a href="' + esc(D.detailUrl(T)) + '">' + esc(T.cate1) + '</a><span>&gt;</span><strong>예약하기</strong></div>' +
			'<h2 class="demo_title">예약하기</h2>' +
			'<ol class="demo_steps"><li><b>01</b>상품 선택</li><li class="on"><b>02</b>예약정보 입력</li><li><b>03</b>예약 완료</li></ol>' +
			'<div class="demo_rbody"><form class="demo_rmain" id="demo_rform" novalidate>' +
			'<section class="demo_box"><h3>예약 상품</h3><div class="demo_prod"><img src="' + esc(D.img(T)) + '" alt="">' +
			'<div><h4>' + esc(T.title) + '</h4><p>' + esc(when) + '<br>' + esc(who) + (hotel ? '' : ' · ' + esc(T.trans) + (T.trans === '항공' ? ' ' + esc(T.flight.go) : '')) + '</p></div></div></section>' +

			'<section class="demo_box"><h3>예약자 정보</h3><div class="demo_grid">' +
			field('c_name', '이름 <em class="demo_req">*</em>', 'text', 'autocomplete="off" maxlength="20" placeholder="홍길동"') +
			field('c_phone', '휴대폰 <em class="demo_req">*</em>', 'tel', 'class="demo_phone" autocomplete="off" maxlength="13" placeholder="010-0000-0000"') +
			field('c_email', '이메일 <em class="demo_req">*</em>', 'email', 'autocomplete="off" placeholder="name@example.com"') +
			'</div><p class="demo_hint">예약 확인 문자와 메일을 보내드려요. (데모라 실제로 발송되지는 않아요)</p></section>' +

			'<section class="demo_box"><h3>' + (hotel ? '투숙객 정보' : '여행자 정보') + '<label><input type="checkbox" id="same_as"> 예약자와 동일</label></h3>' +
			'<table class="demo_table demo_travelers"><caption>여행자 목록</caption><thead><tr><th scope="col" style="width:50px">No</th><th scope="col" style="width:110px">구분</th><th scope="col">이름 <em class="demo_req">*</em></th>' +
			(hotel ? '' : '<th scope="col">생년월일</th>') + '</tr></thead><tbody>' +
			types.map(function (ty, i) {
				var needBirth = ty === '아동' || ty === '유아';
				return '<tr data-type="' + esc(ty) + '"><td>' + (i + 1) + '</td><td>' + esc(ty) + '</td>' +
					'<td><div class="demo_field"><input type="text" name="t_name" maxlength="20" aria-label="' + (i + 1) + '번 ' + esc(ty) + ' 이름" autocomplete="off"></div></td>' +
					(hotel ? '' : '<td><div class="demo_field"><input type="text" name="t_birth" maxlength="10" placeholder="YYYY-MM-DD' + (needBirth ? ' (필수)' : '') + '" aria-label="' + (i + 1) + '번 생년월일" data-required="' + (needBirth ? '1' : '') + '" autocomplete="off"></div></td>') +
					'</tr>';
			}).join('') + '</tbody></table></section>' +

			'<section class="demo_box"><h3>요청사항</h3><div class="demo_field"><textarea id="c_request" name="request" maxlength="500" placeholder="좌석·식사·객실 등 요청사항을 적어 주세요 (선택)" aria-label="요청사항"></textarea></div></section>' +

			'<section class="demo_box"><h3>결제수단</h3>' +
			'<div class="demo_pay" role="radiogroup" aria-label="결제수단">' +
			'<label class="on"><input type="radio" name="pay" value="무통장" checked> 무통장입금</label>' +
			'<label><input type="radio" name="pay" value="카드"> 신용카드</label></div>' +
			'<div class="demo_paybox" id="pay_bank"><div class="demo_grid"><div class="demo_field"><label class="demo_lbl" for="c_depositor">입금자명 <em class="demo_req">*</em></label><input type="text" id="c_depositor" maxlength="20" autocomplete="off"></div></div>' +
			'<p class="demo_hint">예약 접수 후 안내하는 계좌로 2일 안에 입금해 주세요. 입금이 확인되면 담당자가 예약을 확정합니다.</p></div>' +
			'<div class="demo_paybox demo_hidden" id="pay_card">[예약 신청하기] 를 누르면 카드 결제 승인을 흉내 냅니다. <strong>데모라 실제 결제는 일어나지 않고, 카드 정보도 받지 않아요.</strong></div>' +
			'</section>' +

			'<section class="demo_box"><h3>약관 동의</h3><ul class="demo_agree">' +
			'<li><label><input type="checkbox" id="agree_all"> 전체 동의</label></li>' +
			agree('agree_terms', '[필수] ' + (hotel ? '숙박' : '여행') + ' 약관 및 취소·환불 규정 동의', true, '출발(체크인) 30일 전까지 취소하면 전액 환불, 20일 전 10%, 10일 전 15%, 8일 전 20%, 1일 전 30%, 당일 50% 를 공제합니다. 천재지변 등 불가항력으로 행사가 취소되면 전액 환불합니다.') +
			agree('agree_privacy', '[필수] 개인정보 수집·이용 동의', true, '수집 항목: 이름, 휴대폰, 이메일, 여행자 이름·생년월일 / 목적: 예약 진행 및 안내 / 보유 기간: 여행 종료 후 5년 (전자상거래법)') +
			agree('agree_mkt', '[선택] 이벤트·특가 소식 받기', false, '할인 쿠폰과 특가 상품 소식을 문자·메일로 보내드립니다.') +
			'</ul></section>' +
			'</form>' +

			'<aside class="demo_rside"><div class="demo_sum"><h4>결제 금액</h4>' +
			lines.map(function (l) { return '<dl><dt>' + esc(l[0]) + '</dt><dd>' + Mock.won(l[1]) + '</dd></dl>'; }).join('') +
			'<dl class="demo_sum_total"><dt>총 결제금액</dt><dd><strong>' + Mock.num(amount) + '</strong>원</dd></dl>' +
			'<button type="button" class="demo_btn demo_btn_red demo_btn_block" id="demo_submit">예약 신청하기</button>' +
			'<a href="' + esc(Mock.url(D.detailUrl(T), hotel ? {} : { dep: DEP.date })) + '" class="demo_btn demo_btn_line demo_btn_block">이전으로</a>' +
			'</div></aside></div>';
		$root.html(html);
		bind();
	}
	function agree(id, label, required, text) {
		return '<li style="flex-wrap:wrap;"><label><input type="checkbox" id="' + id + '" class="agree_item"' + (required ? ' data-required="1"' : '') + '> ' + esc(label) + '</label>' +
			'<details><summary>내용 보기</summary><div class="demo_terms">' + esc(text) + '</div></details>' +
			'<div class="demo_field" style="width:100%"></div></li>';
	}

	function bind() {
		var $f = $('#demo_rform');
		$f.on('change', 'input[name=pay]', function () {
			$('.demo_pay label').removeClass('on');
			$(this).closest('label').addClass('on');
			$('#pay_bank').toggleClass('demo_hidden', this.value !== '무통장');
			$('#pay_card').toggleClass('demo_hidden', this.value !== '카드');
		});
		$f.on('input', '#c_name', function () {
			var $d = $('#c_depositor');
			if (!$d.data('touched')) $d.val(this.value);
			if ($('#same_as').prop('checked')) $f.find('input[name=t_name]').first().val(this.value);
		});
		$f.on('input', '#c_depositor', function () { $(this).data('touched', true); });
		$f.on('change', '#same_as', function () {
			$f.find('input[name=t_name]').first().val(this.checked ? $('#c_name').val() : '');
		});
		$f.on('change', '#agree_all', function () { $f.find('.agree_item').prop('checked', this.checked); });
		$f.on('change', '.agree_item, #agree_all', function () { $f.find('.demo_agree .demo_err').filter(function () { return $(this).closest('li').find('.agree_item').prop('checked'); }).remove(); });
		$f.on('change', '.agree_item', function () { $('#agree_all').prop('checked', $f.find('.agree_item:not(:checked)').length === 0); });
		$f.on('input change', 'input, textarea', function () { if ($(this).hasClass('demo_invalid')) D.fieldError($(this), ''); });
		$f.on('input', 'input[name=t_birth]', function () {
			var d = this.value.replace(/\D/g, '').slice(0, 8);
			this.value = d.length > 6 ? d.slice(0, 4) + '-' + d.slice(4, 6) + '-' + d.slice(6) : d.length > 4 ? d.slice(0, 4) + '-' + d.slice(4) : d;
		});
		$f.on('submit', function (e) { e.preventDefault(); submit(); });
		$('#demo_submit').on('click', submit);
	}

	function validate() {
		var $f = $('#demo_rform'), first = null;
		D.clearErrors($f);
		function bad($el, msg) { D.fieldError($el, msg); if (!first) first = $el; }
		var name = $.trim($('#c_name').val()), phone = $.trim($('#c_phone').val()), email = $.trim($('#c_email').val());
		if (!name) bad($('#c_name'), '이름을 입력해 주세요.');
		else if (!D.RE.name.test(name)) bad($('#c_name'), '이름은 한글·영문 2~20자로 입력해 주세요.');
		if (!phone) bad($('#c_phone'), '휴대폰 번호를 입력해 주세요.');
		else if (!D.RE.phone.test(phone)) bad($('#c_phone'), '010-0000-0000 형식으로 입력해 주세요.');
		if (!email) bad($('#c_email'), '이메일을 입력해 주세요.');
		else if (!D.RE.email.test(email)) bad($('#c_email'), '이메일 형식이 올바르지 않아요.');
		$f.find('input[name=t_name]').each(function () {
			var v = $.trim(this.value);
			if (!v) bad($(this), '이름을 입력해 주세요.');
			else if (!D.RE.name.test(v)) bad($(this), '한글·영문 2~20자');
		});
		$f.find('input[name=t_birth]').each(function () {
			var v = $.trim(this.value), need = $(this).attr('data-required') === '1';
			if (!v && need) bad($(this), '아동·유아는 생년월일이 필요해요.');
			else if (v && (!D.RE.date.test(v) || isNaN(Mock.toDate(v)) || v >= today)) bad($(this), 'YYYY-MM-DD 형식');
		});
		if ($f.find('input[name=pay]:checked').val() === '무통장' && !$.trim($('#c_depositor').val())) bad($('#c_depositor'), '입금자명을 입력해 주세요.');
		$f.find('.agree_item[data-required=1]').each(function () {
			if (!this.checked) { $(this).closest('li').find('.demo_field').html('<p class="demo_err" role="alert">필수 약관에 동의해 주세요.</p>'); if (!first) first = $(this); }
		});
		return first;
	}

	var busy = false;
	function submit() {
		if (busy) return;
		var first = validate();
		if (first) {
			Mock.toast('입력 내용을 확인해 주세요', { type: 'error' });
			$('html, body').animate({ scrollTop: first.offset().top - 140 }, 200, function () { first.focus(); });
			return;
		}
		// 그사이 다른 예약으로 좌석이 찼는지 다시 확인
		if (T.kind !== 'hotel') {
			var si = TourRes.seatInfo(T, DEP);
			if (si.state === '마감' || pax.adult + pax.child > si.left) { Mock.toast('방금 좌석이 마감됐어요 (잔여 ' + si.left + '석)', { type: 'error' }); return; }
		}
		var $f = $('#demo_rform');
		var pay = $f.find('input[name=pay]:checked').val();
		var names = $f.find('input[name=t_name]').map(function () { return $.trim(this.value); }).get();
		var births = $f.find('input[name=t_birth]').map(function () { return $.trim(this.value); }).get();
		var travelers = travelerTypes().map(function (ty, i) {
			return { name: names[i], type: T.kind === 'hotel' ? '성인' : ty, birth: births[i] || '' };
		});
		var now = Mock.now();
		var row = {
			id: TourRes.newId(),
			createdAt: now,
			status: '예약접수',
			channel: '홈페이지',
			device: window.innerWidth < 768 ? 'MO' : 'PC',
			agent: '',
			payMethod: pay,
			member: false,
			memberId: '',
			customer: { name: $.trim($('#c_name').val()), phone: $.trim($('#c_phone').val()), email: $.trim($('#c_email').val()) },
			pax: pax,
			travelers: travelers,
			kind: T.kind,
			tourId: T.id, tourTitle: T.title, evTitle: T.evTitle, tourCode: T.code,
			cate: T.cate, countryCode: T.countryCode, city: T.city,
			departDate: T.kind === 'hotel' ? Q.checkin : DEP.date,
			returnDate: T.kind === 'hotel' ? Mock.date(Mock.addDays(Q.checkin, nights)) : DEP.ret,
			departFlight: T.flight ? { airline: T.flight.airline, no: T.flight.go } : { airline: '', no: '' },
			returnFlight: T.flight ? { airline: T.flight.airline, no: T.flight.back } : { airline: '', no: '' },
			hotel: T.kind === 'hotel' ? { room: ROOM.name, nights: nights, rooms: rooms, unit: ROOM.price } : null,
			unit: T.kind === 'hotel' ? { adult: 0, child: 0, infant: 0 } : { adult: DEP.price, child: DEP.child, infant: DEP.infant },
			amount: amount,
			paid: pay === '카드' ? amount : 0,
			depositor: pay === '무통장' ? $.trim($('#c_depositor').val()) : '',
			request: $.trim($('#c_request').val()),
			marketing: $('#agree_mkt').prop('checked'),
			manager: '',
			memos: [{ at: now, by: '시스템', text: '홈페이지 예약 접수 (' + (pay === '카드' ? '카드 결제 ' + Mock.won(amount) + ' 승인' : '무통장입금 대기') + ')', public: true }],
			site: 'touroffice'
		};
		busy = true;
		var $btn = $('#demo_submit').addClass('is-loading').text(pay === '카드' ? '카드 승인 중…' : '예약 접수 중…');
		(pay === '카드' ? Mock.delay(700) : Promise.resolve()).then(function () {
			return MockApi.create('tms.reservations', row);
		}).then(function (saved) {
			MockDB.setItem('touroffice.lastRes', { id: saved.id, name: saved.customer.name });
			location.href = Mock.url('tour_complete.html', { res: saved.id });
		}, function (e) {
			busy = false;
			$btn.removeClass('is-loading').text('예약 신청하기');
			Mock.toast('예약을 저장하지 못했어요: ' + e.message, { type: 'error' });
		});
	}
})(jQuery);

/*
 * MyCultureis 데모 — 예약 정보 입력 (good/reserve.html?id=&date=&time=&people=)
 *  예약자 정보 · 요청사항 · 약관 동의 → 필수값/형식 검증 → 잔여 인원 재확인 → myculture.bookings 에 저장
 *  → complete.html?no=<예약번호>.  저장되면 그 슬롯의 잔여 인원이 그만큼 줄어든다 (MC.seats).
 */
(function ($) {
	'use strict';

	var esc = Mock.esc;
	var $root = $('#mcReserve');
	var q = { id: Mock.qs('id'), date: Mock.qs('date'), time: Mock.qs('time'), people: parseInt(Mock.qs('people'), 10) || 1 };
	var cls = null, people = 1;

	function backLink(label) {
		return '<a class="mc-btn" href="' + esc(cls ? MC.link.detail(cls.id) : 'list.html') + '">' + (label || '날짜 다시 고르기') + '</a>';
	}

	function render() {
		var cate = MC.category(cls.cate) || {};
		var last = MockDB.getItem('myculture.lastBooker', null) || {};
		var h = '<div class="mc-rv-grid">' +
			'<form id="mcForm" class="mc-form" novalidate>' +
				'<section class="mc-box"><h3>예약자 정보</h3>' +
					'<div class="mc-field"><label for="rvName">예약자명 <em>*</em></label><input type="text" id="rvName" maxlength="20" autocomplete="name" placeholder="이름을 입력해 주세요" value="' + esc(last.name || '') + '"></div>' +
					'<div class="mc-row2">' +
						'<div class="mc-field"><label for="rvPhone">연락처 <em>*</em></label><input type="tel" id="rvPhone" maxlength="13" autocomplete="tel" placeholder="010-0000-0000" value="' + esc(last.phone || '') + '"><p class="mc-help">예약 안내 문자를 보내 드려요 (데모: 010-0000-xxxx)</p></div>' +
						'<div class="mc-field"><label for="rvEmail">이메일 <em>*</em></label><input type="email" id="rvEmail" maxlength="60" autocomplete="email" placeholder="name@example.com" value="' + esc(last.email || '') + '"></div>' +
					'</div>' +
				'</section>' +
				'<section class="mc-box"><h3>요청사항 <span>(선택)</span></h3>' +
					'<div class="mc-field"><label for="rvReq" class="mc-sr">요청사항</label><textarea id="rvReq" maxlength="300" placeholder="알레르기 재료, 외국인 동반 여부, 기념일 등을 자유롭게 적어 주세요"></textarea><p class="mc-counter"><span id="rvReqCnt">0</span> / 300</p></div>' +
				'</section>' +
				'<section class="mc-box"><h3>약관 동의</h3>' +
					'<div class="mc-field"><label class="mc-check is-all"><input type="checkbox" id="rvAll"> 아래 내용에 모두 동의해요</label></div>' +
					'<div class="mc-field"><label class="mc-check"><input type="checkbox" id="rvAgree1" class="rv-agree"> [필수] 취소 · 환불 규정에 동의해요</label>' +
						'<p class="mc-agree-txt">3일 전까지 취소: 전액 환불 / 2일 전 ~ 1일 전: 50% 환불 / 당일 취소 · 불참: 환불 불가</p></div>' +
					'<div class="mc-field"><label class="mc-check"><input type="checkbox" id="rvAgree2" class="rv-agree"> [필수] 개인정보 수집 · 이용에 동의해요</label>' +
						'<p class="mc-agree-txt">수집 항목: 이름, 연락처, 이메일 / 목적: 예약 확인 및 안내 / 보유 기간: 클래스 종료 후 1년 (데모에서는 이 브라우저에만 저장돼요)</p></div>' +
				'</section>' +
			'</form>' +
			'<aside class="mc-box mc-rv-sum" aria-label="예약 내용">' +
				'<h3>예약 내용</h3>' +
				'<div class="mc-rv-cls"><img src="' + esc(MC.img(cls.thumb)) + '" alt=""><div><p class="mc-meta"><span class="mc-cate">' + esc(cate.name || '') + '</span><span class="mc-country">' + esc(cls.country) + '</span></p><b>' + esc(cls.title) + '</b></div></div>' +
				'<dl class="mc-dl">' +
					'<div><dt>날짜</dt><dd>' + Mock.date(q.date, 'YYYY.MM.DD (ddd)') + '</dd></div>' +
					'<div><dt>시간</dt><dd>' + esc(q.time) + ' ~ ' + MC.endTime(q.time, cls.duration) + ' (' + MC.duration(cls.duration) + ')</dd></div>' +
					'<div><dt>장소</dt><dd>' + esc(cls.place.name) + '</dd></div>' +
					'<div><dt>인원</dt><dd><div class="mc-stepper"><button type="button" id="rvMinus" aria-label="인원 줄이기">−</button><input type="text" id="rvPeople" readonly aria-label="인원"><button type="button" id="rvPlus" aria-label="인원 늘리기">+</button></div></dd></div>' +
					'<div><dt>1인 금액</dt><dd>' + Mock.won(cls.price) + '</dd></div>' +
				'</dl>' +
				'<p class="mc-seatline" id="rvSeat"></p>' +
				'<div class="mc-total"><span>총 결제 금액</span><strong id="rvTotal"></strong></div>' +
				'<button type="submit" form="mcForm" class="mc-btn mc-btn-primary mc-btn-block" id="rvSubmit">예약 확정하기</button>' +
				'<a class="mc-btn mc-btn-gray mc-btn-block" style="margin-top:8px" href="' + esc(Mock.url(MC.link.detail(cls.id), { date: q.date, time: q.time, people: people })) + '" id="rvChange">날짜 · 시간 변경</a>' +
				'<p class="mc-note">데모 화면이라 결제 단계 없이 바로 예약이 확정돼요.</p>' +
			'</aside>' +
		'</div>';
		$root.html(h);
		renderPeople();
	}

	function renderPeople() {
		var s = MC.seats(cls, q.date, q.time);
		var max = Math.max(1, s.left);
		if (people > max) people = max;
		$('#rvPeople').val(people + '명');
		$('#rvMinus').prop('disabled', people <= 1);
		$('#rvPlus').prop('disabled', people >= s.left);
		$('#rvTotal').text(Mock.won(cls.price * people));
		$('#rvSeat').toggleClass('is-few', s.few).text('이 시간 잔여 ' + s.left + '석 / 정원 ' + s.capacity + '명');
		$('#rvChange').attr('href', Mock.url(MC.link.detail(cls.id), { date: q.date, time: q.time, people: people }));
	}

	function formatPhone(v) {
		var d = String(v).replace(/\D/g, '').slice(0, 11);
		if (d.length < 4) return d;
		if (d.length < 8) return d.slice(0, 3) + '-' + d.slice(3);
		return d.slice(0, 3) + '-' + d.slice(3, d.length - 4) + '-' + d.slice(-4);
	}

	function newId() {
		var id;
		do { id = Mock.uid('MC'); } while (MockDB.find(MC.C.book, id));
		return id;
	}

	function bind() {
		$root.on('click', '#rvMinus', function () { if (people > 1) { people--; renderPeople(); } });
		$root.on('click', '#rvPlus', function () {
			var left = MC.seats(cls, q.date, q.time).left;
			if (people < left) { people++; renderPeople(); } else Mock.toast('이 시간은 최대 ' + left + '명까지 예약할 수 있어요');
		});
		$root.on('input', '#rvPhone', function () { this.value = formatPhone(this.value); });
		$root.on('input', '#rvReq', function () { $('#rvReqCnt').text(this.value.length); });
		$root.on('change', '#rvAll', function () { $('.rv-agree').prop('checked', this.checked).closest('.mc-field').removeClass('is-error').find('.mc-err').remove(); });
		$root.on('change', '.rv-agree', function () { $('#rvAll').prop('checked', $('.rv-agree:checked').length === $('.rv-agree').length); });

		$root.on('submit', '#mcForm', function (e) {
			e.preventDefault();
			var $f = $(this), $btn = $('#rvSubmit');
			if ($btn.hasClass('is-busy')) return;
			var ok = MC.validate($f, [
				{ el: '#rvName', test: function (v) { return !v ? '예약자명을 입력해 주세요' : (v.length < 2 ? '이름을 두 글자 이상 입력해 주세요' : ''); } },
				{ el: '#rvPhone', test: function (v) { return !v ? '연락처를 입력해 주세요' : (!MC.re.phone.test(v) ? '휴대폰 번호 형식이 아니에요 (예: 010-0000-1234)' : ''); } },
				{ el: '#rvEmail', test: function (v) { return !v ? '이메일을 입력해 주세요' : (!MC.re.email.test(v) ? '이메일 형식이 아니에요 (예: name@example.com)' : ''); } },
				{ el: '#rvAgree1', test: function (v) { return v ? '' : '취소 · 환불 규정에 동의해 주세요'; } },
				{ el: '#rvAgree2', test: function (v) { return v ? '' : '개인정보 수집 · 이용에 동의해 주세요'; } }
			]);
			if (!ok) return;

			// 그사이 다른 사람이 예약했을 수도 있으니 저장 직전에 다시 확인
			var s = MC.seats(cls, q.date, q.time);
			if (s.left < people) {
				renderPeople();
				Mock.toast(s.left ? '남은 자리가 ' + s.left + '석뿐이에요. 인원을 줄여 주세요' : '방금 마감되었어요. 다른 시간을 골라 주세요', { type: 'error' });
				return;
			}

			var booker = { name: $.trim($('#rvName').val()), phone: formatPhone($('#rvPhone').val()), email: $.trim($('#rvEmail').val()) };
			$btn.addClass('is-busy').prop('disabled', true).text('예약하는 중…');
			MockApi.create(MC.C.book, {
				id: newId(),
				classId: cls.id, title: cls.title,
				date: q.date, time: q.time, people: people,
				price: cls.price, total: cls.price * people,
				name: booker.name, phone: booker.phone, email: booker.email,
				request: $.trim($('#rvReq').val()),
				status: '예약확정',
				createdAt: Mock.now()
			}).then(function (row) {
				MockDB.setItem('myculture.lastBooker', booker);
				location.href = MC.link.complete(row.id);
			}).catch(function (err) {
				console.error(err);
				$btn.removeClass('is-busy').prop('disabled', false).text('예약 확정하기');
				Mock.toast('예약하지 못했어요. 다시 시도해 주세요', { type: 'error' });
			});
		});
	}

	/* ---------- 주소 값 확인 ---------- */
	cls = MC.cls(q.id);
	if (!cls) {
		$root.html(MC.empty('예약할 클래스를 찾을 수 없어요.', '<a class="mc-btn" href="list.html">클래스 목록 보기</a>'));
		return;
	}
	document.title = '예약하기 — ' + cls.title + ' | 마이컬처이즈 — LJY Port :: 실제 운영되는 페이지가 아닙니다';
	if (!q.date || !q.time || !MC.isOpenDate(cls, q.date) || cls.times.indexOf(q.time) < 0) {
		$root.html(MC.empty('예약할 날짜와 시간을 먼저 골라 주세요.', backLink('날짜 · 시간 고르기')));
		return;
	}
	var seat = MC.seats(cls, q.date, q.time);
	if (seat.closed) {
		$root.html(MC.empty(Mock.date(q.date, 'MM월 DD일') + ' ' + esc(q.time) + ' 클래스는 마감되었어요.<br>다른 날짜나 시간을 골라 주세요.', backLink()));
		return;
	}
	people = Math.max(1, Math.min(q.people, seat.left));
	if (people < q.people) Mock.toast('남은 자리가 ' + seat.left + '석이라 인원을 ' + people + '명으로 맞췄어요');
	render();
	bind();
})(jQuery);

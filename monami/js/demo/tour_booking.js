/*
 * Monami France 데모 — 예약하기 (tour/booking.html?id=&date=&adults=&children=)
 * 메인의 Booking Now 처럼 id 만 넘어와도 이 화면에서 날짜·인원을 고를 수 있다.
 * 필수값을 검증한 뒤 monami.bookings 에 저장하고 complete.html?no=예약번호 로 이동한다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var t = D.tour(Mock.qs('id'));
	var $form = $('#bkForm');

	if (!t) {
		$('#dmPageTitle').text('예약할 투어를 찾을 수 없어요');
		D.empty($('#bkState'), '예약할 투어 정보가 없어요. 투어 목록에서 투어를 골라 주세요.', '<a class="dm-btn dm-btn-primary" href="list.html">투어 목록 보기</a>');
		return;
	}

	var c = D.country(t.country) || {};
	var date = D.canBook(t, Mock.qs('date')) ? Mock.qs('date') : '';
	var pickup = t.meeting.place.indexOf('픽업') >= 0;
	var adults, children;

	$form.show();
	$('#dmLoc').html('<a href="../main/pure_main.html"><i class="xi-home"></i> Home</a>' +
		' <i class="xi-angle-right-min"></i> <a href="' + D.url.list({ type: t.type }) + '">' + D.TYPE[t.type] + '</a>' +
		' <i class="xi-angle-right-min"></i> <a href="' + D.url.tour(t.id) + '">' + Mock.esc(t.name) + '</a>' +
		' <i class="xi-angle-right-min"></i> <strong>예약하기</strong>');
	$('#bkTour').html('<img src="' + D.img(t.image) + '" alt=""><div><strong>' + Mock.esc(t.name) + '</strong>' +
		'<p><i class="xi-maker"></i>' + Mock.esc(c.ko + ' · ' + t.region) + ' &nbsp; <i class="xi-clock-o"></i>' + Mock.esc(t.time) + '<br><i class="xi-flag-o"></i>' + Mock.esc(t.meeting.place) + ' (' + Mock.esc(t.meeting.time) + ')</p></div>' +
		'<a class="dm-btn dm-btn-sm" href="' + D.url.tour(t.id) + '">투어 상세</a>');
	$('#bkDays').text('운영 요일 : ' + t.daysText);
	$('#bkPeopleHelp').text((t.minPeople > 1 ? t.minPeople + '인 이상 · ' : '') + '최대 ' + t.maxPeople + '명 · 성인 ' + D.won(t.priceAdult) + ' / 아동(만 12세 이하) ' + D.won(t.priceChild));
	$('#bkRefundText').html(D.br('· 투어일 기준 10일 전까지 취소 : 전액 환불\n· 9일 ~ 4일 전 취소 : 결제 금액의 50% 환불\n· 3일 전 ~ 당일 취소, 노쇼 : 환불 불가\n· 천재지변·현지 정부 지침으로 투어가 취소되면 전액 환불해 드립니다.\n· 날짜 변경은 투어일 4일 전까지 1회 무료입니다.'));
	if (pickup) $('#bkHotelReq').show();
	$('#smTour').text(t.name);

	/* ---------- 날짜 · 인원 · 금액 ---------- */
	function total() { return adults.get() * t.priceAdult + children.get() * t.priceChild; }
	function update() {
		$('#smDate').text(date ? D.dateKo(date) : '-');
		$('#smAdults').text(adults.get() + '명 × ' + D.won(t.priceAdult));
		$('#smChildren').text(children.get() + '명 × ' + D.won(t.priceChild));
		$('#smTotal').text(D.won(total()));
	}
	var limit = function () { Mock.toast('이 투어는 최대 ' + t.maxPeople + '명까지 예약할 수 있어요'); };
	var qa = parseInt(Mock.qs('adults'), 10), qc = parseInt(Mock.qs('children'), 10);
	adults = D.qty($('#bkAdults'), { min: 1, value: qa > 0 ? qa : Math.max(1, t.minPeople), max: function () { return t.maxPeople - (children ? children.get() : 0); }, onChange: function () { if (children) children.refresh(); update(); }, onLimit: limit });
	children = D.qty($('#bkChildren'), { min: 0, value: qc > 0 ? qc : 0, max: function () { return t.maxPeople - adults.get(); }, onChange: function () { adults.refresh(); update(); }, onLimit: limit });
	adults.refresh();

	$('#bkDate').val(date);
	D.datepicker($('#bkDate'), t, function (d) {
		date = d;
		$('#bkDate').removeClass('dm-invalid').closest('td').find('.dm-err').remove();
		update();
	}, { defaultDate: date || D.firstOpenDay(t) });
	update();

	/* ---------- 약관 ---------- */
	$('#bkAgreeAll').on('change', function () { $('.bk-agree').prop('checked', this.checked); });
	$form.on('change', '.bk-agree', function () { $('#bkAgreeAll').prop('checked', $('.bk-agree:checked').length === $('.bk-agree').length); });

	// 휴대폰 번호 자동 하이픈
	$('#bkPhone').on('input', function () {
		var v = this.value.replace(/\D/g, '').slice(0, 11);
		this.value = v.length > 7 ? v.replace(/^(\d{3})(\d{3,4})(\d{4})$/, '$1-$2-$3').replace(/^(\d{3})(\d{4})(\d{1,3})$/, '$1-$2-$3') : v.length > 3 ? v.slice(0, 3) + '-' + v.slice(3) : v;
	});
	$('#bkNameEn').on('input', function () { this.value = this.value.toUpperCase(); });

	/* ---------- 제출 ---------- */
	$form.on('submit', function (e) {
		e.preventDefault();
		$form.find('[name=people]').val(adults.get() + children.get());
		var ok = D.validate($form, [
			{ name: 'date', label: '투어 날짜', required: true, msg: '투어 날짜를 선택해 주세요.', check: function (v) { return D.canBook(t, v) ? '' : '운영 요일 중에서 다시 골라 주세요.'; } },
			{ name: 'people', label: '인원', check: function (v) { v = Number(v); return v < t.minPeople ? t.minPeople + '인 이상 예약할 수 있어요.' : v > t.maxPeople ? '최대 ' + t.maxPeople + '명까지 예약할 수 있어요.' : ''; } },
			{ name: 'name', label: '예약자 이름', required: true, pattern: /^[가-힣a-zA-Z\s]{2,20}$/, patternMsg: '이름은 한글 또는 영문 2~20자로 입력해 주세요.' },
			{ name: 'nameEn', label: '영문 이름', required: true, pattern: /^[A-Za-z][A-Za-z\s]{1,39}$/, patternMsg: '여권과 같은 영문 이름을 입력해 주세요. (예: KIM MONA)' },
			{ name: 'phone', label: '휴대폰', required: true, pattern: /^01[016789]-\d{3,4}-\d{4}$/, patternMsg: '휴대폰 번호를 010-0000-0000 형식으로 입력해 주세요.' },
			{ name: 'email', label: '이메일', required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, patternMsg: '이메일 주소 형식이 올바르지 않아요.' },
			{ name: 'hotel', label: '숙소', required: pickup, msg: '픽업 투어라 숙소 이름과 주소가 필요해요.' },
			{ name: 'agreeRefund', label: '취소 · 환불 규정', required: true, msg: '취소 · 환불 규정에 동의해 주세요.' },
			{ name: 'agreePrivacy', label: '개인정보 수집 · 이용', required: true, msg: '개인정보 수집 · 이용에 동의해 주세요.' }
		]);
		if (!ok) return;

		var no;
		do { no = Mock.uid('MF'); } while (MockDB.find(C.bookings, no));
		var v = function (n) { return $.trim($form.find('[name="' + n + '"]').val() || ''); };
		var row = {
			id: no, tourId: t.id, tourName: t.name, date: date,
			adults: adults.get(), children: children.get(), priceAdult: t.priceAdult, priceChild: t.priceChild, total: total(),
			name: v('name'), nameEn: v('nameEn').toUpperCase(), phone: v('phone'), email: v('email'), kakao: v('kakao'),
			hotel: v('hotel'), payment: $form.find('[name=payment]:checked').val(), request: v('request'),
			status: '예약접수', createdAt: Mock.now()
		};
		var $btn = $('#bkSubmit').addClass('is-busy').text('예약하는 중…');
		MockApi.create(C.bookings, row).then(function (b) {
			var mine = MockDB.getItem('monami.myBookings', []) || [];
			mine.unshift({ no: b.id, name: b.name });
			MockDB.setItem('monami.myBookings', mine.slice(0, 5));
			location.href = D.url.complete(b.id);
		}, function (err) {
			$btn.removeClass('is-busy').text('예약하기');
			Mock.toast(err.message || '예약하지 못했어요. 다시 시도해 주세요.', { type: 'error' });
		});
	});
})(jQuery, window.Demo);

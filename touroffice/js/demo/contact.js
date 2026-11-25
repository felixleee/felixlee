/*!
 * TourOffice 고객센터 상담 문의 — site/contact.html?tour=&date=&pax=
 *  문의를 tms.inquiries 에 저장 → TMS 대시보드 '예약관리 상담기록' 과 '상담/예약현황' 에 바로 나타남
 */
(function ($) {
	'use strict';
	var D = ToDemo, esc = Mock.esc;
	var $f = $('#demo_contact_form');
	if (!$f.length) return;

	// 관심 상품 선택지 (분류별)
	var tours = MockDB.all('touroffice.tours');
	var opt = '<option value="">선택 안 함</option>';
	TourOfficeData.cate.forEach(function (c) {
		var list = tours.filter(function (t) { return t.b_uid === c.uid; });
		if (!list.length) return;
		opt += '<optgroup label="' + esc(c.name) + '">' + list.map(function (t) {
			return '<option value="' + t.id + '">' + esc(D.cut(t.title, 46)) + '</option>';
		}).join('') + '</optgroup>';
	});
	$('#i_tour').html(opt);
	var paxOpt = '<option value="">선택</option>';
	for (var i = 1; i <= 20; i++) paxOpt += '<option value="' + i + '">' + i + '명</option>';
	$('#i_pax').html(paxOpt);
	$('#i_date').attr('min', Mock.rel(1));

	// 상세 화면에서 넘어온 값
	var qt = Mock.qs('tour'), qd = Mock.qs('date'), qp = Mock.qs('pax');
	if (qt) {
		$('#i_tour').val(qt);
		var t0 = MockDB.find('touroffice.tours', qt);
		if (t0) $('#i_kind').val(t0.kind === 'hotel' ? '호텔' : '여행');
	}
	if (qd && qd > Mock.rel(0)) $('#i_date').val(qd);
	if (qp) $('#i_pax').val(qp);

	$f.on('change', '#i_tour', function () {
		var t = MockDB.find('touroffice.tours', this.value);
		if (t) $('#i_kind').val(t.kind === 'hotel' ? '호텔' : '여행');
	});
	$f.on('input change', 'input, textarea, select', function () { if ($(this).hasClass('demo_invalid')) D.fieldError($(this), ''); });
	$f.on('change', '#i_agree', function () { $(this).closest('.demo_box').find('.demo_err').remove(); });

	var busy = false;
	$f.on('submit', function (e) {
		e.preventDefault();
		if (busy) return;
		D.clearErrors($f);
		var first = null;
		function bad($el, msg) { D.fieldError($el, msg); if (!first) first = $el; }
		var name = $.trim($('#i_name').val()), phone = $.trim($('#i_phone').val()), email = $.trim($('#i_email').val());
		var content = $.trim($('#i_content').val()), date = $('#i_date').val();
		if (!name) bad($('#i_name'), '이름을 입력해 주세요.');
		else if (!D.RE.name.test(name)) bad($('#i_name'), '이름은 한글·영문 2~20자로 입력해 주세요.');
		if (!phone) bad($('#i_phone'), '연락처를 입력해 주세요.');
		else if (!D.RE.phone.test(phone)) bad($('#i_phone'), '010-0000-0000 형식으로 입력해 주세요.');
		if (email && !D.RE.email.test(email)) bad($('#i_email'), '이메일 형식이 올바르지 않아요.');
		if (date && date <= Mock.rel(0)) bad($('#i_date'), '희망 일자는 내일 이후로 골라 주세요.');
		if (!content) bad($('#i_content'), '문의 내용을 입력해 주세요.');
		else if (content.length < 5) bad($('#i_content'), '5자 이상 입력해 주세요.');
		if (!$('#i_agree').prop('checked')) {
			$('#i_agree').closest('.demo_box').append('<p class="demo_err" role="alert">개인정보 수집·이용에 동의해 주세요.</p>');
			if (!first) first = $('#i_agree');
		}
		if (first) {
			Mock.toast('입력 내용을 확인해 주세요', { type: 'error' });
			$('html, body').animate({ scrollTop: first.offset().top - 140 }, 200, function () { first.focus(); });
			return;
		}
		var tour = $('#i_tour').val() ? MockDB.find('touroffice.tours', $('#i_tour').val()) : null;
		var id, n = 0;
		do { id = Mock.uid('Q'); n++; } while (MockDB.find('tms.inquiries', id) && n < 50);
		var now = Mock.now();
		var row = {
			id: id, createdAt: now, kind: $('#i_kind').val() || '여행', status: '접수',
			name: name, phone: phone, email: email,
			tourId: tour ? tour.id : '', tourTitle: tour ? tour.title : '',
			wishDate: date || '', pax: Number($('#i_pax').val()) || 0,
			content: content, notifyDate: date ? Mock.date(Mock.addDays(date, -7) > new Date() ? Mock.addDays(date, -7) : Mock.addDays(now, 1)) : Mock.date(Mock.addDays(now, 1)),
			answer: '', site: 'touroffice'
		};
		busy = true;
		var $btn = $f.find('button[type=submit]').addClass('is-loading').text('접수 중…');
		MockApi.create('tms.inquiries', row).then(function (saved) {
			$f.closest('.demo_contact').addClass('demo_hidden');
			$('#demo_contact_done').removeClass('demo_hidden').html(
				'<div class="demo_done"><div class="demo_done_icon"><i class="xi-check-circle-o"></i></div>' +
				'<h2>상담 문의가 접수되었습니다</h2>' +
				'<p class="demo_resno">접수번호<strong id="demo_inq_no">' + esc(saved.id) + '</strong></p>' +
				'<table class="demo_kv"><tbody>' +
				'<tr><th scope="row">문의자</th><td>' + esc(saved.name) + ' / ' + esc(saved.phone) + '</td></tr>' +
				(saved.tourTitle ? '<tr><th scope="row">관심 상품</th><td>' + esc(saved.tourTitle) + '</td></tr>' : '') +
				'<tr><th scope="row">문의 내용</th><td>' + esc(saved.content) + '</td></tr></tbody></table>' +
				'<p class="demo_hint" style="margin-top:14px">영업일 기준 24시간 안에 담당자가 연락드려요. (TMS 대시보드의 \'예약관리 상담기록\' 에 바로 올라가요)</p>' +
				'<div class="demo_btns"><a href="../main/pure_main.html" class="demo_btn">메인으로</a>' +
				(tour ? '<a href="' + esc(D.detailUrl(tour)) + '" class="demo_btn demo_btn_line">상품 다시 보기</a>' : '') + '</div></div>');
			$('html, body').scrollTop(0);
		}, function (err) {
			busy = false;
			$btn.removeClass('is-loading').text('문의 남기기');
			Mock.toast('저장하지 못했어요: ' + err.message, { type: 'error' });
		});
	});
})(jQuery);

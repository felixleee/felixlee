/*
 * 로뎀투어 데모 — 예약 신청 (good/reserve.html?id=&dep=)
 *  - 출발일 · 인원(성인/아동/유아) · 신청자 · 교회/단체명 · 요청사항 → 검증 → rothem.reservations 에 저장
 *  - 저장하면 해당 출발일 잔여석을 줄이고(0 이 되면 마감) 완료 화면(reserve_done.html?no=)으로 이동
 */
(function ($) {
	'use strict';

	var CHILD_RATE = 0.9, INFANT_RATE = 0.2;
	var id = Mock.qs('id'), $box = $('#rdReserve'), good = null;

	function opts(from, to, sel) {
		var h = '';
		for (var i = from; i <= to; i++) h += '<option value="' + i + '"' + (i === sel ? ' selected' : '') + '>' + i + '명</option>';
		return h;
	}
	function depOf(date) { return RD.upcoming(good).filter(function (d) { return d.date === date; })[0] || null; }
	function calc() {
		var d = depOf($('#rvDep').val()), a = +$('#rvAdult').val() || 0, c = +$('#rvChild').val() || 0, n = +$('#rvInfant').val() || 0;
		var unit = d ? d.price : 0;
		return { dep: d, adults: a, children: c, infants: n, unit: unit, total: unit * a + Math.round(unit * CHILD_RATE) * c + Math.round(unit * INFANT_RATE) * n };
	}
	function updateSide() {
		var c = calc();
		$('#sdDep').text(c.dep ? Mock.date(c.dep.date, 'YYYY.MM.DD (ddd)') : '-');
		$('#sdRet').text(c.dep ? Mock.date(Mock.addDays(c.dep.date, good.days - 1), 'YYYY.MM.DD (ddd)') : '-');
		$('#sdPeople').text('성인 ' + c.adults + (c.children ? ' · 아동 ' + c.children : '') + (c.infants ? ' · 유아 ' + c.infants : ''));
		$('#sdUnit').text(c.dep ? Mock.won(c.unit) : '-');
		$('#sdTotal').text(Mock.won(c.total));
		$('#sdSeat').html(c.dep ? RD.badge(c.dep.status) + ' 잔여 ' + c.dep.seats + '석' : '-');
	}

	function render() {
		var open = RD.upcoming(good).filter(RD.isOpen);
		if (!open.length) {
			$box.html(RD.empty('예약 가능한 출발일이 없어요', '<a href="' + Mock.esc(RD.goodUrl(good.id)) + '">상품 상세</a>로 돌아가거나 <a href="' + Mock.esc(RD.inquiryUrl({ goodId: good.id })) + '">단체 상담</a>을 신청해 주세요.'));
			return;
		}
		var want = Mock.qs('dep'), sel = open.some(function (d) { return d.date === want; }) ? want : open[0].date;
		var last = MockDB.getItem('rothem.lastApplicant', null) || {};
		$box.html(
			'<form id="rvForm" class="rd-rsv" action="reserve_done.html" method="post" novalidate>' +
			'<div class="rd-rsv-main">' +
				'<h3>여행 정보</h3>' +
				'<table class="rd-form"><tbody>' +
					'<tr><th scope="row">상품명</th><td><strong>' + Mock.esc(good.title) + '</strong><p class="rd-help">' + Mock.esc(good.code) + ' · ' + RD.period(good) + ' · ' + Mock.esc(good.airline) + '</p></td></tr>' +
					'<tr><th scope="row"><label for="rvDep">출발일<span class="rd-req">*</span></label></th><td class="rd-field"><select id="rvDep" name="dep" class="w-full">' +
						'<option value="">출발일을 고르세요</option>' +
						open.map(function (d) {
							return '<option value="' + d.date + '"' + (d.date === sel ? ' selected' : '') + '>' + Mock.date(d.date, 'YYYY.MM.DD (ddd)') + ' 출발 · ' + d.status + ' · 잔여 ' + d.seats + '석 · ' + Mock.won(d.price) + '</option>';
						}).join('') +
					'</select></td></tr>' +
					'<tr><th scope="row">인원<span class="rd-req">*</span></th><td class="rd-field">' +
						'<label class="rd-inline">성인<select id="rvAdult" name="adults">' + opts(0, 20, 1) + '</select></label>' +
						'<label class="rd-inline">아동 <small>(만 2~11세)</small><select id="rvChild" name="children">' + opts(0, 10, 0) + '</select></label>' +
						'<label class="rd-inline">유아 <small>(만 2세 미만)</small><select id="rvInfant" name="infants">' + opts(0, 5, 0) + '</select></label>' +
						'<p class="rd-help">아동은 성인가의 90%, 유아는 20% 입니다. 유아는 좌석을 차지하지 않아요.</p>' +
					'</td></tr>' +
				'</tbody></table>' +
				'<div class="rd-gap"></div>' +
				'<h3>신청자 정보</h3>' +
				'<table class="rd-form"><tbody>' +
					'<tr><th scope="row"><label for="rvName">신청자 이름<span class="rd-req">*</span></label></th><td class="rd-field"><input type="text" id="rvName" name="name" class="w-m" maxlength="20" autocomplete="name" value="' + Mock.esc(last.name || '') + '" /></td></tr>' +
					'<tr><th scope="row"><label for="rvPhone">휴대폰 번호<span class="rd-req">*</span></label></th><td class="rd-field"><input type="tel" id="rvPhone" name="phone" class="w-m" maxlength="13" placeholder="010-0000-0000" autocomplete="tel" value="' + Mock.esc(last.phone || '') + '" /></td></tr>' +
					'<tr><th scope="row"><label for="rvEmail">이메일</label></th><td class="rd-field"><input type="email" id="rvEmail" name="email" class="w-l" maxlength="60" placeholder="name@example.com" autocomplete="email" value="' + Mock.esc(last.email || '') + '" /></td></tr>' +
					'<tr><th scope="row"><label for="rvChurch">교회 · 단체명</label></th><td class="rd-field"><input type="text" id="rvChurch" name="church" class="w-l" maxlength="40" placeholder="예: 새빛누리교회 (개인 신청은 비워 두세요)" value="' + Mock.esc(last.church || '') + '" /></td></tr>' +
					'<tr><th scope="row"><label for="rvReq">요청사항</label></th><td class="rd-field"><textarea id="rvReq" name="request" maxlength="500" placeholder="객실 배정, 식사(채식 등), 건강 관련 요청을 적어 주세요."></textarea><span class="rd-count" id="rvCount">0 / 500</span></td></tr>' +
				'</tbody></table>' +
				'<div class="rd-agree rd-field" id="rvAgreeBox">' +
					'<div class="box">수집 항목: 신청자 이름, 휴대폰 번호, 이메일, 교회·단체명 / 수집 목적: 여행 예약 확인 및 안내 / 보유 기간: 여행 종료 후 5년(전자상거래법). 여행 약관과 취소 수수료 규정은 국외여행 표준약관을 따릅니다. (데모 화면 — 입력한 내용은 이 브라우저에만 저장됩니다)</div>' +
					'<label><input type="checkbox" id="rvAgree1" name="agree1" value="Y" />[필수] 개인정보 수집 · 이용 동의</label>' +
					'<label><input type="checkbox" id="rvAgree2" name="agree2" value="Y" />[필수] 여행 약관 및 취소 규정 확인</label>' +
				'</div>' +
				'<div class="rd-form-btns">' +
					'<a class="rd-btn line lg" href="' + Mock.esc(RD.goodUrl(good.id)) + '">이전으로</a>' +
					'<button type="submit" class="rd-btn lg" id="rvSubmit">예약 신청하기</button>' +
				'</div>' +
			'</div>' +
			'<aside class="rd-rsv-side" aria-label="신청 요약">' +
				'<div class="img"><img src="' + Mock.esc(good.thumb) + '" alt="" /></div>' +
				'<div class="body">' +
					'<h4>' + Mock.esc(good.title) + '</h4>' +
					'<dl><dt>출발일</dt><dd id="sdDep"></dd><dt>귀국일</dt><dd id="sdRet"></dd><dt>예약 상태</dt><dd id="sdSeat"></dd><dt>인원</dt><dd id="sdPeople"></dd><dt>성인 1인</dt><dd id="sdUnit"></dd></dl>' +
					'<div class="total"><span>예상 금액</span><strong id="sdTotal"></strong></div>' +
					'<p class="note">유류할증료 포함 · 가이드/기사 경비 별도. 예약금(1인 50만원)은 담당자 확인 후 안내해 드려요.</p>' +
				'</div>' +
			'</aside>' +
			'</form>'
		);
		updateSide();
	}

	function validate($f) {
		var errs = [], c = calc();
		if (!c.dep) errs.push({ el: '#rvDep', msg: '출발일을 골라 주세요.' });
		if (c.adults < 1) errs.push({ el: '#rvAdult', msg: '성인은 1명 이상이어야 해요.' });
		else if (c.dep && c.adults + c.children > c.dep.seats) errs.push({ el: '#rvAdult', msg: '잔여석(' + c.dep.seats + '석)보다 인원이 많아요. 인원을 줄이거나 단체 상담을 신청해 주세요.' });
		if (c.infants > c.adults) errs.push({ el: '#rvInfant', msg: '유아는 성인 1명당 1명까지 함께할 수 있어요.' });
		var name = $.trim($('#rvName').val());
		if (!name) errs.push({ el: '#rvName', msg: '신청자 이름을 입력해 주세요.' });
		else if (name.length < 2) errs.push({ el: '#rvName', msg: '이름은 2자 이상 입력해 주세요.' });
		var phone = $.trim($('#rvPhone').val());
		if (!phone) errs.push({ el: '#rvPhone', msg: '휴대폰 번호를 입력해 주세요.' });
		else if (!RD.phoneOk(phone)) errs.push({ el: '#rvPhone', msg: '휴대폰 번호 형식을 확인해 주세요. (예: 010-0000-0000)' });
		var email = $.trim($('#rvEmail').val());
		if (email && !RD.emailOk(email)) errs.push({ el: '#rvEmail', msg: '이메일 형식을 확인해 주세요.' });
		if (!$('#rvAgree1').prop('checked') || !$('#rvAgree2').prop('checked')) errs.push({ el: !$('#rvAgree1').prop('checked') ? '#rvAgree1' : '#rvAgree2', msg: '필수 항목에 동의해 주세요.' });
		return RD.showErrors($f, errs);
	}

	function newNo() {
		var no;
		do { no = Mock.uid('RT'); } while (MockDB.find('rothem.reservations', no));
		return no;
	}

	$box.on('change', '#rvDep, #rvAdult, #rvChild, #rvInfant', updateSide);
	$box.on('input', '#rvReq', function () { $('#rvCount').text($(this).val().length + ' / 500'); });
	$box.on('blur', '#rvPhone', function () { $(this).val(RD.formatPhone($(this).val())); });
	$box.on('submit', '#rvForm', function (e) {
		e.preventDefault();
		var $f = $(this);
		if (!validate($f)) return;
		var c = calc(), $btn = $('#rvSubmit');
		$btn.prop('disabled', true).text('신청하는 중…');
		var row = {
			no: newNo(), goodId: good.id, goodTitle: good.title, depDate: c.dep.date,
			adults: c.adults, children: c.children, infants: c.infants, unitPrice: c.unit, total: c.total,
			name: $.trim($('#rvName').val()), phone: RD.formatPhone($('#rvPhone').val()), email: $.trim($('#rvEmail').val()),
			church: $.trim($('#rvChurch').val()), request: $.trim($('#rvReq').val()), status: '접수', createdAt: Mock.now()
		};
		MockApi.create('rothem.reservations', row).then(function (saved) {
			// 잔여석 줄이기 (0 이 되면 마감)
			MockDB.update('rothem.goods', good.id, function (g) {
				g.departures.forEach(function (d) {
					if (d.date === saved.depDate) {
						d.seats = Math.max(0, d.seats - saved.adults - saved.children);
						if (!d.seats) d.status = '마감';
					}
				});
			});
			MockDB.setItem('rothem.lastApplicant', { name: saved.name, phone: saved.phone, email: saved.email, church: saved.church });
			MockDB.setItem('rothem.lastReserve', { no: saved.no, name: saved.name });
			location.href = Mock.url('reserve_done.html', { no: saved.no });
		}, function (err) {
			$btn.prop('disabled', false).text('예약 신청하기');
			Mock.toast('신청하지 못했어요: ' + err.message, { type: 'error' });
		});
	});

	if (!id) { $box.html(RD.empty('상품 번호가 없어요', '<a href="list.html">상품 목록</a>에서 상품을 골라 주세요.')); return; }
	$box.html(RD.loading('예약 정보를 준비하는 중이에요…'));
	MockApi.get('rothem.goods', id).then(function (g) {
		good = g;
		var th = RD.theme(g.theme);
		$('body').attr('data-gnb', th ? th.name : '');
		$('#gnb_re .menu > li > a').filter(function () { return th && $(this).text() === th.name; }).addClass('on');
		render();
	}, function () {
		$box.html(RD.empty('상품을 찾을 수 없어요', '<a href="list.html">상품 목록</a>으로 이동해 보세요.'));
	});
})(jQuery);

/*
 * Cielpia 수강신청 (content/lecture_apply.html)
 *  - ?id=    : 주문 확인 → 학습자·연락처·결제수단·약관 필수 검증 → 가상 결제 → 완료
 *  - ?order= : 신청 완료 화면 (무료 강의는 상세에서 바로 신청 후 이 화면으로 옴)
 *  - 실제 결제는 일어나지 않고 카드 번호 등 결제 정보도 받지 않음
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	var $box = $('#cpApply');
	var orderId = Mock.qs('order'), lectureId = Mock.qs('id');
	var lec = null;

	function steps(n) {
		$('#cpSteps li').each(function (i) {
			$(this).toggleClass('is-on', i + 1 === n).toggleClass('is-done', i + 1 < n);
		});
	}
	function rangeText(e) { return Mock.date(e.createdAt, 'YYYY.MM.DD') + ' ~ ' + Mock.date(e.endAt, 'YYYY.MM.DD'); }

	/* ---------- 신청 완료 ---------- */
	function showDone(e) {
		var l = CP.lecture(e.lectureId), c = MockDB.find('cielpia.children', e.childId);
		steps(3);
		$('#cpApplyTitle').text('수강신청 완료');
		document.title = '수강신청 완료 | LJY Port :: 실제 운영되는 페이지가 아닙니다';
		$box.html(
			'<div class="cp-done">' +
				'<div class="cp-done-ico"><i class="xi-check" aria-hidden="true"></i></div>' +
				'<h2>수강신청이 완료되었어요!</h2>' +
				'<p>내 강의실에서 바로 1차시를 시작할 수 있어요.</p>' +
				'<dl class="cp-receipt">' +
					'<div><dt>주문번호</dt><dd>' + esc(e.id) + '</dd></div>' +
					'<div><dt>강의명</dt><dd><a href="' + CP.viewUrl(e.lectureId) + '" style="color:#222">' + esc(l ? l.title : '') + '</a></dd></div>' +
					'<div><dt>학습자</dt><dd>' + esc(c ? CP.childLabel(c) : '-') + '</dd></div>' +
					'<div><dt>결제 수단</dt><dd>' + esc(CP.PAY[e.payMethod] || e.payMethod) + '</dd></div>' +
					'<div><dt>결제 금액</dt><dd class="is-price">' + CP.price(e.price) + '</dd></div>' +
					'<div><dt>수강 기간</dt><dd>' + rangeText(e) + ' (90일)</dd></div>' +
					'<div><dt>신청 일시</dt><dd>' + Mock.date(e.createdAt, 'YYYY.MM.DD (ddd) HH:mm') + '</dd></div>' +
				'</dl>' +
				'<div class="cp-done-btns">' +
					'<a class="cp-btn cp-btn-blue cp-btn-lg" href="' + Mock.url('../mypage/my_class.html', { open: e.id }) + '" id="cpGoMyClass">내 강의실로 가기</a>' +
					'<a class="cp-btn cp-btn-lg cp-btn-line" href="' + CP.listUrl({}) + '">다른 강의 둘러보기</a>' +
				'</div>' +
			'</div>');
	}

	/* ---------- 주문서 ---------- */
	function radio(name, value, label, sub, checked) {
		return '<label class="cp-radio' + (checked ? ' is-on' : '') + '"><input type="radio" name="' + name + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + ' />' +
			esc(label) + (sub ? ' <small>' + esc(sub) + '</small>' : '') + '</label>';
	}

	function showForm(l) {
		lec = l;
		steps(1);
		var cur = String(CP.currentChild() || '');
		var kids = CP.children();
		var paid = l.price > 0;
		$box.html(
			'<div class="cp-apply">' +
				'<form class="cp-apply-main" id="cpApplyForm" novalidate>' +
					'<div class="cp-box"><h3>신청 강의</h3>' +
						'<div class="cp-order-item"><img src="' + CP.img(l.thumb) + '" alt="" /><div>' +
							'<p class="cp-card-path">' + esc(CP.pathText(l, true)) + '</p>' +
							'<h4>' + esc(l.title) + '</h4>' +
							'<p>' + esc(l.teacherName) + ' · ' + CP.ageText(l) + ' · ' + l.lessons + '차시(총 ' + CP.minText(l.totalMin) + ') · 수강 기간 90일</p>' +
						'</div></div>' +
					'</div>' +

					'<div class="cp-box" data-field="child"><h3>학습자(자녀) 선택<span class="req">* 필수</span></h3>' +
						'<div class="cp-radio-list">' + kids.map(function (c) {
							var fit = c.age >= l.ageMin && c.age <= l.ageMax;
							return radio('childId', c.id, CP.childLabel(c), fit ? '추천 연령' : '', String(c.id) === cur);
						}).join('') + '</div>' +
						'<p class="cp-error">강의를 들을 자녀를 골라 주세요.</p>' +
					'</div>' +

					'<div class="cp-box" data-field="phone"><h3>수강 안내 받을 연락처<span class="req">* 필수</span></h3>' +
						'<div class="cp-field"><label for="cpPhone">휴대폰 번호 (데모라서 실제 문자는 보내지 않아요)</label>' +
						'<input type="tel" class="cp-input" id="cpPhone" name="phone" value="010-0000-1234" maxlength="13" placeholder="010-0000-0000" /></div>' +
						'<p class="cp-error">휴대폰 번호를 010-0000-0000 형식으로 입력해 주세요.</p>' +
					'</div>' +

					(paid ? '<div class="cp-box" data-field="pay"><h3>결제 수단<span class="req">* 필수</span></h3>' +
						'<div class="cp-radio-list">' + radio('payMethod', 'card', CP.PAY.card) + radio('payMethod', 'bank', CP.PAY.bank) + radio('payMethod', 'easy', CP.PAY.easy) + '</div>' +
						'<p class="cp-demo-note"><i class="xi-info-o" aria-hidden="true"></i> 가상 결제예요. 실제로 결제되지 않고 카드 번호 같은 결제 정보도 받지 않아요.</p>' +
						'<p class="cp-error">결제 수단을 골라 주세요.</p>' +
					'</div>' : '') +

					'<div class="cp-box" data-field="agree"><h3>약관 동의<span class="req">* 필수</span></h3>' +
						'<label class="cp-agree"><input type="checkbox" name="agree" value="Y" /><span>[필수] 수강 및 환불 규정을 확인했고 동의해요</span></label>' +
						'<div class="cp-agree-txt">· 수강 기간은 신청일로부터 90일이에요.<br />· 신청 후 7일 이내, 2차시 미만 수강 시 전액 환불돼요. (가상 규정)<br />· 한 번 신청하면 같은 계정의 자녀 모두 함께 볼 수 있어요.</div>' +
						'<p class="cp-error">수강 및 환불 규정에 동의해 주세요.</p>' +
					'</div>' +
				'</form>' +

				'<aside class="cp-apply-side" aria-label="결제 정보">' +
					'<h3 style="font-family:BMJUA;font-weight:normal;font-size:21px;color:#333;margin-bottom:10px">결제 정보</h3>' +
					'<div class="cp-sum-row"><span>수강료</span><span>' + CP.price(l.price) + '</span></div>' +
					'<div class="cp-sum-row"><span>할인</span><span>0원</span></div>' +
					'<div class="cp-sum-row cp-sum-total"><span>최종 결제 금액</span><strong>' + CP.price(l.price) + '</strong></div>' +
					'<button type="submit" form="cpApplyForm" class="cp-btn cp-btn-blue cp-btn-lg" id="cpPay">' + (paid ? CP.price(l.price) + ' 결제하기' : '무료로 신청하기') + '</button>' +
					'<p class="cp-demo-note" style="text-align:center">' + (paid ? '버튼을 누르면 가상 결제가 진행돼요' : '무료 강의는 결제 없이 바로 신청돼요') + '</p>' +
				'</aside>' +
			'</div>');
	}

	function validate($f) {
		var bad = [];
		var child = $f.find('input[name=childId]:checked').val();
		if (!child) bad.push('child');
		var phone = $.trim($f.find('#cpPhone').val());
		if (!/^01[016789]-?\d{3,4}-?\d{4}$/.test(phone)) bad.push('phone');
		if (lec.price > 0 && !$f.find('input[name=payMethod]:checked').val()) bad.push('pay');
		if (!$f.find('input[name=agree]').prop('checked')) bad.push('agree');
		$f.find('[data-field]').each(function () { $(this).toggleClass('is-invalid', bad.indexOf($(this).attr('data-field')) >= 0); });
		return bad;
	}

	$box.on('change', 'input[type=radio]', function () {
		var name = $(this).attr('name');
		$box.find('input[name=' + name + ']').each(function () { $(this).closest('.cp-radio').toggleClass('is-on', this.checked); });
		$(this).closest('[data-field]').removeClass('is-invalid');
	});
	$box.on('change input', 'input[type=checkbox], #cpPhone', function () { $(this).closest('[data-field]').removeClass('is-invalid'); });

	$box.on('submit', '#cpApplyForm', function (e) {
		e.preventDefault();
		var $f = $(this);
		var bad = validate($f);
		if (bad.length) {
			Mock.toast('필수 항목 ' + bad.length + '개를 확인해 주세요', { type: 'error' });
			var $first = $f.find('.is-invalid').first();
			$('html, body').animate({ scrollTop: $first.offset().top - 20 }, 200);
			return;
		}
		if (CP.enrollment(lec.id)) { Mock.toast('이미 신청한 강의예요', { type: 'error' }); return; }
		var paid = lec.price > 0;
		steps(2);
		$('#cpPay').prop('disabled', true).html('<span class="cp-spin" aria-hidden="true"></span>' + (paid ? '가상 결제 진행 중…' : '신청 중…'));
		var row = {
			id: Mock.uid('CP'), lectureId: lec.id, childId: Number($f.find('input[name=childId]:checked').val()),
			price: lec.price, payMethod: paid ? $f.find('input[name=payMethod]:checked').val() : 'free', status: '수강중',
			createdAt: Mock.now(), endAt: Mock.date(Mock.addDays(new Date(), 90)), done: [], lastAt: ''
		};
		Mock.delay(paid ? 700 : 200).then(function () { return MockApi.create('cielpia.enrollments', row); }).then(function (saved) {
			try { history.replaceState(null, '', Mock.url('lecture_apply.html', { order: saved.id })); } catch (er) { /* 무시 */ }
			showDone(saved);
			$('html, body').scrollTop(0);
			Mock.toast(paid ? '가상 결제가 완료되었어요' : '무료 수강신청이 완료되었어요', { type: 'success' });
		}).catch(function (er) {
			steps(1);
			$('#cpPay').prop('disabled', false).text(paid ? CP.price(lec.price) + ' 결제하기' : '무료로 신청하기');
			Mock.toast('신청하지 못했어요: ' + er.message, { type: 'error' });
		});
	});

	/* ---------- 시작 ---------- */
	if (orderId) {
		MockApi.get('cielpia.enrollments', orderId).then(showDone).catch(function () {
			$box.html(CP.empty('신청 내역을 찾을 수 없어요', '데모 데이터를 초기화했다면 신청 내역도 지워져요.', '<a class="cp-btn cp-btn-blue" href="../mypage/my_class.html">내 강의실로</a>'));
		});
	} else if (lectureId) {
		MockApi.get('cielpia.lectures', lectureId).then(function (l) {
			var enr = CP.enrollment(l.id);
			if (enr) {
				$box.html(CP.empty('이미 신청한 강의예요', '「' + l.title + '」는 내 강의실에서 바로 이어 볼 수 있어요.',
					'<a class="cp-btn cp-btn-blue" href="' + Mock.url('../mypage/my_class.html', { open: enr.id }) + '">내 강의실로 가기</a>'));
				return;
			}
			showForm(l);
		}).catch(function () {
			$box.html(CP.empty('강의를 찾을 수 없어요', '주소가 잘못되었어요.', '<a class="cp-btn cp-btn-blue" href="lecture_list.html">강의 목록으로</a>'));
		});
	} else {
		$box.html(CP.empty('신청할 강의를 먼저 골라 주세요', '', '<a class="cp-btn cp-btn-blue" href="lecture_list.html">강의 목록으로</a>'));
	}
})(jQuery);

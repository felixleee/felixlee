/*
 * 로뎀투어 데모 — 예약 신청 완료 (good/reserve_done.html?no=)
 */
(function ($) {
	'use strict';

	var no = Mock.qs('no'), $box = $('#rdDone');

	function people(r) {
		return '성인 ' + r.adults + '명' + (r.children ? ' · 아동 ' + r.children + '명' : '') + (r.infants ? ' · 유아 ' + r.infants + '명' : '');
	}

	if (!no) { $box.html(RD.empty('신청번호가 없어요', '<a href="reserve_check.html">예약조회</a>에서 신청 내역을 확인해 주세요.')); return; }
	$box.html(RD.loading('신청 내역을 확인하는 중이에요…'));
	MockApi.get('rothem.reservations', no).then(function (r) {
		var g = MockDB.find('rothem.goods', r.goodId);
		$box.html(
			'<div class="rd-done">' +
				'<span class="ico" aria-hidden="true"><i class="fa fa-check"></i></span>' +
				'<h2>예약 신청이 접수되었어요</h2>' +
				'<p>' + Mock.esc(r.name) + '님, 로뎀투어를 찾아 주셔서 감사합니다. 담당자가 확인한 뒤 1영업일 안에 ' + Mock.esc(r.phone) + ' 로 연락드릴게요.</p>' +
				'<p class="no"><small>신청번호</small>' + Mock.esc(r.no) + '</p>' +
			'</div>' +
			'<h3 class="rd-box-tit">신청 내용</h3>' +
			'<table class="rd-form"><tbody>' +
				'<tr><th scope="row">상품명</th><td><a href="' + Mock.esc(RD.goodUrl(r.goodId)) + '"><strong>' + Mock.esc(r.goodTitle) + '</strong></a></td></tr>' +
				'<tr><th scope="row">출발일</th><td>' + Mock.date(r.depDate, 'YYYY.MM.DD (ddd)') + (g ? ' ~ ' + Mock.date(Mock.addDays(r.depDate, g.days - 1), 'YYYY.MM.DD (ddd)') + ' (' + RD.period(g) + ')' : '') + '</td></tr>' +
				'<tr><th scope="row">인원</th><td>' + people(r) + '</td></tr>' +
				'<tr><th scope="row">예상 금액</th><td><strong style="color:#1f79cb">' + Mock.won(r.total) + '</strong> <span class="rd-help">(성인 1인 ' + Mock.won(r.unitPrice) + ' 기준)</span></td></tr>' +
				'<tr><th scope="row">신청자</th><td>' + Mock.esc(r.name) + ' · ' + Mock.esc(r.phone) + (r.email ? ' · ' + Mock.esc(r.email) : '') + '</td></tr>' +
				(r.church ? '<tr><th scope="row">교회 · 단체</th><td>' + Mock.esc(r.church) + '</td></tr>' : '') +
				(r.request ? '<tr><th scope="row">요청사항</th><td>' + Mock.esc(r.request).replace(/\n/g, '<br>') + '</td></tr>' : '') +
				'<tr><th scope="row">진행 상태</th><td>' + RD.badge(r.status) + ' <span class="rd-help">' + Mock.date(r.createdAt, 'YYYY.MM.DD HH:mm') + ' 신청</span></td></tr>' +
			'</tbody></table>' +
			'<div class="rd-notice-box"><ul>' +
				'<li>예약금 <strong>1인 50만원</strong>은 담당자 확인 전화 후 아래 계좌로 입금해 주세요. 입금이 확인되면 <strong>예약확정</strong>으로 바뀝니다.</li>' +
				'<li>입금 계좌: 하나은행 012-345678-90123 / 국민은행 123456-78-987654 (예금주: (주)샘플샘플)</li>' +
				'<li>신청 내역은 상단 [예약조회] 메뉴에서 신청자 이름과 신청번호로 언제든 확인할 수 있어요.</li>' +
			'</ul></div>' +
			'<div class="rd-form-btns">' +
				'<a class="rd-btn line lg" href="../main/pure_main.html">메인으로</a>' +
				'<a class="rd-btn line lg" href="list.html">다른 상품 보기</a>' +
				'<a class="rd-btn lg" id="rdGoCheck" href="' + Mock.esc(Mock.url('reserve_check.html', { no: r.no })) + '">내 신청 조회</a>' +
			'</div>'
		);
	}, function () {
		$box.html(RD.empty('신청 내역을 찾을 수 없어요', '신청번호를 확인하거나 <a href="reserve_check.html">예약조회</a>에서 다시 찾아 주세요.'));
	});
})(jQuery);

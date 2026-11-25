/*
 * Monami France 데모 — 후기 쓰기 (review/write.html?tourId=)
 * 필수값(투어·별점·제목·내용 20자·작성자) 검증 → monami.reviews 에 저장 → 목록(?new=id)으로 이동
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var $form = $('#wrForm');

	var tours = MockDB.all(C.tours).sort(function (a, b) { return a.sort - b.sort; });
	$('#wrTour').append(tours.map(function (t) { return '<option value="' + t.id + '">' + Mock.esc(t.name) + '</option>'; }).join(''));
	var pre = Mock.qs('tourId');
	if (D.tour(pre)) $('#wrTour').val(pre);
	$('#wrCancel').attr('href', D.url.reviews({ tourId: D.tour(pre) ? pre : '' }));

	// 별점
	var LABEL = ['', '별로였어요', '아쉬웠어요', '보통이에요', '좋았어요', '최고였어요'];
	function setRate(v) {
		$form.find('[name=rating]').val(v || '');
		$('#wrRate button').each(function () { $(this).toggleClass('on', Number($(this).attr('data-v')) <= v).attr('aria-checked', Number($(this).attr('data-v')) === v ? 'true' : 'false'); });
		$('#wrRateTxt').text(v ? v + '점 · ' + LABEL[v] : '별을 눌러 골라 주세요');
	}
	$('#wrRate').on('click', 'button', function () {
		setRate(Number($(this).attr('data-v')));
		$(this).closest('td').find('.dm-err').remove();
	});
	$('#wrRate').attr('role', 'radiogroup').find('button').attr('role', 'radio');
	setRate(0);

	// 여행 날짜 (오늘 이전만)
	$('#wrTravel').datepicker({
		dateFormat: 'yy-mm-dd', maxDate: 0, minDate: -730, showMonthAfterYear: true, yearSuffix: '년',
		monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
		dayNamesMin: D.WEEK, prevText: '이전 달', nextText: '다음 달'
	}).on('click', function () { $(this).datepicker('show'); });

	$('#wrContent').on('input', function () { $('#wrCount').text(this.value.length); });

	$form.on('submit', function (e) {
		e.preventDefault();
		var ok = D.validate($form, [
			{ name: 'tourId', label: '투어', required: true, msg: '다녀온 투어를 골라 주세요.' },
			{ name: 'rating', label: '별점', required: true, msg: '별점을 골라 주세요.' },
			{ name: 'title', label: '제목', required: true, min: 2 },
			{ name: 'content', label: '내용', required: true, min: 20 },
			{ name: 'author', label: '작성자', required: true, pattern: /^[가-힣a-zA-Z\s]{2,20}$/, patternMsg: '작성자는 한글 또는 영문 2~20자로 입력해 주세요.' }
		]);
		if (!ok) return;
		var v = function (n) { return $.trim($form.find('[name="' + n + '"]').val() || ''); };
		var $btn = $('#wrSubmit').addClass('is-busy').text('등록하는 중…');
		MockApi.create(C.reviews, {
			tourId: Number(v('tourId')), best: 0, rating: Number(v('rating')), author: D.mask(v('author')), views: 0,
			title: v('title'), content: v('content'), image: '', travelDate: v('travelDate'), createdAt: Mock.now()
		}).then(function (r) {
			location.href = D.url.reviews({ 'new': r.id });
		}, function (err) {
			$btn.removeClass('is-busy').text('후기 등록');
			Mock.toast(err.message || '등록하지 못했어요', { type: 'error' });
		});
	});
})(jQuery, window.Demo);

/*
 * 로뎀투어 데모 — 글쓰기 (cmm/write.html?BD_CD=REVIEW[&goodId=])
 *  - 여행후기만 고객이 쓸 수 있다. 단체문의(QNA)는 상담 신청 폼으로, 나머지는 관리자 전용 안내
 *  - 저장하면 rothem.posts 에 추가하고 방금 쓴 글(view.html)로 이동
 */
(function ($) {
	'use strict';

	var bd = (Mock.qs('BD_CD') || 'REVIEW').toUpperCase(), B = RD.BOARDS[bd], $box = $('#rdWrite');

	if (bd === 'QNA') { location.replace(RD.inquiryUrl({ goodId: Mock.qs('goodId') })); return; }
	if (!B) { bd = 'REVIEW'; B = RD.BOARDS.REVIEW; }
	$('#rdBoardTitle').text(B.name + ' 쓰기');
	$('#rdLocBoard').text(B.name).attr('href', RD.boardUrl(bd));
	document.title = B.name + ' 쓰기 | 로뎀투어 - LJY Port :: 실제 운영되는 페이지가 아닙니다';

	if (!B.write) {
		$('#rdBoardDesc').text(B.desc);
		$box.html(RD.empty('이 게시판은 관리자만 글을 쓸 수 있어요', '여행 후기는 <a href="write.html?BD_CD=REVIEW">여행후기 쓰기</a>, 단체 상담은 <a href="inquiry_travel.html?BD_CD=QNA">상담 신청</a>을 이용해 주세요.'));
		return;
	}
	$('#rdBoardDesc').text('다녀온 순례 이야기를 나눠 주세요. 다른 분들이 상품을 고를 때 큰 도움이 됩니다.');

	var goods = MockDB.all('rothem.goods');
	var want = Mock.qs('goodId');
	var last = MockDB.getItem('rothem.lastApplicant', null) || {};

	$box.html(
		'<form id="wrForm" action="view.html" method="post" novalidate>' +
		'<table class="rd-form"><tbody>' +
			'<tr><th scope="row"><label for="wrName">작성자<span class="rd-req">*</span></label></th><td class="rd-field"><input type="text" id="wrName" name="name" class="w-m" maxlength="20" value="' + Mock.esc(last.name || '') + '" /><p class="rd-help">목록에는 가운데 글자를 가려서(예: 김*혜) 보여 줘요.</p></td></tr>' +
			'<tr><th scope="row"><label for="wrGood">다녀온 상품<span class="rd-req">*</span></label></th><td class="rd-field"><select id="wrGood" name="goodId" class="w-full"><option value="">상품을 고르세요</option>' +
				RD.THEMES.map(function (th) {
					return '<optgroup label="' + Mock.esc(th.name) + '">' + goods.filter(function (g) { return g.theme === th.code; }).map(function (g) {
						return '<option value="' + g.id + '"' + (String(g.id) === String(want) ? ' selected' : '') + '>' + Mock.esc(g.title) + '</option>';
					}).join('') + '</optgroup>';
				}).join('') +
			'</select></td></tr>' +
			'<tr><th scope="row">별점<span class="rd-req">*</span></th><td class="rd-field"><span class="rd-rating-pick" role="radiogroup" aria-label="별점">' +
				[5, 4, 3, 2, 1].map(function (n) { return '<input type="radio" name="rating" id="wrR' + n + '" value="' + n + '"' + (n === 5 ? ' checked' : '') + ' /><label for="wrR' + n + '" title="' + n + '점">★</label>'; }).join('') +
			'</span> <span id="wrRatingTxt" class="rd-help" style="display:inline">5점</span></td></tr>' +
			'<tr><th scope="row"><label for="wrTitle">제목<span class="rd-req">*</span></label></th><td class="rd-field"><input type="text" id="wrTitle" name="title" class="w-full" maxlength="60" placeholder="예: 2026.11.03~11.11 이스라엘, 요르단 9일 순례를 다녀와서" /></td></tr>' +
			'<tr><th scope="row"><label for="wrContent">내용<span class="rd-req">*</span></label></th><td class="rd-field"><textarea id="wrContent" name="content" maxlength="2000" style="min-height:240px" placeholder="가장 기억에 남는 장소, 인솔자 · 일정 · 숙소 · 식사에 대한 이야기를 들려주세요. (20자 이상)"></textarea><span class="rd-count" id="wrCount">0 / 2000</span></td></tr>' +
		'</tbody></table>' +
		'<div class="rd-form-btns"><a class="rd-btn line lg" href="' + Mock.esc(RD.boardUrl(bd)) + '">취소</a><button type="submit" class="rd-btn lg" id="wrSubmit">후기 등록</button></div>' +
		'</form>'
	);

	$box.on('change', 'input[name=rating]', function () { $('#wrRatingTxt').text(this.value + '점'); });
	$box.on('input', '#wrContent', function () { $('#wrCount').text($(this).val().length + ' / 2000'); });
	$box.on('submit', '#wrForm', function (e) {
		e.preventDefault();
		var $f = $(this), errs = [];
		var name = $.trim($('#wrName').val()), goodId = $('#wrGood').val(), title = $.trim($('#wrTitle').val()), content = $.trim($('#wrContent').val());
		var rating = +$f.find('input[name=rating]:checked').val() || 0;
		if (!name) errs.push({ el: '#wrName', msg: '작성자 이름을 입력해 주세요.' });
		if (!goodId) errs.push({ el: '#wrGood', msg: '다녀온 상품을 골라 주세요.' });
		if (!rating) errs.push({ el: '#wrR5', msg: '별점을 골라 주세요.' });
		if (!title) errs.push({ el: '#wrTitle', msg: '제목을 입력해 주세요.' });
		else if (title.length < 5) errs.push({ el: '#wrTitle', msg: '제목은 5자 이상 입력해 주세요.' });
		if (!content) errs.push({ el: '#wrContent', msg: '내용을 입력해 주세요.' });
		else if (content.length < 20) errs.push({ el: '#wrContent', msg: '내용은 20자 이상 입력해 주세요. (지금 ' + content.length + '자)' });
		if (!RD.showErrors($f, errs)) return;
		$('#wrSubmit').prop('disabled', true).text('등록하는 중…');
		MockApi.create('rothem.posts', { bd: bd, name: name, goodId: +goodId, rating: rating, title: title, content: content, createdAt: Mock.now(), hits: 0 }).then(function (p) {
			location.href = RD.viewUrl(bd, p.id, { 'new': 1 });
		}, function (err) {
			$('#wrSubmit').prop('disabled', false).text('후기 등록');
			Mock.toast('등록하지 못했어요: ' + err.message, { type: 'error' });
		});
	});
})(jQuery);

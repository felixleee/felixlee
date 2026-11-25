/*
 * Monami France 데모 — 자주 묻는 질문 (notice/faq.html?cate=booking|tour|refund|etc)
 * 푸터의 '취소 및 환불 정책' 은 ?cate=refund 로 들어와 첫 질문을 펼친다.
 */
(function ($, D) {
	'use strict';
	var C = D.COL;
	var cate = D.FAQ_CATE[Mock.qs('cate')] ? Mock.qs('cate') : '';
	var $list = $('#fqList');

	function load(openFirst) {
		$('#fqCate button').each(function () { $(this).toggleClass('on', $(this).attr('data-v') === cate); });
		$('#dmPageTitle').text(cate ? '자주 묻는 질문 · ' + D.FAQ_CATE[cate] : '자주 묻는 질문');
		D.syncQuery({ cate: cate });
		D.loading($list, '질문을 불러오는 중이에요…');
		MockApi.list(C.faqs, { filter: { cate: cate }, sort: 'id' }).then(function (res) {
			if (!res.total) { D.empty($list, '등록된 질문이 없어요.'); return; }
			$list.html(res.items.map(function (f, i) {
				return '<li class="' + (openFirst && i === 0 ? 'open' : '') + '">' +
					'<button type="button" class="dm-faq-q" aria-expanded="' + (openFirst && i === 0) + '" aria-controls="faq-a-' + f.id + '"><span class="mk">Q</span><span class="cate">' + D.FAQ_CATE[f.cate] + '</span>' + Mock.esc(f.q) + '<i class="xi-angle-down ar"></i></button>' +
					'<div class="dm-faq-a" id="faq-a-' + f.id + '">' + D.br(f.a) + '</div></li>';
			}).join(''));
		}, function (e) { D.fail($list, e); });
	}

	$('#fqCate').on('click', 'button', function () { cate = $(this).attr('data-v'); load(false); });
	$list.on('click', '.dm-faq-q', function () {
		var $li = $(this).closest('li').toggleClass('open');
		$(this).attr('aria-expanded', $li.hasClass('open') ? 'true' : 'false');
	});
	load(cate === 'refund');
})(jQuery, window.Demo);

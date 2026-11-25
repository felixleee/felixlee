/*
 * 로뎀투어 데모 — 단체 견적 문의 (cmm/inquiry_travel.html?BD_CD=QNA[&goodId=])
 *  - 필수값 검증 → rothem.posts 에 QNA '접수' 비밀글로 저장 → 단체문의 목록(index.html?BD_CD=QNA&new=)으로 이동
 *  - 내가 쓴 글 번호는 MockDB.setItem('rothem.myQna') 에 기억 → 목록 · 보기에서 잠금 없이 열림
 */
(function ($) {
	'use strict';

	var $f = $('#rdInquiry');
	var goods = MockDB.all('rothem.goods');
	var want = Mock.qs('goodId'), wantGood = want ? MockDB.find('rothem.goods', want) : null;

	/* 선택 항목 채우기 */
	$('#iqTheme').append(RD.THEMES.map(function (t) { return '<option value="' + t.code + '">' + Mock.esc(t.name) + '</option>'; }).join('') + '<option value="etc">기타 · 미정</option>');
	$('#iqGood').append(RD.THEMES.map(function (th) {
		return '<optgroup label="' + Mock.esc(th.name) + '">' + goods.filter(function (g) { return g.theme === th.code; }).map(function (g) {
			return '<option value="' + g.id + '" data-theme="' + g.theme + '">' + Mock.esc(g.title) + '</option>';
		}).join('') + '</optgroup>';
	}).join(''));
	(function () {
		var d = new Date(), html = '';
		for (var i = 1; i <= 12; i++) {
			var t = new Date(d.getFullYear(), d.getMonth() + i, 1);
			html += '<option value="' + Mock.date(t, 'YYYY-MM') + '">' + Mock.date(t, 'YYYY년 MM월') + '</option>';
		}
		$('#iqMonth').append(html + '<option value="undecided">미정 (상담 후 결정)</option>');
	})();
	if (wantGood) { $('#iqGood').val(wantGood.id); $('#iqTheme').val(wantGood.theme); }
	var last = MockDB.getItem('rothem.lastApplicant', null);
	if (last) { $('#iqName').val(last.name || ''); $('#iqPhone').val(last.phone || ''); $('#iqEmail').val(last.email || ''); $('#iqChurch').val(last.church || ''); }

	$('#iqGood').on('change', function () {
		var t = $(this).find('option:selected').attr('data-theme');
		if (t) $('#iqTheme').val(t);
	});
	$('#iqContent').on('input', function () { $('#iqCount').text($(this).val().length + ' / 1000'); });
	$('#iqPhone').on('blur', function () { $(this).val(RD.formatPhone($(this).val())); });

	$f.on('submit', function (e) {
		e.preventDefault();
		var v = {
			church: $.trim($('#iqChurch').val()), name: $.trim($('#iqName').val()), phone: $.trim($('#iqPhone').val()), email: $.trim($('#iqEmail').val()),
			theme: $('#iqTheme').val(), goodId: $('#iqGood').val(), month: $('#iqMonth').val(), people: $.trim($('#iqPeople').val()),
			title: $.trim($('#iqTitle').val()), content: $.trim($('#iqContent').val())
		};
		var errs = [], n = parseInt(v.people, 10);
		if (!v.church) errs.push({ el: '#iqChurch', msg: '교회 · 단체명을 입력해 주세요.' });
		if (!v.name) errs.push({ el: '#iqName', msg: '담당자 이름을 입력해 주세요.' });
		if (!v.phone) errs.push({ el: '#iqPhone', msg: '휴대폰 번호를 입력해 주세요.' });
		else if (!RD.phoneOk(v.phone)) errs.push({ el: '#iqPhone', msg: '휴대폰 번호 형식을 확인해 주세요. (예: 010-0000-0000)' });
		if (v.email && !RD.emailOk(v.email)) errs.push({ el: '#iqEmail', msg: '이메일 형식을 확인해 주세요.' });
		if (!v.theme) errs.push({ el: '#iqTheme', msg: '희망 여행 테마를 골라 주세요.' });
		if (!v.month) errs.push({ el: '#iqMonth', msg: '희망 출발 시기를 골라 주세요.' });
		if (!v.people) errs.push({ el: '#iqPeople', msg: '예상 인원을 입력해 주세요.' });
		else if (!(n >= 1 && n <= 300) || String(n) !== v.people) errs.push({ el: '#iqPeople', msg: '예상 인원은 1~300 사이 숫자로 입력해 주세요.' });
		if (!v.content) errs.push({ el: '#iqContent', msg: '문의 내용을 입력해 주세요.' });
		else if (v.content.length < 10) errs.push({ el: '#iqContent', msg: '문의 내용은 10자 이상 입력해 주세요.' });
		if (!$('#iqAgree').prop('checked')) errs.push({ el: '#iqAgree', msg: '개인정보 수집 · 이용에 동의해 주세요.' });
		if (!RD.showErrors($f, errs)) return;

		var th = RD.theme(v.theme);
		var row = {
			bd: 'QNA', secret: true, status: '접수', hits: 0, createdAt: Mock.now(),
			church: v.church, name: v.name, phone: RD.formatPhone(v.phone), email: v.email,
			theme: th ? th.code : '', goodId: v.goodId ? +v.goodId : null, month: v.month === 'undecided' ? '' : v.month, people: n,
			title: v.title || '[견적문의] ' + (th ? th.name : '성지순례') + ' — ' + n + '명 단체',
			content: v.content
		};
		$('#iqSubmit').prop('disabled', true).text('신청하는 중…');
		MockApi.create('rothem.posts', row).then(function (p) {
			var mine = MockDB.getItem('rothem.myQna', []);
			mine.push(p.id);
			MockDB.setItem('rothem.myQna', mine);
			MockDB.setItem('rothem.lastApplicant', $.extend(MockDB.getItem('rothem.lastApplicant', {}) || {}, { name: v.name, phone: row.phone, email: v.email, church: v.church }));
			location.href = RD.boardUrl('QNA', { 'new': p.id });
		}, function (err) {
			$('#iqSubmit').prop('disabled', false).text('상담 신청하기');
			Mock.toast('신청하지 못했어요: ' + err.message, { type: 'error' });
		});
	});
})(jQuery);

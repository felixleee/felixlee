/*
 * Cielpia 메인 (main/pure_main.html)
 *  - 카테고리 6개 + 호버 하위메뉴(data-idx)를 가상 데이터에서 렌더링 (원래 마크업 구조 그대로)
 *  - 하위메뉴 오른쪽 목록: 원래 getAjax("category/category_3/" + idx) → CPMain.rightCate(idx)
 *  - Class Case 슬라이드 6장, 글로벌리더 국가 팝업('국가1~5' 자리)을 데이터로 채움
 *  이 파일은 원래 인라인 스크립트(Swiper 초기화·이벤트 연결) 바로 앞에서 불러와
 *  렌더링이 끝난 뒤 Swiper 가 초기화되도록 한다.
 */
(function ($) {
	'use strict';
	var esc = CP.esc;
	CP.isMain = true;

	/* ---------- 1. 카테고리 아이콘 + 호버 하위메뉴 ---------- */
	var html = CP.groups().map(function (g) {
		var levels = CP.levels(g.id);
		var left = levels.map(function (lv) {
			return '\n                            <li data-idx="' + esc(lv.id) + '">' +
				'\n                                <a href="javascript:;">' +
				'\n                                    · ' + esc(lv.name) + ' <i class="xi-angle-right-thin"></i>' +
				'\n                                </a>' +
				'\n                            </li>';
		}).join('\n');
		return '\n                <li class="picBTN ' + g.pic + '" data-cate="' + g.id + '">' +
			'\n                    <a title="' + esc(g.name) + (g.nationPopup ? ' 국가 선택' : ' 강의 보기') + '">' +
			'\n                        <div class="img_box">' +
			'\n                            <img class="common_st" src="../image/web/main/' + g.icon + '.png" alt="">' +
			'\n                            <img class="hover_st" src="../image/web/main/' + g.icon + '_blue.png" alt="">' +
			'\n                        </div>' +
			'\n                        <span>' + esc(g.name) + '</span>' +
			'\n                    </a>' +
			'\n                    <div class="sub_menu">' +
			'\n                        <ul class="left_cate">' + left + '\n                        </ul>' +
			'\n                        <ul class="right_cate"></ul>' +
			'\n                    </div>' +
			'\n                </li>';
	}).join('');
	$('#category_group').html(html + '\n            ');

	// 하위메뉴 오른쪽(3단계) 목록 — 원래 서버가 돌려주던 response.html 자리
	window.CPMain = {
		rightCate: function (idx) {
			var lv = CP.cate(idx);
			if (!lv) return '';
			var areas = CP.areas(lv.parent);
			var count = function (area) {
				return MockDB.count('cielpia.lectures', function (l) { return l.level === lv.id && (!area || l.area === area); });
			};
			return '<li><a href="' + CP.listUrl({ cate: lv.id }) + '">· 전체 보기 <em class="cp-cnt">' + count() + '</em></a></li>' +
				areas.map(function (a) {
					return '<li><a href="' + CP.listUrl({ cate: lv.id, area: a.id }) + '">· ' + esc(a.name) + ' <em class="cp-cnt">' + count(a.id) + '</em></a></li>';
				}).join('');
		}
	};

	// 아이콘 클릭 → 강의 목록 (글로벌리더는 국가 선택 팝업)
	$('#category_group').on('click', 'li.picBTN > a', function () {
		var id = $(this).parent().attr('data-cate'), g = CP.cate(id);
		if (g && g.nationPopup) { openNation(); return; }
		window.location.href = CP.listUrl({ cate: id });
	});

	/* ---------- 2. Class Case 슬라이드 ---------- */
	var cases = MockDB.all('cielpia.classcases').sort(function (a, b) { return a.order - b.order; });
	$('.swiper-container-3pcs.class .swiper-wrapper').html(cases.map(function (c) {
		var l = CP.lecture(c.lectureId);
		var title = l ? l.title : '';
		return '\n                        <div  class="swiper-slide"><a href="' + CP.viewUrl(c.lectureId) + '" title="' + esc(title) + '">' +
			'<img src="../image/web/main/' + esc(c.img) + '" alt="' + esc(title) + '" />' +
			(l ? '<span class="cp-case-cap"><em>' + esc(CP.pathText(l, true)) + '</em>' + esc(title) + '</span>' : '') +
			'</a></div>';
	}).join('') + '\n                    ');

	/* ---------- 3. 글로벌리더 국가 팝업 ---------- */
	function renderNations() {
		var cur = (MockDB.getItem('cielpia.nation', null) || {}).id;
		var nations = MockDB.all('cielpia.nations').sort(function (a, b) { return a.order - b.order; });
		$('#img_list').html(nations.map(function (n) {
			return '\n                        <span' + (n.id === cur ? ' class="cp-on"' : '') + '><a href="' + CP.listUrl({ cate: 'global', area: n.area }) + '" data-nation="' + n.id + '">' +
				'<i class="cp-flag cp-flag-' + n.id + '" aria-hidden="true"></i>' +
				'\n                                <p>' + esc(n.name) + ' · ' + esc(n.lang) + '</p>' +
				'\n                            </a></span>';
		}).join('') + '\n                    ');
	}
	function openNation() {
		renderNations();
		$('#nation_detail').css('display', 'flex').hide().fadeIn(200);
	}
	function closeNation() { $('#nation_detail').fadeOut(200); }
	renderNations();
	$('#nation_detail').on('click', '.xi-close', closeNation)
		.on('click', function (e) { if (e.target === this) closeNation(); })
		.on('click', 'a[data-nation]', function (e) {
			e.preventDefault();
			var n = MockDB.find('cielpia.nations', $(this).attr('data-nation'));
			if (!n) return;
			MockDB.setItem('cielpia.nation', { id: n.id, name: n.name, lang: n.lang, area: n.area, at: Mock.now() });
			$('#img_list span').removeClass('cp-on');
			$(this).parent().addClass('cp-on');
			Mock.toast(n.greet + ' ' + n.name + '(' + n.lang + ') 과정을 선택했어요', { type: 'success' });
			CP.flash(n.name + '(' + n.lang + ') 글로벌리더 강의를 모았어요', 'success');
			var href = this.href;
			setTimeout(function () { window.location.href = href; }, 900);
		});
	CPMain.openNation = openNation;
})(jQuery);

/*
 * 로뎀투어 데모 — 공통 도우미 (window.RD)
 *  - 테마 · 코스 · 게시판 정의, 경로 만들기, 템플릿, 로딩/결과 없음, 페이징, 폼 검증
 *  - 모든 화면이 rothem/<폴더>/<파일>.html 한 단계 아래에 있으므로 경로는 '../' 기준
 *  - 필요: jQuery 1.9.1, mock/mock-api.js, data/goods.js
 */
(function ($, w) {
	'use strict';

	var RD = {};

	/* ---------- 상품 분류 ---------- */
	RD.THEMES = [
		{ code: 'exodus', name: '출애굽', desc: '이스라엘 · 요르단 · 이집트, 출애굽의 길과 예수님의 생애를 따라가는 순례', courses: [
			{ code: 'isr-jor', name: '이스라엘+요르단' }, { code: 'egy-isr-jor', name: '이집트+이스라엘+요르단' },
			{ code: 'isr', name: '이스라엘 일주' }, { code: 'isr-jor-dxb', name: '이스라엘+요르단+두바이' }] },
		{ code: 'paul', name: '바울여정', desc: '튀르키예 · 그리스 · 로마, 사도 바울의 전도여행 경로를 따라가는 순례', courses: [
			{ code: 'tur-grc', name: '튀르키예+그리스' }, { code: 'tur-grc-ita', name: '튀르키예+그리스+로마' },
			{ code: 'tur', name: '튀르키예 일주' }, { code: 'grc', name: '그리스 일주' }] },
		{ code: 'reform', name: '종교개혁지', desc: '루터 · 칼뱅 · 츠빙글리 · 얀 후스의 발자취를 찾아가는 유럽 종교개혁지 순례', courses: [
			{ code: 'reform5', name: '종교개혁지 5국' }] },
		{ code: 'holyland', name: '성지완전일주', desc: '이스라엘과 튀르키예 · 로마를 잇는 성지완전일주 순례', courses: [
			{ code: 'isr-jor-tur', name: '이스라엘+요르단+튀르키예' }, { code: 'isr-ita', name: '이스라엘+이태리' },
			{ code: 'isr-tur', name: '이스라엘+튀르키예' }] }
	];
	RD.theme = function (code) {
		for (var i = 0; i < RD.THEMES.length; i++) if (RD.THEMES[i].code === code) return RD.THEMES[i];
		return null;
	};
	RD.course = function (code) {
		for (var i = 0; i < RD.THEMES.length; i++) {
			var cs = RD.THEMES[i].courses;
			for (var j = 0; j < cs.length; j++) if (cs[j].code === code) return $.extend({ theme: RD.THEMES[i].code }, cs[j]);
		}
		return null;
	};
	RD.COUNTRIES = ['이스라엘', '요르단', '이집트', '튀르키예', '그리스', '이탈리아', '독일', '체코', '오스트리아', '스위스', '아랍에미리트'];
	RD.AIRLOGO = {
		'카타르항공': 'air1.jpg', '러시아항공': 'air2.jpg', '대한항공': 'air3.jpg', '아시아나항공': 'air4.jpg', '에티하드항공': 'air5.jpg',
		'폴란드항공': 'air6.jpg', '터키항공': 'air7.jpg', '에티오피아항공': 'air8.jpg', '에미레이트항공': 'air9.jpg', '사우디항공': 'air10.jpg'
	};
	RD.airLogo = function (airline) { return RD.AIRLOGO[airline] ? '../image/main/' + RD.AIRLOGO[airline] : ''; };

	/* ---------- 게시판 ---------- */
	RD.BOARDS = {
		NOTICE: { name: '공지사항', type: 'list', desc: '로뎀투어의 새 소식과 여행 안내를 전해 드립니다.' },
		REVIEW: { name: '여행후기', type: 'list', write: true, desc: '로뎀투어와 함께한 순례자들의 생생한 후기입니다.' },
		ONLINE: { name: '극동방송 랜선 성지순례', type: 'list', desc: '일정을 따라 하루씩 떠나는 랜선 성지순례입니다.' },
		COLUMN: { name: '극동방송 성서의 땅 칼럼', type: 'list', desc: '성경 속 장소의 배경과 의미를 소개합니다.' },
		PRESS: { name: '보도자료', type: 'list', desc: '로뎀투어 소식을 전해 드립니다.' },
		FAQ: { name: '자주묻는질문', type: 'faq', desc: '예약부터 현지 생활까지 자주 묻는 질문을 모았습니다.' },
		GRP101: { name: '단체여행 갤러리', type: 'photo', desc: '교회 · 단체 순례의 소중한 순간을 모았습니다.' },
		QNA: { name: '단체문의', type: 'qna', desc: '교회 · 단체 맞춤 견적 상담 게시판입니다. 문의 글은 비밀글로 등록됩니다.' }
	};
	RD.BOARD_ORDER = ['NOTICE', 'REVIEW', 'ONLINE', 'COLUMN', 'PRESS', 'FAQ', 'GRP101', 'QNA'];

	/* ---------- 경로 ---------- */
	RD.home = '../main/pure_main.html';
	RD.goodUrl = function (id, extra) { return Mock.url('../good/detail.html', $.extend({ id: id }, extra)); };
	RD.listUrl = function (params) { return Mock.url('../good/list.html', params); };
	RD.reserveUrl = function (id, dep) { return Mock.url('../good/reserve.html', { id: id, dep: dep }); };
	RD.boardUrl = function (bd, params) { return Mock.url('../cmm/index.html', $.extend({ BD_CD: bd }, params)); };
	RD.viewUrl = function (bd, id, extra) { return Mock.url('../cmm/view.html', $.extend({ BD_CD: bd, id: id }, extra)); };
	RD.inquiryUrl = function (params) { return Mock.url('../cmm/inquiry_travel.html', $.extend({ BD_CD: 'QNA' }, params)); };

	/* ---------- 상품 도우미 ---------- */
	RD.today = function () { return Mock.rel(0); };
	/** 오늘 이후 출발일 (날짜순) */
	RD.upcoming = function (g) {
		var t = RD.today();
		return (g.departures || []).filter(function (d) { return d.date >= t; }).sort(function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : 0; });
	};
	RD.isOpen = function (d) { return d.status !== '마감' && d.seats > 0; };
	/** 예약 가능한 출발일 중 최저가 (없으면 기본가) */
	RD.minPrice = function (g) {
		var ps = RD.upcoming(g).filter(RD.isOpen).map(function (d) { return d.price; });
		return ps.length ? Math.min.apply(null, ps) : g.price;
	};
	/** '출발확정 - 2026년 12/4, 12/18' (원래 화면 문구 형식) */
	RD.confirmText = function (g, max) {
		var list = RD.upcoming(g).filter(function (d) { return d.status === '출발확정' && d.seats > 0; }).slice(0, max || 4);
		if (!list.length) return '출발일 상담 가능';
		return '출발확정 - ' + Mock.toDate(list[0].date).getFullYear() + '년 ' + list.map(function (d) {
			var t = Mock.toDate(d.date); return (t.getMonth() + 1) + '/' + t.getDate();
		}).join(', ');
	};
	RD.period = function (g) { return g.nights + '박 ' + g.days + '일'; };
	RD.countriesText = function (g) { return (g.countries || []).join(' · '); };
	RD.searchText = function (g) {
		var th = RD.theme(g.theme), cs = RD.course(g.course);
		var places = [];
		(g.itinerary || []).forEach(function (d) { places.push(d.title); places = places.concat(d.places); });
		return [g.title, (g.countries || []).join(' '), th ? th.name : '', cs ? cs.name : '', g.airline, places.join(' ')].join(' ').toLowerCase();
	};

	/* ---------- 표시 ---------- */
	RD.esc = function (s) { return Mock.esc(s); };
	/** '{{key}}' 는 이스케이프, '{{{key}}}' 는 그대로 */
	RD.tpl = function (html, data) {
		return String(html).replace(/\{\{\{(\w+)\}\}\}|\{\{(\w+)\}\}/g, function (m, raw, key) {
			if (raw) return data[raw] == null ? '' : data[raw];
			return data[key] == null ? '' : Mock.esc(data[key]);
		});
	};
	RD.tplOf = function (id) { var el = document.getElementById(id); return el ? el.innerHTML.replace(/^\s+|\s+$/g, '') : ''; };
	RD.mask = function (name) {
		name = String(name || '');
		if (name.length <= 1) return name;
		if (name.length === 2) return name.charAt(0) + '*';
		return name.charAt(0) + new Array(name.length - 1).join('*') + name.charAt(name.length - 1);
	};
	RD.stars = function (n) {
		n = Math.max(0, Math.min(5, Number(n) || 0));
		return '<span class="rd-stars" title="별점 ' + n + '점">' + new Array(n + 1).join('★') + '<em>' + new Array(6 - n).join('★') + '</em></span>';
	};
	RD.paras = function (text) {
		return String(text || '').split(/\n{2,}/).map(function (p) { return '<p>' + Mock.esc(p).replace(/\n/g, '<br>') + '</p>'; }).join('');
	};
	RD.loading = function (msg) { return '<div class="rd-loading" role="status"><span class="rd-spin" aria-hidden="true"></span>' + Mock.esc(msg || '불러오는 중이에요…') + '</div>'; };
	RD.empty = function (msg, sub) { return '<div class="rd-empty"><i class="fa fa-info-circle" aria-hidden="true"></i><p>' + Mock.esc(msg || '결과가 없어요') + '</p>' + (sub ? '<p class="rd-empty-sub">' + sub + '</p>' : '') + '</div>'; };
	RD.statusCls = function (s) { return { '출발확정': 'ok', '예약가능': 'open', '마감': 'close', '접수': 'new', '상담중': 'ing', '답변완료': 'done', '예약확정': 'ok', '취소': 'close' }[s] || 'open'; };
	RD.badge = function (s) { return '<span class="rd-badge rd-badge-' + RD.statusCls(s) + '">' + Mock.esc(s) + '</span>'; };

	/** 페이징 — 원래 사이트 .page 느낌의 번호 목록. a[data-page] 를 호출한 쪽에서 처리 */
	RD.pager = function (res) {
		if (!res || res.pages <= 1) return '';
		var r = Mock.pageRange(res.page, res.pages, 5), h = '<div class="rd-paging" role="navigation" aria-label="페이지">';
		h += '<a href="#" data-page="1" class="rd-pg-edge' + (res.page === 1 ? ' is-disabled' : '') + '" aria-label="처음">&laquo;</a>';
		h += '<a href="#" data-page="' + Math.max(1, res.page - 1) + '" class="rd-pg-edge' + (res.page === 1 ? ' is-disabled' : '') + '" aria-label="이전">&lsaquo;</a>';
		r.list.forEach(function (p) { h += '<a href="#" data-page="' + p + '"' + (p === res.page ? ' class="on" aria-current="page"' : '') + '>' + p + '</a>'; });
		h += '<a href="#" data-page="' + Math.min(res.pages, res.page + 1) + '" class="rd-pg-edge' + (res.page === res.pages ? ' is-disabled' : '') + '" aria-label="다음">&rsaquo;</a>';
		h += '<a href="#" data-page="' + res.pages + '" class="rd-pg-edge' + (res.page === res.pages ? ' is-disabled' : '') + '" aria-label="마지막">&raquo;</a>';
		return h + '</div>';
	};

	/** 주소창 쿼리만 바꾸기 (file:// 에서도 경로가 같으면 허용됨) */
	RD.replaceQuery = function (params) {
		try { w.history.replaceState(null, '', Mock.url(w.location.pathname.split('/').pop(), params)); } catch (e) { /* 무시 */ }
	};

	/* ---------- 폼 검증 ---------- */
	RD.phoneOk = function (s) { return /^01[016789]-?\d{3,4}-?\d{4}$/.test(String(s || '').trim()); };
	RD.emailOk = function (s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim()); };
	RD.formatPhone = function (s) {
		var d = String(s || '').replace(/\D/g, '');
		if (d.length === 11) return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7);
		if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
		return String(s || '').trim();
	};
	/** errors: [{ el: jQuery|selector, msg }] → 칸 아래 메시지 + 첫 칸으로 이동. 오류가 없으면 true */
	RD.showErrors = function ($form, errors) {
		$form.find('.rd-err').remove();
		$form.find('.is-invalid').removeClass('is-invalid').removeAttr('aria-invalid');
		if (!errors.length) return true;
		errors.forEach(function (e) {
			var $el = $(e.el).first();
			$el.addClass('is-invalid').attr('aria-invalid', 'true');
			var $box = $el.closest('.rd-field');
			($box.length ? $box : $el.parent()).append('<p class="rd-err" role="alert">' + Mock.esc(e.msg) + '</p>');
		});
		var $first = $(errors[0].el).first();
		try { $('html, body').scrollTop(Math.max(0, $first.offset().top - 140)); } catch (er) { /* 무시 */ }
		$first.focus();
		Mock.toast(errors[0].msg, { type: 'error' });
		return false;
	};

	/* ---------- 헤더 · 퀵메뉴 ---------- */
	RD.bookmark = function () { Mock.toast('Ctrl+D (Mac 은 ⌘+D) 를 눌러 즐겨찾기에 추가해 주세요'); return false; };
	RD.SEARCH_HINT = '여행지를 입력하세요.';

	/** 최근 본 상품 (퀵메뉴 #quick_good_list) */
	RD.pushRecent = function (id) {
		var list = MockDB.getItem('rothem.recent', []).filter(function (x) { return String(x) !== String(id); });
		list.unshift(id);
		MockDB.setItem('rothem.recent', list.slice(0, 5));
	};
	RD.renderRecent = function () {
		var $box = $('#quick_good_list');
		if (!$box.length || !MockDB.has('rothem.goods')) return;
		var items = MockDB.getItem('rothem.recent', []).map(function (id) { return MockDB.find('rothem.goods', id); }).filter(Boolean).slice(0, 2);
		if (!items.length) { $box.empty(); return; }
		$box.html('<p class="rd-recent-tit">최근 본 상품</p>' + items.map(function (g) {
			return '<a class="rd-recent" href="' + RD.esc(RD.goodUrl(g.id)) + '" title="' + RD.esc(g.title) + '"><img src="' + RD.esc(g.thumb) + '" alt="' + RD.esc(g.title) + '"></a>';
		}).join(''));
	};

	/** 새 화면(body.rd-page)의 헤더 동작 — 메인은 원래 인라인 스크립트가 처리 */
	RD.initLayout = function () {
		var $b = $('body');
		if ($b.hasClass('rd-page')) {
			// 현재 메뉴 표시
			var gnb = $b.attr('data-gnb');
			if (gnb) $('#gnb_re .menu > li > a').filter(function () { return $(this).text() === gnb; }).addClass('on');
			// 고객센터 왼쪽 메뉴
			var bd = (Mock.qs('BD_CD') || '').toUpperCase();
			$('#rdLnb li').filter(function () { return $(this).attr('data-bd') === bd; }).addClass('on');
		}
		// 헤더 검색: 안내 문구 그대로 보내지 않기
		$('form[name=top_search_frm]').on('submit', function () {
			var $i = $(this).find('input[name=g_title_s]');
			if ($.trim($i.val()) === RD.SEARCH_HINT) $i.val('');
		});
		// 목록 화면에서 검색어 유지
		var kw = Mock.qs('g_title_s');
		if (kw && kw !== RD.SEARCH_HINT) $('form[name=top_search_frm] input[name=g_title_s]').val(kw);
		RD.renderRecent();
	};

	w.RD = RD;
	$(function () { RD.initLayout(); });
})(jQuery, window);

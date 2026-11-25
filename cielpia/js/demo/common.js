/*
 * Cielpia 데모 공통 스크립트 (모든 화면)
 *  - 데이터 조회 도우미 · 강의 카드 · 페이징 · 로딩/결과 없음 · 모달 · 찜하기
 *  - 헤더 공통: 설정 팝업(언어·통화, 원래 POST /setting/set_language) 저장,
 *               자녀선택 팝업(원래 POST /setting/set_child) 저장,
 *               검색폼(원래 GET /search) → content/search.html?q=
 *               모바일 사이드메뉴 '강의' 분류를 데이터에서 렌더링
 *  불러오는 순서: jQuery → mock/mock-api.js → data/*.js → 이 파일
 */
(function ($) {
	'use strict';

	var IMG_DIR = '../image/web/main/';
	var USD_RATE = 1400; // 가상 환율
	var PAY = { card: '신용카드', bank: '실시간 계좌이체', easy: '간편결제', free: '무료 신청' };
	var esc = Mock.esc;

	function byOrder(a, b) { return (a.order || 0) - (b.order || 0); }

	var CP = {
		PAY: PAY,
		IMG_DIR: IMG_DIR,
		esc: esc,
		img: function (file) { return IMG_DIR + file; },

		/* ---------- 분류 ---------- */
		cate: function (id) { return id == null || id === '' ? null : MockDB.find('cielpia.categories', id); },
		groups: function () { return MockDB.where('cielpia.categories', function (c) { return c.depth === 1; }).sort(byOrder); },
		levels: function (group) { return MockDB.where('cielpia.categories', function (c) { return c.depth === 2 && c.parent === group; }).sort(byOrder); },
		areas: function (group) { return MockDB.where('cielpia.categories', function (c) { return c.depth === 3 && c.group === group; }).sort(byOrder); },
		/** cate 파라미터(depth1 id 또는 depth2 idx) → { group, level } */
		resolveCate: function (cate) {
			var c = CP.cate(cate);
			if (!c) return { group: '', level: '' };
			if (c.depth === 1) return { group: c.id, level: '' };
			if (c.depth === 2) return { group: c.parent, level: c.id };
			return { group: c.group, level: '' };
		},
		listUrl: function (params) { return Mock.url('../content/lecture_list.html', params || {}); },
		viewUrl: function (id) { return Mock.url('../content/lecture_view.html', { id: id }); },

		/* ---------- 강의 ---------- */
		lecture: function (id) { return MockDB.find('cielpia.lectures', id); },
		teacher: function (id) { return MockDB.find('cielpia.teachers', id); },
		pathText: function (l, withGroup) {
			var g = CP.cate(l.group), lv = CP.cate(l.level), ar = CP.cate(l.area), out = [];
			if (withGroup && g) out.push(g.name);
			if (lv && lv.name !== '공통') out.push(lv.name);
			if (ar) out.push(ar.name);
			return out.join(' · ');
		},
		ageText: function (l) { return '만 ' + l.ageMin + '~' + l.ageMax + '세'; },
		minText: function (m) {
			m = Number(m) || 0;
			if (m < 60) return m + '분';
			return Math.floor(m / 60) + '시간' + (m % 60 ? ' ' + (m % 60) + '분' : '');
		},
		setting: function () { return $.extend({ lang: 'ko', currency: 'KRW' }, MockDB.getItem('cielpia.setting', {})); },
		price: function (n) {
			if (!n) return '무료';
			if (CP.setting().currency === 'USD') return 'US$ ' + (n / USD_RATE).toFixed(2);
			return Mock.won(n);
		},
		stars: function (r) {
			var pct = Math.max(0, Math.min(100, (Number(r) || 0) / 5 * 100));
			return '<span class="cp-stars" role="img" aria-label="평점 ' + r + '점"><span class="cp-stars-on" style="width:' + pct + '%">★★★★★</span>★★★★★</span>';
		},

		/* ---------- 자녀(학습자) ---------- */
		children: function () { return MockDB.all('cielpia.children'); },
		currentChild: function () { return MockDB.getItem('cielpia.child', ''); }, // '' = 전체 자녀
		childLabel: function (c) { return c ? c.name + ' (만 ' + c.age + '세)' : ''; },

		/* ---------- 찜 · 수강 ---------- */
		wished: function (lectureId) { return MockDB.count('cielpia.wishes', function (w) { return String(w.lectureId) === String(lectureId); }) > 0; },
		toggleWish: function (lectureId) {
			var rows = MockDB.where('cielpia.wishes', function (w) { return String(w.lectureId) === String(lectureId); });
			if (rows.length) { MockDB.remove('cielpia.wishes', rows.map(function (w) { return w.id; })); return false; }
			MockDB.insert('cielpia.wishes', { lectureId: Number(lectureId), createdAt: Mock.now() });
			return true;
		},
		enrollment: function (lectureId) {
			var rows = MockDB.where('cielpia.enrollments', function (e) { return String(e.lectureId) === String(lectureId); });
			return rows.length ? rows[0] : null;
		},
		progress: function (enr, lec) {
			lec = lec || CP.lecture(enr.lectureId);
			var total = lec ? lec.lessons : 0, done = (enr.done || []).length;
			return { done: done, total: total, pct: total ? Math.round(done / total * 100) : 0 };
		},

		/** 검색어 강조 — 이스케이프한 뒤 <mark> */
		mark: function (text, q) {
			var t = esc(text);
			q = $.trim(q || '');
			if (!q) return t;
			var re = new RegExp(esc(q).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
			return t.replace(re, function (m) { return '<mark>' + m + '</mark>'; });
		},

		/* ---------- 마크업 조각 ---------- */
		card: function (l, opts) {
			opts = opts || {};
			var g = CP.cate(l.group), on = CP.wished(l.id), enr = CP.enrollment(l.id);
			return '<li class="cp-card">' +
				'<a class="cp-card-link" href="' + CP.viewUrl(l.id) + '">' +
					'<div class="cp-thumb"><img src="' + CP.img(l.thumb) + '" alt="" />' +
						'<div class="cp-badges"><span class="cp-badge cp-g-' + l.group + '">' + esc(g ? g.name : '') + '</span>' +
						(l.price ? '' : '<span class="cp-badge cp-free">무료</span>') +
						(enr ? '<span class="cp-badge cp-mine">' + (enr.status === '수강완료' ? '수강완료' : '수강중') + '</span>' : '') +
					'</div></div>' +
					'<div class="cp-card-body">' +
						'<p class="cp-card-path">' + esc(CP.pathText(l)) + '</p>' +
						'<h4 class="cp-card-title">' + CP.mark(l.title, opts.q) + '</h4>' +
						'<p class="cp-card-meta">' + CP.mark(l.teacherName, opts.q) + ' · ' + CP.ageText(l) + ' · ' + l.lessons + '차시</p>' +
						'<p class="cp-card-foot"><span class="cp-card-rate">★ ' + l.rating.toFixed(1) + ' <em>(' + Mock.num(l.reviews) + ')</em></span>' +
						'<strong class="cp-card-price' + (l.price ? '' : ' is-free') + '">' + CP.price(l.price) + '</strong></p>' +
					'</div>' +
				'</a>' +
				CP.wishBtn(l.id, on) +
			'</li>';
		},
		wishBtn: function (id, on, cls) {
			return '<button type="button" class="cp-wish' + (cls ? ' ' + cls : '') + (on ? ' is-on' : '') + '" data-wish="' + id + '" aria-pressed="' + on + '" title="찜하기">' +
				'<i class="' + (on ? 'xi-heart' : 'xi-heart-o') + '" aria-hidden="true"></i><span class="cp-blind">찜하기</span></button>';
		},
		loading: function (msg) { return '<div class="cp-loading" role="status"><span class="cp-spin" aria-hidden="true"></span>' + esc(msg || '강의를 불러오는 중이에요') + '</div>'; },
		empty: function (title, desc, actionHtml) {
			return '<div class="cp-empty"><p class="cp-empty-tit">' + esc(title) + '</p>' + (desc ? '<p class="cp-empty-desc">' + esc(desc) + '</p>' : '') + (actionHtml || '') + '</div>';
		},
		paging: function (res) {
			if (!res || res.pages <= 1) return '';
			var r = Mock.pageRange(res.page, res.pages, 5), h = '';
			h += '<button type="button" data-page="' + Math.max(1, res.page - 1) + '"' + (res.page === 1 ? ' disabled' : '') + ' aria-label="이전 페이지">&lt;</button>';
			r.list.forEach(function (p) { h += '<button type="button" data-page="' + p + '"' + (p === res.page ? ' class="is-on" aria-current="page"' : '') + '>' + p + '</button>'; });
			h += '<button type="button" data-page="' + Math.min(res.pages, res.page + 1) + '"' + (res.page === res.pages ? ' disabled' : '') + ' aria-label="다음 페이지">&gt;</button>';
			return h;
		},

		/* ---------- 알림 · 모달 ---------- */
		/** 다음 화면에서 띄울 토스트 (페이지 이동 직전에 사용) */
		flash: function (msg, type) { MockDB.setItem('cielpia.flash', { msg: msg, type: type || '' }); },
		modal: function (html, opts) {
			opts = opts || {};
			CP.closeModal();
			var $m = $('<div class="cp-modal" role="dialog" aria-modal="true"><div class="cp-modal-box' + (opts.cls ? ' ' + opts.cls : '') + '">' +
				'<button type="button" class="cp-modal-x" aria-label="닫기"><i class="xi-close" aria-hidden="true"></i></button>' + html + '</div></div>');
			$('body').append($m);
			setTimeout(function () { $m.addClass('is-open'); }, 10);
			$m.on('click', function (e) { if (e.target === this || $(e.target).closest('.cp-modal-x, [data-close]').length) CP.closeModal(); });
			return $m;
		},
		closeModal: function () { $('.cp-modal').remove(); }
	};

	window.CP = CP;

	/* ================= 페이지 공통 동작 ================= */

	// 모바일 사이드메뉴 '강의' 분류 (원래 비어 있던 자리)
	function renderSideCategory() {
		var $box = $('#sidemenu h4 + .side_category');
		if (!$box.length) return;
		var html = CP.groups().map(function (g) {
			var levels = CP.levels(g.id), areas = CP.areas(g.id), sub;
			if (levels.length > 1) {
				sub = '<ul class="sub_menu third_cate">' + levels.map(function (lv) {
					return '<li><a class="third_tit" href="javascript:;">' + esc(lv.name) + ' <i class="xi-angle-down"></i></a>' +
						'<ul class="third_menu"><li><a href="' + CP.listUrl({ cate: lv.id }) + '">전체</a></li>' +
						areas.map(function (a) { return '<li><a href="' + CP.listUrl({ cate: lv.id, area: a.id }) + '">' + esc(a.name) + '</a></li>'; }).join('') +
						'</ul></li>';
				}).join('') + '</ul>';
			} else {
				sub = '<ul class="sub_menu"><li><a href="' + CP.listUrl({ cate: g.id }) + '">전체</a></li>' +
					areas.map(function (a) { return '<li><a href="' + CP.listUrl({ cate: g.id, area: a.id }) + '">' + esc(a.name) + '</a></li>'; }).join('') + '</ul>';
			}
			return '<p class="menu"><span>' + esc(g.name) + '</span><i class="xi-angle-down"></i></p>' + sub;
		}).join('');
		$box.html(html);
	}

	// 설정 팝업(언어·통화) — 원래 POST /setting/set_language
	function initSetting() {
		var s = CP.setting();
		$('#flag_language_' + (s.lang === 'en' ? 'en' : 'kr')).prop('checked', true);
		$('#flag_current_' + (s.currency === 'USD' ? 'usd' : 'krw')).prop('checked', true);
		$(document).on('click', '.lang_select a.ok_btn', function () {
			var next = {
				lang: $('input[name=flag_language]:checked').val() === '2' ? 'en' : 'ko',
				currency: $('input[name=flag_current]:checked').val() === '2' ? 'USD' : 'KRW'
			};
			var prev = CP.setting();
			MockDB.setItem('cielpia.setting', next);
			var msg = '설정을 저장했어요 · ' + (next.lang === 'en' ? '영어' : '한국어') + ' / ' + next.currency;
			if (next.lang === 'en' && prev.lang !== 'en') msg += ' (영어 화면은 데모에서 준비 중이에요)';
			if (next.currency !== prev.currency) {
				CP.flash(msg + (next.currency === 'USD' ? ' — 가상 환율 1 USD = ' + Mock.num(USD_RATE) + '원' : ''), 'success');
				setTimeout(function () { location.reload(); }, 250);
			} else {
				Mock.toast(msg, { type: 'success' });
			}
		});
	}

	// 자녀선택 팝업 — 원래 POST /setting/set_child (트리거: a.child_select_btn)
	function initChild() {
		var $ul = $('.child_select .select_wrap ul');
		if ($ul.length) {
			var cur = String(CP.currentChild());
			var opts = [{ id: '', label: '전체 자녀' }].concat(CP.children().map(function (c) { return { id: String(c.id), label: CP.childLabel(c) }; }));
			$ul.html('<li><p>학습자를 골라 주세요</p>' + opts.map(function (o) {
				var id = 'child_idx_' + (o.id || 'all');
				return '<div class="input"><input type="radio" name="child_idx" value="' + o.id + '" id="' + id + '"' + (o.id === cur ? ' checked' : '') + ' /><label for="' + id + '">' + esc(o.label) + '</label></div>';
			}).join('') + '</li>');
		}
		$(document).on('click', 'a.child_select_btn', function () {
			$('div.child_select').css('display', 'flex').hide().fadeIn();
		});
		$(document).on('click', '.child_select a.ok_btn', function () {
			var v = $('input[name=child_idx]:checked').val() || '';
			MockDB.setItem('cielpia.child', v ? Number(v) : '');
			var c = v ? MockDB.find('cielpia.children', v) : null;
			Mock.toast(c ? c.name + ' 학습자로 바꿨어요' : '전체 자녀의 강의를 보여 줄게요', { type: 'success' });
			$(document).trigger('cp:child');
		});
	}

	// 검색 — 원래 GET /search
	function initSearch() {
		$(document).on('submit', '#searchForm, .cp-search-form', function (e) {
			e.preventDefault();
			var $in = $(this).find('input[type=text], input[type=search]').first();
			var v = $.trim($in.val() || '');
			if (!v) {
				$('#search_alert').text('검색어를 입력하세요');
				$(this).find('.cp-search-alert').text('검색어를 입력하세요');
				$in.trigger('focus');
				return false;
			}
			location.href = Mock.url('../content/search.html', { q: v });
			return false;
		});
		// 메인은 원래 인라인 스크립트가 #search_btn 을 처리하므로 다른 화면에서만 연결
		if (!CP.isMain) {
			$(document).on('click', '#search_btn', function () { $('#searchForm').trigger('submit'); });
		}
		$(document).on('input', '#main_search, .cp-search-form input', function () { $('#search_alert, .cp-search-alert').text(''); });
	}

	// 찜하기 버튼 (카드·상세 공통)
	function initWish() {
		$(document).on('click', '[data-wish]', function (e) {
			e.preventDefault();
			e.stopPropagation();
			var id = $(this).attr('data-wish');
			var on = CP.toggleWish(id);
			$('[data-wish="' + id + '"]').each(function () {
				$(this).toggleClass('is-on', on).attr('aria-pressed', on)
					.find('i').attr('class', on ? 'xi-heart' : 'xi-heart-o');
				$(this).find('.cp-wish-txt').text(on ? '찜 완료' : '찜하기');
			});
			Mock.toast(on ? '찜 목록에 담았어요 (내 강의실 > 찜한 강의)' : '찜을 해제했어요', { type: on ? 'success' : '' });
			$(document).trigger('cp:wish', [id, on]);
		});
	}

	function showFlash() {
		var f = MockDB.getItem('cielpia.flash', null);
		if (f && f.msg) {
			MockDB.removeItem('cielpia.flash');
			setTimeout(function () { Mock.toast(f.msg, { type: f.type || '', duration: 3200 }); }, 200);
		}
	}

	$(function () {
		renderSideCategory();
		initSetting();
		initChild();
		initSearch();
		initWish();
		showFlash();
		$(document).on('keydown', function (e) { if (e.key === 'Escape') CP.closeModal(); });
	});
})(jQuery);

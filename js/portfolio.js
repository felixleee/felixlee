/* Lee Jae Youn — Portfolio: 테마 전환 · 프로젝트 필터 · 헤더 · 맨 위로 */
(function () {
	'use strict';

	var root = document.documentElement;
	var KEY = 'portfolio-theme';

	/* ---------- 테마 ---------- */
	var themeBtn = document.getElementById('themeBtn');
	function setTheme(t) {
		if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
		var meta = document.querySelector('meta[name="theme-color"]');
		if (meta) meta.setAttribute('content', t === 'light' ? '#fbf8f0' : '#161412');
		themeBtn.setAttribute('aria-pressed', t === 'light' ? 'true' : 'false');
		try { localStorage.setItem(KEY, t); } catch (e) { /* 비공개 창 등 */ }
	}
	themeBtn.addEventListener('click', function () {
		setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light');
	});
	themeBtn.setAttribute('aria-pressed', root.getAttribute('data-theme') === 'light' ? 'true' : 'false');

	/* ---------- 프로젝트 필터 ---------- */
	var cards = Array.prototype.slice.call(document.querySelectorAll('#projectGrid .card'));
	var buttons = Array.prototype.slice.call(document.querySelectorAll('.filters [data-filter]'));
	var empty = document.getElementById('projectEmpty');

	function tagsOf(card) { return (card.getAttribute('data-tags') || '').split(/\s+/); }
	function matches(card, f) { return f === 'all' || tagsOf(card).indexOf(f) >= 0; }

	buttons.forEach(function (b) {
		var f = b.getAttribute('data-filter');
		var n = cards.filter(function (c) { return matches(c, f); }).length;
		var c = b.querySelector('.count');
		if (c) c.textContent = n;
		if (!n && f !== 'all') b.hidden = true;
	});
	document.getElementById('statTotal').textContent = cards.length;
	document.getElementById('statDemo').textContent = cards.filter(function (c) { return matches(c, 'demo'); }).length;

	function applyFilter(f) {
		var shown = 0;
		cards.forEach(function (c) {
			var on = matches(c, f);
			c.hidden = !on;
			if (on) shown++;
		});
		buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filter') === f ? 'true' : 'false'); });
		empty.classList.toggle('is-on', shown === 0);
	}
	buttons.forEach(function (b) {
		b.addEventListener('click', function () { applyFilter(b.getAttribute('data-filter')); });
	});
	// 히어로의 '데모' 타일 → 데모만 걸러서 프로젝트로 이동
	Array.prototype.forEach.call(document.querySelectorAll('[data-jump-filter]'), function (el) {
		el.addEventListener('click', function () {
			applyFilter(el.getAttribute('data-jump-filter'));
			document.getElementById('projects').scrollIntoView({ behavior: 'smooth', block: 'start' });
		});
	});

	/* ---------- 헤더 경계선 · 맨 위로 ---------- */
	var header = document.querySelector('.site-header');
	var goTop = document.getElementById('goTop');
	function onScroll() {
		var y = window.scrollY || document.documentElement.scrollTop;
		header.classList.toggle('is-scrolled', y > 4);
		goTop.classList.toggle('is-on', y > 600);
	}
	window.addEventListener('scroll', onScroll, { passive: true });
	onScroll();
	goTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

	var year = document.getElementById('year');
	if (year) year.textContent = new Date().getFullYear();
})();

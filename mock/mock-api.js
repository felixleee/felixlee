/*!
 * Mock API — 포트폴리오 데모용 가상 데이터 계층
 *
 * - 데이터는 각 사이트의 data/*.js 에서 MockDB.define() 으로 등록한다.
 *   (JSON fetch 대신 스크립트라서 GitHub Pages 와 file:// 양쪽에서 똑같이 동작)
 * - 등록/수정/삭제한 내용은 localStorage 에 저장되어 페이지를 옮기거나 새로고침해도 남는다.
 *   화면 왼쪽 아래 DEMO 배지의 [초기화] 를 누르면 처음 데이터로 돌아간다.
 * - MockApi.* 는 실제 API 처럼 Promise 를 돌려주고 약간 늦게 응답한다.
 *
 * 사용 순서:  <script src="(루트)/mock/mock-api.js"></script>
 *             <script src="../data/tours.js"></script>      ← MockDB.define(...)
 *             <script src="../js/tour_list.js"></script>    ← MockApi.list(...).then(render)
 */
(function (global) {
	'use strict';

	var NS = 'felixlee.mock:';
	var registry = {};     // name -> { key, version, seed }
	var cache = {};        // name -> 현재 rows
	var memoryStore = {};  // localStorage 를 못 쓸 때 대신 쓰는 저장소
	var listeners = {};    // name -> [fn]

	/* ---------- 저장소 ---------- */
	function lsGet(k) {
		try { var v = global.localStorage.getItem(k); if (v !== null) return v; } catch (e) { /* 비공개 창 등 */ }
		return Object.prototype.hasOwnProperty.call(memoryStore, k) ? memoryStore[k] : null;
	}
	function lsSet(k, v) {
		try { global.localStorage.setItem(k, v); delete memoryStore[k]; } catch (e) { memoryStore[k] = v; }
	}
	function lsDel(k) {
		try { global.localStorage.removeItem(k); } catch (e) { /* 무시 */ }
		delete memoryStore[k];
	}
	function lsKeys() {
		var out = [];
		try { for (var i = 0; i < global.localStorage.length; i++) out.push(global.localStorage.key(i)); } catch (e) { /* 무시 */ }
		Object.keys(memoryStore).forEach(function (k) { if (out.indexOf(k) < 0) out.push(k); });
		return out;
	}

	function clone(v) { return v == null ? v : JSON.parse(JSON.stringify(v)); }
	function getPath(obj, path) {
		if (obj == null) return undefined;
		if (path.indexOf('.') < 0) return obj[path];
		return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
	}

	/* ---------- MockDB : 동기 저장소 ---------- */
	function define(name, rows, opts) {
		opts = opts || {};
		registry[name] = {
			key: opts.key || 'id',
			version: String(opts.version == null ? '1' : opts.version),
			seed: clone(rows || [])
		};
		delete cache[name];
		return MockDB;
	}

	function reg(name) {
		var r = registry[name];
		if (!r) throw new Error('[MockDB] 정의되지 않은 컬렉션: ' + name + ' (data 스크립트를 먼저 불러와야 해요)');
		return r;
	}

	function load(name) {
		var r = reg(name);
		if (cache[name]) return cache[name];
		var raw = lsGet(NS + name), parsed = null;
		if (raw) { try { parsed = JSON.parse(raw); } catch (e) { parsed = null; } }
		cache[name] = (parsed && parsed.v === r.version && Array.isArray(parsed.rows)) ? parsed.rows : clone(r.seed);
		return cache[name];
	}

	function persist(name) {
		lsSet(NS + name, JSON.stringify({ v: reg(name).version, rows: cache[name] }));
		emit(name, 'local');
	}

	function indexOfId(name, id) {
		var key = reg(name).key, rows = load(name);
		for (var i = 0; i < rows.length; i++) if (String(rows[i][key]) === String(id)) return i;
		return -1;
	}

	function nextId(name) {
		var key = reg(name).key, rows = load(name), numeric = rows.length > 0, max = 0;
		rows.forEach(function (r) {
			var n = Number(r[key]);
			if (r[key] === '' || r[key] == null || isNaN(n)) numeric = false; else if (n > max) max = n;
		});
		return numeric || rows.length === 0 ? max + 1 : Mock.uid();
	}

	var MockDB = {
		define: define,
		has: function (name) { return !!registry[name]; },
		all: function (name) { return clone(load(name)); },
		find: function (name, id) { var i = indexOfId(name, id); return i < 0 ? null : clone(load(name)[i]); },
		where: function (name, pred) { return clone(load(name).filter(pred)); },
		count: function (name, pred) { return pred ? load(name).filter(pred).length : load(name).length; },
		nextId: nextId,
		insert: function (name, row) {
			var key = reg(name).key, item = clone(row) || {};
			if (item[key] == null || item[key] === '') item[key] = nextId(name);
			if (indexOfId(name, item[key]) >= 0) throw new Error('[MockDB] 이미 있는 ' + key + ': ' + item[key]);
			load(name).push(item);
			persist(name);
			return clone(item);
		},
		update: function (name, id, patch) {
			var i = indexOfId(name, id);
			if (i < 0) return null;
			var rows = load(name), key = reg(name).key;
			if (typeof patch === 'function') { var res = patch(rows[i]); if (res && typeof res === 'object') rows[i] = res; }
			else Object.keys(patch || {}).forEach(function (k) { if (k !== key) rows[i][k] = clone(patch[k]); });
			persist(name);
			return clone(rows[i]);
		},
		remove: function (name, ids) {
			var list = Array.isArray(ids) ? ids.map(String) : [String(ids)], key = reg(name).key, rows = load(name), n = 0;
			for (var i = rows.length - 1; i >= 0; i--) if (list.indexOf(String(rows[i][key])) >= 0) { rows.splice(i, 1); n++; }
			if (n) persist(name);
			return n;
		},
		/** name 을 주면 그 컬렉션만, 없으면 데모 데이터 전부를 처음 상태로 */
		reset: function (name) {
			if (name) { lsDel(NS + name); delete cache[name]; emit(name, 'reset'); return; }
			lsKeys().forEach(function (k) { if (k.indexOf(NS) === 0) lsDel(k); });
			Object.keys(cache).forEach(function (n) { delete cache[n]; });
			Object.keys(registry).forEach(function (n) { emit(n, 'reset'); });
		},
		isModified: function (name) { return lsGet(NS + name) !== null; },
		/** 다른 탭에서 바뀐 것까지 알려 준다. fn(source) — 'local' | 'remote' | 'reset' */
		on: function (name, fn) { (listeners[name] = listeners[name] || []).push(fn); return function () { listeners[name] = (listeners[name] || []).filter(function (f) { return f !== fn; }); }; },
		/** 컬렉션에 속하지 않는 작은 값(최근 본 상품, 로그인 흉내 등) */
		getItem: function (k, fallback) { var v = lsGet(NS + 'kv:' + k); if (v === null) return fallback; try { return JSON.parse(v); } catch (e) { return fallback; } },
		setItem: function (k, v) { lsSet(NS + 'kv:' + k, JSON.stringify(v)); },
		removeItem: function (k) { lsDel(NS + 'kv:' + k); }
	};

	function emit(name, source) {
		(listeners[name] || []).slice().forEach(function (fn) { try { fn(source); } catch (e) { console.error(e); } });
	}

	try {
		global.addEventListener('storage', function (e) {
			if (!e.key || e.key.indexOf(NS) !== 0 || e.key.indexOf(NS + 'kv:') === 0) return;
			var name = e.key.slice(NS.length);
			delete cache[name];
			emit(name, 'remote');
		});
	} catch (e) { /* 무시 */ }

	/* ---------- 조회 조건 처리 ---------- */
	function compare(a, b) {
		if (a == null && b == null) return 0;
		if (a == null) return 1;
		if (b == null) return -1;
		if (typeof a === 'number' && typeof b === 'number') return a - b;
		return String(a).localeCompare(String(b), 'ko', { numeric: true });
	}

	/**
	 * q = {
	 *   filter:  { 'status': '예약확정', 'cate': ['A','B'] }  또는  function(row){}
	 *   keyword: '파리',  fields: ['title', 'summary']
	 *   sort:    '-createdAt'  또는  ['status', '-price']   (- 는 내림차순)
	 *   page: 1,  size: 10    (size 가 없으면 전부)
	 * }
	 * → { items, total, page, size, pages }
	 */
	function query(rows, q) {
		q = q || {};
		var out = rows.slice();
		if (typeof q.filter === 'function') out = out.filter(q.filter);
		else if (q.filter && typeof q.filter === 'object') {
			Object.keys(q.filter).forEach(function (k) {
				var want = q.filter[k];
				if (want == null || want === '' || (Array.isArray(want) && !want.length)) return;
				out = out.filter(function (r) {
					var got = getPath(r, k);
					return Array.isArray(want) ? want.map(String).indexOf(String(got)) >= 0 : String(got) === String(want);
				});
			});
		}
		var kw = q.keyword == null ? '' : String(q.keyword).trim().toLowerCase();
		if (kw && q.fields && q.fields.length) {
			out = out.filter(function (r) {
				return q.fields.some(function (f) { var v = getPath(r, f); return v != null && String(v).toLowerCase().indexOf(kw) >= 0; });
			});
		}
		if (q.sort) {
			var specs = (Array.isArray(q.sort) ? q.sort : [q.sort]).filter(Boolean).map(function (s) {
				return s.charAt(0) === '-' ? { f: s.slice(1), d: -1 } : { f: s, d: 1 };
			});
			out.sort(function (a, b) {
				for (var i = 0; i < specs.length; i++) {
					var va = getPath(a, specs[i].f), vb = getPath(b, specs[i].f);
					if (va == null || va === '' || vb == null || vb === '') {
						// 값이 없는 행(예: 가격 '요금문의')은 정렬 방향과 상관없이 뒤로
						var ea = va == null || va === '', eb = vb == null || vb === '';
						if (ea !== eb) return ea ? 1 : -1;
						continue;
					}
					var c = compare(va, vb);
					if (c) return c * specs[i].d;
				}
				return 0;
			});
		}
		var total = out.length;
		var size = q.size > 0 ? Number(q.size) : Math.max(total, 1);
		var pages = Math.max(1, Math.ceil(total / size));
		var page = Math.min(Math.max(parseInt(q.page, 10) || 1, 1), pages);
		return { items: clone(out.slice((page - 1) * size, page * size)), total: total, page: page, size: size, pages: pages };
	}

	/* ---------- MockApi : 비동기(Promise) 응답 ---------- */
	function respond(fn) {
		return new Promise(function (resolve, reject) {
			var l = MockApi.latency, ms = l[0] + Math.round(Math.random() * Math.max(0, l[1] - l[0]));
			setTimeout(function () { try { resolve(fn()); } catch (e) { reject(e); } }, ms);
		});
	}
	function notFound(name, id) {
		var err = new Error('요청한 데이터를 찾을 수 없어요 (' + name + ' / ' + id + ')');
		err.status = 404;
		return err;
	}

	var MockApi = {
		latency: [120, 380],
		list: function (name, q) { return respond(function () { return query(load(name), q); }); },
		get: function (name, id) { return respond(function () { var r = MockDB.find(name, id); if (!r) throw notFound(name, id); return r; }); },
		create: function (name, row) { return respond(function () { return MockDB.insert(name, row); }); },
		update: function (name, id, patch) { return respond(function () { var r = MockDB.update(name, id, patch); if (!r) throw notFound(name, id); return r; }); },
		remove: function (name, ids) { return respond(function () { return MockDB.remove(name, ids); }); },
		/** 원하는 값을 그대로 지연 응답 — 집계 결과 등 */
		resolve: function (fn) { return respond(typeof fn === 'function' ? fn : function () { return fn; }); },
		query: query
	};

	/* ---------- Mock : 화면에서 자주 쓰는 도우미 ---------- */
	var scriptEl = document.currentScript;
	// 저장소 루트의 절대 주소 (file:///D:/.../felixlee/  또는  https://felixleee.github.io/felixlee/)
	var root = (function () {
		try { return new URL('../', scriptEl.src).href; } catch (e) { return ''; }
	})();

	function pad(n, w) { n = String(n); while (n.length < (w || 2)) n = '0' + n; return n; }
	function toDate(d) {
		if (d instanceof Date) return d;
		if (typeof d === 'number') return new Date(d);
		if (typeof d === 'string') {
			var m = d.match(/^(\d{4})[-.\/](\d{1,2})[-.\/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
			if (m) return new Date(+m[1], +m[2] - 1, +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
		}
		return new Date(d);
	}
	var WEEK = ['일', '월', '화', '수', '목', '금', '토'];

	var Mock = {
		root: root,
		/** 저장소 루트 기준 경로 → 현재 페이지 기준 경로 (예: Mock.asset('touroffice/main/image/a.jpg')) */
		asset: function (path) { return /^(https?:|data:|\/\/)/.test(path) ? path : root + String(path).replace(/^\.?\//, ''); },
		qs: function (name, search) {
			var p = new URLSearchParams(search == null ? global.location.search : search);
			return p.get(name);
		},
		/** Mock.url('detail.html', { id: 3, q: '' }) → 'detail.html?id=3' (빈 값은 뺌) */
		url: function (path, params) {
			var p = new URLSearchParams();
			Object.keys(params || {}).forEach(function (k) { var v = params[k]; if (v != null && v !== '') p.set(k, v); });
			var s = p.toString();
			return s ? path + (path.indexOf('?') >= 0 ? '&' : '?') + s : path;
		},
		esc: function (s) {
			return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
		},
		num: function (n) { return n == null || n === '' || isNaN(n) ? '' : Number(n).toLocaleString('ko-KR'); },
		/** 가격 — 값이 없으면 '요금문의' */
		won: function (n, suffix) { return n == null || n === '' || isNaN(n) ? '요금문의' : Number(n).toLocaleString('ko-KR') + (suffix == null ? '원' : suffix); },
		toDate: toDate,
		/** Mock.date(d, 'YYYY.MM.DD (ddd) HH:mm') */
		date: function (d, fmt) {
			if (d == null || d === '') return '';
			var t = toDate(d);
			if (isNaN(t)) return String(d);
			return (fmt || 'YYYY-MM-DD').replace(/YYYY|YY|MM|DD|HH|mm|ss|ddd/g, function (k) {
				switch (k) {
					case 'YYYY': return t.getFullYear();
					case 'YY': return pad(t.getFullYear() % 100);
					case 'MM': return pad(t.getMonth() + 1);
					case 'DD': return pad(t.getDate());
					case 'HH': return pad(t.getHours());
					case 'mm': return pad(t.getMinutes());
					case 'ss': return pad(t.getSeconds());
					case 'ddd': return WEEK[t.getDay()];
				}
			});
		},
		addDays: function (d, n) { var t = new Date(toDate(d).getTime()); t.setDate(t.getDate() + n); return t; },
		/** 오늘 기준 상대 날짜 — 시드 데이터가 늘 최신으로 보이게.  Mock.rel(14) → 'YYYY-MM-DD',  Mock.rel(-2, '10:30') → 'YYYY-MM-DD 10:30:00' */
		rel: function (days, time) {
			var t = new Date(); t.setHours(0, 0, 0, 0); t.setDate(t.getDate() + (days || 0));
			if (!time) return Mock.date(t);
			var hm = String(time).split(':');
			t.setHours(+hm[0] || 0, +hm[1] || 0, +hm[2] || 0);
			return Mock.date(t, 'YYYY-MM-DD HH:mm:ss');
		},
		now: function () { return Mock.date(new Date(), 'YYYY-MM-DD HH:mm:ss'); },
		/** 'R' + YYMMDD + 4자리 */
		uid: function (prefix) { return (prefix || '') + Mock.date(new Date(), 'YYMMDD') + pad(Math.floor(Math.random() * 10000), 4); },
		delay: function (ms) { return new Promise(function (r) { setTimeout(r, ms); }); },
		/** 페이지 번호 계산 — Mock.pageRange(7, 12, 5) → { list:[6..10], prev:5, next:11, first:1, last:12 } */
		pageRange: function (page, pages, span) {
			span = span || 5;
			var start = Math.floor((page - 1) / span) * span + 1, end = Math.min(start + span - 1, pages), list = [];
			for (var i = start; i <= end; i++) list.push(i);
			return { list: list, page: page, pages: pages, first: 1, last: pages, prev: Math.max(1, start - 1), next: Math.min(pages, end + 1), hasPrev: start > 1, hasNext: end < pages };
		},
		toast: function (msg, opts) {
			opts = opts || {};
			ensureStyle();
			var box = document.querySelector('.fx-toast-wrap');
			if (!box) { box = document.createElement('div'); box.className = 'fx-toast-wrap'; document.body.appendChild(box); }
			var el = document.createElement('div');
			el.className = 'fx-toast' + (opts.type ? ' fx-toast-' + opts.type : '');
			el.setAttribute('role', 'status');
			el.textContent = msg;
			box.appendChild(el);
			setTimeout(function () { el.classList.add('fx-out'); }, opts.duration || 2200);
			setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, (opts.duration || 2200) + 400);
		},
		/** 데모에서 지원하지 않는 메뉴를 눌렀을 때 */
		notInDemo: function (what) { Mock.toast((what ? what + ' — ' : '') + '데모에서는 지원하지 않는 메뉴예요'); return false; }
	};

	/* ---------- DEMO 배지 + 토스트 스타일 ---------- */
	var styleDone = false;
	function ensureStyle() {
		if (styleDone) return;
		styleDone = true;
		var css = [
			'.fx-demo{position:fixed;left:16px;bottom:16px;z-index:2147483000;display:flex;align-items:center;gap:6px;padding:6px 6px 6px 12px;border-radius:999px;background:rgba(17,24,39,.88);color:#fff;font:500 12px/1.2 "Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif;letter-spacing:0;box-shadow:0 4px 14px rgba(0,0,0,.2);backdrop-filter:blur(4px)}',
			'.fx-demo .fx-dot{width:7px;height:7px;border-radius:50%;background:#34d399;flex:none}',
			'.fx-demo .fx-label{margin-right:4px;white-space:nowrap}',
			'.fx-demo button,.fx-demo a{all:unset;cursor:pointer;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.12);color:#fff;font:inherit;white-space:nowrap}',
			'.fx-demo button:hover,.fx-demo a:hover{background:rgba(255,255,255,.24)}',
			'.fx-demo button:focus-visible,.fx-demo a:focus-visible{outline:2px solid #93c5fd;outline-offset:1px}',
			'.fx-demo.fx-min .fx-label,.fx-demo.fx-min .fx-act{display:none}',
			'.fx-toast-wrap{position:fixed;left:50%;bottom:72px;transform:translateX(-50%);z-index:2147483001;display:flex;flex-direction:column;align-items:center;gap:8px;pointer-events:none}',
			'.fx-toast{max-width:min(92vw,420px);padding:11px 18px;border-radius:10px;background:rgba(17,24,39,.92);color:#fff;font:500 14px/1.45 "Malgun Gothic","Apple SD Gothic Neo",system-ui,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.22);text-align:center;transition:opacity .3s,transform .3s}',
			'.fx-toast-error{background:rgba(185,28,28,.94)}',
			'.fx-toast-success{background:rgba(4,120,87,.94)}',
			'.fx-toast.fx-out{opacity:0;transform:translateY(6px)}',
			'@media print{.fx-demo,.fx-toast-wrap{display:none!important}}'
		].join('\n');
		var st = document.createElement('style');
		st.setAttribute('data-mock', '');
		st.textContent = css;
		(document.head || document.documentElement).appendChild(st);
	}

	function mountBadge() {
		if (scriptEl && scriptEl.hasAttribute('data-no-badge')) return;
		if (document.querySelector('.fx-demo')) return;
		try { if (global.self !== global.top) return; } catch (e) { return; } // 모달 iframe 안에서는 배지를 다시 띄우지 않음
		ensureStyle();
		var el = document.createElement('div');
		el.className = 'fx-demo';
		el.innerHTML =
			'<span class="fx-dot" aria-hidden="true"></span>' +
			'<span class="fx-label" title="이 화면의 목록·상세·예약 데이터는 가상 데이터이고, 바꾼 내용은 이 브라우저에만 저장돼요">DEMO · 가상 데이터</span>' +
			'<button type="button" class="fx-act" data-act="reset">초기화</button>' +
			'<a class="fx-act" href="' + Mock.esc(root) + '">포트폴리오</a>' +
			'<button type="button" data-act="min" aria-label="배지 접기" title="접기/펴기">–</button>';
		el.addEventListener('click', function (e) {
			var act = e.target && e.target.getAttribute('data-act');
			if (act === 'reset') {
				if (global.confirm('이 데모의 가상 데이터를 처음 상태로 되돌릴까요?\n(등록·수정·예약한 내용이 모두 지워져요)')) {
					MockDB.reset();
					try { global.sessionStorage.setItem('fx-reset-done', '1'); } catch (er) { /* 무시 */ }
					global.location.reload();
				}
			} else if (act === 'min') {
				el.classList.toggle('fx-min');
				e.target.textContent = el.classList.contains('fx-min') ? '+' : '–';
			}
		});
		document.body.appendChild(el);
		try {
			if (global.sessionStorage.getItem('fx-reset-done')) {
				global.sessionStorage.removeItem('fx-reset-done');
				Mock.toast('가상 데이터를 처음 상태로 되돌렸어요');
			}
		} catch (er) { /* 무시 */ }
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountBadge);
	else mountBadge();

	global.MockDB = MockDB;
	global.MockApi = MockApi;
	global.Mock = Mock;
})(window);

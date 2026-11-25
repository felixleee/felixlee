/*
 * 이력관리 — 출하일 기간·기종·PJT/No·S/N 검색 → 결과 목록 → PJT/No·S/N 을 누르면 아래에 상세(영업·생산·품질·성적서 탭)
 *  주소: record.html?model=&pjt=&sn=&from=&to=&page=   id= 상세 열기, tab= 탭, doc= 성적서 팝업 (품질문서 메뉴에서)
 *  상세 정보 수정은 work_info.html?id= 에서
 */
$(function () {
	'use strict';
	var NAME = 'stxadmin.warehouse', SIZE = 10, COLS = 10;
	var e = Mock.esc;
	var $table = $('#recordTable'), $tbody = $table.find('tbody'), $paging = $('#recPaging'), $detail = $('#detail_info');
	var $f = { from: $('#startDate'), to: $('#endDate'), model: $('#model'), pjt: $('#pjt_no'), sn: $('#sn_num') };
	var reqSeq = 0, state = { page: 1 }, current = null;
	var SORT = ['-inDate', '-id'];

	StxDemo.bindCheckAll($table);
	$detail.find('input[type=text], textarea').prop('readonly', true);

	/* ---------- 검색 ---------- */
	function readForm() {
		return { from: $f.from.val(), to: $f.to.val(), model: $.trim($f.model.val()), pjt: $.trim($f.pjt.val()), sn: $.trim($f.sn.val()) };
	}
	function fillForm(q) {
		$f.model.val(q.model || ''); $f.pjt.val(q.pjt || ''); $f.sn.val(q.sn || '');
		if (window.picker && (q.from || q.to)) { try { window.picker.setDateRange(q.from || null, q.to || null, true); } catch (er) { /* 무시 */ } }
		$f.from.val(q.from || ''); $f.to.val(q.to || '');
	}
	function has(v, kw) { return !kw || String(v || '').toLowerCase().indexOf(kw.toLowerCase()) >= 0; }
	function filterFn(q) {
		return function (r) {
			return has(r.model, q.model) && has(r.pjtNo, q.pjt) && has(r.sn, q.sn) &&
				(!q.from || (r.outDate && r.outDate >= q.from)) && (!q.to || (r.outDate && r.outDate <= q.to));
		};
	}
	function isFiltered(q) { return !!(q.from || q.to || q.model || q.pjt || q.sn); }

	/* ---------- 목록 ---------- */
	function load(page) {
		var q = readForm(), my = ++reqSeq;
		state = { q: q, page: page || 1 };
		StxDemo.stateRow($tbody, COLS, 'loading');
		StxDemo.resetCheckAll($table);
		StxDemo.replaceQuery($.extend({}, q, { page: state.page > 1 ? state.page : '', id: current ? current.id : '' }));
		return MockApi.list(NAME, { filter: filterFn(q), sort: SORT, page: state.page, size: SIZE }).then(function (res) {
			if (my !== reqSeq) return res;
			state.page = res.page;
			StxDemo.paging($paging, res, function (p) { load(p); });
			if (!res.total) {
				StxDemo.stateRow($tbody, COLS, 'empty', isFiltered(q) ? '검색 조건에 맞는 이력이 없어요' : '등록된 이력이 없어요');
				return res;
			}
			$tbody.html(res.items.map(function (r, i) {
				return '<tr data-id="' + r.id + '"' + (current && String(current.id) === String(r.id) ? ' class="demo_sel"' : '') + '>' +
					'<td><input type="checkbox" name="chk" value="' + r.id + '"/></td>' +
					'<td>' + ((res.page - 1) * SIZE + i + 1) + '</td>' +
					'<td>' + e(r.model) + '</td>' +
					'<td><a class="demo_link js-open" href="javascript:;" title="상세 보기">' + e(r.pjtNo) + '</a></td>' +
					'<td><a class="demo_link js-open" href="javascript:;" title="상세 보기">' + e(r.sn) + '</a></td>' +
					'<td>' + StxDemo.dotDate(r.inDate) + '</td>' +
					'<td>' + (r.outDate ? StxDemo.dotDate(r.outDate) : StxDemo.stageBadge(r.stage)) + '</td>' +
					'<td><a class="gray_btn js-doclist" href="javascript:;" title="성적서 목록 내려받기">다운로드</a></td>' +
					'<td><a class="gray_btn js-print" href="javascript:;" title="이력 인쇄">인쇄</a></td>' +
					'<td><a class="js-xls" href="javascript:;" title="이력 정보를 엑셀(CSV)로"><img src="../image/excel_icon.png" width="30" alt="엑셀"></a></td>' +
					'</tr>';
			}).join(''));
			return res;
		}).catch(function () {
			if (my === reqSeq) StxDemo.stateRow($tbody, COLS, 'error');
		});
	}

	$('#btnSearch').on('click', function (ev) {
		ev.preventDefault();
		var q = readForm();
		if (q.from && q.to && q.from > q.to) return Mock.toast('출하일 기간을 다시 확인해 주세요', { type: 'error' });
		load(1);
	});
	$('#btnReset').on('click', function () {
		fillForm({});
		if (window.picker) { try { window.picker.setDateRange(null, null, true); } catch (er) { /* 무시 */ } }
		load(1);
	});

	/* ---------- 상세 (탭) ---------- */
	var FIELDS = {
		contract_num: 'contractNo', ship_name: 'ship', contract_name: 'contractName', ship_num: 'shipNo',
		Date1: 'outDate', Date2: 'inDate', supplier: 'supplier', etc: 'etc', significant: 'note',
		pd_significant: 'pdNote', running_time: function (r) { return StxDemo.hours(r.runHours); }, distance: 'distance',
		repair_count: function (r) { return r.overhaul ? r.overhaul + '회차' : ''; }, repair_history: 'repairHistory',
		rpm: 'rpm', horse_power: 'hp', kw: 'kw', size: 'size', weight: 'weight', types: 'milType', q_significant: 'qNote'
	};
	function showTab(tab) {
		tab = tab || 'sales';
		$detail.find('.demo_tabs a').each(function () {
			var on = $(this).attr('data-tab') === tab;
			$(this).toggleClass('on', on).attr('aria-selected', on ? 'true' : 'false');
		});
		$detail.find('.demo_tab_panel').each(function () { $(this).toggleClass('on', $(this).attr('data-panel') === tab); });
	}
	function openDetail(id, tab, opts) {
		opts = opts || {};
		return MockApi.get(NAME, id).then(function (r) {
			current = r;
			var sep = '<em class="demo_sep">·</em>';
			$('#recordTitle').html(e(r.model) + sep + 'S/N ' + e(r.sn) + sep + 'PJT ' + e(r.pjtNo) + sep + e(r.ship) + ' ' + StxDemo.stageBadge(r.stage));
			$.each(FIELDS, function (elId, key) {
				var v = typeof key === 'function' ? key(r) : r[key];
				var $el = $detail.find('#' + elId);
				$el.val(v == null ? '' : v);
				if ($el.is('textarea')) $el.attr('placeholder', v ? '' : '등록된 내용이 없어요');
				else if (elId === 'Date1') $el.attr('placeholder', v ? '' : '정비 중 (출하 전)');
			});
			$detail.addClass('pop_on');
			showTab(tab);
			$tbody.find('tr').removeClass('demo_sel').filter('[data-id="' + r.id + '"]').addClass('demo_sel');
			StxDemo.replaceQuery($.extend({}, state.q || readForm(), { page: state.page > 1 ? state.page : '', id: r.id, tab: tab && tab !== 'sales' ? tab : '' }));
			if (opts.scroll !== false) $('html, body').animate({ scrollTop: $detail.offset().top - 70 }, 250);
			return r;
		}).catch(function () {
			Mock.toast('이력을 찾을 수 없어요 (삭제되었을 수 있어요)', { type: 'error' });
		});
	}
	function closeDetail() {
		current = null;
		$detail.removeClass('pop_on');
		$tbody.find('tr').removeClass('demo_sel');
		StxDemo.replaceQuery($.extend({}, state.q || readForm(), { page: state.page > 1 ? state.page : '' }));
		$('html, body').animate({ scrollTop: 0 }, 200);
	}

	$table.on('click', '.js-open', function () { openDetail($(this).closest('tr').attr('data-id'), 'sales'); });
	$detail.on('click', '.demo_tabs a', function () {
		var tab = $(this).attr('data-tab');
		showTab(tab);
		if (current) StxDemo.replaceQuery($.extend({}, state.q || readForm(), { page: state.page > 1 ? state.page : '', id: current.id, tab: tab !== 'sales' ? tab : '' }));
	});
	$detail.on('click', '[data-doc]', function () {
		if (!current) return;
		$detail.find('[data-doc]').removeClass('on');
		$(this).addClass('on');
		StxDocs.open(current, $(this).attr('data-doc'));
	});
	$('#btnDetailEdit').on('click', function () { if (current) location.href = Mock.url('work_info.html', { id: current.id }); });
	$('#btnDetailClose, #btnConfirm').on('click', function () {
		if (!current && this.id === 'btnConfirm') return Mock.toast('목록에서 PJT/No 나 S/N 을 누르면 이력 상세가 열려요');
		closeDetail();
	});
	function printDetail() {
		document.body.classList.add('demo_print_detail');
		try { window.print(); } finally { setTimeout(function () { document.body.classList.remove('demo_print_detail'); }, 300); }
	}
	$('#btnDetailPrint').on('click', printDetail);

	/* ---------- 행 버튼: 성적서 목록 · 인쇄 · 엑셀 ---------- */
	function rowRecord(el) { return MockDB.find(NAME, $(el).closest('tr').attr('data-id')); }
	$table.on('click', '.js-doclist', function () {
		var r = rowRecord(this);
		if (!r) return;
		StxDemo.csv('성적서목록_' + r.pjtNo + '.csv', ['No', '문서', '문서번호', '작성일', '검사원', '상태'],
			StxDocs.list(r).map(function (d, i) { return [i + 1, d.name, d.no, d.date, d.writer, d.result]; }));
	});
	$table.on('click', '.js-print', function () {
		var id = $(this).closest('tr').attr('data-id');
		openDetail(id, 'sales', { scroll: false }).then(function (r) { if (r) setTimeout(printDetail, 50); });
	});
	$table.on('click', '.js-xls', function () {
		var r = rowRecord(this);
		if (!r) return;
		StxDemo.csv('이력_' + r.pjtNo + '_' + r.sn + '.csv', ['구분', '항목', '내용'], [
			['기본', '기종', r.model], ['기본', 'S/N', r.sn], ['기본', 'PJT/No', r.pjtNo], ['기본', '진행 단계', r.stage],
			['영업정보', '계약번호', r.contractNo], ['영업정보', '계약명', r.contractName], ['영업정보', '함명', r.ship], ['영업정보', '함번호', r.shipNo],
			['영업정보', '출하일', r.outDate], ['영업정보', '입고일', r.inDate], ['영업정보', '납품처', r.supplier], ['영업정보', '기타', r.etc], ['영업정보', '특이사항', r.note],
			['생산정보', '생산 중 특이사항', r.pdNote],
			['품질정보', '가동시간', StxDemo.hours(r.runHours)], ['품질정보', '이동거리', r.distance], ['품질정보', '정비회차', r.overhaul], ['품질정보', '정비이력', r.repairHistory],
			['품질정보', 'RPM', r.rpm], ['품질정보', '마력', r.hp], ['품질정보', 'KW', r.kw], ['품질정보', '크기', r.size], ['품질정보', '무게', r.weight],
			['품질정보', '군 Type', r.milType], ['품질정보', '특이사항', r.qNote]
		]);
	});

	/* ---------- 아래 버튼: 다운로드 · 수정 · 확인 ---------- */
	$('#btnListCsv').on('click', function () {
		MockApi.list(NAME, { filter: filterFn(readForm()), sort: SORT }).then(function (res) {
			if (!res.total) return Mock.toast('내려받을 이력이 없어요');
			StxDemo.csv('이력관리_' + StxDemo.ymd(new Date()) + '.csv', ['No', '기종', 'PJT/No', 'S/N', '함명', '오버홀 회차', '입고일', '출고일', '진행 단계'],
				res.items.map(function (r, i) { return [i + 1, r.model, r.pjtNo, r.sn, r.ship, r.overhaul, r.inDate, r.outDate, r.stage]; }));
		});
	});
	$('#btnEdit').on('click', function () {
		var ids = StxDemo.checkedIds($table);
		var id = current ? current.id : ids[0];
		if (!id) return Mock.toast('수정할 이력을 선택해 주세요 (체크 또는 PJT/No 클릭)');
		location.href = Mock.url('work_info.html', { id: id });
	});

	/* ---------- 처음 열 때 ---------- */
	var p = { model: Mock.qs('model'), pjt: Mock.qs('pjt'), sn: Mock.qs('sn'), from: Mock.qs('from'), to: Mock.qs('to') };
	var openId = Mock.qs('id'), tab = Mock.qs('tab'), doc = Mock.qs('doc'), saved = Mock.qs('saved');
	fillForm(p);
	load(parseInt(Mock.qs('page'), 10) || 1).then(function (res) {
		if (saved) {
			var msg = '이력 정보를 저장했어요';
			try { msg = sessionStorage.getItem('stx.flash') || msg; sessionStorage.removeItem('stx.flash'); } catch (er) { /* 무시 */ }
			Mock.toast(msg, { type: 'success', duration: 3200 });
		}
		var target = openId;
		if (!target && (doc || tab) && res && res.total) {
			// 메뉴(품질문서·시운전)에서 왔으면 그 문서가 이미 작성된 가장 최근 이력을 보여 줌
			var need = doc && StxDocs.DOCS[doc] ? StxDocs.DOCS[doc].stage : StxDemo.stageIndex('출고');
			var ready = MockApi.query(MockDB.all(NAME), { filter: function (r) { return filterFn(readForm())(r) && StxDemo.stageIndex(r.stage) >= need; }, sort: SORT, size: 1 }).items[0];
			target = ready ? ready.id : res.items[0].id;
		}
		if (!target) return;
		if (doc && StxDocs.DOCS[doc]) tab = 'docs';
		openDetail(target, tab || 'sales').then(function (r) {
			if (!r) return;
			if (doc && StxDocs.DOCS[doc]) {
				$detail.find('[data-doc="' + doc + '"]').addClass('on');
				setTimeout(function () { StxDocs.open(r, doc); }, 280);
			} else if (tab === 'docs' && !openId) {
				Mock.toast('출고까지 마친 가장 최근 이력의 성적서예요. 목록에서 다른 엔진을 고를 수 있어요');
			}
		});
	});
});

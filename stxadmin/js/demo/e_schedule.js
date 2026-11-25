/*
 * 긴급일정 — 목록(페이징) · 표출 스위치(메인 화면 긴급일정에 반영) · 등록/수정 팝업 · 선택 삭제 · CSV/파일 내려받기
 *  주소: e_schedule.html?page=   id= 수정 팝업 열기 (메인에서), new=1 등록 팝업
 */
$(function () {
	'use strict';
	var NAME = 'stxadmin.schedules', SIZE = 8, COLS = 11;
	var e = Mock.esc;
	var $table = $('#scheduleTable'), $tbody = $table.find('tbody'), $paging = $('#schPaging');
	var $pop = $('#schedule_pop'), $save = $('#btnSchSave');
	var $f = {
		title: $('#sch_title'), item: $('#sch_item'), inDate: $('#Date1'), outDate: $('#Date2'), show: $('#sch_show'),
		manager: $('#sch_manager'), phone: $('#sch_phone'), memo: $('#sch_memo')
	};
	var SORT = ['-createdAt', '-id'];
	var state = { page: 1 }, reqSeq = 0, editing = null, saving = false;

	StxDemo.bindCheckAll($table);

	function lead(r) {
		if (!StxDemo.isDate(r.inDate) || !StxDemo.isDate(r.outDate)) return '';
		return StxDemo.leadText(StxDemo.daysBetween(r.inDate, r.outDate));
	}

	/* ---------- 목록 ---------- */
	function load(page, flashId) {
		var my = ++reqSeq;
		state.page = page || 1;
		StxDemo.stateRow($tbody, COLS, 'loading');
		StxDemo.resetCheckAll($table);
		StxDemo.replaceQuery({ page: state.page > 1 ? state.page : '' });
		return MockApi.list(NAME, { sort: SORT, page: state.page, size: SIZE }).then(function (res) {
			if (my !== reqSeq) return res;
			state.page = res.page;
			var shown = MockDB.count(NAME, function (r) { return r.show; });
			$('#schCount').html('총 <strong>' + res.total + '</strong>건 · 메인 화면 표출 <strong>' + shown + '</strong>건');
			StxDemo.paging($paging, res, function (p) { load(p); });
			if (!res.total) { StxDemo.stateRow($tbody, COLS, 'empty', '등록된 긴급일정이 없어요'); return res; }
			$tbody.html(res.items.map(function (r, i) {
				return '<tr data-id="' + r.id + '">' +
					'<td><input type="checkbox" name="chk" value="' + r.id + '"/></td>' +
					'<td>' + ((res.page - 1) * SIZE + i + 1) + '</td>' +
					'<td><a class="demo_link js-edit" href="javascript:;" title="' + e(r.title) + ' — 수정">' + e(r.item) + '</a></td>' +
					'<td>' + e(lead(r)) + '</td>' +
					'<td>' + e(r.phone) + '</td>' +
					'<td>' + StxDemo.dotDate(r.inDate) + '</td>' +
					'<td>' + StxDemo.dotDate(r.outDate) + '</td>' +
					'<td><a class="gray_btn js-file" href="javascript:;">다운로드</a></td>' +
					'<td><a class="gray_btn js-print" href="javascript:;">인쇄</a></td>' +
					'<td><a class="js-xls" href="javascript:;" title="이 일정을 엑셀(CSV)로"><img src="../image/excel_icon.png" width="30" alt="엑셀"></a></td>' +
					'<td><label class="demo_switch" title="메인 화면 표출"><input type="checkbox" class="js-show"' + (r.show ? ' checked' : '') + '/><i></i></label></td>' +
					'</tr>';
			}).join(''));
			if (flashId) StxDemo.flash($tbody.find('tr[data-id="' + flashId + '"]'));
			return res;
		}).catch(function () { if (my === reqSeq) StxDemo.stateRow($tbody, COLS, 'error'); });
	}

	/* ---------- 표출 스위치 ---------- */
	$table.on('change', '.js-show', function () {
		var $c = $(this), id = $c.closest('tr').attr('data-id'), on = this.checked;
		$c.prop('disabled', true);
		MockApi.update(NAME, id, { show: on }).then(function (r) {
			Mock.toast(on ? '\'' + r.title + '\'' + StxDemo.josa(r.title, '을', '를') + ' 메인 화면에 표출해요' : '메인 화면 표출을 해제했어요', { type: 'success' });
			var shown = MockDB.count(NAME, function (x) { return x.show; });
			$('#schCount strong').last().text(shown);
		}).catch(function () {
			$c.prop('checked', !on);
			Mock.toast('표출 여부를 바꾸지 못했어요', { type: 'error' });
		}).finally(function () { $c.prop('disabled', false); });
	});

	/* ---------- 등록·수정 팝업 ---------- */
	window.onScheduleDate = function () {
		var t = lead({ inDate: $.trim($f.inDate.val()), outDate: $.trim($f.outDate.val()) });
		$('#sch_lead').text(t || '-');
	};
	$f.inDate.add($f.outDate).on('input change blur', window.onScheduleDate);

	function openPop(r) {
		editing = r || null;
		StxDemo.clearInvalid($pop);
		$('#schPopTitle').text(r ? '긴급일정 수정' : '긴급일정 등록');
		$('#btnSchDelete').closest('li').toggle(!!r);
		$f.title.val(r ? r.title : ''); $f.item.val(r ? r.item : ''); $f.manager.val(r ? r.manager : '');
		$f.phone.val(r ? r.phone : ''); $f.memo.val(r ? r.memo : ''); $f.show.prop('checked', r ? !!r.show : true);
		StxDemo.setDateField($f.inDate, r ? r.inDate : StxDemo.today(), window.picker);
		StxDemo.setDateField($f.outDate, r ? r.outDate : Mock.rel(14), window.picker2);
		window.onScheduleDate();
		StxDemo.openPop('schedule_pop');
		if (!r) setTimeout(function () { $f.title.trigger('focus'); }, 50);
	}
	function openEdit(id) {
		MockApi.get(NAME, id).then(openPop).catch(function () { Mock.toast('긴급일정을 찾을 수 없어요 (삭제되었을 수 있어요)', { type: 'error' }); });
	}
	$table.on('click', '.js-edit', function () { openEdit($(this).closest('tr').attr('data-id')); });
	$('#btnNew').on('click', function () { openPop(null); });
	$pop.on('input change', 'input', function () { $(this).removeClass('demo_invalid'); });

	$save.on('click', function () {
		if (saving) return;
		var inDate = $.trim($f.inDate.val());
		var ok = StxDemo.validate([
			{ el: $f.title, label: '제목', required: true, test: function (v) { return v.length > 40 ? '제목은 40자까지 입력할 수 있어요' : ''; } },
			{ el: $f.item, label: '아이템', required: true },
			{ el: $f.inDate, label: '입고일', required: true, test: function (v) { return StxDemo.isDate(v) ? '' : '입고일은 YYYY-MM-DD 형식으로 입력해 주세요'; } },
			{ el: $f.outDate, label: '출고일', required: true, test: function (v) {
				if (!StxDemo.isDate(v)) return '출고일은 YYYY-MM-DD 형식으로 입력해 주세요';
				return StxDemo.isDate(inDate) && v < inDate ? '출고일이 입고일보다 빠를 수 없어요' : '';
			} },
			{ el: $f.manager, label: '담당자', required: true },
			{ el: $f.phone, label: '전화번호', required: true, test: function (v) { return StxDemo.isPhone(v) ? '' : '전화번호는 010-0000-1234 형식으로 입력해 주세요'; } }
		]);
		if (!ok) return;
		var v = function ($el) { return $.trim($el.val() || ''); };
		var row = {
			title: v($f.title), item: v($f.item), inDate: v($f.inDate), outDate: v($f.outDate), show: $f.show.prop('checked'),
			manager: v($f.manager), phone: v($f.phone), memo: v($f.memo)
		};
		if (!editing) row.createdAt = Mock.now();
		saving = true;
		StxDemo.busy($save, true);
		var p = editing ? MockApi.update(NAME, editing.id, row) : MockApi.create(NAME, row);
		p.then(function (r) {
			StxDemo.closePop('schedule_pop');
			Mock.toast(editing ? '긴급일정을 수정했어요' : '긴급일정을 등록했어요' + (r.show ? ' (메인 화면에 표출)' : ''), { type: 'success' });
			return load(editing ? state.page : 1, r.id);
		}).catch(function (err) {
			Mock.toast((err && err.message) || '저장하지 못했어요', { type: 'error' });
		}).finally(function () { saving = false; StxDemo.busy($save, false); });
	});

	function removeIds(ids) {
		if (!window.confirm('선택한 긴급일정 ' + ids.length + '건을 삭제할까요?')) return Promise.resolve(0);
		return MockApi.remove(NAME, ids).then(function (n) {
			Mock.toast(n + '건을 삭제했어요', { type: 'success' });
			load(state.page);
			return n;
		});
	}
	$('#btnSchDelete').on('click', function () {
		if (!editing) return;
		removeIds([editing.id]).then(function (n) { if (n) StxDemo.closePop('schedule_pop'); });
	});
	$('#btnDelete').on('click', function () {
		var ids = StxDemo.checkedIds($table);
		if (!ids.length) return Mock.toast('삭제할 긴급일정을 선택해 주세요');
		removeIds(ids);
	});

	/* ---------- 내려받기 · 인쇄 ---------- */
	function rowOf(el) { return MockDB.find(NAME, $(el).closest('tr').attr('data-id')); }
	var HEAD = ['제목', '아이템', '리드타임', '전화번호', '담당자', '입고일', '출고일', '표출', '비고'];
	function cells(r) { return [r.title, r.item, lead(r), r.phone, r.manager, r.inDate, r.outDate, r.show ? '표출' : '미표출', r.memo]; }
	$('#btnExcel').on('click', function () {
		MockApi.list(NAME, { sort: SORT }).then(function (res) {
			if (!res.total) return Mock.toast('내려받을 긴급일정이 없어요');
			StxDemo.csv('긴급일정_' + StxDemo.ymd(new Date()) + '.csv', ['No'].concat(HEAD), res.items.map(function (r, i) { return [i + 1].concat(cells(r)); }));
		});
	});
	$table.on('click', '.js-xls', function () {
		var r = rowOf(this);
		if (r) StxDemo.csv('긴급일정_' + r.id + '.csv', HEAD, [cells(r)]);
	});
	$table.on('click', '.js-file', function () {
		var r = rowOf(this);
		if (!r) return;
		var text = ['[긴급일정] ' + r.title, '', '아이템   : ' + r.item, '입고일   : ' + r.inDate, '출고일   : ' + r.outDate,
			'리드타임 : ' + lead(r), '담당자   : ' + r.manager + ' (' + r.phone + ')', '비고     : ' + (r.memo || '-'), '',
			'※ 포트폴리오 데모용 가상 자료입니다.'].join('\r\n');
		StxDemo.download('긴급일정_' + r.item.replace(/[\\/:*?"<>|()\s]+/g, '_').replace(/_+$/, '') + '.txt', '﻿' + text);
	});
	$table.on('click', '.js-print', function () {
		var $tr = $(this).closest('tr');
		StxDemo.flash($tr);
		StxDemo.print();
	});

	/* ---------- 처음 열 때 ---------- */
	var openId = Mock.qs('id'), isNew = Mock.qs('new');
	load(parseInt(Mock.qs('page'), 10) || 1).then(function () {
		if (openId) openEdit(openId);
		else if (isNew) openPop(null);
	});
});

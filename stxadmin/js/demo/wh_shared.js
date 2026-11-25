/*
 * 입고정보 입력 공통 — 등록(wh_new) · 변경(wh_edit) · 월별 조회의 빠른 입력 팝업(wh_detail)이 같이 씀
 *  - 검증 규칙(필수값·형식·S/N+회차 중복·PJT 중복·출고일)과 저장할 행 만들기
 */
(function (global, $) {
	'use strict';
	var NAME = 'stxadmin.warehouse';

	function models() { return MockDB.all('stxadmin.models'); }
	function ships() { return MockDB.all('stxadmin.ships'); }
	function find(list, key, v) { for (var i = 0; i < list.length; i++) if (list[i][key] === v) return list[i]; return null; }

	var W = {
		NAME: NAME,
		/** 기종·함명 자동완성 목록 채우기 */
		fillDatalists: function ($model, $ship) {
			$model.html(models().map(function (m) { return '<option value="' + Mock.esc(m.name) + '"></option>'; }).join(''));
			$ship.html(ships().map(function (s) { return '<option value="' + Mock.esc(s.name) + '">' + Mock.esc(s.hullNo) + '</option>'; }).join(''));
		},
		/**
		 * $f: { model, sn, ship, over, hours, inDate, pjt?, stage?, outDate? } (jQuery 입력칸)
		 * record: 변경 중인 행 (등록이면 null)
		 */
		validate: function ($f, record) {
			function others() {
				return MockDB.all(NAME).filter(function (r) { return !record || String(r.id) !== String(record.id); });
			}
			var stage = $f.stage ? $f.stage.val() : '입고', inDate = $.trim($f.inDate.val());
			var rules = [
				{ el: $f.model, label: '기종', required: true },
				{ el: $f.sn, label: 'S/N', required: true, test: function (v) { return /^[A-Za-z0-9-]{4,20}$/.test(v) ? '' : 'S/N 은 영문·숫자 4~20자로 입력해 주세요'; } },
				{ el: $f.ship, label: '함명', required: true },
				{ el: $f.over, label: '오버홀 회차', required: true, test: function (v) {
					if (!/^\d{1,2}$/.test(v) || +v < 1) return '오버홀 회차는 1 이상의 숫자로 입력해 주세요';
					var sn = $.trim($f.sn.val());
					var dup = others().some(function (r) { return r.sn === sn && Number(r.overhaul) === Number(v); });
					return dup ? '같은 S/N 의 ' + v + '회차 입고정보가 이미 있어요' : '';
				} },
				{ el: $f.hours, label: '가동시간', required: true, test: function (v) {
					var n = StxDemo.parseNum(v);
					return isNaN(n) || n <= 0 || n > 200000 ? '가동시간은 숫자로 입력해 주세요 (예: 10,000H)' : '';
				} },
				{ el: $f.inDate, label: '입고일', required: true, test: function (v) { return StxDemo.isDate(v) ? '' : '입고일은 YYYY-MM-DD 형식으로 입력해 주세요'; } }
			];
			if ($f.pjt) rules.push({ el: $f.pjt, label: 'PJT/No', test: function (v) {
				if (!/^[A-Za-z0-9-]{4,20}$/.test(v)) return 'PJT/No 는 영문·숫자로 입력해 주세요 (예: E26R512)';
				return others().some(function (r) { return r.pjtNo === v; }) ? '이미 쓰고 있는 PJT/No 예요' : '';
			} });
			if ($f.outDate) rules.push({ el: $f.outDate, label: '출고일', required: stage === '출고', test: function (v) {
				if (!StxDemo.isDate(v)) return '출고일은 YYYY-MM-DD 형식으로 입력해 주세요';
				if (StxDemo.isDate(inDate) && v < inDate) return '출고일이 입고일보다 빠를 수 없어요';
				return stage !== '출고' ? '출고일을 넣으면 진행 단계를 \'출고\'로 바꿔 주세요' : '';
			} });
			return StxDemo.validate(rules);
		},
		/** 입고일 연도의 다음 PJT 번호 (E26R512 → E26R513) */
		nextPjt: function (inDate) {
			var yy = inDate.slice(2, 4), max = 500;
			MockDB.all(NAME).forEach(function (r) {
				var m = /^E(\d{2})R(\d{3})$/.exec(r.pjtNo || '');
				if (m && m[1] === yy && +m[2] > max) max = +m[2];
			});
			return 'E' + yy + 'R' + (max + 1);
		},
		/** 입력값 → 저장할 행 (등록이면 영업·품질정보 기본값까지) */
		buildRow: function ($f, record) {
			var v = function ($el) { return $el ? $.trim($el.val() || '') : ''; };
			var model = v($f.model), ship = v($f.ship), inDate = v($f.inDate), over = Number(v($f.over));
			var row = {
				model: model, sn: v($f.sn), ship: ship, overhaul: over, runHours: StxDemo.parseNum(v($f.hours)), inDate: inDate,
				updatedAt: Mock.now()
			};
			if ($f.stage) row.stage = $f.stage.val();
			if ($f.outDate) row.outDate = v($f.outDate);
			if ($f.manager) row.manager = v($f.manager);
			if ($f.pjt) row.pjtNo = v($f.pjt);
			if (!row.pjtNo && !(record && record.pjtNo)) row.pjtNo = W.nextPjt(inDate);
			else if (!row.pjtNo) delete row.pjtNo;
			var hull = find(ships(), 'name', ship);
			if (hull || !record || record.ship !== ship) row.shipNo = hull ? hull.hullNo : '';
			var spec = find(models(), 'name', model);
			if (spec && (!record || record.model !== model)) {
				row.rpm = spec.rpm; row.hp = spec.hp; row.kw = spec.kw; row.size = spec.size; row.weight = spec.weight; row.milType = spec.milType;
			}
			if (!record) {
				$.extend(row, {
					stage: row.stage || '입고', outDate: row.outDate || '', manager: row.manager || '김태섭', createdAt: Mock.now(),
					contractNo: 'OH-' + inDate.slice(0, 4) + '-' + String(MockDB.nextId(NAME) + 40).slice(-3),
					contractName: ship + ' ' + model + ' ' + over + '차 창정비',
					supplier: '', etc: '', note: '', pdNote: '', distance: '', qNote: '',
					repairHistory: '창정비 ' + Math.max(0, over - 1) + '회'
				});
			} else if (record.ship !== ship || record.model !== model || Number(record.overhaul) !== over) {
				row.contractName = ship + ' ' + model + ' ' + over + '차 창정비';
			}
			return row;
		}
	};
	global.StxWh = W;
})(window, jQuery);

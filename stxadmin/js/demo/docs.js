/*
 * 품질문서(성적서) 조회 팝업 — 이력관리(record.html)와 영업·생산·품질정보(work_info.html)에서 같이 씀
 *  - 문서는 입고정보 한 건(엔진 1대 오버홀)에서 만들어짐: 진행 단계가 문서 작성 단계에 못 미치면 '작성 전'
 *  - 측정값은 레코드 id 로 고르는 고정값 → 다시 열어도 같은 값
 *  - 팝업 마크업은 각 화면의 #doc_pop (layer_pop) 을 씀
 */
(function (global, $) {
	'use strict';

	// stage: 이 단계(StxDemo.STAGES 의 index)부터 작성됨, items: [점검 항목, 기준, 측정값 후보...]
	var DOCS = {
		incoming: {
			name: '입고검사기록', code: 'IN', stage: 0, day: 0, items: [
				['외관 상태', '손상·부식 없음', ['이상 없음', '경미한 도장 박리', '이상 없음']],
				['윤활유 오염도', 'NAS 9급 이하', ['NAS 7급', 'NAS 8급', 'NAS 6급']],
				['냉각수 누설', '누설 없음', ['누설 없음', '누설 없음', '미세 누설(조치 완료)']],
				['부속품 수량', '명세서와 일치', ['일치', '일치', '일치']]
			]
		},
		dock_trial: {
			name: '입창시운전기록부', code: 'DT', stage: 0, day: 1, items: [
				['입창 전 시동 상태', '정상 시동', ['정상', '정상', '2회차 시동']],
				['최대 회전수 도달', '정격의 90% 이상', ['94%', '91%', '96%']],
				['이상 소음·진동', '없음', ['없음', '과급기 이음', '없음']],
				['배기 색상', '무색~엷은 회색', ['엷은 회색', '무색', '회색']]
			]
		},
		parts: {
			name: '부품검사이력', code: 'PI', stage: 2, day: 14, items: [
				['크랭크축 저널 진원도', '0.02 mm 이하', ['0.008 mm', '0.011 mm', '0.014 mm']],
				['실린더 라이너 내경 마모', '0.10 mm 이하', ['0.04 mm', '0.06 mm', '0.07 mm']],
				['커넥팅로드 대단부 내경', '기준 ±0.015 mm', ['+0.006 mm', '-0.004 mm', '+0.009 mm']],
				['캠축 리프트', '기준 ±0.05 mm', ['-0.02 mm', '+0.01 mm', '-0.03 mm']],
				['밸브 시트 접촉 폭', '1.5~2.5 mm', ['1.9 mm', '2.1 mm', '1.7 mm']]
			]
		},
		inspect: {
			name: '검사성적서', code: 'QC', stage: 2, day: 16, items: [
				['부품 치수 검사', '도면 공차 이내', ['합격', '합격', '합격']],
				['비파괴 검사(자분탐상)', '균열 없음', ['균열 없음', '균열 없음', '균열 없음']],
				['경도 측정(크랭크 핀)', 'HRC 50 이상', ['HRC 54', 'HRC 52', 'HRC 55']],
				['표면 거칠기(저널)', 'Ra 0.4 μm 이하', ['Ra 0.25 μm', 'Ra 0.31 μm', 'Ra 0.28 μm']]
			]
		},
		assembly: {
			name: '조립공정기록부', code: 'AS', stage: 3, day: 30, items: [
				['메인 베어링 볼트 토크', '기준 토크 ±3%', ['+1.2%', '-0.8%', '+0.5%']],
				['크랭크축 축방향 유격', '0.15~0.35 mm', ['0.22 mm', '0.27 mm', '0.19 mm']],
				['피스톤 돌출량', '0.4~0.7 mm', ['0.52 mm', '0.58 mm', '0.49 mm']],
				['밸브 간극(흡기)', '0.40 mm', ['0.40 mm', '0.40 mm', '0.40 mm']],
				['밸브 간극(배기)', '0.60 mm', ['0.60 mm', '0.60 mm', '0.60 mm']]
			]
		},
		trial_log: {
			name: '시운전일지', code: 'TL', stage: 4, day: 46, items: [
				['시동 시간', '10초 이내', ['4초', '6초', '5초']],
				['정격 회전수 유지', '정격 ±1%', ['+0.3%', '-0.2%', '+0.4%']],
				['윤활유 압력', '4.5~6.0 bar', ['5.2 bar', '5.4 bar', '5.0 bar']],
				['냉각수 출구 온도', '85~92 ℃', ['88 ℃', '87 ℃', '90 ℃']],
				['배기 온도 편차', '±40 ℃ 이내', ['±22 ℃', '±31 ℃', '±18 ℃']]
			]
		},
		trial_report: {
			name: '시운전성적서', code: 'TR', stage: 4, day: 50, items: [
				['정격 출력', '정격 출력 이상', ['101.2%', '100.6%', '100.9%']],
				['연료 소비율', '기준 +5% 이내', ['+2.1%', '+1.4%', '+3.0%']],
				['진동', '11 mm/s 이하', ['6.8 mm/s', '7.5 mm/s', '5.9 mm/s']],
				['소음', '105 dB(A) 이하', ['101 dB(A)', '99 dB(A)', '102 dB(A)']]
			]
		},
		etc: {
			name: '기타 문서', code: 'ET', stage: 0, day: 0, items: [
				['작업 지시서', '등록', ['등록됨', '등록됨', '등록됨']],
				['부품 교환 내역서', '등록', ['등록됨', '등록됨', '등록됨']],
				['작업 사진 기록', '등록', ['24장', '31장', '18장']]
			]
		}
	};
	var ORDER = ['incoming', 'dock_trial', 'parts', 'assembly', 'trial_log', 'trial_report', 'etc'];
	var INSPECTORS = ['정하늘', '문지후', '배서윤', '양태오'];

	function docOf(rec, code) {
		var d = DOCS[code];
		if (!d) return null;
		var cur = StxDemo.stageIndex(rec.stage);
		var ready = cur >= d.stage;
		var date = '';
		if (ready) {
			var t = Mock.addDays(rec.inDate, d.day);
			var limit = Mock.toDate(rec.outDate || StxDemo.today());
			if (t > limit) t = limit;
			date = Mock.date(t);
		}
		var seed = Number(rec.id) || 0;
		return {
			code: code,
			name: d.name,
			no: 'QD-' + (rec.pjtNo || 'NEW') + '-' + d.code,
			ready: ready,
			date: date,
			writer: ready ? INSPECTORS[(seed + d.stage) % INSPECTORS.length] : '',
			needStage: StxDemo.STAGES[d.stage],
			result: ready ? '합격' : '작성 전',
			items: d.items.map(function (it, i) {
				return { name: it[0], std: it[1], value: ready ? it[2][(seed + i) % it[2].length] : '', ok: ready ? '합격' : '' };
			})
		};
	}

	var current = null;

	function open(rec, code) {
		var doc = docOf(rec, code);
		if (!doc) return Mock.notInDemo('해당 문서');
		current = { rec: rec, doc: doc };
		var e = Mock.esc;
		$('#docTitle').text(doc.name);
		$('#docInfo').html(
			'<tr><td>문서번호</td><td class="align_l">' + e(doc.no) + '</td><td>판정</td><td class="align_l">' +
				(doc.ready ? '<span class="demo_ok">합격</span>' : '<span class="demo_wait">작성 전</span>') + '</td></tr>' +
			'<tr><td>기종</td><td class="align_l">' + e(rec.model) + '</td><td>S/N</td><td class="align_l">' + e(rec.sn) + '</td></tr>' +
			'<tr><td>함명</td><td class="align_l">' + e(rec.ship) + '</td><td>PJT/No</td><td class="align_l">' + e(rec.pjtNo) + '</td></tr>' +
			'<tr><td>작성일</td><td class="align_l">' + e(doc.date || '-') + '</td><td>검사원</td><td class="align_l">' + e(doc.writer || '-') + '</td></tr>'
		);
		if (doc.ready) {
			$('#docItems').html(doc.items.map(function (it) {
				return '<tr><td class="align_l">' + e(it.name) + '</td><td>' + e(it.std) + '</td><td>' + e(it.value) + '</td><td><span class="demo_ok">' + e(it.ok) + '</span></td></tr>';
			}).join(''));
		} else {
			StxDemo.stateRow($('#docItems'), 4, 'empty', '아직 작성되지 않은 문서예요. \'' + doc.needStage + '\' 단계부터 작성돼요 (현재 단계: ' + rec.stage + ')');
		}
		$('#btnDocCsv, #btnDocPrint').toggleClass('gray', !doc.ready);
		StxDemo.openPop('doc_pop');
	}

	function docRows(doc) {
		return doc.items.map(function (it) { return [it.name, it.std, it.value, it.ok]; });
	}

	$(function () {
		$('#btnDocCsv').on('click', function () {
			if (!current) return;
			if (!current.doc.ready) return Mock.toast('작성되지 않은 문서는 내려받을 수 없어요');
			var c = current;
			var info = [
				['문서번호', c.doc.no], ['기종', c.rec.model], ['S/N', c.rec.sn], ['함명', c.rec.ship],
				['PJT/No', c.rec.pjtNo], ['작성일', c.doc.date], ['검사원', c.doc.writer], ['판정', c.doc.result]
			].map(function (r) { return [r[0], r[1], '', '']; });
			StxDemo.csv(c.doc.name + '_' + c.rec.pjtNo + '.csv', ['문서', c.doc.name, '', ''],
				info.concat([['', '', '', ''], ['점검 항목', '기준', '측정값', '판정']], docRows(c.doc)));
		});
		$('#btnDocPrint').on('click', function () {
			if (!current) return;
			if (!current.doc.ready) return Mock.toast('작성되지 않은 문서는 인쇄할 수 없어요');
			StxDemo.print('doc_pop');
		});
	});

	global.StxDocs = {
		DOCS: DOCS,
		ORDER: ORDER,
		docOf: docOf,
		open: open,
		/** 한 건의 문서 목록 (리스트 다운로드용) */
		list: function (rec) { return ORDER.map(function (c) { return docOf(rec, c); }); }
	};
})(window, jQuery);

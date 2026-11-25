/*
 * STX Engine 정비시스템 — 입고(오버홀) 정보 + 이력(영업·생산·품질) 가상 데이터
 *  - 한 행 = 엔진 1대의 오버홀(창정비) 1건.  입고정보 조회·이력관리·메인 요약이 같은 컬렉션을 씀
 *  - 날짜는 Mock.rel() 로 오늘 기준 상대값 → 언제 열어도 진행 중인 건과 출고된 건이 섞여 보임
 *  - 함명·담당자·연락처는 모두 가상
 */
(function () {
	var models = {};
	MockDB.all('stxadmin.models').forEach(function (m) { models[m.name] = m; });
	var ships = MockDB.all('stxadmin.ships');
	var managers = ['김태섭', '이현정', '박준영', '최은비', '오세진', '윤가람', '한도윤'];
	var suppliers = ['한빛 정비창', '해솔 정비단', '푸른바다 군수지원단'];
	var etcs = ['하자보증 12개월', '부품 선행 발주 완료', '', '긴급 정비 대상', '하자보증 12개월', ''];

	var notes = [
		'입고 시 냉각수 계통 누설 흔적 확인, 분해 범위 협의 필요',
		'정기 창정비 대상. 운용 부대 요청으로 시운전 일정 앞당김',
		'과급기(터보차저) 이음 발생 이력 있음',
		'연료분사 펌프 교체 요청 접수',
		'운용시간 대비 윤활유 소모량 많음 — 피스톤 링 점검 요망',
		'함 정비 일정과 연계, 출고일 변경 불가',
		'계약 변경(추가 정비 항목) 협의 중',
		'배기온도 편차 경보 이력 2회',
		'첫 오버홀 — 기준 데이터 확보 대상',
		'장기 계류 후 입고, 부식 상태 확인 필요'
	];
	var pdNotes = [
		'실린더 헤드 3번 밸브 시트 마모로 교체',
		'크랭크축 저널 연마 후 언더사이즈 베어링 적용',
		'메인 베어링 전량 교체, 커넥팅로드 볼트 재사용 불가 판정',
		'과급기 카트리지 교체, 인터쿨러 세척',
		'연료분사 노즐 전량 교체, 분사 압력 재조정',
		'캠축 베어링 일부 교체, 밸브 간극 재조정',
		'냉각수 펌프 임펠러 교체, 실 키트 적용',
		'피스톤 링 세트 교체, 라이너 호닝 작업',
		'특이사항 없음 — 표준 공정대로 진행',
		'부품 수급 지연으로 조립 공정 3일 지연'
	];
	var qNotes = [
		'시운전 결과 정격 출력 만족',
		'진동 측정값 기준 이내, 재측정 불필요',
		'배기온도 편차 ±25℃ 로 양호',
		'윤활유 압력 정상 범위 유지',
		'초기 시동 지연 1회 — 시동 계통 재점검 후 정상',
		'연료 소비율 기준 대비 +2.1%',
		'',
		'냉각수 출구 온도 88℃ 로 안정',
		'소음 측정 101 dB(A)',
		'재시운전 없이 합격'
	];

	// [함 index, 기종, S/N, 오버홀 회차, 가동시간, 입고(며칠 전), 출고(입고 후 며칠, 없으면 진행 중)]
	var rows = [
		[0, '20V538TB92', '5380417', 3, 14250, 3, null],
		[1, '12V856TB82', '8560233', 2, 10120, 6, null],
		[2, '16V2000TB82', '20161108', 1, 6840, 9, null],
		[3, '20V538TB92', '5380522', 2, 11860, 12, null],
		[4, '16V396TB94', '39610871', 2, 9930, 17, null],
		[5, '12V856TB82', '8560412', 3, 15480, 21, null],
		[6, '12V4000TB82', '40120654', 1, 7210, 26, null],
		[7, '16V2000TB82', '20161342', 2, 11040, 31, null],
		[8, '20V538TB92', '5380639', 1, 8120, 36, null],
		[9, '16V396TB94', '39610925', 3, 16320, 42, null],
		[0, '20V538TB92', '5380418', 3, 14310, 47, null],
		[2, '12V4000TB82', '40120577', 2, 10870, 53, null],
		[1, '12V856TB82', '8560234', 2, 10090, 58, null],
		[3, '20V538TB92', '5380523', 2, 11790, 64, null],
		[6, '12V4000TB82', '40120655', 1, 7330, 71, null],
		[5, '12V856TB82', '8560413', 3, 15210, 78, 62],
		[7, '16V2000TB82', '20161343', 2, 10980, 86, 58],
		[4, '16V396TB94', '39610872', 2, 9870, 93, 64],
		[8, '20V538TB92', '5380640', 1, 8060, 101, 70],
		[9, '16V396TB94', '39610926', 3, 16100, 110, 66],
		[2, '16V2000TB82', '20161109', 1, 6790, 118, 61],
		[0, '20V538TB92', '5380301', 2, 12040, 127, 72],
		[1, '12V856TB82', '8560107', 4, 19870, 136, 75],
		[3, '20V538TB92', '5380288', 3, 15020, 149, 68],
		[6, '12V4000TB82', '40120412', 2, 11240, 163, 63],
		[7, '16V2000TB82', '20160977', 3, 15630, 178, 71],
		[4, '16V396TB94', '39610644', 1, 7480, 192, 66],
		[9, '16V396TB94', '39610713', 2, 10350, 208, 59],
		[8, '20V538TB92', '5380355', 2, 11600, 224, 74],
		[5, '12V856TB82', '8560198', 2, 9960, 241, 67],
		[2, '12V4000TB82', '40120388', 1, 6950, 259, 62],
		[0, '20V538TB92', '5380302', 2, 11980, 277, 70],
		[1, '12V856TB82', '8560108', 3, 14870, 296, 64],
		[3, '20V538TB92', '5380289', 2, 10760, 318, 76],
		[7, '16V2000TB82', '20160978', 2, 10420, 341, 60],
		[6, '12V4000TB82', '40120413', 1, 7120, 362, 65],
		[4, '16V396TB94', '39610645', 1, 7390, 384, 69],
		[9, '16V396TB94', '39610714', 2, 10280, 407, 63]
	];

	function stageOf(inAgo, outAfter) {
		if (outAfter != null) return '출고';
		if (inAgo <= 5) return '입고';
		if (inAgo <= 15) return '분해';
		if (inAgo <= 28) return '검사';
		if (inAgo <= 45) return '조립';
		return '시운전';
	}
	function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

	// PJT 번호: 입고일 순서대로 연도별 일련번호 (예: E26R512)
	var order = rows.map(function (r, i) { return i; }).sort(function (a, b) { return rows[b][5] - rows[a][5]; });
	var pjt = {}, perYear = {};
	order.forEach(function (i) {
		var yy = Mock.date(Mock.rel(-rows[i][5]), 'YY');
		perYear[yy] = (perYear[yy] || 0) + 1;
		pjt[i] = 'E' + yy + 'R' + (500 + perYear[yy] * 3 + (i % 3));
	});

	var data = rows.map(function (r, i) {
		var ship = ships[r[0]], m = models[r[1]] || {};
		var inDate = Mock.rel(-r[5]);
		var outDate = r[6] == null ? '' : Mock.rel(-r[5] + r[6]);
		var year = inDate.slice(0, 4);
		var created = Mock.rel(-r[5], '09:' + pad((i * 7) % 60, 2));
		return {
			id: i + 1,
			model: r[1],
			sn: r[2],
			ship: ship.name,
			shipNo: ship.hullNo,
			overhaul: r[3],
			runHours: r[4],
			inDate: inDate,
			outDate: outDate,
			stage: stageOf(r[5], r[6]),
			pjtNo: pjt[i],
			manager: managers[i % managers.length],
			// 영업정보
			contractNo: 'OH-' + year + '-' + pad(40 - i, 3),
			contractName: ship.name + ' ' + r[1] + ' ' + r[3] + '차 창정비',
			supplier: suppliers[i % suppliers.length],
			etc: etcs[i % etcs.length],
			note: notes[i % notes.length],
			// 생산정보
			pdNote: r[5] <= 15 && r[6] == null ? '' : pdNotes[(i * 3) % pdNotes.length],
			// 품질정보
			distance: Mock.num(Math.round(r[4] * 1.27 / 10) * 10) + ' NM',
			repairHistory: '창정비 ' + (r[3] - 1) + '회 / 수시정비 ' + ((i % 3) + 1) + '회',
			rpm: m.rpm || '',
			hp: m.hp || '',
			kw: m.kw || '',
			size: m.size || '',
			weight: m.weight || '',
			milType: m.milType || '',
			qNote: r[6] == null && r[5] <= 45 ? '' : qNotes[i % qNotes.length],
			createdAt: created,
			updatedAt: created
		};
	});

	MockDB.define('stxadmin.warehouse', data, { version: '1' });
})();

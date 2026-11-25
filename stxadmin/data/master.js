/*
 * STX Engine 정비시스템 — 기준 정보(가상)
 *  - stxadmin.models : 엔진 기종과 제원 (입고 등록 시 품질정보 기본값으로 씀)
 *  - stxadmin.ships  : 함명·함번호 (모두 가상 이름, 실존 함정 아님)
 */
MockDB.define('stxadmin.models', [
	{ id: 1, name: '20V538TB92', rpm: '1,950', hp: '7,500', kw: '5,590', size: '4,980 × 1,720 × 2,410 mm', weight: '21.4 t', milType: '주기관(추진)' },
	{ id: 2, name: '12V856TB82', rpm: '1,800', hp: '3,260', kw: '2,430', size: '3,250 × 1,490 × 2,050 mm', weight: '9.8 t', milType: '주기관(추진)' },
	{ id: 3, name: '16V2000TB82', rpm: '2,100', hp: '2,450', kw: '1,830', size: '2,810 × 1,450 × 1,690 mm', weight: '6.1 t', milType: '주기관(추진)' },
	{ id: 4, name: '12V4000TB82', rpm: '1,900', hp: '4,320', kw: '3,220', size: '3,640 × 1,560 × 2,240 mm', weight: '12.3 t', milType: '발전기 구동' },
	{ id: 5, name: '16V396TB94', rpm: '2,100', hp: '4,000', kw: '2,980', size: '3,520 × 1,520 × 2,120 mm', weight: '10.7 t', milType: '주기관(추진)' }
], { version: '1' });

MockDB.define('stxadmin.ships', [
	{ id: 1, name: '해오름함', hullNo: 'H-301' },
	{ id: 2, name: '물보라함', hullNo: 'H-302' },
	{ id: 3, name: '은빛나래함', hullNo: 'H-305' },
	{ id: 4, name: '새벽별함', hullNo: 'H-311' },
	{ id: 5, name: '바람결함', hullNo: 'H-312' },
	{ id: 6, name: '푸른솔함', hullNo: 'H-318' },
	{ id: 7, name: '한누리함', hullNo: 'H-321' },
	{ id: 8, name: '다온함', hullNo: 'H-327' },
	{ id: 9, name: '가온누리함', hullNo: 'H-330' },
	{ id: 10, name: '별하람함', hullNo: 'H-336' }
], { version: '1' });

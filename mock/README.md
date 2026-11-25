# 가상 데이터(Mock) 구성 안내

포트폴리오의 각 프로젝트 화면을 **가상 데이터로 실제 서비스처럼 동작**하게 만든 구조입니다.
서버 없이 정적 파일만으로 동작하며, GitHub Pages(`https://felixleee.github.io/felixlee/`)와 로컬 파일(`file://`) 모두에서 똑같이 동작합니다.

## 구조

```
mock/
  mock-api.js          공통 가상 API (MockDB · MockApi · Mock 도우미 + DEMO 배지)
  shared/              여러 프로젝트가 함께 쓰는 데이터 (예: TourOffice 상품 ↔ TMS 예약)
<프로젝트>/
  data/*.js            가상 데이터 — MockDB.define('<프로젝트>.<컬렉션>', [...], { version })
  js/demo/*.js         화면별 동작 스크립트 (목록 렌더링·검색·상세·등록·예약 등)
  (새 화면 .html)      메인에 이미 걸려 있던 링크 경로에 맞춰 추가
```

- 데이터는 JSON 이 아니라 **스크립트(`data/*.js`)** 로 둡니다. `file://` 에서는 `fetch()` 로 JSON 을 못 읽기 때문입니다.
- 등록·수정·예약한 내용은 **localStorage** 에 저장되어 새로고침하거나 페이지를 옮겨도 남습니다.
  화면 왼쪽 아래 **DEMO 배지의 [초기화]** 를 누르면 처음 데이터로 돌아갑니다.
- 데이터를 고쳐서 기존 저장분을 버리고 싶으면 `MockDB.define(..., { version: '2' })` 처럼 버전을 올립니다.

## 페이지에서 쓰는 순서

```html
<script src="../../mock/mock-api.js"></script>   <!-- 1. 공통 (상대 경로) -->
<script src="../data/tours.js"></script>         <!-- 2. 데이터 정의 -->
<script src="../js/demo/tour_list.js"></script>  <!-- 3. 화면 동작 -->
```

## API 요약

| 구분 | 함수 | 설명 |
|---|---|---|
| 정의 | `MockDB.define(name, rows, { key: 'id', version: '1' })` | 컬렉션 등록 |
| 동기 조회 | `MockDB.all(name)` · `find(name, id)` · `where(name, fn)` · `count(name, fn)` | 렌더링 직전 계산용 |
| 동기 변경 | `MockDB.insert` · `update(name, id, patch)` · `remove(name, ids)` · `reset(name?)` | 변경 즉시 저장 |
| 작은 값 | `MockDB.getItem(k, 기본값)` · `setItem(k, v)` | 최근 본 상품, 로그인 흉내 등 |
| 변경 알림 | `MockDB.on(name, fn)` | 다른 탭에서 바뀐 것도 알림 (`'remote'`) |
| 비동기 | `MockApi.list(name, { filter, keyword, fields, sort, page, size })` | `{ items, total, page, size, pages }` |
| 비동기 | `MockApi.get` · `create` · `update` · `remove` · `resolve(fn)` | 실제 API 처럼 120~380ms 뒤 응답 |
| 도우미 | `Mock.qs('id')` · `Mock.url('a.html', {id:1})` · `Mock.esc(s)` | 주소·이스케이프 |
| 도우미 | `Mock.won(n)` → `1,250,000원` / 값 없으면 `요금문의` · `Mock.num(n)` | 금액 |
| 도우미 | `Mock.date(d, 'YYYY.MM.DD (ddd)')` · `Mock.rel(14)` · `Mock.now()` · `Mock.addDays` | 날짜 (`rel` = 오늘 기준 상대 날짜) |
| 도우미 | `Mock.pageRange(page, pages, 5)` · `Mock.uid('R')` · `Mock.asset('img/a.jpg')` | 페이징·번호·루트 기준 경로 |
| 도우미 | `Mock.toast('저장했어요', { type: 'success' })` · `Mock.notInDemo('로그인')` | 알림 |

`filter` 는 `{ status: '예약확정', cate: ['A', 'B'] }` 같은 객체(빈 값은 무시) 또는 함수, `sort` 는 `'-createdAt'`·`['status', '-price']` (앞에 `-` 는 내림차순, 빈 값은 항상 뒤로) 입니다.

## 데이터 원칙

- 모든 인명·연락처·이메일은 **가상**입니다. 전화번호는 `010-0000-1234` 처럼 가운데 `0000`, 이메일은 `@example.com`.
- 이미지는 각 프로젝트 폴더에 **이미 있는 파일만** 씁니다 (외부 이미지 링크 없음).
- 날짜는 `Mock.rel()` 로 오늘 기준 상대값을 써서 언제 봐도 출발일·접수일이 자연스럽게 보이게 합니다.
- 경로는 모두 **상대 경로** 입니다 (`/` 로 시작하는 절대 경로는 GitHub Pages 의 `/felixlee/` 아래에서 깨짐).

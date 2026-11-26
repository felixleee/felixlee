# 포트폴리오 첫 화면 (React)

`https://felixleee.github.io/felixlee/` 의 첫 화면과 프로젝트 상세 페이지 소스예요.
Vite + React + TypeScript 로 만들고, 빌드할 때 모든 경로를 정적 HTML 로 미리 그려(프리렌더) 둡니다.
저장소의 데모 폴더(`stxadmin/`, `touroffice/` …), `img/`, `files/`, `designs/` 는 손대지 않고 배포 때 함께 합쳐요.

## 명령

| 명령 | 하는 일 |
|---|---|
| `npm install` | 처음 한 번 |
| `npm run dev` | 개발 서버 — http://localhost:5173/felixlee/ (데모·이미지도 같은 주소로 열림) |
| `npm run build` | 타입 검사 → 클라이언트 빌드 → 서버 렌더 빌드 → 프리렌더 → `../_site` 조립 |
| `npm run preview` | `../_site` 를 GitHub Pages 와 같은 조건으로 띄움 — http://localhost:4173/felixlee/ |

## 구조

```
src/
  data/projects.ts   프로젝트 17개 (카드 · 필터 · 상세 페이지가 모두 여기서 만들어짐)
  data/profile.ts    소개 · 연락처 · 스택 문구
  pages/             Home · ProjectDetail(/projects/:slug) · NotFound
  components/        Layout(헤더 · 푸터 · 테마) · ProjectCard · Icons
  entry-server.tsx   빌드 때 경로마다 HTML 을 그리는 진입점
scripts/
  prerender.mjs      dist/client/<경로>/index.html, 404.html 생성
  assemble.mjs       저장소 정적 폴더 + 빌드 결과 → ../_site
public/case/         상세 페이지의 데모 화면 캡처
```

- 프로젝트 추가: `projects.ts` 배열에 하나 추가 (최신순). `caseStudy` 를 넣으면 상세 페이지에 배경 · 내가 한 일 · 데모 흐름 · 화면이 나와요.
- 배포: `main` 에 push 하면 `.github/workflows/deploy.yml` 이 빌드해서 Pages 에 올려요.

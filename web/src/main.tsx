import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BASE } from './lib/util';

// …/index.html 로 들어오면(예: 데모의 [포트폴리오] 버튼, 예전 링크) 같은 페이지의 폴더 주소로 바꾼다.
// 미리 그린 HTML 은 폴더 주소 기준이라, 바꾸지 않으면 라우터가 404 로 보고 화면이 어긋난다.
if (window.location.pathname.endsWith('/index.html')) {
	const { pathname, search, hash } = window.location;
	window.history.replaceState(window.history.state, '', pathname.slice(0, -'index.html'.length) + search + hash);
}

const container = document.getElementById('root')!;
const app = (
	<StrictMode>
		<BrowserRouter basename={BASE.replace(/\/$/, '')}>
			<App />
		</BrowserRouter>
	</StrictMode>
);

// 빌드 결과는 미리 그려진 HTML 이 들어 있으니 이어 붙이고(hydrate), 개발 서버에서는 새로 그린다
if (container.firstElementChild) hydrateRoot(container, app);
else createRoot(container).render(app);

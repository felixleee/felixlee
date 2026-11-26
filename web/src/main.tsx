import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BASE } from './lib/util';

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

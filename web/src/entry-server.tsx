/**
 * 빌드할 때만 쓰는 서버 렌더 진입점 — scripts/prerender.mjs 가 경로마다 render() 를 불러
 * 정적 HTML 을 미리 만든다. (GitHub Pages 에서 /projects/xxx 로 바로 들어와도 열리고, 검색엔진도 내용을 읽음)
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import App from './App';
import { profile } from './data/profile';
import { findProject, projects } from './data/projects';
import { BASE, SITE_TITLE } from './lib/util';

const basename = BASE.replace(/\/$/, '');

/** 미리 만들 경로 (basename 제외) */
export const routes = ['/', ...projects.map((p) => `/projects/${p.slug}`)];

export interface Head {
	title: string;
	description: string;
}

function headFor(path: string): Head {
	const m = path.match(/^\/projects\/([^/]+)/);
	if (m) {
		const p = findProject(m[1]);
		if (p) return { title: `${p.title} · ${profile.nameKo} 포트폴리오`, description: `${p.point} (${p.date} · ${p.category})` };
	}
	if (path === '/404') return { title: `페이지를 찾을 수 없어요 · ${profile.nameKo} 포트폴리오`, description: '주소가 바뀌었거나 없는 페이지예요.' };
	return {
		title: SITE_TITLE,
		description: `디자인부터 프런트 개발까지 — 웹 퍼블리셔·프런트엔드 개발자 ${profile.nameKo}의 포트폴리오. 프로젝트 ${projects.length}개, 가상 데이터로 직접 체험하는 데모 ${projects.filter((p) => p.demo).length}개.`
	};
}

export function render(path: string): { html: string; head: Head } {
	const html = renderToString(
		<StrictMode>
			<StaticRouter location={basename + path} basename={basename}>
				<App />
			</StaticRouter>
		</StrictMode>
	);
	return { html, head: headFor(path) };
}

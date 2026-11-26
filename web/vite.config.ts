import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** GitHub Pages 주소가 https://felixleee.github.io/felixlee/ 라서 모든 경로의 기준 */
const BASE = '/felixlee/';
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const TYPES: Record<string, string> = {
	'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
	'.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
	'.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.pdf': 'application/pdf',
	'.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject'
};

/**
 * 개발 서버에서 저장소 루트의 정적 파일(img/, files/, 데모 폴더, designs/ …)을
 * 배포 때와 같은 주소(/felixlee/…)로 내어 준다. 첫 화면(index.html)과 src/ 는 Vite 가 처리.
 */
function repoStatic(): Plugin {
	return {
		name: 'repo-static',
		configureServer(server) {
			server.middlewares.use((req, res, next) => {
				let url: string;
				try { url = decodeURIComponent((req.url ?? '').split('?')[0]); } catch { return next(); }
				if (!url.startsWith(BASE)) return next();
				const rel = url.slice(BASE.length);
				if (!rel || /^(web|src|node_modules|@|\.)/.test(rel)) return next();
				let file = path.join(repoRoot, rel);
				if (!file.startsWith(repoRoot)) return next();
				try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { return next(); }
				if (file === path.join(repoRoot, 'index.html') || !fs.existsSync(file)) return next();
				res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] ?? 'application/octet-stream');
				fs.createReadStream(file).pipe(res);
			});
		}
	};
}

export default defineConfig({
	base: BASE,
	plugins: [react(), repoStatic()],
	server: { port: 5173, strictPort: true },
	build: { assetsDir: 'assets', sourcemap: false }
});

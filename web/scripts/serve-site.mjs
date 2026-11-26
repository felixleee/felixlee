// 조립된 ../_site 를 GitHub Pages 와 같은 조건(/felixlee/ 하위 경로, 없는 주소는 404.html)으로 띄운다
// npm run preview  → http://localhost:4173/felixlee/
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../_site');
const BASE = '/felixlee/';
const PORT = Number(process.env.PORT || 4173);
const TYPES = {
	'.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
	'.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
	'.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.webp': 'image/webp', '.pdf': 'application/pdf', '.woff': 'font/woff',
	'.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject', '.txt': 'text/plain; charset=utf-8'
};

if (!fs.existsSync(root)) {
	console.error('먼저 npm run build 로 _site 를 만들어 주세요');
	process.exit(1);
}

http.createServer((req, res) => {
	let url;
	try { url = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { res.writeHead(400).end(); return; }
	if (url === '/' || url === BASE.slice(0, -1)) { res.writeHead(302, { Location: BASE }).end(); return; }
	if (!url.startsWith(BASE)) { res.writeHead(404).end('404'); return; }
	let file = path.join(root, url.slice(BASE.length));
	if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
	try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch { /* 아래 */ }
	let status = 200;
	if (!fs.existsSync(file)) { file = path.join(root, '404.html'); status = 404; }
	res.writeHead(status, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
	fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`site preview → http://localhost:${PORT}${BASE}`));

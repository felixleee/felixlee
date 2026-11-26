// 빌드 후 경로마다 정적 HTML 을 미리 만든다 (dist/client/<경로>/index.html, 404.html)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const clientDir = path.join(webDir, 'dist/client');
const template = fs.readFileSync(path.join(clientDir, 'index.html'), 'utf8');
const { render, routes } = await import(pathToFileURL(path.join(webDir, 'dist/server/entry-server.js')).href);

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function page(url) {
	const { html, head } = render(url);
	if (!template.includes('<!--app-html-->')) throw new Error('템플릿에 <!--app-html--> 이 없어요');
	return template
		.replace('<!--app-html-->', html)
		.replace(/<title>[^<]*<\/title>/, `<title>${esc(head.title)}</title>`)
		.replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(head.description)}$2`)
		.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(head.title)}$2`)
		.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(head.description)}$2`);
}

let n = 0;
for (const url of routes) {
	const out = url === '/' ? path.join(clientDir, 'index.html') : path.join(clientDir, url.slice(1), 'index.html');
	fs.mkdirSync(path.dirname(out), { recursive: true });
	fs.writeFileSync(out, page(url));
	n++;
}
// GitHub Pages 는 없는 주소에 404.html 을 보여 준다
fs.writeFileSync(path.join(clientDir, '404.html'), page('/404'));
console.log(`prerender: ${n}개 경로 + 404.html`);

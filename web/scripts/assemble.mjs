// 배포할 사이트(../_site) 조립: 저장소의 정적 폴더(데모 · 이미지 · 이력서 · designs …) + React 빌드 결과
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const webDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const repo = path.resolve(webDir, '..');
const out = path.join(repo, '_site');

/** 배포에 넣지 않을 것 — 개발용 폴더와, React 로 대체된 예전 정적 첫 화면 */
const SKIP = new Set(['.git', '.github', '.claude', '.gitignore', 'web', '_site', 'node_modules', 'index.html', 'README.md', 'head.html']);

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

let copied = 0;
for (const name of fs.readdirSync(repo)) {
	if (SKIP.has(name)) continue;
	fs.cpSync(path.join(repo, name), path.join(out, name), { recursive: true });
	copied++;
}
fs.cpSync(path.join(webDir, 'dist/client'), out, { recursive: true });
fs.writeFileSync(path.join(out, '.nojekyll'), '');
console.log(`assemble: 저장소 항목 ${copied}개 + React 빌드 → ${path.relative(repo, out)}/`);

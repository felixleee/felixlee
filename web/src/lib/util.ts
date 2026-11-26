/** 배포 기준 경로 (/felixlee/) */
export const BASE = import.meta.env.BASE_URL;

/** 저장소 루트 기준 경로 → 실제 주소. 외부 주소는 그대로 */
export const asset = (p: string) => (/^(https?:)?\/\//.test(p) ? p : BASE + p.replace(/^\.?\//, ''));

/** 외부 링크인지 */
export const isExternal = (p: string) => /^(https?:)?\/\//.test(p);

/** '**굵게**' 표시를 조각으로 나눔 — [텍스트, 굵게?][] */
export const splitBold = (s: string): [string, boolean][] =>
	s.split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map((t) => (t.startsWith('**') ? [t.slice(2, -2), true] : [t, false]));

export const SITE_TITLE = '이재윤 · Front-end Developer & UX/UI Designer';

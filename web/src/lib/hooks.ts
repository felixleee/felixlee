import { useCallback, useEffect, useState } from 'react';
import { SITE_TITLE } from './util';

export type Theme = 'dark' | 'light';
const THEME_KEY = 'portfolio-theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#161412', light: '#fbf8f0' };

function applyTheme(t: Theme) {
	const root = document.documentElement;
	if (t === 'light') root.setAttribute('data-theme', 'light');
	else root.removeAttribute('data-theme');
	document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[t]);
	try { localStorage.setItem(THEME_KEY, t); } catch { /* 비공개 창 등 */ }
}

/**
 * 테마 — 첫 칠하기 전 index.html 의 인라인 스크립트가 저장값을 먼저 적용하고,
 * 여기서는 그 상태를 읽어 버튼과 맞춘다. (서버 렌더 결과와 어긋나지 않게 처음엔 dark 로 시작)
 */
export function useTheme() {
	const [theme, setTheme] = useState<Theme>('dark');
	useEffect(() => {
		setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
	}, []);
	const toggle = useCallback(() => {
		const next: Theme = theme === 'light' ? 'dark' : 'light';
		applyTheme(next);
		setTheme(next);
	}, [theme]);
	return { theme, toggle };
}

/** 스크롤이 px 를 넘었는지 */
export function useScrolledPast(px: number) {
	const [on, setOn] = useState(false);
	useEffect(() => {
		const onScroll = () => setOn(window.scrollY > px);
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	}, [px]);
	return on;
}

/**
 * 페이지 제목 (클라이언트에서 화면을 옮길 때) — 첫 로드 제목은 프리렌더가 넣는다.
 * null 이면 건드리지 않음 (안쪽 컴포넌트가 정할 때)
 */
export function useTitle(title?: string | null) {
	useEffect(() => {
		if (title === null) return;
		document.title = title ? `${title} · 이재윤 포트폴리오` : SITE_TITLE;
	}, [title]);
}

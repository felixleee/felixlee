import { useCallback, useEffect, useRef, useState } from 'react';
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

/** 요소가 화면에 들어왔는지 — 한 번 들어오면 계속 true (IntersectionObserver 없으면 바로 true) */
export function useInView<T extends Element>(threshold = 0.3) {
	const ref = useRef<T>(null);
	const [inView, setInView] = useState(false);
	useEffect(() => {
		const el = ref.current;
		if (!el || !('IntersectionObserver' in window)) {
			setInView(true);
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setInView(true);
					io.disconnect();
				}
			},
			{ threshold }
		);
		io.observe(el);
		return () => io.disconnect();
	}, [threshold]);
	return { ref, inView };
}

/**
 * 스크롤 등장 효과 — [data-reveal] 요소가 화면에 들어오면 살짝 떠오르며 또렷해진다 (한 번만, 같은 줄은 차례로).
 * - 처음 열었을 때 화면 안 · 위에 있는 요소는 절대 숨기지 않는다. 화면 아래에 있는 것만 숨겨 두고 기다림
 *   (화면을 다시 그리지 않는 숨은 탭 · 미리보기 창에서도 첫 화면이 비지 않게)
 * - 라우트 이동 · 필터 변경으로 새로 생긴 요소는 MutationObserver 로 잡아, 화면 안이면 바로 떠오르게
 * - 움직임은 Web Animations 로 `translate` 만 써서, 카드 hover 의 transform · transition 과 겹치지 않는다
 * - 표시는 React 가 모르는 data-* 속성 (className 이 다시 그려져도 안 지워짐) · 동작 줄이기 설정이면 아무것도 안 함
 */
export function useScrollReveal() {
	useEffect(() => {
		if (!('IntersectionObserver' in window) || !('animate' in document.documentElement)) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		const SEL = '[data-reveal]:not([data-revealed])';
		const WAIT = 'data-reveal-wait'; // 화면 아래에서 기다리는 중 (CSS 가 투명하게)
		const limit = () => window.innerHeight * 0.92;
		const done = (el: Element) => {
			io.unobserve(el);
			el.removeAttribute(WAIT);
			el.setAttribute('data-revealed', '');
		};
		/** 위→아래, 왼→오 순서로 살짝 시차를 두고 떠오르게 */
		const play = (els: Element[]) => {
			const items = els.map((el) => ({ el, r: el.getBoundingClientRect() })).sort((a, b) => a.r.top - b.r.top || a.r.left - b.r.left);
			items.forEach(({ el }, n) => {
				done(el);
				el.animate([{ opacity: 0, translate: '0 32px' }, { opacity: 1, translate: '0 0' }], {
					duration: 900,
					delay: Math.min(n, 5) * 90,
					easing: 'cubic-bezier(.16, 1, .3, 1)',
					fill: 'backwards'
				});
			});
		};
		const io = new IntersectionObserver(
			(entries) => {
				entries.filter((e) => !e.isIntersecting && e.boundingClientRect.bottom < 0).forEach((e) => done(e.target)); // 건너뛴 위쪽은 그냥 보여 줌
				play(entries.filter((e) => e.isIntersecting).map((e) => e.target));
			},
			{ rootMargin: '0px 0px -8% 0px' }
		);
		/** 화면 아래 → 숨기고 기다림 / 화면 안 → (animate 면) 떠오르게, 아니면 그대로 / 화면 위 → 그대로 */
		const take = (els: Element[], animate: boolean) => {
			const inView: Element[] = [];
			for (const el of els) {
				const r = el.getBoundingClientRect();
				if (r.top >= window.innerHeight) {
					// 조금이라도 보이는 건 숨기지 않음
					el.setAttribute(WAIT, '');
					io.observe(el);
				} else if (animate && r.bottom > 0) inView.push(el);
				else el.setAttribute('data-revealed', '');
			}
			if (inView.length) play(inView);
		};
		take([...document.querySelectorAll(SEL)], false);
		const mo = new MutationObserver((muts) => {
			const added = new Set<Element>();
			for (const m of muts)
				m.addedNodes.forEach((n) => {
					if (!(n instanceof Element)) return;
					if (n.matches(SEL)) added.add(n);
					n.querySelectorAll(SEL).forEach((el) => added.add(el));
				});
			if (added.size) take([...added], true);
		});
		mo.observe(document.getElementById('root') ?? document.body, { childList: true, subtree: true });
		// 안전망 — 스크롤이 멈췄는데 화면 안(또는 위)에 아직 기다리는 요소가 있으면 보여 준다
		let idle = 0;
		const onScroll = () => {
			clearTimeout(idle);
			idle = window.setTimeout(() => {
				const late = [...document.querySelectorAll(`[${WAIT}]`)].filter((el) => el.getBoundingClientRect().top < limit());
				if (late.length) play(late);
			}, 250);
		};
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			io.disconnect();
			mo.disconnect();
			clearTimeout(idle);
			window.removeEventListener('scroll', onScroll);
		};
	}, []);
}

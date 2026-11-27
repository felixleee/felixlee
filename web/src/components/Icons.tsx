import type { SVGProps } from 'react';

type P = SVGProps<SVGSVGElement>;
const base = (p: P) => ({
	viewBox: '0 0 24 24',
	fill: 'none',
	stroke: 'currentColor',
	strokeWidth: 2.2,
	strokeLinecap: 'round' as const,
	strokeLinejoin: 'round' as const,
	'aria-hidden': true,
	...p
});

export const IconExternal = (p: P) => <svg {...base(p)}><path d="M7 17 17 7M8 7h9v9" /></svg>;
export const IconDown = (p: P) => <svg {...base(p)}><path d="M12 5v14M6 13l6 6 6-6" /></svg>;
export const IconUp = (p: P) => <svg {...base(p)}><path d="M12 19V5M6 11l6-6 6 6" /></svg>;
export const IconLeft = (p: P) => <svg {...base(p)}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>;
export const IconRight = (p: P) => <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
export const IconFile = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
		<path d="M14 3v5h5M9 13h6M9 17h6" />
	</svg>
);
export const IconPlay = (p: P) => (
	<svg {...base({ fill: 'currentColor', stroke: 'none', ...p })}>
		<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
	</svg>
);
export const IconMoon = (p: P) => <svg {...base({ strokeWidth: 2, ...p })}><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>;
export const IconSun = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<circle cx="12" cy="12" r="4" />
		<path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
	</svg>
);

/* How I work 단계 아이콘 */
export const IconChat = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.3-4.4a8 8 0 1 1 15.2-4.1z" />
		<path d="M8.5 11.5h.01M12.5 11.5h.01M16.5 11.5h.01" strokeWidth={2.8} />
	</svg>
);
export const IconLayout = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<rect x="3" y="4" width="18" height="16" rx="2.5" />
		<path d="M3 9h18M9.5 9v11" />
	</svg>
);
export const IconCode = (p: P) => <svg {...base({ strokeWidth: 2, ...p })}><path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" /></svg>;
export const IconBraces = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<path d="M8 4H7a2 2 0 0 0-2 2v4l-2 2 2 2v4a2 2 0 0 0 2 2h1M16 4h1a2 2 0 0 1 2 2v4l2 2-2 2v4a2 2 0 0 1-2 2h-1" />
	</svg>
);
export const IconCycle = (p: P) => (
	<svg {...base({ strokeWidth: 2, ...p })}>
		<path d="M20 11A8 8 0 0 0 5.3 7.2L4 8.5M4 4v4.5h4.5M4 13a8 8 0 0 0 14.7 3.8l1.3-1.3M20 20v-4.5h-4.5" />
	</svg>
);

import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { profile } from '../data/profile';
import { useScrolledPast, useTheme } from '../lib/hooks';
import { IconMoon, IconSun, IconUp } from './Icons';

/** 주소가 바뀌면: #해시가 있으면 그 섹션으로, 없으면 맨 위로 */
function ScrollManager() {
	const { pathname, hash } = useLocation();
	useEffect(() => {
		if (hash) {
			const el = document.getElementById(decodeURIComponent(hash.slice(1)));
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' });
				return;
			}
		}
		window.scrollTo(0, 0);
	}, [pathname, hash]);
	return null;
}

function Brand() {
	const [first, ...rest] = profile.handle.split('.');
	return (
		<Link className="brand" to="/" aria-label={`${profile.handle}, 첫 화면으로`}>
			{first}
			<span>.</span>
			{rest.join('.')}
		</Link>
	);
}

function Header() {
	const scrolled = useScrolledPast(4);
	const { theme, toggle } = useTheme();
	return (
		<header className={`site-header${scrolled ? ' is-scrolled' : ''}`}>
			<div className="wrap">
				<Brand />
				<nav className="nav" aria-label="주요 메뉴">
					<Link to={{ pathname: '/', hash: '#projects' }}>Projects</Link>
					<Link to={{ pathname: '/', hash: '#about' }}>About</Link>
					<Link className="contact-link" to={{ pathname: '/', hash: '#contact' }}>Contact</Link>
					<button type="button" className="theme-btn" onClick={toggle} aria-label="라이트/다크 테마 전환" aria-pressed={theme === 'light'}>
						<IconMoon className="i-moon" />
						<IconSun className="i-sun" />
					</button>
				</nav>
			</div>
		</header>
	);
}

function Footer() {
	return (
		<footer className="site-footer">
			<p>
				© <span suppressHydrationWarning>{new Date().getFullYear()}</span> {profile.nameEn}. Built with React · Vite · TypeScript.
			</p>
		</footer>
	);
}

function GoTop() {
	const on = useScrolledPast(600);
	return (
		<button
			type="button"
			className={`go-top${on ? ' is-on' : ''}`}
			aria-label="맨 위로"
			onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
		>
			<IconUp />
		</button>
	);
}

export default function Layout() {
	return (
		<>
			<ScrollManager />
			<Header />
			<main>
				<Outlet />
			</main>
			<Footer />
			<GoTop />
		</>
	);
}

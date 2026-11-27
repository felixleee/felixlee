import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import ProjectCard from '../components/ProjectCard';
import { IconBraces, IconChat, IconCode, IconCycle, IconDown, IconExternal, IconFile, IconLayout } from '../components/Icons';
import { profile } from '../data/profile';
import { countBy, FILTERS, projects, type FilterKey } from '../data/projects';
import { useInView, useTitle } from '../lib/hooks';
import { asset, splitBold } from '../lib/util';

type Filter = FilterKey | 'all';
const isFilter = (v: string | null): v is Filter => !!v && FILTERS.some((f) => f.key === v);

const WORK_ICONS = { chat: IconChat, layout: IconLayout, code: IconCode, braces: IconBraces, cycle: IconCycle };

/** How I work — 단계가 왼쪽부터 차례로 켜지는 스테퍼 (화면에 들어올 때 한 번) */
function HowIWork() {
	const w = profile.howIWork;
	const { ref, inView } = useInView<HTMLDivElement>(0.35);
	return (
		<div ref={ref} className={`tile tile-work${inView ? ' is-in' : ''}`} data-reveal>
			<p className="tile-title" style={{ marginBottom: 0 }}>
				How I work
			</p>
			<p className="work-title">{w.title}</p>
			<ol className="work-steps" aria-label="일하는 순서">
				{w.steps.map((s, i) => {
					const Icon = WORK_ICONS[s.icon];
					return (
						<li key={s.title} style={{ '--i': i } as CSSProperties}>
							<span className="work-icon">
								<Icon />
							</span>
							<span className="work-num">{String(i + 1).padStart(2, '0')}</span>
							<strong className="work-name">{s.title}</strong>
							<span className="work-desc">{s.desc}</span>
						</li>
					);
				})}
			</ol>
			<div className="work-owner">
				<span>
					<b>{profile.handle}</b>
					{w.owner}
				</span>
			</div>
		</div>
	);
}

function Hero({ onShowDemos }: { onShowDemos: () => void }) {
	return (
		<section className="hero" aria-labelledby="heroTitle">
			<div className="wrap">
				<div className="bento">
					<div className="tile tile-intro" data-reveal>
						<div>
							<p className="eyebrow">{profile.roleLine}</p>
							<h1 id="heroTitle">
								{profile.headline.map((l) => (
									<span key={l}>
										{l}
										<br />
									</span>
								))}
								<em>{profile.headlineEm}</em>
							</h1>
							<p className="lead">{profile.lead}</p>
						</div>
						<div className="hero-actions">
							<a className="btn btn-accent" href="#projects">
								프로젝트 보기 <IconDown />
							</a>
							<a className="btn" href={asset(profile.resume)} target="_blank" rel="noopener">
								<IconFile /> Resume PDF
							</a>
						</div>
					</div>

					<a className="tile tile-stat is-accent" href="#projects" data-reveal>
						<span className="num">{projects.length}</span>
						<span className="label">projects · {profile.years}</span>
					</a>
					<button type="button" className="tile tile-stat" onClick={onShowDemos} aria-label="데모 체험 가능한 프로젝트만 보기" data-reveal>
						<IconExternal className="go" />
						<span className="num">{countBy('demo')}</span>
						<span className="label">직접 눌러 보는 데모</span>
					</button>

					<div className="tile tile-stack" data-reveal>
						<p className="tile-title">What I do</p>
						<ul className="chips chips-role">
							{profile.whatIDo.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
						<p className="tile-title" style={{ marginTop: 20 }}>
							Stack
						</p>
						<ul className="chips">
							{profile.stack.map((s) => (
								<li key={s}>{s}</li>
							))}
						</ul>
					</div>

					<HowIWork />
				</div>
			</div>
		</section>
	);
}

function Projects({ filter, onChange }: { filter: Filter; onChange: (f: Filter) => void }) {
	const visible = useMemo(() => projects.filter((p) => filter === 'all' || p.tags.includes(filter)), [filter]);
	return (
		<section className="section" id="projects" aria-labelledby="projectsTitle">
			<div className="wrap">
				<div className="section-head" data-reveal>
					<div>
						<h2 id="projectsTitle">Projects</h2>
						<p>Demo 는 가상 데이터로 목록·상세·예약 흐름을 직접 눌러 볼 수 있는 화면이에요.</p>
					</div>
					<div className="filters" role="group" aria-label="프로젝트 필터">
						{FILTERS.filter((f) => countBy(f.key) > 0).map((f) => (
							<button key={f.key} type="button" aria-pressed={filter === f.key} onClick={() => onChange(f.key)}>
								{f.label}
								<span className="count">{countBy(f.key)}</span>
							</button>
						))}
					</div>
				</div>
				{visible.length ? (
					<div className="grid">
						{visible.map((p) => (
							<ProjectCard key={p.slug} project={p} />
						))}
					</div>
				) : (
					<p className="empty is-on">이 조건에 맞는 프로젝트가 없어요.</p>
				)}
			</div>
		</section>
	);
}

function About() {
	const c = profile.contact;
	return (
		<section className="section" id="about" aria-labelledby="aboutTitle">
			<div className="wrap">
				<div className="section-head" data-reveal>
					<h2 id="aboutTitle">About</h2>
				</div>
				<div className="about">
					<div className="about-photo" data-reveal>
						<img src={asset(profile.photo)} alt={`${profile.nameKo} 사진`} loading="lazy" />
					</div>
					<div className="about-text" data-reveal>
						{profile.about.map((para) => (
							<p key={para.slice(0, 20)}>
								{splitBold(para).map(([t, b], i) => (b ? <strong key={i}>{t}</strong> : <span key={i}>{t}</span>))}
							</p>
						))}
						<div className="hero-actions" style={{ marginTop: 24 }}>
							<a className="btn btn-accent" href={asset(profile.resume)} target="_blank" rel="noopener">
								<IconFile /> Resume PDF
							</a>
						</div>
					</div>
				</div>
				<div className="contact" id="contact">
					<a href={`tel:${c.tel}`} data-reveal>
						<span className="k">Phone</span>
						<span className="v">{c.phone}</span>
					</a>
					<a href={`mailto:${c.email}`} data-reveal>
						<span className="k">Email</span>
						<span className="v">{c.email}</span>
					</a>
					<div data-reveal>
						<span className="k">Location</span>
						<span className="v">{c.location}</span>
					</div>
				</div>
			</div>
		</section>
	);
}

export default function Home() {
	useTitle();
	const [filter, setFilter] = useState<Filter>('all');

	// ?filter=demo 처럼 주소로 공유된 필터 — 서버 렌더(전체)와 어긋나지 않게 마운트 후 적용
	useEffect(() => {
		const q = new URLSearchParams(window.location.search).get('filter');
		if (isFilter(q)) setFilter(q);
	}, []);

	const change = (f: Filter) => {
		setFilter(f);
		const url = new URL(window.location.href);
		if (f === 'all') url.searchParams.delete('filter');
		else url.searchParams.set('filter', f);
		window.history.replaceState(window.history.state, '', url);
	};

	return (
		<>
			<Hero
				onShowDemos={() => {
					change('demo');
					document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}}
			/>
			<Projects filter={filter} onChange={change} />
			<About />
		</>
	);
}

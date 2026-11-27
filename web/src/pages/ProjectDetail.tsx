import { Link, useParams } from 'react-router-dom';
import { IconLeft, IconRight } from '../components/Icons';
import { ProjectLinks } from '../components/ProjectCard';
import { findProject, formatLabel, projects } from '../data/projects';
import { useTitle } from '../lib/hooks';
import { asset } from '../lib/util';
import NotFound from './NotFound';

export default function ProjectDetail() {
	const { slug } = useParams();
	const project = findProject(slug);
	useTitle(project ? project.title : null); // 없는 프로젝트면 NotFound 가 제목을 정함
	if (!project) return <NotFound />;

	const i = projects.indexOf(project);
	const newer = projects[i - 1];
	const older = projects[i + 1];
	const cs = project.caseStudy;

	return (
		<article className="detail">
			<div className="wrap">
				<Link className="back" to={{ pathname: '/', hash: '#projects' }}>
					<IconLeft /> 모든 프로젝트
				</Link>

				<header className="detail-head" data-reveal>
					<p className="eyebrow">
						{project.date} · {project.format}
						{project.stack ? ` · ${project.stack}` : ''}
					</p>
					<h1>{project.title}</h1>
					<p className="lead">{project.point}</p>
					<ProjectLinks project={project} />
				</header>

				<div className="detail-hero" data-reveal>
					<img src={asset(project.thumb)} alt={`${project.title} 화면`} width={1600} height={1000} />
				</div>

				<dl className="facts">
					<div data-reveal>
						<dt>시기</dt>
						<dd>{project.date}</dd>
					</div>
					<div data-reveal>
						<dt>분야</dt>
						<dd>{project.category}</dd>
					</div>
					<div data-reveal>
						<dt>형태</dt>
						<dd>{formatLabel(project)}</dd>
					</div>
					<div data-reveal>
						<dt>맡은 역할</dt>
						<dd>
							<ul className="tags">
								{project.roles.map((r) => (
									<li key={r}>{r}</li>
								))}
							</ul>
						</dd>
					</div>
				</dl>

				<section className="detail-section" aria-labelledby="sec-intro" data-reveal>
					<h2 id="sec-intro">프로젝트 소개</h2>
					<p>{project.description}</p>
				</section>

				{cs && (
					<>
						<section className="detail-section" aria-labelledby="sec-bg" data-reveal>
							<h2 id="sec-bg">배경</h2>
							{cs.background.map((t) => (
								<p key={t}>{t}</p>
							))}
						</section>
						<section className="detail-section" aria-labelledby="sec-did" data-reveal>
							<h2 id="sec-did">내가 한 일</h2>
							<ul className="bullets">
								{cs.did.map((t) => (
									<li key={t}>{t}</li>
								))}
							</ul>
						</section>
						{cs.flow && (
							<section className="detail-section" aria-labelledby="sec-flow" data-reveal>
								<h2 id="sec-flow">{cs.flow.title ?? '데모로 직접 해 보기'}</h2>
								<ol className="steps">
									{cs.flow.steps.map((t) => (
										<li key={t}>{t}</li>
									))}
								</ol>
								{cs.flow.links && cs.flow.links.length > 0 && (
									<div className="hero-actions">
										{cs.flow.links.map((l, n) => (
											// 실행 파일은 새 탭 없이 바로 내려받기
											<a key={l.href} className={`btn${n === 0 ? ' btn-accent' : ''}`} href={asset(l.href)} target={/\.exe$/i.test(l.href) ? undefined : '_blank'} rel="noopener">
												{l.label}
											</a>
										))}
									</div>
								)}
								{cs.flow.note && <p className="note">{cs.flow.note}</p>}
							</section>
						)}
						{cs.shots && cs.shots.length > 0 && (
							<section className="detail-section" aria-labelledby="sec-shots">
								<h2 id="sec-shots" data-reveal>화면</h2>
								<div className="shots">
									{cs.shots.map((s) => (
										<figure key={s.src} data-reveal>
											<img src={asset(s.src)} alt={s.caption} loading="lazy" width={1050} height={675} />
											<figcaption>{s.caption}</figcaption>
										</figure>
									))}
								</div>
							</section>
						)}
					</>
				)}

				<nav className="pager" aria-label="다른 프로젝트">
					{newer ? (
						<Link to={`/projects/${newer.slug}`} className="prev" data-reveal>
							<span className="k">
								<IconLeft /> 최근 프로젝트
							</span>
							<span className="v">{newer.title}</span>
						</Link>
					) : (
						<span />
					)}
					{older ? (
						<Link to={`/projects/${older.slug}`} className="next" data-reveal>
							<span className="k">
								이전 프로젝트 <IconRight />
							</span>
							<span className="v">{older.title}</span>
						</Link>
					) : (
						<span />
					)}
				</nav>
			</div>
		</article>
	);
}

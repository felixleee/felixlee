import { Link } from 'react-router-dom';
import { metaLine, type Project } from '../data/projects';
import { asset } from '../lib/util';
import { IconDown, IconExternal, IconPlay } from './Icons';

/** Live(실서비스) · Demo(가상 데이터 데모) · 내려받기(.exe) 버튼 */
export function ProjectLinks({ project, withDetail = false }: { project: Project; withDetail?: boolean }) {
	if (!withDetail && !project.live && !project.demo && !project.download) return null; // 상세 페이지에 보여 줄 버튼이 없으면 빈 줄도 만들지 않음
	return (
		<div className="links">
			{withDetail && (
				<Link className="more" to={`/projects/${project.slug}`}>
					자세히
				</Link>
			)}
			{project.live && (
				<a href={project.live} target="_blank" rel="noopener">
					Live <IconExternal />
				</a>
			)}
			{project.demo && (
				<a className="is-demo" href={asset(project.demo)} target="_blank" rel="noopener">
					Demo <IconPlay />
				</a>
			)}
			{project.download && (
				<a href={project.download} rel="noopener" title="Windows 용 실행 파일(.exe)을 내려받아요">
					내려받기 <IconDown />
				</a>
			)}
		</div>
	);
}

export default function ProjectCard({ project }: { project: Project }) {
	const to = `/projects/${project.slug}`;
	return (
		<article className="card">
			<Link className="thumb" to={to} tabIndex={-1} aria-hidden="true">
				<img src={asset(project.thumb)} alt="" loading="lazy" width={800} height={500} />
			</Link>
			<div className="card-body">
				<div className="card-head">
					<h3>
						<Link to={to}>{project.title}</Link>
					</h3>
					<span className="year">{project.date}</span>
				</div>
				<p className="meta">{metaLine(project)}</p>
				<p className="point">{project.point}</p>
				<ul className="tags" aria-label="맡은 역할">
					{project.roles.map((r) => (
						<li key={r}>{r}</li>
					))}
				</ul>
				<ProjectLinks project={project} withDetail />
			</div>
		</article>
	);
}

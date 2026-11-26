import { Link } from 'react-router-dom';
import { useTitle } from '../lib/hooks';

export default function NotFound() {
	useTitle('페이지를 찾을 수 없어요');
	return (
		<section className="notfound">
			<div className="wrap">
				<p className="eyebrow">404</p>
				<h1>페이지를 찾을 수 없어요</h1>
				<p className="lead">주소가 바뀌었거나 없는 페이지예요.</p>
				<div className="hero-actions">
					<Link className="btn btn-accent" to="/">
						첫 화면으로
					</Link>
					<Link className="btn" to={{ pathname: '/', hash: '#projects' }}>
						프로젝트 보기
					</Link>
				</div>
			</div>
		</section>
	);
}

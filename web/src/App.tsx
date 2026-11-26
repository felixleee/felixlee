import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import NotFound from './pages/NotFound';
import ProjectDetail from './pages/ProjectDetail';
import './styles/portfolio.css';

export default function App() {
	return (
		<Routes>
			<Route path="/" element={<Layout />}>
				<Route index element={<Home />} />
				<Route path="projects/:slug" element={<ProjectDetail />} />
				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
}

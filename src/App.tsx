import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AgendaManager from "./pages/admin/AgendaManager";
import DocumentationManager from "./pages/admin/DocumentationManager";
import SiteSettingsManager from "./pages/admin/SiteSettingsManager";
import ProtectedRoute from "./components/ProtectedRoute";
import AgendaList from "./pages/AgendaList";
import AgendaDetail from "./pages/AgendaDetail";

function App() {
	return (
		<Router>
			<Routes>
				{/* Public Routes */}
				<Route path="/" element={<LandingPage />} />
				<Route path="/login" element={<Login />} />
				<Route path="/agenda" element={<AgendaList />} />
				<Route path="/agenda/:slug" element={<AgendaDetail />} />

				{/* Admin Routes */}
				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<AdminLayout />
						</ProtectedRoute>
					}
				>
					<Route index element={<AdminDashboard />} />
					<Route path="agenda" element={<AgendaManager />} />
					<Route path="documentation" element={<DocumentationManager />} />
					<Route path="settings" element={<SiteSettingsManager />} />
				</Route>
			</Routes>
		</Router>
	);
}

export default App;

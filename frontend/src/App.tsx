import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Phase 2 pages (to be implemented) */}
          <Route path="/check" element={<div className="p-8 text-center">Health Check (Coming soon)</div>} />
          <Route path="/history" element={<div className="p-8 text-center">History (Coming soon)</div>} />
          <Route path="/history/:id" element={<div className="p-8 text-center">Result (Coming soon)</div>} />
          
          <Route path="*" element={<div className="p-8 text-center">404 - Not Found</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

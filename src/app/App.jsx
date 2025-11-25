import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from '../components/layout/PublicLayout';
import LandingPage from '../pages/home/LandingPage';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import Dashboard from '../pages/dashboard/Dashboard';
import BrandDetails from '../pages/dashboard/BrandDetails';
import CreateBrand from '../pages/dashboard/CreateBrand';
import EditContent from '../pages/dashboard/EditContent';
import UserDetails from '../features/admin/UserDetails';
import About from '../pages/static/About';
import Blog from '../pages/static/Blog';
import Careers from '../pages/static/Careers';
import Contact from '../pages/static/Contact';
import Privacy from '../pages/static/Privacy';
import Terms from '../pages/static/Terms';
import Security from '../pages/static/Security';
import Api from '../pages/static/API';
import Integrations from '../pages/static/Integrations';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));

  return (
    <Router>
      <Routes>
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="about" element={<About />} />
          <Route path="blog" element={<Blog />} />
          <Route path="careers" element={<Careers />} />
          <Route path="contact" element={<Contact />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="terms" element={<Terms />} />
          <Route path="security" element={<Security />} />
          <Route path="api" element={<Api />} />
          <Route path="integrations" element={<Integrations />} />
        </Route>

        <Route
          path="/login"
          element={
            !isLoggedIn ? <Login onLogin={() => setIsLoggedIn(true)} /> : <Navigate to="/dashboard" replace />
          }
        />
        <Route path="/signup" element={<Signup onSignup={() => setIsLoggedIn(true)} />} />

        <Route
          path="/dashboard"
          element={
            isLoggedIn ? <Dashboard onLogout={() => setIsLoggedIn(false)} /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/brand/:id"
          element={isLoggedIn ? <BrandDetails /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/brands/new"
          element={isLoggedIn ? <CreateBrand /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/edit/:id"
          element={isLoggedIn ? <EditContent /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/view/:id"
          element={isLoggedIn ? <EditContent /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/user/:id"
          element={isLoggedIn ? <UserDetails /> : <Navigate to="/login" replace />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

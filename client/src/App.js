import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import DashboardLayout from './components/layout/DashboardLayout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import LinkAnalytics from './pages/LinkAnalytics';
import Audiences from './pages/Audiences';
import Links from './pages/Links';
import UserSettings from './pages/UserSettings';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />

          {/* App — shared layout, no /dashboard prefix */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/links" element={<Links />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/analytics/:shortCode" element={<LinkAnalytics />} />
            <Route path="/audiences" element={<Audiences />} />
            <Route path="/settings" element={<UserSettings />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

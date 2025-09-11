import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import Navbar from './components/Navbar';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import FamilyManagement from './pages/FamilyManagement';
import TestScheduling from './pages/TestScheduling';
import Notifications from './pages/Notifications';
import HealthReport from './pages/HealthReport';
import EmergencyButton from './components/EmergencyButton';
import LanguageSelector from './components/LanguageSelector';
import { AuthContext } from './context/AuthContext';
import { LanguageContext } from './context/LanguageContext';

interface User {
  id: string;
  phone: string;
  name: string;
  email?: string;
  verificationStatus: string;
  preferredLanguage: string;
  qrCode: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguage] = useState('malayalam');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token
    const token = localStorage.getItem('healthcareToken');
    const userData = localStorage.getItem('healthcareUser');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
        setLanguage(JSON.parse(userData).preferredLanguage || 'malayalam');
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('healthcareToken');
        localStorage.removeItem('healthcareUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setLanguage(userData.preferredLanguage || 'malayalam');
    localStorage.setItem('healthcareToken', token);
    localStorage.setItem('healthcareUser', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('healthcareToken');
    localStorage.removeItem('healthcareUser');
  };

  const changeLanguage = (newLanguage: string) => {
    setLanguage(newLanguage);
    if (user) {
      const updatedUser = { ...user, preferredLanguage: newLanguage };
      setUser(updatedUser);
      localStorage.setItem('healthcareUser', JSON.stringify(updatedUser));
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <LanguageContext.Provider value={{ language, changeLanguage }}>
        <Router>
          <div className="App">
            {user && <Navbar />}
            
            <Container fluid className={user ? "pt-4" : ""}>
              <Routes>
                <Route
                  path="/login"
                  element={user ? <Navigate to="/dashboard" /> : <Login />}
                />
                <Route
                  path="/signup"
                  element={user ? <Navigate to="/dashboard" /> : <Signup />}
                />
                <Route
                  path="/dashboard"
                  element={user ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                  path="/family"
                  element={user ? <FamilyManagement /> : <Navigate to="/login" />}
                />
                <Route
                  path="/tests"
                  element={user ? <TestScheduling /> : <Navigate to="/login" />}
                />
                <Route
                  path="/notifications"
                  element={user ? <Notifications /> : <Navigate to="/login" />}
                />
                <Route
                  path="/health-report"
                  element={user ? <HealthReport /> : <Navigate to="/login" />}
                />
                <Route
                  path="/"
                  element={<Navigate to={user ? "/dashboard" : "/login"} />}
                />
              </Routes>
            </Container>

            {user && (
              <>
                <EmergencyButton />
                <div className="position-fixed top-0 end-0 m-3 z-index-1000">
                  <LanguageSelector />
                </div>
              </>
            )}
          </div>
        </Router>
      </LanguageContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
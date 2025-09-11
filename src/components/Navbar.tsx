import React from 'react';
import { Navbar as BootstrapNavbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Users, Calendar, Bell, FileText, LogOut,
  Heart, Shield, Phone, Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: t('dashboard') },
    { path: '/family', icon: Users, label: t('family') },
    { path: '/tests', icon: Calendar, label: t('tests') },
    { path: '/notifications', icon: Bell, label: t('notifications') },
    { path: '/health-report', icon: FileText, label: t('healthReport') },
  ];

  return (
    <BootstrapNavbar 
      bg="success" 
      variant="dark" 
      expand="lg" 
      sticky="top"
      className="shadow-sm"
      style={{ background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' }}
    >
      <Container>
        <BootstrapNavbar.Brand as={Link} to="/dashboard" className="fw-bold d-flex align-items-center">
          <Heart className="me-2" size={24} />
          Kerala Healthcare
        </BootstrapNavbar.Brand>
        
        <BootstrapNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BootstrapNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  className={`d-flex align-items-center px-3 py-2 rounded-pill mx-1 transition-all ${
                    isActive ? 'bg-white bg-opacity-20 text-white fw-bold' : 'text-light'
                  }`}
                  style={{
                    transition: 'all 0.2s ease',
                    textDecoration: 'none'
                  }}
                >
                  <IconComponent size={18} className="me-2" />
                  <span className="d-none d-lg-inline">{item.label}</span>
                </Nav.Link>
              );
            })}
          </Nav>

          <Nav className="align-items-center">
            <div className="text-light me-3 d-none d-md-block">
              <div className="d-flex align-items-center">
                <Shield size={16} className="me-1" />
                <small>{user?.name}</small>
              </div>
              <div className="d-flex align-items-center mt-1">
                <Activity size={14} className="me-1" />
                <small className="opacity-75">
                  {user?.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
                </small>
              </div>
            </div>
            
            <Button
              variant="outline-light"
              size="sm"
              onClick={logout}
              className="d-flex align-items-center px-3 py-2 rounded-pill"
              style={{ 
                border: '1px solid rgba(255,255,255,0.3)',
                transition: 'all 0.2s ease'
              }}
            >
              <LogOut size={16} className="me-2" />
              <span className="d-none d-sm-inline">Logout</span>
            </Button>
          </Nav>
        </BootstrapNavbar.Collapse>
      </Container>
    </BootstrapNavbar>
  );
}

export default Navbar;
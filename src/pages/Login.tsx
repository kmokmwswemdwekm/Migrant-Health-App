import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Phone, Lock, Heart, Shield, Users, FileText } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

function Login() {
  const [formData, setFormData] = useState({ phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center"
      style={{
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 50%, #e0f2e0 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8} xl={6}>
            {/* Language Selector */}
            <div className="text-end mb-3">
              <LanguageSelector />
            </div>

            {/* Header */}
            <div className="text-center mb-4">
              <div className="d-flex justify-content-center align-items-center mb-3">
                <Heart 
                  size={40} 
                  className="text-success me-2"
                  style={{ filter: 'drop-shadow(0 2px 4px rgba(76,175,80,0.3))' }}
                />
                <h1 className="text-success fw-bold mb-0">Kerala Healthcare</h1>
              </div>
              <p className="text-muted fs-5">
                Migrant Workers Health Management System
              </p>
            </div>

            {/* Features Preview */}
            <Row className="mb-4">
              {[
                { icon: Shield, text: 'Secure & Verified' },
                { icon: Users, text: 'Family Management' },
                { icon: FileText, text: 'Health Reports' }
              ].map((feature, index) => (
                <Col key={index} xs={4} className="text-center">
                  <div className="bg-white rounded-circle p-3 d-inline-flex mb-2 shadow-sm">
                    <feature.icon size={24} className="text-success" />
                  </div>
                  <p className="small text-muted mb-0">{feature.text}</p>
                </Col>
              ))}
            </Row>

            {/* Login Form */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div 
                className="bg-success text-white p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                }}
              >
                <h3 className="mb-0 fw-bold">{t('login')}</h3>
                <p className="mb-0 opacity-90 small">Access your healthcare dashboard</p>
              </div>

              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center">
                    <div>{error}</div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-muted">
                      <Phone size={16} className="me-2" />
                      {t('phone')}
                    </Form.Label>
                    <Form.Control
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      placeholder="+91 XXXXX XXXXX"
                      className="py-3 border-0 bg-light"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <Lock size={16} className="me-2" />
                      {t('password')}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      className="py-3 border-0 bg-light"
                      style={{ fontSize: '16px' }}
                    />
                  </Form.Group>

                  <Button
                    type="submit"
                    variant="success"
                    className="w-100 py-3 fw-bold"
                    disabled={loading}
                    style={{
                      fontSize: '16px',
                      background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                      border: 'none'
                    }}
                  >
                    {loading ? 'Signing in...' : t('login')}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0 text-muted">
                    Don't have an account?{' '}
                    <Link 
                      to="/signup" 
                      className="text-success fw-semibold text-decoration-none"
                      style={{ transition: 'color 0.2s ease' }}
                    >
                      {t('signup')}
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>

            {/* Footer */}
            <div className="text-center mt-4">
              <p className="small text-muted mb-1">
                Powered by Government of Kerala
              </p>
              <p className="small text-muted">
                For emergencies, call <strong className="text-danger">108</strong>
              </p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login;
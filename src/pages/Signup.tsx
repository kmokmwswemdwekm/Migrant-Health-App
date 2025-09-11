import React, { useState } from 'react';
import { Card, Form, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Phone, Lock, User, Mail, MapPin, Calendar, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';

function Signup() {
  const [formData, setFormData] = useState({
    phone: '',
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    district: '',
    pincode: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { t } = useTranslation();

  const keralDistricts = [
    'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
    'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
    'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user, data.token);
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-vh-100 py-4"
      style={{
        background: 'linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 50%, #e0f2e0 100%)'
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={10} lg={8}>
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
                Create Your Healthcare Account
              </p>
            </div>

            {/* Signup Form */}
            <Card className="shadow-lg border-0 overflow-hidden">
              <div 
                className="bg-success text-white p-4 text-center"
                style={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                }}
              >
                <h3 className="mb-0 fw-bold">{t('signup')}</h3>
                <p className="mb-0 opacity-90 small">Register for healthcare services</p>
              </div>

              <Card.Body className="p-4">
                {error && (
                  <Alert variant="danger" className="d-flex align-items-center mb-4">
                    <div>{error}</div>
                  </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <Phone size={16} className="me-2" />
                          {t('phone')} *
                        </Form.Label>
                        <Form.Control
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="+91 XXXXX XXXXX"
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <User size={16} className="me-2" />
                          {t('name')} *
                        </Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Full name"
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <Lock size={16} className="me-2" />
                          Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          placeholder="Create password"
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <Lock size={16} className="me-2" />
                          Confirm Password *
                        </Form.Label>
                        <Form.Control
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          required
                          placeholder="Confirm password"
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <Mail size={16} className="me-2" />
                          Email
                        </Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your@email.com"
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <Calendar size={16} className="me-2" />
                          Date of Birth
                        </Form.Label>
                        <Form.Control
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="py-2 border-0 bg-light"
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">Gender</Form.Label>
                        <Form.Select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="py-2 border-0 bg-light"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold text-muted">
                          <MapPin size={16} className="me-2" />
                          District
                        </Form.Label>
                        <Form.Select
                          name="district"
                          value={formData.district}
                          onChange={handleChange}
                          className="py-2 border-0 bg-light"
                        >
                          <option value="">Select district</option>
                          {keralDistricts.map(district => (
                            <option key={district} value={district}>{district}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-muted">
                      <MapPin size={16} className="me-2" />
                      Address
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Current address"
                      className="border-0 bg-light"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">Pincode</Form.Label>
                    <Form.Control
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      placeholder="6-digit pincode"
                      className="py-2 border-0 bg-light"
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
                    {loading ? 'Creating Account...' : t('signup')}
                  </Button>
                </Form>

                <hr className="my-4" />

                <div className="text-center">
                  <p className="mb-0 text-muted">
                    Already have an account?{' '}
                    <Link 
                      to="/login" 
                      className="text-success fw-semibold text-decoration-none"
                    >
                      {t('login')}
                    </Link>
                  </p>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Signup;
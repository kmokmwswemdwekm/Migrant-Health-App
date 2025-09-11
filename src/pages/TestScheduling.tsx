import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Button, Modal, Form, Alert, Badge, ListGroup, Tab, Tabs 
} from 'react-bootstrap';
import { 
  Calendar, Plus, Clock, MapPin, FileText, CheckCircle, 
  AlertTriangle, RefreshCw, QrCode 
} from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import QRCode from 'react-qr-code';

interface Test {
  id: string;
  test_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: 'scheduled' | 'completed' | 'missed' | 'rescheduled';
  lab_name?: string;
  lab_location?: string;
  results?: string;
  qr_code: string;
  doctor_name?: string;
  hospital_name?: string;
  family_member_name?: string;
  relationship?: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
}

function TestScheduling() {
  const { t } = useTranslation();
  const [tests, setTests] = useState<Test[]>([]);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    testType: '',
    scheduledDate: '',
    scheduledTime: '09:00',
    familyMemberId: '',
    labName: '',
    labLocation: ''
  });

  const testTypes = [
    'Blood Test', 'Urine Test', 'X-Ray', 'ECG', 'Chest X-Ray',
    'General Health Check-up', 'Diabetes Screening', 'Blood Pressure Check',
    'Eye Examination', 'Dental Check-up'
  ];

  useEffect(() => {
    fetchTests();
    fetchFamilyMembers();
  }, []);

  const fetchTests = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch('/api/tests/user/tests', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTests(data.tests || []);
      }
    } catch (error) {
      console.error('Fetch tests error:', error);
    }
  };

  const fetchFamilyMembers = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch('/api/users/family-members', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setFamilyMembers(data.members || []);
      }
    } catch (error) {
      console.error('Fetch family members error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch('/api/tests/schedule-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          testType: formData.testType,
          scheduledDate: formData.scheduledDate,
          scheduledTime: formData.scheduledTime,
          familyMemberId: formData.familyMemberId || null,
          labName: formData.labName,
          labLocation: formData.labLocation
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({
          testType: '',
          scheduledDate: '',
          scheduledTime: '09:00',
          familyMemberId: '',
          labName: '',
          labLocation: ''
        });
        fetchTests();
      } else {
        setError(data.error || 'Failed to schedule test');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showQRCode = (test: Test) => {
    setSelectedTest(test);
    setShowQRModal(true);
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      'scheduled': 'primary',
      'completed': 'success',
      'missed': 'danger',
      'rescheduled': 'warning'
    };
    return colors[status as keyof typeof colors] || 'secondary';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return Clock;
      case 'completed': return CheckCircle;
      case 'missed': return AlertTriangle;
      case 'rescheduled': return RefreshCw;
      default: return Clock;
    }
  };

  const filterTests = (status: string) => {
    const today = new Date().toISOString().split('T')[0];
    
    switch (status) {
      case 'upcoming':
        return tests.filter(test => 
          test.status === 'scheduled' && test.scheduled_date >= today
        );
      case 'past':
        return tests.filter(test => 
          test.status === 'completed' || 
          (test.status === 'scheduled' && test.scheduled_date < today)
        );
      case 'missed':
        return tests.filter(test => test.status === 'missed');
      default:
        return tests;
    }
  };

  const renderTestCard = (test: Test) => {
    const StatusIcon = getStatusIcon(test.status);
    
    return (
      <ListGroup.Item key={test.id} className="border-0 border-bottom py-3">
        <div className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center flex-grow-1">
            <div 
              className={`rounded-circle p-2 me-3 bg-${getStatusBadge(test.status)} bg-opacity-10`}
              style={{ width: '48px', height: '48px' }}
            >
              <StatusIcon size={20} className={`text-${getStatusBadge(test.status)}`} />
            </div>
            
            <div className="flex-grow-1">
              <div className="d-flex align-items-center mb-1">
                <h6 className="mb-0 me-2">{test.test_type}</h6>
                <Badge bg={getStatusBadge(test.status)} className="rounded-pill">
                  {test.status}
                </Badge>
              </div>
              
              <div className="d-flex flex-wrap gap-3 text-muted small">
                <div className="d-flex align-items-center">
                  <Calendar size={14} className="me-1" />
                  {new Date(test.scheduled_date).toLocaleDateString()}
                </div>
                <div className="d-flex align-items-center">
                  <Clock size={14} className="me-1" />
                  {test.scheduled_time}
                </div>
                {test.lab_name && (
                  <div className="d-flex align-items-center">
                    <MapPin size={14} className="me-1" />
                    {test.lab_name}
                  </div>
                )}
                {test.family_member_name && (
                  <div>
                    For: {test.family_member_name} ({test.relationship})
                  </div>
                )}
              </div>
              
              {test.results && (
                <div className="mt-2">
                  <Badge bg="success" className="me-2">
                    <FileText size={12} className="me-1" />
                    Results Available
                  </Badge>
                </div>
              )}
            </div>
          </div>
          
          <div className="d-flex gap-2">
            <Button
              variant="outline-info"
              size="sm"
              onClick={() => showQRCode(test)}
            >
              <QrCode size={16} />
            </Button>
            {test.status === 'missed' && (
              <Button variant="outline-warning" size="sm">
                <RefreshCw size={16} />
              </Button>
            )}
          </div>
        </div>
      </ListGroup.Item>
    );
  };

  return (
    <div className="test-scheduling-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-1">
            <Calendar size={32} className="me-2 text-primary" />
            {t('tests')} & Scheduling
          </h2>
          <p className="text-muted mb-0">
            Manage your health check-ups and view test results
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center px-4 py-2"
        >
          <Plus size={20} className="me-2" />
          {t('scheduleTest')}
        </Button>
      </div>

      {/* Tests Tabs */}
      <Card className="border-0 shadow-sm">
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'upcoming')}
          className="border-0 px-3 pt-3"
        >
          <Tab 
            eventKey="upcoming" 
            title={
              <span className="d-flex align-items-center">
                <Clock size={16} className="me-2" />
                Upcoming ({filterTests('upcoming').length})
              </span>
            }
          >
            <Card.Body className="p-0">
              {filterTests('upcoming').length > 0 ? (
                <ListGroup variant="flush">
                  {filterTests('upcoming').map(renderTestCard)}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <Calendar size={48} className="text-muted opacity-50 mb-3" />
                  <h6 className="text-muted">No Upcoming Tests</h6>
                  <p className="text-muted small mb-4">
                    Schedule your next health check-up
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setShowModal(true)}
                  >
                    <Plus size={20} className="me-2" />
                    Schedule Test
                  </Button>
                </div>
              )}
            </Card.Body>
          </Tab>

          <Tab 
            eventKey="past" 
            title={
              <span className="d-flex align-items-center">
                <CheckCircle size={16} className="me-2" />
                Past Tests ({filterTests('past').length})
              </span>
            }
          >
            <Card.Body className="p-0">
              {filterTests('past').length > 0 ? (
                <ListGroup variant="flush">
                  {filterTests('past').map(renderTestCard)}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <FileText size={48} className="text-muted opacity-50 mb-3" />
                  <h6 className="text-muted">No Past Tests</h6>
                  <p className="text-muted small">
                    Your completed tests will appear here
                  </p>
                </div>
              )}
            </Card.Body>
          </Tab>

          <Tab 
            eventKey="missed" 
            title={
              <span className="d-flex align-items-center">
                <AlertTriangle size={16} className="me-2" />
                Missed ({filterTests('missed').length})
              </span>
            }
          >
            <Card.Body className="p-0">
              {filterTests('missed').length > 0 ? (
                <div>
                  <Alert variant="warning" className="m-3">
                    <AlertTriangle size={20} className="me-2" />
                    <strong>Missed Tests Require Attention</strong>
                    <div className="small mt-1">
                      Please reschedule these tests to maintain your health monitoring
                    </div>
                  </Alert>
                  <ListGroup variant="flush">
                    {filterTests('missed').map(renderTestCard)}
                  </ListGroup>
                </div>
              ) : (
                <div className="text-center py-5">
                  <CheckCircle size={48} className="text-success opacity-50 mb-3" />
                  <h6 className="text-success">Great! No Missed Tests</h6>
                  <p className="text-muted small">
                    Keep up the good work with your health appointments
                  </p>
                </div>
              )}
            </Card.Body>
          </Tab>
        </Tabs>
      </Card>

      {/* Schedule Test Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center">
            <Plus size={24} className="me-2" />
            {t('scheduleTest')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Test Type *</Form.Label>
                  <Form.Select
                    name="testType"
                    value={formData.testType}
                    onChange={handleChange}
                    required
                    className="py-2"
                  >
                    <option value="">Select test type</option>
                    {testTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">For Family Member</Form.Label>
                  <Form.Select
                    name="familyMemberId"
                    value={formData.familyMemberId}
                    onChange={handleChange}
                    className="py-2"
                  >
                    <option value="">For myself</option>
                    {familyMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.relationship})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Preferred Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Preferred Time *</Form.Label>
                  <Form.Select
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleChange}
                    required
                    className="py-2"
                  >
                    <option value="09:00">09:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="15:00">03:00 PM</option>
                    <option value="16:00">04:00 PM</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Laboratory/Hospital Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="labName"
                    value={formData.labName}
                    onChange={handleChange}
                    placeholder="e.g., Government Medical College Hospital"
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="labLocation"
                    value={formData.labLocation}
                    onChange={handleChange}
                    placeholder="e.g., Thiruvananthapuram"
                    className="py-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-3 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
                className="px-4"
              >
                {loading ? 'Scheduling...' : 'Schedule Test'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* QR Code Modal */}
      <Modal show={showQRModal} onHide={() => setShowQRModal(false)} centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="d-flex align-items-center">
            <QrCode size={24} className="me-2" />
            Test QR Code
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {selectedTest?.qr_code && (
            <div>
              <div className="p-3 bg-light rounded mb-3">
                <QRCode value={selectedTest.qr_code} size={200} />
              </div>
              <h6 className="text-info">{selectedTest.test_type}</h6>
              <p className="text-muted small mb-2">
                {new Date(selectedTest.scheduled_date).toLocaleDateString()} at {selectedTest.scheduled_time}
              </p>
              <p className="text-muted small">
                Show this QR code at the lab for quick check-in
              </p>
              <Badge bg="info" className="rounded-pill">
                {selectedTest.status}
              </Badge>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default TestScheduling;
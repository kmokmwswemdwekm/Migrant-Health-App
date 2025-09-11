import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Button, Modal, Form, Alert, Badge, ListGroup 
} from 'react-bootstrap';
import { Users, Plus, Edit3, QrCode, Calendar, Phone } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';
import QRCode from 'react-qr-code';

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  qr_code: string;
}

function FamilyManagement() {
  const { t } = useTranslation();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    medicalHistory: ''
  });

  useEffect(() => {
    fetchFamilyMembers();
  }, []);

  const fetchFamilyMembers = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch('/api/users/family-members', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMembers(data.members || []);
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
      const response = await fetch('/api/users/add-family-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setShowModal(false);
        setFormData({
          name: '',
          relationship: '',
          dateOfBirth: '',
          gender: '',
          phone: '',
          medicalHistory: ''
        });
        fetchFamilyMembers();
      } else {
        setError(data.error || 'Failed to add family member');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const showQRCode = (member: FamilyMember) => {
    setSelectedMember(member);
    setShowQRModal(true);
  };

  const getRelationshipBadge = (relationship: string) => {
    const colors = {
      'spouse': 'primary',
      'child': 'success',
      'parent': 'info',
      'sibling': 'warning',
      'other': 'secondary'
    };
    return colors[relationship.toLowerCase() as keyof typeof colors] || 'secondary';
  };

  return (
    <div className="family-management-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-1">
            <Users size={32} className="me-2 text-success" />
            {t('family')} Management
          </h2>
          <p className="text-muted mb-0">
            Manage your family members' healthcare profiles
          </p>
        </div>
        <Button
          variant="success"
          onClick={() => setShowModal(true)}
          className="d-flex align-items-center px-4 py-2"
        >
          <Plus size={20} className="me-2" />
          {t('addFamilyMember')}
        </Button>
      </div>

      {/* Family Members Grid */}
      <Row>
        {members.length > 0 ? (
          members.map((member) => (
            <Col key={member.id} md={6} lg={4} className="mb-4">
              <Card className="border-0 shadow-sm h-100 hover-card">
                <Card.Body className="p-4">
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="flex-grow-1">
                      <h5 className="mb-2 text-dark fw-bold">{member.name}</h5>
                      <Badge 
                        bg={getRelationshipBadge(member.relationship)}
                        className="rounded-pill mb-2"
                      >
                        {member.relationship}
                      </Badge>
                    </div>
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => showQRCode(member)}
                      className="ms-2"
                    >
                      <QrCode size={16} />
                    </Button>
                  </div>

                  <div className="member-details">
                    {member.date_of_birth && (
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <Calendar size={14} className="me-2" />
                        Born: {new Date(member.date_of_birth).toLocaleDateString()}
                      </div>
                    )}
                    {member.phone && (
                      <div className="d-flex align-items-center text-muted small mb-2">
                        <Phone size={14} className="me-2" />
                        {member.phone}
                      </div>
                    )}
                    {member.gender && (
                      <div className="text-muted small mb-2">
                        Gender: <span className="text-capitalize">{member.gender}</span>
                      </div>
                    )}
                  </div>

                  <div className="d-flex gap-2 mt-3">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="flex-fill"
                    >
                      <Edit3 size={14} className="me-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline-info"
                      size="sm"
                      className="flex-fill"
                      href="/tests"
                    >
                      <Calendar size={14} className="me-1" />
                      Tests
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12}>
            <Card className="border-0 shadow-sm text-center py-5">
              <Card.Body>
                <Users size={64} className="text-muted opacity-50 mb-3" />
                <h5 className="text-muted">No Family Members Added</h5>
                <p className="text-muted mb-4">
                  Add your family members to manage their healthcare together
                </p>
                <Button
                  variant="success"
                  onClick={() => setShowModal(true)}
                  className="px-4"
                >
                  <Plus size={20} className="me-2" />
                  {t('addFamilyMember')}
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Add Family Member Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title className="d-flex align-items-center">
            <Plus size={24} className="me-2" />
            {t('addFamilyMember')}
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
                  <Form.Label className="fw-semibold">Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter full name"
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Relationship *</Form.Label>
                  <Form.Select
                    name="relationship"
                    value={formData.relationship}
                    onChange={handleChange}
                    required
                    className="py-2"
                  >
                    <option value="">Select relationship</option>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                    <option value="grandparent">Grandparent</option>
                    <option value="grandchild">Grandchild</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Date of Birth</Form.Label>
                  <Form.Control
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="py-2"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Gender</Form.Label>
                  <Form.Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="py-2"
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Phone Number</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 XXXXX XXXXX"
                className="py-2"
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-semibold">Medical History (Optional)</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="medicalHistory"
                value={formData.medicalHistory}
                onChange={handleChange}
                placeholder="Any existing medical conditions, allergies, or ongoing treatments..."
              />
            </Form.Group>

            <div className="d-flex gap-3 justify-content-end">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
                disabled={loading}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="success"
                disabled={loading}
                className="px-4"
              >
                {loading ? 'Adding...' : t('save')}
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
            QR Code - {selectedMember?.name}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center p-4">
          {selectedMember?.qr_code && (
            <div>
              <div className="p-3 bg-light rounded mb-3">
                <QRCode value={selectedMember.qr_code} size={200} />
              </div>
              <h6 className="text-info">Health ID QR Code</h6>
              <p className="text-muted small">
                Use this QR code for quick check-ins at hospitals and labs
              </p>
              <Badge bg="info" className="rounded-pill">
                {selectedMember.relationship}
              </Badge>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        .hover-card {
          transition: transform 0.2s ease;
        }
        .hover-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default FamilyManagement;
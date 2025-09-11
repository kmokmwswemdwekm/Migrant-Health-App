import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert, Badge, ListGroup } from 'react-bootstrap';
import { 
  Calendar, Users, FileText, Bell, Activity, Heart,
  Clock, CheckCircle, AlertCircle, Plus, QrCode
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';
import QRCode from 'react-qr-code';

interface DashboardStats {
  upcomingTests: number;
  familyMembers: number;
  unreadNotifications: number;
  completedTests: number;
}

interface UpcomingTest {
  id: string;
  test_type: string;
  scheduled_date: string;
  scheduled_time: string;
  status: string;
}

function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    upcomingTests: 0,
    familyMembers: 0,
    unreadNotifications: 0,
    completedTests: 0
  });
  const [upcomingTests, setUpcomingTests] = useState<UpcomingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Fetch tests
      const testsResponse = await fetch('/api/tests/user/tests', { headers });
      const testsData = await testsResponse.json();

      // Fetch family members
      const familyResponse = await fetch('/api/users/family-members', { headers });
      const familyData = await familyResponse.json();

      // Fetch notifications
      const notificationsResponse = await fetch(`/api/notifications/${user?.id}`, { headers });
      const notificationsData = await notificationsResponse.json();

      if (testsResponse.ok && familyResponse.ok && notificationsResponse.ok) {
        const tests = testsData.tests || [];
        const today = new Date().toISOString().split('T')[0];
        
        const upcoming = tests.filter((test: UpcomingTest) => 
          test.status === 'scheduled' && test.scheduled_date >= today
        );
        
        const completed = tests.filter((test: UpcomingTest) => 
          test.status === 'completed'
        );

        const unread = notificationsData.notifications?.filter(
          (notif: any) => !notif.is_read
        ).length || 0;

        setStats({
          upcomingTests: upcoming.length,
          familyMembers: familyData.members?.length || 0,
          unreadNotifications: unread,
          completedTests: completed.length
        });

        setUpcomingTests(upcoming.slice(0, 3)); // Show only next 3
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: t('upcomingTests'),
      value: stats.upcomingTests,
      icon: Calendar,
      color: 'primary',
      description: 'Scheduled for this month'
    },
    {
      title: t('family'),
      value: stats.familyMembers,
      icon: Users,
      color: 'info',
      description: 'Family members registered'
    },
    {
      title: t('notifications'),
      value: stats.unreadNotifications,
      icon: Bell,
      color: 'warning',
      description: 'Unread notifications'
    },
    {
      title: 'Completed Tests',
      value: stats.completedTests,
      icon: CheckCircle,
      color: 'success',
      description: 'Total tests completed'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="mb-4">
        <Row className="align-items-center">
          <Col>
            <h2 className="mb-1 text-dark fw-bold">
              {t('welcome')}, {user?.name}! 👋
            </h2>
            <p className="text-muted mb-0">
              Here's your healthcare overview for today
            </p>
          </Col>
          <Col xs="auto">
            <Button
              variant="outline-success"
              onClick={() => setShowQR(!showQR)}
              className="d-flex align-items-center"
            >
              <QrCode size={20} className="me-2" />
              My QR Code
            </Button>
          </Col>
        </Row>

        {showQR && user?.qrCode && (
          <Row className="mt-3">
            <Col md={6} lg={4}>
              <Card className="border-success">
                <Card.Body className="text-center">
                  <div className="p-3 bg-white rounded">
                    <QRCode value={user.qrCode} size={200} />
                  </div>
                  <h6 className="mt-3 text-success">Your Health ID QR Code</h6>
                  <p className="small text-muted">
                    Show this at hospitals for quick check-in
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </div>

      {/* Verification Status */}
      {user?.verificationStatus === 'pending' && (
        <Alert variant="warning" className="d-flex align-items-center mb-4">
          <AlertCircle size={20} className="me-2" />
          <div>
            <strong>Account Verification Pending</strong>
            <div className="small mt-1">
              Complete your profile verification to access all features
            </div>
          </div>
        </Alert>
      )}

      {/* Stats Cards */}
      <Row className="mb-4">
        {statsCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Col key={index} sm={6} lg={3} className="mb-3">
              <Card 
                className="h-100 border-0 shadow-sm hover-card"
                style={{ 
                  background: `linear-gradient(135deg, var(--bs-${card.color}) 0%, var(--bs-${card.color}) 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s ease'
                }}
              >
                <Card.Body className="d-flex align-items-center">
                  <div className="flex-grow-1">
                    <div className="d-flex align-items-center mb-2">
                      <IconComponent size={20} className="me-2 opacity-90" />
                      <span className="small opacity-90">{card.title}</span>
                    </div>
                    <h3 className="mb-0 fw-bold">{card.value}</h3>
                    <small className="opacity-75">{card.description}</small>
                  </div>
                  <div className="text-end">
                    <IconComponent size={32} className="opacity-30" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Row>
        {/* Upcoming Tests */}
        <Col lg={8} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0 d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center">
                <Calendar size={20} className="text-primary me-2" />
                <h5 className="mb-0">{t('upcomingTests')}</h5>
              </div>
              <Button variant="outline-primary" size="sm" href="/tests">
                <Plus size={16} className="me-1" />
                Schedule Test
              </Button>
            </Card.Header>
            <Card.Body>
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : upcomingTests.length > 0 ? (
                <ListGroup variant="flush">
                  {upcomingTests.map((test) => (
                    <ListGroup.Item 
                      key={test.id}
                      className="d-flex align-items-center justify-content-between py-3 border-0 border-bottom"
                    >
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle bg-primary bg-opacity-10 p-2 me-3"
                          style={{ width: '40px', height: '40px' }}
                        >
                          <Activity size={16} className="text-primary" />
                        </div>
                        <div>
                          <h6 className="mb-1">{test.test_type}</h6>
                          <div className="d-flex align-items-center text-muted small">
                            <Clock size={14} className="me-1" />
                            {new Date(test.scheduled_date).toLocaleDateString()} at {test.scheduled_time}
                          </div>
                        </div>
                      </div>
                      <Badge bg="primary" className="rounded-pill">
                        {test.status}
                      </Badge>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <div className="text-center py-5">
                  <Calendar size={48} className="text-muted opacity-50 mb-3" />
                  <h6 className="text-muted">No upcoming tests</h6>
                  <p className="text-muted small">Schedule your health check-ups</p>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick Actions */}
        <Col lg={4} className="mb-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Header className="bg-white border-0">
              <div className="d-flex align-items-center">
                <Heart size={20} className="text-success me-2" />
                <h5 className="mb-0">Quick Actions</h5>
              </div>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-3">
                <Button
                  variant="outline-success"
                  className="d-flex align-items-center justify-content-start p-3"
                  href="/family"
                >
                  <Users size={20} className="me-3" />
                  <div className="text-start">
                    <div className="fw-semibold">Manage Family</div>
                    <small className="text-muted">Add or update family members</small>
                  </div>
                </Button>

                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center justify-content-start p-3"
                  href="/tests"
                >
                  <Calendar size={20} className="me-3" />
                  <div className="text-start">
                    <div className="fw-semibold">Schedule Test</div>
                    <small className="text-muted">Book health check-ups</small>
                  </div>
                </Button>

                <Button
                  variant="outline-info"
                  className="d-flex align-items-center justify-content-start p-3"
                  href="/health-report"
                >
                  <FileText size={20} className="me-3" />
                  <div className="text-start">
                    <div className="fw-semibold">Health Report</div>
                    <small className="text-muted">Download PDF report</small>
                  </div>
                </Button>

                {stats.unreadNotifications > 0 && (
                  <Button
                    variant="outline-warning"
                    className="d-flex align-items-center justify-content-start p-3"
                    href="/notifications"
                  >
                    <Bell size={20} className="me-3" />
                    <div className="text-start">
                      <div className="fw-semibold">Notifications</div>
                      <small className="text-muted">
                        {stats.unreadNotifications} unread messages
                      </small>
                    </div>
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <style>{`
        .hover-card:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
}

export default Dashboard;
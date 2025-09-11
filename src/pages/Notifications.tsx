import React, { useState, useEffect } from 'react';
import { Card, Alert, Button, Badge, ListGroup } from 'react-bootstrap';
import { 
  Bell, CheckCircle, AlertTriangle, Info, Calendar, 
  Heart, MoreVertical 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from '../context/LanguageContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'emergency' | 'reminder';
  is_read: boolean;
  created_at: string;
}

function Notifications() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch(`/api/notifications/${user?.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Fetch notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => 
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        ));
      }
    } catch (error) {
      console.error('Mark as read error:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('healthcareToken');
      const response = await fetch(`/api/notifications/user/${user?.id}/read-all`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
      }
    } catch (error) {
      console.error('Mark all as read error:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'reminder': return Calendar;
      case 'info':
      default: return Info;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'emergency': return 'danger';
      case 'warning': return 'warning';
      case 'reminder': return 'primary';
      case 'info':
      default: return 'info';
    }
  };

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="notifications-page">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="text-dark fw-bold mb-1">
            <Bell size={32} className="me-2 text-warning" />
            {t('notifications')}
            {unreadCount > 0 && (
              <Badge bg="warning" className="rounded-pill ms-2">
                {unreadCount}
              </Badge>
            )}
          </h2>
          <p className="text-muted mb-0">
            Stay updated with your healthcare activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline-primary"
            onClick={markAllAsRead}
            className="d-flex align-items-center"
          >
            <CheckCircle size={18} className="me-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <Card className="border-0 shadow-sm">
        {loading ? (
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </Card.Body>
        ) : notifications.length > 0 ? (
          <ListGroup variant="flush">
            {notifications.map((notification) => {
              const IconComponent = getNotificationIcon(notification.type);
              const colorClass = getNotificationColor(notification.type);
              
              return (
                <ListGroup.Item 
                  key={notification.id}
                  className={`border-0 border-bottom py-3 ${
                    !notification.is_read ? 'bg-light bg-opacity-50' : ''
                  }`}
                  style={{ 
                    borderLeftWidth: '4px',
                    borderLeftStyle: 'solid',
                    borderLeftColor: `var(--bs-${colorClass})`
                  }}
                >
                  <div className="d-flex align-items-start">
                    <div 
                      className={`rounded-circle p-2 me-3 bg-${colorClass} bg-opacity-10`}
                      style={{ width: '48px', height: '48px' }}
                    >
                      <IconComponent size={20} className={`text-${colorClass}`} />
                    </div>
                    
                    <div className="flex-grow-1">
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <h6 className="mb-0 fw-bold">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="text-primary ms-2">•</span>
                          )}
                        </h6>
                        <div className="d-flex align-items-center text-muted small">
                          <span className="me-2">
                            {new Date(notification.created_at).toLocaleDateString()}
                          </span>
                          {!notification.is_read && (
                            <Button
                              variant="link"
                              size="sm"
                              className="text-muted p-0"
                              onClick={() => markAsRead(notification.id)}
                              title="Mark as read"
                            >
                              <CheckCircle size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <p className="mb-0 text-muted">
                        {notification.message}
                      </p>
                      
                      <div className="d-flex align-items-center justify-content-between mt-2">
                        <Badge 
                          bg={colorClass} 
                          className="rounded-pill text-capitalize"
                        >
                          {notification.type}
                        </Badge>
                        <small className="text-muted">
                          {new Date(notification.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </small>
                      </div>
                    </div>
                  </div>
                </ListGroup.Item>
              );
            })}
          </ListGroup>
        ) : (
          <Card.Body className="text-center py-5">
            <Bell size={64} className="text-muted opacity-50 mb-3" />
            <h5 className="text-muted">No Notifications</h5>
            <p className="text-muted">
              You're all caught up! Notifications about your healthcare activities will appear here.
            </p>
          </Card.Body>
        )}
      </Card>

      {/* Notification Types Info */}
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0">
          <h6 className="mb-0 d-flex align-items-center">
            <Heart size={18} className="text-success me-2" />
            Notification Types
          </h6>
        </Card.Header>
        <Card.Body className="p-3">
          <div className="row g-3">
            {[
              { 
                type: 'emergency', 
                icon: AlertTriangle, 
                color: 'danger', 
                title: 'Emergency Alerts',
                description: 'Critical health situations requiring immediate attention'
              },
              { 
                type: 'warning', 
                icon: AlertTriangle, 
                color: 'warning', 
                title: 'Health Warnings',
                description: 'Important health reminders and missed appointments'
              },
              { 
                type: 'reminder', 
                icon: Calendar, 
                color: 'primary', 
                title: 'Appointment Reminders',
                description: 'Upcoming tests and scheduled health check-ups'
              },
              { 
                type: 'info', 
                icon: Info, 
                color: 'info', 
                title: 'Health Information',
                description: 'General updates and health-related information'
              }
            ].map((item) => {
              const IconComp = item.icon;
              return (
                <div key={item.type} className="col-md-6 col-lg-3">
                  <div className="d-flex align-items-center">
                    <div 
                      className={`rounded-circle p-2 me-2 bg-${item.color} bg-opacity-10`}
                      style={{ width: '36px', height: '36px' }}
                    >
                      <IconComp size={16} className={`text-${item.color}`} />
                    </div>
                    <div>
                      <div className="fw-semibold small">{item.title}</div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        {item.description}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

export default Notifications;
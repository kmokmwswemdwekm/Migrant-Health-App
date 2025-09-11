import React, { useState } from 'react';
import { Button, Modal, Alert, Spinner } from 'react-bootstrap';
import { Phone, MapPin, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

function EmergencyButton() {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertSent, setAlertSent] = useState(false);
  const { t } = useTranslation();

  const sendEmergencyAlert = async () => {
    setLoading(true);
    
    try {
      // Get user's location
      let location = null;
      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
      }

      const token = localStorage.getItem('healthcareToken');
      const response = await fetch('/api/emergency/notify-doctor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: 'Emergency assistance required',
          location
        })
      });

      if (response.ok) {
        setAlertSent(true);
        // Auto-hide modal after 3 seconds
        setTimeout(() => {
          setShowModal(false);
          setAlertSent(false);
        }, 3000);
      } else {
        throw new Error('Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Emergency alert error:', error);
      alert('Failed to send emergency alert. Please try calling directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Emergency Button */}
      <Button
        variant="danger"
        className="position-fixed rounded-circle shadow-lg border-0"
        style={{
          bottom: '20px',
          right: '20px',
          width: '60px',
          height: '60px',
          zIndex: 1000,
          background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
          animation: 'pulse 2s infinite'
        }}
        onClick={() => setShowModal(true)}
        title={t('emergency')}
      >
        <Phone size={24} className="text-white" />
      </Button>

      {/* Emergency Modal */}
      <Modal
        show={showModal}
        onHide={() => !loading && setShowModal(false)}
        centered
        backdrop={loading ? 'static' : true}
      >
        <Modal.Header closeButton={!loading} className="bg-danger text-white">
          <Modal.Title className="d-flex align-items-center">
            <AlertTriangle size={24} className="me-2" />
            {t('emergencyAlert')}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center py-4">
          {alertSent ? (
            <Alert variant="success" className="d-flex align-items-center">
              <div>
                <h5 className="mb-2">Alert Sent Successfully!</h5>
                <p className="mb-0">
                  Emergency services and nearby doctors have been notified. 
                  Help is on the way.
                </p>
              </div>
            </Alert>
          ) : loading ? (
            <div>
              <Spinner animation="border" variant="danger" className="mb-3" />
              <h5 className="text-danger">Sending Emergency Alert...</h5>
              <p className="text-muted">
                Notifying nearby doctors and healthcare workers
              </p>
            </div>
          ) : (
            <div>
              <div className="text-danger mb-3">
                <AlertTriangle size={48} />
              </div>
              <h5 className="text-danger mb-3">Emergency Assistance</h5>
              <p className="mb-4">
                This will immediately alert nearby doctors, hospitals, and 
                healthcare workers to your location.
              </p>
              
              <div className="d-flex justify-content-center gap-3">
                <Button
                  variant="danger"
                  size="lg"
                  onClick={sendEmergencyAlert}
                  disabled={loading}
                  className="px-4 d-flex align-items-center"
                >
                  <Phone size={20} className="me-2" />
                  Send Emergency Alert
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>

              <div className="mt-4 pt-3 border-top">
                <p className="small text-muted mb-2">
                  <MapPin size={16} className="me-1" />
                  Your location will be shared with emergency responders
                </p>
                <p className="small text-muted">
                  For immediate life-threatening emergencies, 
                  call <strong>108</strong> directly
                </p>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>

      <style>{`
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
      `}</style>
    </>
  );
}

export default EmergencyButton;
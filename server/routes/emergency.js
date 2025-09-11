const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Emergency alert endpoint
router.post('/notify-doctor', verifyToken, (req, res) => {
  try {
    const { message, location } = req.body;
    const { lat, lng } = location || {};

    const db = getDatabase();
    const emergencyId = uuidv4();

    // Create emergency alert
    db.prepare(`
      INSERT INTO emergency_alerts (id, user_id, location_lat, location_lng, message)
      VALUES (?, ?, ?, ?, ?)
    `).run(emergencyId, req.user.userId, lat || null, lng || null, message || 'Emergency assistance required');

    // Get user info for emergency response
    const user = db.prepare('SELECT name, phone, district FROM users WHERE id = ?')
      .get(req.user.userId);

    // Find nearest available doctors in the user's district
    const nearbyDoctors = db.prepare(`
      SELECT id, name, phone, hospital_name
      FROM doctors 
      WHERE district = ? 
      ORDER BY current_workload ASC 
      LIMIT 3
    `).all(user.district || 'Thiruvananthapuram');

    // Create emergency notifications for doctors and user
    const notifications = [];
    
    // Notify user
    const userNotificationId = uuidv4();
    notifications.push({
      id: userNotificationId,
      userId: req.user.userId,
      title: 'Emergency Alert Sent',
      message: 'Your emergency alert has been sent to nearby doctors and healthcare workers.',
      type: 'emergency'
    });

    // In a real implementation, this would send SMS/push notifications to doctors
    console.log('🚨 EMERGENCY ALERT:', {
      user: user.name,
      phone: user.phone,
      location: { lat, lng },
      message,
      nearbyDoctors: nearbyDoctors.length
    });

    // Insert all notifications
    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `);

    notifications.forEach(notification => {
      insertNotification.run(
        notification.id,
        notification.userId,
        notification.title,
        notification.message,
        notification.type
      );
    });

    res.json({
      message: 'Emergency alert sent successfully',
      emergencyId,
      contactedDoctors: nearbyDoctors.length,
      nearbyDoctors: nearbyDoctors.map(d => ({
        name: d.name,
        hospital: d.hospital_name
      }))
    });

  } catch (error) {
    console.error('Emergency alert error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get emergency alerts history
router.get('/alerts', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const alerts = db.prepare(`
      SELECT id, message, status, location_lat, location_lng, 
             created_at, resolved_at
      FROM emergency_alerts 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20
    `).all(req.user.userId);

    res.json({ alerts });

  } catch (error) {
    console.error('Get emergency alerts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
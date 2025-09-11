const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get notifications for user
router.get('/:userId', verifyToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user can only access their own notifications
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = getDatabase();
    const notifications = db.prepare(`
      SELECT id, title, message, type, is_read, created_at
      FROM notifications 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 50
    `).all(userId);

    res.json({ notifications });

  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:notificationId/read', verifyToken, (req, res) => {
  try {
    const { notificationId } = req.params;
    const db = getDatabase();

    // Verify notification belongs to user
    const notification = db.prepare(`
      SELECT user_id FROM notifications WHERE id = ?
    `).get(notificationId);

    if (!notification || notification.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    db.prepare('UPDATE notifications SET is_read = TRUE WHERE id = ?')
      .run(notificationId);

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/user/:userId/read-all', verifyToken, (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const db = getDatabase();
    db.prepare('UPDATE notifications SET is_read = TRUE WHERE user_id = ?')
      .run(userId);

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
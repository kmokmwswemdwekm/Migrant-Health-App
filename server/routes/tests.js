const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Schedule a test
router.post('/schedule-test', verifyToken, async (req, res) => {
  try {
    const { 
      testType, scheduledDate, scheduledTime, doctorId, 
      familyMemberId, labName, labLocation 
    } = req.body;

    if (!testType || !scheduledDate || !scheduledTime) {
      return res.status(400).json({ 
        error: 'Test type, date, and time are required' 
      });
    }

    const db = getDatabase();
    const testId = uuidv4();

    // Generate QR code for test
    const qrCodeData = JSON.stringify({
      type: 'test',
      id: testId,
      userId: req.user.userId,
      testType,
      scheduledDate,
      timestamp: Date.now()
    });
    const qrCode = await QRCode.toDataURL(qrCodeData);

    const insertTest = db.prepare(`
      INSERT INTO tests (
        id, user_id, family_member_id, doctor_id, test_type,
        scheduled_date, scheduled_time, lab_name, lab_location, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTest.run(
      testId, req.user.userId, familyMemberId || null, doctorId || null,
      testType, scheduledDate, scheduledTime, labName || null, 
      labLocation || null, qrCode
    );

    // Create notification
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      notificationId,
      req.user.userId,
      'Test Scheduled',
      `Your ${testType} test has been scheduled for ${scheduledDate} at ${scheduledTime}`,
      'reminder'
    );

    res.status(201).json({
      message: 'Test scheduled successfully',
      test: { id: testId, testType, scheduledDate, scheduledTime, qrCode }
    });

  } catch (error) {
    console.error('Schedule test error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user tests
router.get('/user/tests', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const tests = db.prepare(`
      SELECT t.*, d.name as doctor_name, d.hospital_name,
             fm.name as family_member_name, fm.relationship
      FROM tests t
      LEFT JOIN doctors d ON t.doctor_id = d.id
      LEFT JOIN family_members fm ON t.family_member_id = fm.id
      WHERE t.user_id = ?
      ORDER BY t.scheduled_date DESC, t.scheduled_time DESC
    `).all(req.user.userId);

    res.json({ tests });

  } catch (error) {
    console.error('Get tests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update test status
router.patch('/update-test-status/:testId', verifyToken, (req, res) => {
  try {
    const { testId } = req.params;
    const { status, results } = req.body;

    if (!['scheduled', 'completed', 'missed', 'rescheduled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const db = getDatabase();
    
    // Verify test belongs to user
    const test = db.prepare('SELECT user_id FROM tests WHERE id = ?').get(testId);
    if (!test || test.user_id !== req.user.userId) {
      return res.status(404).json({ error: 'Test not found' });
    }

    const updateTest = db.prepare(`
      UPDATE tests SET 
        status = ?, 
        results = ?, 
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateTest.run(status, results || null, testId);

    // Create notification based on status
    const notificationMessages = {
      completed: 'Your test has been completed. Results are available.',
      missed: 'You missed your scheduled test. Please reschedule.',
      rescheduled: 'Your test has been rescheduled.'
    };

    if (notificationMessages[status]) {
      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        notificationId,
        req.user.userId,
        'Test Status Update',
        notificationMessages[status],
        status === 'missed' ? 'warning' : 'info'
      );
    }

    res.json({ message: 'Test status updated successfully' });

  } catch (error) {
    console.error('Update test status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Auto-reschedule missed tests (AI feature)
router.post('/auto-reschedule-missed', verifyToken, async (req, res) => {
  try {
    const db = getDatabase();
    
    // Find missed tests from yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const missedTests = db.prepare(`
      UPDATE tests SET status = 'missed' 
      WHERE status = 'scheduled' 
      AND scheduled_date = ? 
      AND user_id = ?
      RETURNING id, test_type
    `).all(yesterdayStr, req.user.userId);

    // Auto-reschedule for next available slot (7 days from now)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    for (const test of missedTests) {
      const newTestId = uuidv4();
      const qrCodeData = JSON.stringify({
        type: 'test',
        id: newTestId,
        userId: req.user.userId,
        testType: test.test_type,
        scheduledDate: nextWeekStr,
        rescheduled: true,
        timestamp: Date.now()
      });
      const qrCode = await QRCode.toDataURL(qrCodeData);

      db.prepare(`
        INSERT INTO tests (
          id, user_id, family_member_id, doctor_id, test_type,
          scheduled_date, scheduled_time, status, qr_code
        ) 
        SELECT ?, user_id, family_member_id, doctor_id, test_type,
               ?, '10:00', 'scheduled', ?
        FROM tests WHERE id = ?
      `).run(newTestId, nextWeekStr, qrCode, test.id);

      // Create notification
      const notificationId = uuidv4();
      db.prepare(`
        INSERT INTO notifications (id, user_id, title, message, type)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        notificationId,
        req.user.userId,
        'Test Auto-Rescheduled',
        `Your missed ${test.test_type} test has been automatically rescheduled for ${nextWeekStr}`,
        'info'
      );
    }

    res.json({ 
      message: `${missedTests.length} tests auto-rescheduled`,
      rescheduledCount: missedTests.length
    });

  } catch (error) {
    console.error('Auto-reschedule error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
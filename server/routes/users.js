const express = require('express');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Add family member
router.post('/add-family-member', verifyToken, async (req, res) => {
  try {
    const { name, relationship, dateOfBirth, gender, phone, medicalHistory } = req.body;
    
    if (!name || !relationship) {
      return res.status(400).json({ error: 'Name and relationship are required' });
    }

    const db = getDatabase();
    const memberId = uuidv4();
    
    // Generate QR code for family member
    const qrCodeData = JSON.stringify({
      type: 'family_member',
      id: memberId,
      userId: req.user.userId,
      name,
      relationship,
      timestamp: Date.now()
    });
    const qrCode = await QRCode.toDataURL(qrCodeData);

    const insertMember = db.prepare(`
      INSERT INTO family_members (
        id, user_id, name, relationship, date_of_birth, 
        gender, phone, medical_history, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMember.run(
      memberId, req.user.userId, name, relationship, 
      dateOfBirth || null, gender || null, phone || null, 
      medicalHistory || null, qrCode
    );

    res.status(201).json({
      message: 'Family member added successfully',
      member: { id: memberId, name, relationship, qrCode }
    });

  } catch (error) {
    console.error('Add family member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get family members
router.get('/family-members', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const members = db.prepare(`
      SELECT id, name, relationship, date_of_birth, gender, phone, qr_code 
      FROM family_members WHERE user_id = ?
    `).all(req.user.userId);

    res.json({ members });

  } catch (error) {
    console.error('Get family members error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user profile
router.get('/profile', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const user = db.prepare(`
      SELECT id, phone, name, email, date_of_birth, gender, address, 
             district, verification_status, preferred_language, qr_code
      FROM users WHERE id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update user profile
router.patch('/profile', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const { name, email, address, district, preferredLanguage } = req.body;

    const updateUser = db.prepare(`
      UPDATE users SET 
        name = COALESCE(?, name),
        email = COALESCE(?, email),
        address = COALESCE(?, address),
        district = COALESCE(?, district),
        preferred_language = COALESCE(?, preferred_language),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateUser.run(name, email, address, district, preferredLanguage, req.user.userId);

    res.json({ message: 'Profile updated successfully' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get health report
router.get('/health-report', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    
    // Get user info
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.userId);
    
    // Get recent tests
    const tests = db.prepare(`
      SELECT t.*, d.name as doctor_name, d.hospital_name
      FROM tests t
      LEFT JOIN doctors d ON t.doctor_id = d.id
      WHERE t.user_id = ?
      ORDER BY t.scheduled_date DESC
      LIMIT 10
    `).all(req.user.userId);

    // Get family members
    const familyMembers = db.prepare(`
      SELECT id, name, relationship FROM family_members WHERE user_id = ?
    `).all(req.user.userId);

    const healthReport = {
      user: {
        name: user.name,
        phone: user.phone,
        verificationStatus: user.verification_status,
        qrCode: user.qr_code
      },
      tests,
      familyMembers,
      generatedAt: new Date().toISOString()
    };

    res.json({ healthReport });

  } catch (error) {
    console.error('Get health report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
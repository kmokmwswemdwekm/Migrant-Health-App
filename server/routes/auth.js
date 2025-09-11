const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');
const { getDatabase } = require('../database/init');
const { generateToken } = require('../middleware/auth');

const router = express.Router();

// Signup endpoint
router.post('/signup', async (req, res) => {
  try {
    const { phone, name, password, email, dateOfBirth, gender, address, district, pincode } = req.body;

    if (!phone || !name || !password) {
      return res.status(400).json({ error: 'Phone, name, and password are required' });
    }

    // Check if user already exists
    const db = getDatabase();
    const existingUser = db.prepare('SELECT id FROM users WHERE phone = ?').get(phone);
    
    if (existingUser) {
      return res.status(400).json({ error: 'User with this phone number already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Generate unique user ID and QR code
    const userId = uuidv4();
    const qrCodeData = JSON.stringify({
      type: 'user',
      id: userId,
      phone,
      name,
      timestamp: Date.now()
    });
    const qrCode = await QRCode.toDataURL(qrCodeData);

    // Insert user into database
    const insertUser = db.prepare(`
      INSERT INTO users (
        id, phone, name, password_hash, email, date_of_birth, 
        gender, address, district, pincode, qr_code
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      userId, phone, name, passwordHash, email || null, 
      dateOfBirth || null, gender || null, address || null, 
      district || 'Kerala', pincode || null, qrCode
    );

    // Generate JWT token
    const token = generateToken({ userId, phone, name });

    // Send welcome notification
    const notificationId = uuidv4();
    const insertNotification = db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    insertNotification.run(
      notificationId,
      userId,
      'Welcome to Kerala Healthcare',
      'Your account has been created successfully. Complete your profile verification for full access.',
      'info'
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: { id: userId, phone, name, email, qrCode }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: 'Phone and password are required' });
    }

    const db = getDatabase();
    const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(phone);

    if (!user) {
      return res.status(400).json({ error: 'Invalid phone number or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid phone number or password' });
    }

    const token = generateToken({ userId: user.id, phone: user.phone, name: user.name });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        email: user.email,
        verificationStatus: user.verification_status,
        preferredLanguage: user.preferred_language,
        qrCode: user.qr_code
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify OTP endpoint (simulation)
router.post('/verify-otp', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    // In a real implementation, verify against SMS service
    // For demo purposes, accept any 6-digit number
    if (otp && otp.toString().length === 6) {
      const db = getDatabase();
      db.prepare('UPDATE users SET verification_status = ? WHERE phone = ?')
        .run('verified', phone);

      res.json({ message: 'Phone number verified successfully' });
    } else {
      res.status(400).json({ error: 'Invalid OTP' });
    }

  } catch (error) {
    console.error('OTP verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
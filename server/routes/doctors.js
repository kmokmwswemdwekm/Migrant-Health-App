const express = require('express');
const { getDatabase } = require('../database/init');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

// Get all doctors
router.get('/', verifyToken, (req, res) => {
  try {
    const db = getDatabase();
    const { district, specialization } = req.query;
    
    let query = `
      SELECT id, name, specialization, hospital_name, district, 
             phone, current_workload, max_patients_per_day, languages
      FROM doctors
    `;
    const params = [];
    const conditions = [];

    if (district) {
      conditions.push('district = ?');
      params.push(district);
    }

    if (specialization) {
      conditions.push('specialization LIKE ?');
      params.push(`%${specialization}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY current_workload ASC, name ASC';

    const doctors = db.prepare(query).all(...params);

    res.json({ doctors });

  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign doctor using AI optimization
router.post('/assign-doctor', verifyToken, (req, res) => {
  try {
    const { preferredDistrict, specialization, urgency = 'normal' } = req.body;
    
    const db = getDatabase();
    
    // AI-based doctor assignment logic
    let query = `
      SELECT id, name, specialization, hospital_name, district, 
             phone, current_workload, max_patients_per_day, languages
      FROM doctors
      WHERE current_workload < max_patients_per_day
    `;
    const params = [];
    
    if (specialization) {
      query += ' AND specialization LIKE ?';
      params.push(`%${specialization}%`);
    }

    // Prioritize by district match, then by workload
    if (preferredDistrict) {
      query += ` ORDER BY 
        CASE WHEN district = ? THEN 0 ELSE 1 END,
        current_workload ASC,
        RANDOM()
      `;
      params.push(preferredDistrict);
    } else {
      query += ' ORDER BY current_workload ASC, RANDOM()';
    }

    query += ' LIMIT 1';

    const assignedDoctor = db.prepare(query).get(...params);

    if (!assignedDoctor) {
      return res.status(404).json({ 
        error: 'No available doctors found matching your criteria' 
      });
    }

    // Update doctor's workload
    db.prepare('UPDATE doctors SET current_workload = current_workload + 1 WHERE id = ?')
      .run(assignedDoctor.id);

    // Create notification for user
    const { v4: uuidv4 } = require('uuid');
    const notificationId = uuidv4();
    db.prepare(`
      INSERT INTO notifications (id, user_id, title, message, type)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      notificationId,
      req.user.userId,
      'Doctor Assigned',
      `Dr. ${assignedDoctor.name} has been assigned to you at ${assignedDoctor.hospital_name}`,
      'info'
    );

    res.json({
      message: 'Doctor assigned successfully',
      doctor: assignedDoctor
    });

  } catch (error) {
    console.error('Assign doctor error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
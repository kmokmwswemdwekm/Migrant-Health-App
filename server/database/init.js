const Database = require('better-sqlite3');
const path = require('path');

let db;

function initializeDatabase() {
  try {
    db = new Database(path.join(__dirname, 'healthcare.db'));
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    createTables();
    seedInitialData();
    
    console.log('✅ Database initialized successfully');
    return db;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

function createTables() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      phone TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      email TEXT,
      password_hash TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      address TEXT,
      district TEXT,
      state TEXT DEFAULT 'Kerala',
      pincode TEXT,
      government_id_type TEXT,
      government_id_number TEXT,
      government_id_image TEXT,
      verification_status TEXT DEFAULT 'pending',
      preferred_language TEXT DEFAULT 'malayalam',
      emergency_contact TEXT,
      qr_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Family members table
  db.exec(`
    CREATE TABLE IF NOT EXISTS family_members (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      date_of_birth DATE,
      gender TEXT CHECK(gender IN ('male', 'female', 'other')),
      phone TEXT,
      medical_history TEXT,
      qr_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Doctors table
  db.exec(`
    CREATE TABLE IF NOT EXISTS doctors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      specialization TEXT NOT NULL,
      hospital_name TEXT NOT NULL,
      hospital_type TEXT DEFAULT 'government',
      district TEXT NOT NULL,
      phone TEXT NOT NULL,
      available_hours TEXT,
      current_workload INTEGER DEFAULT 0,
      max_patients_per_day INTEGER DEFAULT 20,
      languages TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Tests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS tests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      family_member_id TEXT,
      doctor_id TEXT,
      test_type TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      scheduled_time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'missed', 'rescheduled')),
      results TEXT,
      lab_name TEXT,
      lab_location TEXT,
      qr_code TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (family_member_id) REFERENCES family_members(id) ON DELETE CASCADE,
      FOREIGN KEY (doctor_id) REFERENCES doctors(id)
    )
  `);

  // Notifications table
  db.exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('info', 'warning', 'emergency', 'reminder')),
      is_read BOOLEAN DEFAULT FALSE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Emergency alerts table
  db.exec(`
    CREATE TABLE IF NOT EXISTS emergency_alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      location_lat REAL,
      location_lng REAL,
      message TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'resolved')),
      responder_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      resolved_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log('✅ Database tables created');
}

function seedInitialData() {
  // Check if doctors already exist
  const doctorCount = db.prepare('SELECT COUNT(*) as count FROM doctors').get();
  
  if (doctorCount.count === 0) {
    // Insert sample government doctors across Kerala districts
    const doctors = [
      {
        id: 'doc-001',
        name: 'Dr. Priya Nair',
        specialization: 'General Medicine',
        hospital_name: 'Government Medical College Hospital, Thiruvananthapuram',
        district: 'Thiruvananthapuram',
        phone: '+91-471-2442811',
        languages: 'Malayalam,English,Tamil'
      },
      {
        id: 'doc-002',
        name: 'Dr. Rajesh Kumar',
        specialization: 'Internal Medicine',
        hospital_name: 'Ernakulam General Hospital',
        district: 'Ernakulam',
        phone: '+91-484-2370073',
        languages: 'Malayalam,English,Hindi'
      },
      {
        id: 'doc-003',
        name: 'Dr. Fatima Beevi',
        specialization: 'Family Medicine',
        hospital_name: 'Kozhikode Medical College Hospital',
        district: 'Kozhikode',
        phone: '+91-495-2359336',
        languages: 'Malayalam,English,Urdu'
      },
      {
        id: 'doc-004',
        name: 'Dr. Suresh Pillai',
        specialization: 'Occupational Health',
        hospital_name: 'Kollam District Hospital',
        district: 'Kollam',
        phone: '+91-474-2794104',
        languages: 'Malayalam,English'
      },
      {
        id: 'doc-005',
        name: 'Dr. Meera Thomas',
        specialization: 'Preventive Medicine',
        hospital_name: 'Thrissur Medical College',
        district: 'Thrissur',
        phone: '+91-487-2420212',
        languages: 'Malayalam,English,Hindi'
      }
    ];

    const insertDoctor = db.prepare(`
      INSERT INTO doctors (id, name, specialization, hospital_name, district, phone, languages)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    doctors.forEach(doctor => {
      insertDoctor.run(
        doctor.id,
        doctor.name,
        doctor.specialization,
        doctor.hospital_name,
        doctor.district,
        doctor.phone,
        doctor.languages
      );
    });

    console.log('✅ Sample doctors added');
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

module.exports = { initializeDatabase, getDatabase };
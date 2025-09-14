AURA – Kerala Migrant Healthcare App

AURA is a full-stack healthcare platform designed to support migrant workers in Kerala.
It provides multilingual access to healthcare features like doctor availability, emergency alerts, notifications, and test scheduling.

🚀 Features

User Authentication – Signup & Login system with JWT-based authentication.

Multilingual Support – Language selector for better accessibility.

Healthcare Dashboard – View health reports and family management options.

Emergency Button – Quick one-click SOS for urgent medical help.

Notifications System – Alerts for appointments, emergencies, and updates.

Doctor & Test Scheduling – Book appointments and medical tests.

🛠️ Tech Stack
Frontend

React (with TypeScript + Vite)

TailwindCSS (for styling)

Context API (for state management)

Components: Navbar, LanguageSelector, EmergencyButton

Backend

Node.js + Express

Middleware: Authentication handling

Routes:

auth.js → User authentication (login/signup)

doctors.js → Doctor-related operations

emergency.js → Emergency features

notifications.js → Notifications handling

tests.js → Test scheduling

users.js → User management

Database

SQLite (using better-sqlite3) stored in /server/database/

📂 Project Structure
project-root/
│── server/                # Backend server code
│   ├── database/          # SQLite database files
│   ├── middleware/        # Custom middleware (auth, etc.)
│   ├── routes/            # Express routes
│   ├── init.js            # DB initialization
│   ├── app.js             # Express app entry
│
│── src/                   # Frontend React app
│   ├── components/        # Reusable UI components
│   ├── context/           # React context providers
│   ├── pages/             # Main application pages
│   ├── App.tsx            # Root component
│   ├── main.tsx           # Vite entry point
│
│── .bolt/                 # Project config (Bolt.dev)
│── package.json           # Dependencies & scripts
│── vite.config.ts         # Vite configuration
│── tailwind.config.js     # TailwindCSS config
│── tsconfig.json          # TypeScript config

⚡ Getting Started
1️⃣ Clone the Repository
git clone https://github.com/your-username/aura.git
cd aura

2️⃣ Install Dependencies

Make sure you are using Node.js v18 LTS.
Then install dependencies:

npm install --legacy-peer-deps

3️⃣ Run the Application

Start both backend & frontend:

npm run dev


Frontend → http://localhost:3000

Backend → http://localhost:5000

📜 Available Scripts

npm run dev → Run frontend & backend together (via concurrently)

npm run server → Run backend server only

npm run client → Run React frontend only

🔐 Authentication

JWT-based login & signup

Middleware protection for API routes

User sessions handled via AuthContext in frontend

🌍 Multilingual Support

LanguageSelector.tsx allows switching between supported languages.

Content updates dynamically using LanguageContext.

📅 Roadmap

 Add role-based access (Doctor, Patient, Admin)

 Improve UI/UX with animations

 Deploy to cloud (Vercel for frontend, Railway/Heroku for backend)

 Add real-time emergency alerts via WebSockets

🤝 Contributing

Fork the repo

Create a new branch (feature-xyz)

Commit your changes

Push & create a PR

📄 License

MIT License © 2025 AURA Project

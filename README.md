<div align="center">

# 🎓 EduZone

**A Comprehensive Digital Ecosystem Reimagining Education Management & Resource Allocation**

[![React](https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Framework-Express-lightgray?style=for-the-badge&logo=express)](https://expressjs.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=for-the-badge&logo=sqlite)](https://www.sqlite.org/)

A unified platform connecting Schools, Principals, Teachers, Zonal Education Officers (ZEO), and Donors to streamline administrative operations, foster inter-school welfare, and transparently route community donations.

</div>

---

## ✨ Key Features

- **🛡️ Multi-Tier Authentication:** Securely engineered role-based access for Principals, Teachers, ZEOs, and public Donors.
- **🏫 School & Principal Dashboards:** Automate monthly reporting, visualize student-staff attendance metrics, and seamlessly issue regional circulars.
- **❤️ Transparent Donation Network:** Direct connections between benefactors and institutional welfare requests. Donors can seamlessly select programs and visualize their impact.
- **🔀 Teacher Transfers Hub:** Built-in capabilities dedicated to managing, reviewing, and approving regional teacher transfer applications directly through ZEO pathways.
- **📚 Open Resource Repository:** A public reservoir where schools share digital resources, curriculums, and documentation with the broader community.

---

## 💻 Tech Stack

### Frontend (User Interface)
- **Vite + React.js**: Lightning-fast, component-driven UI.
- **Tailwind CSS**: Sleek, modern, and completely responsive styling.
- **Context API & Hooks**: Fluid state management across deeply nested role-dashboards.

### Backend (Server & Database)
- **Node.js & Express.js**: Resilient, scalable, and non-blocking REST API architecture.
- **Sequelize ORM**: Graceful, robust data mapping and relational constraints.
- **SQLite / PostgreSQL Ready**: Engineered safely mapped environments for rapid local tests and production transitions.
- **Jest & Supertest**: Full API protection backed by a 100% automated CI-ready testing suite.

---

## 🛠️ Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/eduzone.git
   cd eduzone
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Setup environment variables using .env.example
   cp .env.example .env
   
   npm start
   # API will launch on http://localhost:5000
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   
   # Setup Vite environment
   npm run dev
   # App will launch on http://localhost:5173
   ```

---

## 🧪 Testing

The backend is armored with a robust, automated test environment explicitly mocked for rapid speed and efficiency.
```bash
cd backend
npm test
```
*Current Coverage includes fully authenticated workflows surrounding Welfare, Resources, Schools, Reports, and Donation suites.*

---

<div align="center">
<i>Empowering communities. Modernizing schools. Revolutionizing education management.</i>
<br><br>
<b>Made with ❤️ for the Future of Education</b>
</div>

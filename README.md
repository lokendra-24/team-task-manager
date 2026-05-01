# 🚀 TaskFlow: Premium SaaS Task Management System

A high-fidelity, production-grade SaaS task management platform designed for modern teams. Built with a robust **FastAPI** backend and a sleek, responsive **React** frontend, TaskFlow offers granular task ownership, team collaboration, and real-time activity tracking.

![Project Banner](https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=2000)

## ✨ Core Features

### 📊 Professional Dashboard
- **Real-time Analytics**: Visual breakdown of task distribution by status.
* **Smart Stat Cards**: Instant visibility into total, completed, pending, and overdue tasks.
* **Team Overview**: Quick glance at tasks assigned to you and high-priority alerts.

### 🛠️ Advanced Task Management
- **Kanban & List Views**: Flexible task visualization for different workflows.
* **Granular Ownership**: Clear distinction between creators and assignees.
* **Priority Alerts**: Visual indicators for high-priority and overdue tasks.
* **Role-Based Access Control (RBAC)**: Secure access levels for Admins and Team Members.

### 🛡️ Enterprise-Grade Backend
- **FastAPI Core**: High-performance, asynchronous Python backend.
* **JWT Authentication**: Secure stateless authentication with industry-standard JWT tokens.
* **CORS Optimized**: Pre-configured for secure cross-origin resource sharing.
* **Database Migrations**: Managed with Alembic for safe, version-controlled schema updates.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://reactjs.org/) (Vite)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Charts**: [Recharts](https://recharts.org/)
* **Icons**: [Lucide React](https://lucide.dev/)

### Backend
- **Engine**: [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
* **ORM**: [SQLAlchemy 2.0](https://www.sqlalchemy.org/)
* **Database**: [PostgreSQL](https://www.postgresql.org/)
* **Migrations**: [Alembic](https://alembic.sqlalchemy.org/)

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```
*API runs at:* `http://localhost:8000`

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
*Frontend runs at:* `http://localhost:5173`

---

## ☁️ Deployment (Railway)

TaskFlow is optimized for **Railway** deployment:

1. **Backend Service**:
   - Set root directory to `backend/`.
   - Add PostgreSQL plugin.
   - Set `DATABASE_URL` and `SECRET_KEY` in environment variables.
   
2. **Frontend Service**:
   - Set root directory to `frontend/`.
   - Set `VITE_API_BASE_URL` to your deployed backend URL.
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run preview -- --host 0.0.0.0 --port ${PORT}`

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License
This project is licensed under the MIT License.

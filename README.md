# EduManage — Student Management System

A full-featured Student Management System built with React and Supabase, featuring role-based access, AI-powered grade prediction, and real-time data persistence.

## 🚀 Live Demo
> Coming soon (Vercel deployment)

## ✨ Features

- **Role-Based Access** — Separate dashboards for Admin, Teacher, Student, and Parent
- **Student Management** — Add, edit, delete students with full CRUD operations
- **Attendance Tracking** — Mark and monitor student attendance by class and subject
- **Marks & Results** — Enter and track student marks across subjects and exam types
- **AI Grade Prediction** — Predict student final grades based on attendance, mid-term scores, study hours, and assignments using a weighted ML formula
- **Analytics Dashboard** — Visual charts for student distribution, gender split, subject performance, and fee collection
- **CSV Export** — Export student data to CSV with one click
- **Fee Management** — Track fee payment status (Paid, Pending, Overdue)
- **Search & Filter** — Search students by name, roll number, or email; filter by class and gender
- **Student Profile Modal** — Detailed student view with performance charts and radar graph
- **Real Database** — Supabase PostgreSQL backend with persistent data storage

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Database | Supabase (PostgreSQL) |
| Build Tool | Vite |
| Icons | Lucide React |

## 📦 Installation

1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/edumanage-sms.git
cd edumanage-sms
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` in root folder
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server
```bash
npm run dev
```

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | password |
| Teacher | sunita.mehta@school.com | password |
| Student | rahul.sharma@school.com | password |
| Parent | vijay.sharma@parent.com | password |

## 📁 Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/          # Admin-specific components
│   │   ├── teacher/        # Teacher-specific components
│   │   ├── dashboards/     # Role-based dashboards
│   │   └── Login.tsx       # Authentication page
│   ├── context/
│   │   └── AppContext.tsx  # Global state + Supabase integration
│   ├── lib/
│   │   └── supabase.ts     # Supabase client
│   ├── data/
│   │   └── mockData.ts     # Fallback mock data
│   └── types/
│       └── index.ts        # TypeScript interfaces
```

## 🎓 About

Built as a Minor Project for B.Tech Computer Science (AI/ML), Semester 4.

**Developer:** Neha Devi  
**Tech Focus:** Frontend Development + Database Integration
# EduManage — Student Management System

A full-stack Student Management System built with React, TypeScript, and Supabase, featuring role-based access for Admin, Teacher, Student, and Parent.

## ✨ Features

### Admin
- Manage Students — Add, edit, delete with Supabase Auth account creation
- Manage Teachers — Full CRUD with role-based access
- Fee Management — Track payments, collection rates, fee structure
- Report Cards — Generate and print student report cards
- Grade Prediction — Weighted scoring formula based on attendance, mid-term, study hours, assignments
- Dashboard — Real-time stats: students, teachers, attendance rate, revenue

### Teacher
- My Students — View students in assigned classes with performance details
- Mark Attendance — Mark Present/Absent/Late per class and subject
- Enter Marks — Record exam results, auto-calculates grades
- Assignments — Create assignments for classes, persisted to Supabase
- Dashboard — Class overview, attendance summary, marks entered

### Student
- Dashboard — Personal stats for attendance, marks, fees, assignments
- My Marks — Exam results with subject-wise performance chart
- My Attendance — Full attendance record with month filter and progress bar
- Assignments — View class assignments with urgency indicators
- My Fees — Fee payment status and history

### Parent
- Dashboard — Child's performance, attendance, fee overview
- Fee Payment — View and pay fees via UPI or bank challan

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| Database | Supabase (PostgreSQL + Auth) |
| Build Tool | Vite |
| Notifications | Sonner (toast) |
| Icons | Lucide React |

## 📦 Installation

1. Clone the repository
```bash
git clone https://github.com/Neha80915/edumanage-sms.git
cd edumanage-sms
```

2. Install dependencies
```bash
npm install
```

3. Create `.env.local` in the root folder
```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_SERVICE_KEY=your_supabase_service_key
```

4. Run the development server
```bash
npm run dev
```

## 🔐 Demo Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.com | password123 |
| Teacher | sunita.mehta@school.com | password123 |
| Student | rahul.sharma@school.com | password123 |
| Parent | vijay.sharma@parent.com | password123 |

## 🗄️ Database Tables (Supabase)

| Table | Description |
|-------|-------------|
| `profiles` | User role mapping |
| `students` | Student records |
| `teachers` | Teacher records |
| `parents` | Parent records |
| `attendance` | Daily attendance records |
| `marks` | Exam marks and grades |
| `fees` | Fee payment records |
| `assignments` | Class assignments |
| `fee_structure` | Fee structure per class |

## 📁 Project Structure

```
src/
└── app/
    ├── components/
    │   ├── admin/        — ManageStudents, ManageTeachers, FeeManagement, GradePrediction, ReportCard
    │   ├── teacher/      — MarkAttendance, EnterMarks, TeacherStudentView, TeacherAssignments
    │   ├── student/      — StudentMarks, StudentAttendance, StudentAssignments, StudentFees
    │   ├── parent/       — ParentFees, PayFee
    │   ├── dashboards/   — AdminDashboard, TeacherDashboard, StudentDashboard, ParentDashboard
    │   ├── Login.tsx     — Authentication page
    │   └── Notifications.tsx — Smart role-based alerts
    ├── context/
    │   └── AppContext.tsx — Global state + role-based Supabase CRUD
    ├── lib/
    │   └── supabase.ts   — Supabase client (reads from .env.local)
    ├── data/
    │   └── mockData.ts   — Fallback data
    └── types/
        └── index.ts      — TypeScript interfaces
```

## 🔑 Key Technical Decisions

### Role-Based Data Fetching
Each role fetches only the data it needs on login:
- **Admin** → fetches everything in parallel using Promise.all
- **Teacher** → only their class students, own attendance/marks
- **Student** → only their own records + class assignments
- **Parent** → only their children's records

### Grade Prediction Formula
```
Final Score = (Mid-Term × 0.40) + (Attendance × 0.25) + (Study Hours × 0.20) + (Assignments × 0.15)
Attendance Penalty = -3 points for every 5% below 75%
```

### Security
- Supabase keys stored in `.env.local` — never committed to Git
- Passwords minimum 8 characters with masked input
- Role-based access enforced at UI and data level

## 🎓 About

**Project:** Minor Project — B.Tech Computer Science, Semester 4  
**Developer:** Neha Devi  
**Institution:** [Your College Name]
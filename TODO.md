# EduManage — Project Documentation

## Overview
EduManage is a full-stack Student Management System built with React, TypeScript, and Supabase.
It supports 4 user roles: Admin, Teacher, Student, and Parent — each with a dedicated dashboard and features.

---

## Tech Stack
- **Frontend:** React 18, TypeScript, Tailwind CSS, Vite
- **Backend:** Supabase (PostgreSQL + Auth)
- **UI Components:** shadcn/ui, Radix UI
- **Charts:** Recharts
- **Notifications:** Sonner (toast)

---

## Features by Role

### Admin
- Manage Students — Add, Edit, Delete with Supabase Auth account creation
- Manage Teachers — Full CRUD with role-based access
- Fee Management — Track payments, fee structure, collection rates
- Report Cards — Generate and print student report cards
- Grade Prediction — Weighted scoring formula (Mid-Term 40%, Attendance 25%, Study Hours 20%, Assignments 15%)
- Dashboard — Real-time stats for students, teachers, attendance rate, revenue

### Teacher
- My Students — View students in assigned classes with performance details
- Mark Attendance — Mark Present/Absent/Late per class and subject, saved to Supabase
- Enter Marks — Record exam marks by exam type, auto-calculates grade
- Assignments — Create assignments for classes, persisted to Supabase
- Dashboard — Overview of classes, attendance summary, marks entered

### Student
- Dashboard — Personal stats for attendance, marks, fees, assignments
- My Marks — View all exam results with subject-wise performance chart
- My Attendance — Full attendance record with month filter and progress bar
- Assignments — View assignments for their class with urgency indicators
- My Fees — View fee payment status and history

### Parent
- Dashboard — Overview of child's performance, attendance, fees
- Fee Payment — View and pay fees with UPI/bank challan options

---

## Database Tables (Supabase)
- `profiles` — User role mapping
- `students` — Student records
- `teachers` — Teacher records
- `parents` — Parent records
- `attendance` — Daily attendance records
- `marks` — Exam marks and grades
- `fees` — Fee payment records
- `assignments` — Class assignments
- `fee_structure` — Fee structure per class

---

## Key Technical Decisions

### Role-Based Data Fetching
Each role fetches only the data it needs on login:
- Admin fetches all data
- Teacher fetches only their class students, their attendance/marks
- Student fetches only their own records
- Parent fetches only their children's records

### Weighted Scoring Formula (Grade Prediction)
```
Final Score = (Mid-Term × 0.40) + (Attendance × 0.25) + (Study Hours × 0.20) + (Assignments × 0.15)
Attendance Penalty = -3 points for every 5% below 75%
```

### Security
- Supabase keys stored in `.env.local` (not committed to Git)
- Role-based access enforced at UI level
- Passwords minimum 8 characters, masked input

---

## Project Structure
```
src/
  app/
    components/
      admin/        — ManageStudents, ManageTeachers, FeeManagement, GradePrediction, ReportCard
      teacher/      — MarkAttendance, EnterMarks, TeacherStudentView, TeacherAssignments
      student/      — StudentMarks, StudentAttendance, StudentAssignments, StudentFees
      parent/       — ParentFees, PayFee
      dashboards/   — AdminDashboard, TeacherDashboard, StudentDashboard, ParentDashboard
    context/        — AppContext (global state + Supabase CRUD)
    types/          — TypeScript interfaces
    lib/            — Supabase client
    data/           — Mock data (assignments only)
```

---

## Setup Instructions
1. Clone the repository
2. Run `npm install`
3. Create `.env.local` with your Supabase URL and key
4. Run `npm run dev`

---

## Minor Project — B.Tech Computer Science, Semester 4
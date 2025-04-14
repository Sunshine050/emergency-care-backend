# 🚑 Backend Development Plan - Emergency Response Project

## 🧠 Overview
This project handles emergency assistance coordination between users, the 1669 emergency center, hospitals, and rescue teams.

---

## 🧩 Sprint Plan

### ✅ Sprint 1: Authentication System (Basic Login/Register)
- [ ] Setup NestJS Project
- [ ] Create User Entity (email, password, phone, etc.)
- [ ] Register API (Prevent duplicate email)
- [ ] Login API with password hash
- [ ] JWT-based Authentication
- [ ] Setup AuthGuard for protected routes
- [ ] Google Login (OAuth2) setup with Passport

---

### 🆘 Sprint 2: SOS System & Emergency Reporting
- [ ] Create SOS Entity (userId, severity, type, location, status)
- [ ] API for sending SOS (with grading system)
- [ ] Store user location (lat/lng)
- [ ] Track SOS status (pending → accepted → resolved)
- [ ] Fetch SOS history by user

---

### 🏥 Sprint 3: 1669 + Hospital Backend
- [ ] Extend User Entity to include roles (general, 1669, hospital)
- [ ] 1669 API: View all SOS requests (filter by status, severity)
- [ ] 1669 API: Update SOS status and assign hospital
- [ ] Hospital API: Receive assigned SOS case
- [ ] Hospital API: Update patient status
- [ ] API to view assigned/past SOS cases by role

---

### 🚑 Sprint 4: Rescue Team + Real-time Updates
- [ ] Create RescueTeam Entity
- [ ] Assign rescue teams to SOS cases (via hospital)
- [ ] RescueTeam API: Update mission status
- [ ] Add callback or WebSocket for real-time update (optional)
- [ ] Dashboard API for admin/statistics (optional)

---

## 📊 Future Improvements
- Email Verification
- Push Notification / SMS alert
- Admin Dashboard with charts (NestJS + Chart.js or external)
- Firebase Integration (if using in Mobile App)

---

## 📌 Technologies Used
- NestJS + TypeORM
- MySQL / PostgreSQL
- JWT Auth + OAuth2 (Google)

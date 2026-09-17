

 # Smart Internship Management System

## 📌 Overview

Smart Internship Management System is a web-based platform designed to simplify and manage the internship journey for students, mentors, and administrators.

The system provides a centralized platform where students can manage their internships, mentors can monitor student progress, and administrators can manage internship-related activities.

## 🎯 Problem Statement

Managing internships using separate documents, messages, and spreadsheets can make it difficult to track student progress, tasks, reports, and communication.

This project provides a single platform to organize internship activities and improve coordination between students, mentors, and administrators.

## 💡 Solution

The Smart Internship Management System brings important internship activities into one platform.

It allows users to:
- Manage internship information
- Track student progress
- Manage tasks and assignments
- Submit and monitor internship reports
- Monitor internship activities
- Maintain student and mentor information
- Provide role-based dashboards

## ✨ Key Features

### 👨‍🎓 Student
- Student registration and login
- Student profile management
- View internship details
- Track assigned tasks
- Monitor task status
- Submit internship reports
- View internship progress
- View relevant internship information

### 👨‍🏫 Mentor
- Mentor login
- View assigned students
- Monitor student internship progress
- Manage tasks
- Track student activities
- Review internship-related information

### 🛠️ Admin
- Admin dashboard
- Manage students
- Manage mentors
- Manage internships
- Manage internship-related records
- Monitor overall internship activities

## 🧠 Smart Monitoring

The system is designed to provide a structured view of internship progress by organizing tasks, reports, internship details, and student activities in one place.

This helps mentors and administrators monitor internship activities more efficiently.

## 🏗️ System Architecture

```text
                    ┌─────────────────────┐
                    │      Frontend       │
                    │      Next.js        │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │       Backend       │
                    │   FastAPI / Python  │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │      Database       │
                    │       SQLite        │
                    └─────────────────────┘

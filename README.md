# 🚀 Smart Internship Management System

A web-based platform designed to simplify, organize, and monitor the complete internship journey of students through a centralized system for Students, Mentors, and Administrators.

## 📌 Overview

Managing internships through separate documents, spreadsheets, messages, and manual records can make it difficult to track student progress, tasks, reports, and internship activities.

The **Smart Internship Management System** provides a centralized platform where students, mentors, and administrators can manage and monitor internship-related activities efficiently.

## 🎯 Problem Statement

Traditional internship management often involves:

- Manual maintenance of student and internship records
- Difficulty tracking student progress
- Scattered task and report information
- Limited visibility for mentors and administrators
- Time-consuming coordination between different stakeholders

## 💡 Our Solution

Our platform brings internship-related activities into one system with role-based access.

It helps students manage their internship journey while allowing mentors and administrators to monitor and manage internship activities from dedicated dashboards.

## ✨ Key Features

### 👨‍🎓 Student Module

- Student registration and login
- Student profile management
- View internship details
- View assigned tasks
- Track task status
- Submit internship-related reports
- Monitor internship progress
- Access internship information through a dedicated dashboard

### 👨‍🏫 Mentor Module

- Mentor authentication
- View assigned students
- Monitor student internship progress
- Manage student tasks
- Track task status
- Review internship-related information
- Mentor dashboard for monitoring activities

### 🛠️ Admin Module

- Admin authentication
- Admin dashboard
- Manage students
- Manage mentors
- Manage internships
- Manage internship-related records
- Monitor overall internship activities

## 🔄 How the System Works

1. Users register or log in to the platform.
2. The system identifies the user's role.
3. Users are provided with their respective dashboards.
4. Students manage their profiles, internships, tasks, and reports.
5. Mentors monitor students and manage internship tasks.
6. Administrators manage users, internships, and overall activities.
7. The backend processes requests through REST APIs and stores application data.

## 🧠 Smart Monitoring

The system organizes internship information such as tasks, reports, internship details, and student activities in a structured manner.

This provides mentors and administrators with better visibility into internship progress and helps reduce manual management.

## 🏗️ System Architecture

```text
                 ┌────────────────────────┐
                 │       FRONTEND         │
                 │   Next.js / React      │
                 └───────────┬────────────┘
                             │
                         REST APIs
                             │
                             ▼
                 ┌────────────────────────┐
                 │        BACKEND         │
                 │   Python / FastAPI     │
                 └───────────┬────────────┘
                             │
                        SQLAlchemy
                             │
                             ▼
                 ┌────────────────────────┐
                 │       DATABASE         │
                 │         SQLite         │
                 └────────────────────────┘

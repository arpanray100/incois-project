# 🌊 INCOIS Disaster Management App

A full-stack disaster management system built with **React Native (user app)**, **Next.js (admin dashboard)**, **Node.js/Express (backend)**, and **Machine Learning (Python)**.  
This project helps victims report hazards, NGOs/government monitor data, and generate real-time insights.

---

## 📂 Project Structure

incois-project/
│
├── admin-dashboard/ # Next.js admin dashboard (data visualization, PDF reports)
├── backend/ # Node.js + Express backend APIs
├── user-app/ # React Native mobile app for victims/users
├── ml/ # Machine Learning models & analytics pipeline
├── package.json # Root package (workspace info, scripts)
└── README.md # Project documentation

---

## 🚀 Features

- **Victim App (React Native)**
  - Report hazards (fire, flood, earthquake, tsunami, etc.)
  - Attach images/videos/audio/documents
  - Auto-detect or enter location
  - Input name & phone number for emergency response

- **Backend (Node.js + Express + MongoDB)**
  - REST APIs for hazard, resource, service, donations, emergencies
  - File upload support with Multer
  - Data stored in MongoDB

- **Admin Dashboard (Next.js)**
  - View & filter hazard reports
  - Sort by type, location, and date
  - Preview media (images/videos/audio/docs)
  - Download hazard reports as **PDF**

- **Machine Learning (Python)**
  - Analyze hazard trends
  - Generate insights with **Plotly charts**
  - Export ML reports as PDF
  - Auto-scheduled ML jobs (cron)

---

## ⚙️ Setup Instructions


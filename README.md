# PRIMA CRM – AI Report Generation Module

PRIMA CRM is an enterprise-grade Customer Relationship Management platform tailored for professional coaching workflows. This specific module enables AI-powered candidate report generation, refinement, and finalization through a secure, scalable API interface.

> ⚠️ This is a **confidential client project**. No real credentials, API URLs, or source code are shared here. This repository is intended as a **developer showcase** only.

---

## 🧑‍💻 My Role

I contributed as a **Frontend Developer**, responsible for:

- Implementing dynamic UI workflows for report creation, modification, and finalization
- Managing secure token-based session handling (Access & Refresh Tokens)
- Building interactive dashboards, filters, and report history views
- Integrating real-time feedback and status indicators for report lifecycle stages
- Ensuring responsive and accessible UI using Tailwind CSS and React best practices

---

## 🔑 Key Features

- ✨ **AI-Powered Report Generation**  
  Automatically generate personalized monthly summaries from session notes and candidate data.

- ✍️ **Coach-Guided Refinement**  
  Allow coaches to add additional notes and prompts to influence AI-generated content.

- 🔒 **Secure Authentication Flow**  
  JWT-based access/refresh token implementation with automatic renewal logic.

- 📊 **Status Lifecycle Management**  
  Track and update report states: Draft → In Review → Finalized.

---

## 🛠 Tech Stack

| Area       | Tech Used                           |
|------------|-------------------------------------|
| Frontend   | React, Vite, TypeScript, Tailwind CSS     |
| API Comm   | Axios, JWT Authentication           |
| UI/UX      | Modals, Toasts (react-hot-toast), Form Handling |
| Tools      | React Markdown |

---


🧠 AI Report Workflow (Frontend)
Generate Report
→ Form to collect program, candidate, and notes
→ Call /report/generate

Modify Draft
→ Coach edits + adds prompts
→ Call /report/modify

Finalize Report
→ Submit finalized copy
→ Call /report/finalize

View Report History
→ Table view with versions, status, export options


🔐 Login Page
<img width="1919" height="868" alt="Screenshot 2025-07-17 111317" src="https://github.com/user-attachments/assets/eab26d70-c3d7-40a7-850f-ea49eac6ae7a" />
<img width="1919" height="867" alt="Screenshot 2025-07-17 111353" src="https://github.com/user-attachments/assets/65f80936-f6c3-4749-a408-04bcdca3217b" />

📊 Dashboard Overview
<img width="1915" height="865" alt="Screenshot 2025-07-17 103144" src="https://github.com/user-attachments/assets/1125a827-4a6e-4bf8-ac02-f55a2486ddc0" />

📋 Report List
<img width="1917" height="872" alt="Screenshot 2025-07-17 103336" src="https://github.com/user-attachments/assets/e3721769-5b86-44b8-bab7-197c8ae6fdfb" />



## 📂 Modules Handled

```bash
/pages
 ├── Dashboard
 ├── ReportList
 └── Auth (Login, Token Refresh)







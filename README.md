# Appl.AI 🚀

> AI-powered job application tracker built for the Indian job market — find jobs, track applications, optimise your resume, and never miss a follow-up.

---

## What is Appl.AI?

Appl.AI is a full-stack web app that helps you manage your entire job search in one place. It auto-fetches live job postings from LinkedIn, Naukri, Indeed and more (India-focused), lets you track every application through a Kanban pipeline, and uses AI to tailor your resume and draft outreach emails for each role.

---

## Features

| Feature | Description |
|---|---|
| 🌐 **Live Job Board** | Auto-fetches Indian job postings (last 30 days) via JSearch API. Filters by state, work type, experience level, salary disclosure, and keyword search. |
| 📋 **Application Tracker** | Kanban board with four lanes: Applied → Interview → Offer → Rejected. Set interview dates, follow-up reminders, and notes per application. |
| ✨ **AI Career Center** | Upload your resume (.docx), get it AI-optimised for a specific JD, and generate personalised cold outreach emails. |
| 📊 **Dashboard** | CV-style command centre showing your pipeline, recommended jobs, today's follow-ups & interviews, job type breakdown, and match stats. |
| 📖 **User Guide** | Step-by-step in-app walkthrough of the full job search journey. |
| 🌗 **Dark / Light Mode** | Fully accessible theming with high-contrast text in both modes. |
| 💾 **Auto-save** | All data persists to localStorage — no login required after setup. |

---

## Tech Stack

- **Frontend:** React 19, Vite, Zustand (state + persistence), React Router v7
- **Backend:** Node.js + Express (auth endpoints), MongoDB (user accounts)
- **AI:** Anthropic Claude API (resume optimisation + email drafting)
- **Jobs API:** JSearch via RapidAPI (real-time Indian job postings)
- **Hosting:** Render (frontend static site + backend web service)

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/Appl.AI.git
cd Appl.AI
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Set environment variables

Create a `.env` file in the root:

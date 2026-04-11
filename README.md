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

VITE_JOBS_KEY=your_rapidapi_key_here
VITE_ANTHROPIC_KEY=your_anthropic_key_here

- Get a free **JSearch API** key at [rapidapi.com](https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch) (10 req/month free, $10/month for 200 req)
- Get an **Anthropic API** key at [console.anthropic.com](https://console.anthropic.com)

### 4. Install backend dependencies

```bash
cd backend
npm install
```

### 5. Set backend environment variables

Create `backend/.env`:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key

### 6. Run locally

```bash
# Terminal 1 — frontend
npm run dev

# Terminal 2 — backend
cd backend && node server.js
```

---

## Deploying to Render

### Frontend (Static Site)
- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Environment variables:** Add `VITE_JOBS_KEY` and `VITE_ANTHROPIC_KEY`

> ⚠️ Vite bakes `VITE_` variables at build time. After adding or changing them in Render, trigger a new deploy.

### Backend (Web Service)
- **Root directory:** `backend`
- **Build command:** `npm install`
- **Start command:** `node server.js`
- **Environment variables:** Add `MONGODB_URI` and `JWT_SECRET`

---

## User Journey

1. **Sign up / Log in** → auth handled by the Express backend
2. **Upload resume** in Career Center → unlocks AI match scores
3. **Browse Job Board** → jobs auto-load for India (30 days)
4. **Star jobs** you like → filter by ⭐ Starred only
5. **Mark Applied** on a job card → moves it to your Applications Kanban
6. **Set interview & follow-up dates** inside each application card
7. **Dashboard** surfaces today's follow-ups, interviews, and top job picks
8. **AI optimise** your resume for any job with the ✨ sparkle button
9. **Refresh daily** to pull new listings — duplicates are filtered automatically

---

## Project Structure

Appl.AI/
├── src/
│   ├── pages/
│   │   ├── Dashboard.jsx       # CV-style command centre
│   │   ├── Jobs.jsx            # Live job board + filters
│   │   ├── Applications.jsx    # Kanban application tracker
│   │   ├── Outreach.jsx        # AI career centre
│   │   ├── Login.jsx
│   │   └── Signup.jsx
│   ├── components/
│   │   ├── JobCard.jsx         # Individual job card with apply/star/AI buttons
│   │   └── ...
│   ├── services/
│   │   ├── fetchJobs.js        # JSearch API integration (India, 30 days)
│   │   └── aiService.js        # Anthropic Claude integration
│   ├── store/
│   │   └── useStore.js         # Zustand store (jobs, applications, persistence)
│   └── MainApp.jsx             # Layout, sidebar, routing, user guide
├── backend/
│   ├── server.js
│   ├── routes/auth.js
│   └── controllers/authController.js
└── README.md


---

## License

MIT

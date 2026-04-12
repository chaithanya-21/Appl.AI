import { create } from "zustand";

const STORAGE_KEY = "Appl.AI-data";

const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");

function persist(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    jobs:         state.jobs,
    applications: state.applications,
    profile:      state.profile,
    meta:         state.meta
  }));
}

function scoreJob(job) {
  let score = job.matchScore || 70;
  if (job.priority)                                    score += 10;
  if (job.workType === "remote")                       score += 3;
  if (job.salary && job.salary !== "Salary not disclosed") score += 2;
  return Math.min(100, score);
}

const DEFAULT_PROFILE = {
  name:          "",
  headline:      "",
  linkedinUrl:   "",
  skills:        [],
  summary:       "",
  setupComplete: false
};

export const useStore = create((set, get) => ({

  /* ── META ── */
  meta: saved.meta || { lastSaved: Date.now() },

  /* ── PROFILE ── */
  profile: { ...DEFAULT_PROFILE, ...(saved.profile || {}) },

  setProfile: (data) => set(state => {
    const updated = { ...state.profile, ...data };
    const next = { ...state, profile: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { profile: updated, meta: { lastSaved: Date.now() } };
  }),

  /* ── JOBS ── */
  jobs: (saved.jobs || []).map(j => ({ ...j, score: scoreJob(j) })),

  addJob: (job) => set(state => {
    if (state.jobs.some(j => j.id === job.id)) return {};

    const newJob = {
      ...job,
      id:         job.id || Date.now(),
      priority:   job.priority   || false,
      atsScore:   job.atsScore   || 70,
      matchScore: job.matchScore || Math.floor(Math.random() * 30) + 70
    };
    newJob.score = scoreJob(newJob);

    const updated = [...state.jobs, newJob];
    const next    = { ...state, jobs: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { jobs: updated, meta: { lastSaved: Date.now() } };
  }),

  togglePriority: id => set(state => {
    const updated = state.jobs.map(j => {
      if (j.id !== id) return j;
      const u = { ...j, priority: !j.priority };
      u.score = scoreJob(u);
      return u;
    });
    const next = { ...state, jobs: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { jobs: updated, meta: { lastSaved: Date.now() } };
  }),

  updateJob: (id, data) => set(state => {
    const updated = state.jobs.map(j => {
      if (j.id !== id) return j;
      const u = { ...j, ...data };
      u.score = scoreJob(u);
      return u;
    });
    const next = { ...state, jobs: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { jobs: updated, meta: { lastSaved: Date.now() } };
  }),

  deleteJob: id => set(state => {
    const updated = state.jobs.filter(j => j.id !== id);
    const next = { ...state, jobs: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { jobs: updated, meta: { lastSaved: Date.now() } };
  }),

  /* ── APPLICATIONS ── */
  applications: (saved.applications || []).map(a => {
    if (!a.jobId) {
      const match = (saved.jobs || []).find(
        j => j.role === a.role && j.company === a.company
      );
      if (match) return { ...a, jobId: match.id };
    }
    return a;
  }),

  addApplication: (app) => set(state => {
    if (state.applications.some(a => a.jobId === app.jobId)) return {};
    const updated = [
      ...state.applications,
      {
        id:            Date.now(),
        jobId:         app.jobId,
        role:          app.role,
        company:       app.company,
        status:        "Applied",
        notes:         "",
        interviewDate: "",
        followup:      "",
        contacted:     false,
        replied:       false
      }
    ];
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  moveApplication: (id, status) => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, status } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  updateNotes: (id, notes) => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, notes } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  setInterviewDate: (id, date) => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, interviewDate: date } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  setFollowup: (id, date) => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, followup: date } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  markContacted: id => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, contacted: !a.contacted } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  markReplied: id => set(state => {
    const updated = state.applications.map(a => a.id === id ? { ...a, replied: !a.replied } : a);
    const next = { ...state, applications: updated, meta: { lastSaved: Date.now() } };
    persist(next);
    return { applications: updated, meta: { lastSaved: Date.now() } };
  }),

  /* ── COMPUTED ── */

  getFollowupsToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().applications.filter(a => a.followup === today);
  },

  getInterviewsToday: () => {
    const today = new Date().toISOString().slice(0, 10);
    return get().applications.filter(a => a.interviewDate === today);
  },

  getBestJobs: () => {
    const { jobs, applications } = get();
    const appliedIds = new Set(applications.map(a => a.jobId));
    return jobs
      .filter(j => !appliedIds.has(j.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

}));

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore";
import { useState, useEffect } from "react";

import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";

/* ─── Full User Journey Guide ─────────────────────────────────── */

const GUIDE_STEPS = [
  {
    icon: "🚀",
    step: "Step 1",
    title: "Set Up Your Profile",
    text: "Go to Career Center (✨) and upload your resume (.docx or paste plain text). This powers AI match scores on every job card and lets the AI tailor your resume for specific roles."
  },
  {
    icon: "🌐",
    step: "Step 2",
    title: "Browse Live Jobs from India",
    text: "Head to Job Board. Jobs from LinkedIn, Naukri, Indeed and more are auto-fetched for India (last 30 days). Use filters to narrow by role, state, work type (Remote / Hybrid / Onsite), experience level, and salary disclosure."
  },
  {
    icon: "⭐",
    step: "Step 3",
    title: "Star Jobs You Like",
    text: "Hit the ⭐ icon on any job card to mark it as a priority. Use the 'Starred only' filter to focus your day. Each card shows a match score based on your uploaded resume."
  },
  {
    icon: "📋",
    step: "Step 4",
    title: "Apply & Track",
    text: "Click 'Mark Applied' on a job card to instantly move it to your Applications board. The Kanban board has four lanes: Applied → Interview → Offer → Rejected. Drag or use the dropdown to move cards between stages."
  },
  {
    icon: "📅",
    step: "Step 5",
    title: "Log Interviews & Follow-ups",
    text: "Inside each application card, set an Interview Date and a Follow-up Date. Your Dashboard will surface today's interviews and follow-ups automatically every morning so nothing slips through."
  },
  {
    icon: "✨",
    step: "Step 6",
    title: "AI Resume Optimisation",
    text: "Click the ✨ sparkle icon on any job card to send its job description to Career Center. The AI will rewrite bullet points in your resume to match the JD, boosting your ATS score. You can also generate a personalised cold email for that role."
  },
  {
    icon: "📊",
    step: "Step 7",
    title: "Monitor Your Dashboard",
    text: "The Dashboard gives you a daily command centre: total live jobs, applications sent, interviews lined up, offers received, your pipeline breakdown, today's follow-ups, and your top-ranked unapplied jobs — all at a glance."
  },
  {
    icon: "🔄",
    step: "Pro Tip",
    title: "Refresh Jobs Daily",
    text: "Click the ↻ Refresh button on the Job Board each morning to pull the latest 30-day postings. Jobs are de-duplicated automatically, so you only ever see new listings."
  }
];

/* ─── Component ──────────────────────────────────────────────── */

export default function MainApp() {
  const { meta } = useStore();
  const [guide, setGuide] = useState(false);
  const [guideStep, setGuideStep] = useState(0);
  const [theme, setTheme] = useState(() => localStorage.getItem("appl-theme") || "dark");
  const location = useLocation();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("appl-theme", theme);
  }, [theme]);

  // Reset guide to first step when opened
  function openGuide() {
    setGuideStep(0);
    setGuide(true);
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const NAV_ITEMS = [
    { to: "/dashboard",    label: "📊 Dashboard" },
    { to: "/jobs",         label: "🌐 Job Board" },
    { to: "/applications", label: "📋 Applications" },
    { to: "/outreach",     label: "✨ Career Center" }
  ];

  const currentStep = GUIDE_STEPS[guideStep];
  const isFirst = guideStep === 0;
  const isLast  = guideStep === GUIDE_STEPS.length - 1;

  return (
    <div style={styles.wrapper}>

      {/* Animated background */}
      <div
        style={{
          ...styles.background,
          backgroundImage: 'url("/ai-login-bg.png")'
        }}
      />
      <div style={styles.overlay} />

      <div style={styles.appContainer}>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>
          <div style={styles.brandArea}>
            <span style={styles.brandIcon}>✦</span>
            <span style={styles.brandName}>Appl.AI</span>
          </div>

          <nav style={styles.nav}>
            {NAV_ITEMS.map(({ to, label }) => {
              const isActive =
                location.pathname === to ||
                (to === "/dashboard" && location.pathname === "/");
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    ...styles.navItem,
                    background: isActive
                      ? "rgba(10,132,255,0.2)"
                      : "transparent",
                    color: isActive ? "#0A84FF" : "var(--text-primary)",
                    fontWeight: isActive ? "700" : "500"
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Bottom actions */}
          <div style={styles.sidebarFooter}>
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              style={styles.ghostBtn}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button onClick={openGuide} style={styles.ghostBtn}>
              📖 User Guide
            </button>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={styles.mainContent}>

          {/* Save indicator */}
          <div style={styles.saveIndicator}>
            Saved ✓ {new Date(meta.lastSaved).toLocaleTimeString()}
          </div>

          <Routes>
            <Route path="/"             element={<Dashboard />} />
            <Route path="/dashboard"    element={<Dashboard />} />
            <Route path="/jobs"         element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/outreach"     element={<Outreach />} />
          </Routes>
        </div>
      </div>

      {/* ── User Guide Modal ── */}
      {guide && (
        <div
          style={styles.modalOverlay}
          onClick={() => setGuide(false)}
        >
          <div
            style={styles.modal}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={styles.modalHeader}>
              <div>
                <div style={styles.guideStepLabel}>
                  {currentStep.step} of {GUIDE_STEPS.length}
                </div>
                <h2 style={styles.modalTitle}>📖 User Guide</h2>
              </div>
              <button
                onClick={() => setGuide(false)}
                style={styles.modalCloseBtn}
              >
                ✕
              </button>
            </div>

            {/* Progress bar */}
            <div style={styles.progressTrack}>
              <div
                style={{
                  ...styles.progressFill,
                  width: (((guideStep + 1) / GUIDE_STEPS.length) * 100) + "%"
                }}
              />
            </div>

            {/* Step content */}
            <div style={styles.modalBody}>
              <div style={styles.guideStepCard}>
                <div style={styles.guideIconLarge}>{currentStep.icon}</div>
                <div style={styles.guideStepTitle}>{currentStep.title}</div>
                <div style={styles.guideStepText}>{currentStep.text}</div>
              </div>

              {/* Step dots */}
              <div style={styles.stepDots}>
                {GUIDE_STEPS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setGuideStep(i)}
                    style={{
                      ...styles.stepDot,
                      background: i === guideStep
                        ? "#0A84FF"
                        : i < guideStep
                        ? "rgba(10,132,255,0.4)"
                        : "rgba(120,120,128,0.25)",
                      width: i === guideStep ? "20px" : "8px"
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Footer navigation */}
            <div style={styles.modalFooter}>
              <button
                onClick={() => setGuide(false)}
                style={styles.skipBtn}
              >
                Skip
              </button>
              <div style={styles.navBtns}>
                {!isFirst && (
                  <button
                    onClick={() => setGuideStep(s => s - 1)}
                    style={styles.prevBtn}
                  >
                    ← Back
                  </button>
                )}
                {!isLast ? (
                  <button
                    onClick={() => setGuideStep(s => s + 1)}
                    style={styles.nextBtn}
                  >
                    Next →
                  </button>
                ) : (
                  <button
                    onClick={() => setGuide(false)}
                    style={styles.nextBtn}
                  >
                    🎉 Let's go!
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────── */

const styles = {
  wrapper: {
    position: "relative",
    height: "100vh",
    overflow: "hidden"
  },

  background: {
    position: "absolute",
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: "float 30s infinite alternate ease-in-out",
    zIndex: 1
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 2
  },

  appContainer: {
    position: "relative",
    zIndex: 3,
    display: "flex",
    height: "100vh"
  },

  sidebar: {
    width: "240px",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRight: "1px solid var(--glass-border)",
    flexShrink: 0
  },

  brandArea: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "24px",
    paddingLeft: "8px"
  },

  brandIcon: {
    fontSize: "20px",
    color: "#0A84FF"
  },

  brandName: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    letterSpacing: "-0.02em"
  },

  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  navItem: {
    textDecoration: "none",
    padding: "11px 14px",
    borderRadius: "12px",
    fontSize: "14px",
    transition: "all 0.2s ease",
    display: "block"
  },

  sidebarFooter: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    marginTop: "12px"
  },

  ghostBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    border: "1px solid var(--glass-border)",
    background: "transparent",
    color: "var(--text-secondary)",
    fontWeight: "500",
    fontSize: "13px",
    cursor: "pointer",
    textAlign: "left",
    boxShadow: "none"
  },

  logoutBtn: {
    padding: "10px 14px",
    borderRadius: "12px",
    background: "rgba(255,59,48,0.1)",
    color: "#FF453A",
    border: "1px solid rgba(255,59,48,0.2)",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "none"
  },

  mainContent: {
    flex: 1,
    padding: "32px",
    overflowY: "auto",
    background: "var(--glass-bg)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)"
  },

  saveIndicator: {
    position: "fixed",
    top: 16,
    right: 24,
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)",
    padding: "5px 12px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "500",
    color: "var(--text-secondary)",
    zIndex: 100
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.65)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },

  modal: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(40px)",
    WebkitBackdropFilter: "blur(40px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "24px",
    width: "min(540px, 92vw)",
    maxHeight: "88vh",
    overflow: "auto",
    boxShadow: "0 40px 80px rgba(0,0,0,0.5)"
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: "24px 28px 12px"
  },

  guideStepLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#0A84FF",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "4px"
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)"
  },

  modalCloseBtn: {
    background: "rgba(120,120,128,0.15)",
    border: "none",
    borderRadius: "50%",
    width: "30px",
    height: "30px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-secondary)",
    fontSize: "13px",
    padding: 0,
    boxShadow: "none",
    fontWeight: "600",
    flexShrink: 0
  },

  progressTrack: {
    height: "3px",
    background: "rgba(120,120,128,0.2)",
    margin: "0 28px 0",
    borderRadius: "4px",
    overflow: "hidden"
  },

  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #0A84FF, #BF5AF2)",
    borderRadius: "4px",
    transition: "width 0.35s ease"
  },

  modalBody: {
    padding: "24px 28px 12px"
  },

  guideStepCard: {
    background: "rgba(10,132,255,0.06)",
    border: "1px solid rgba(10,132,255,0.15)",
    borderRadius: "20px",
    padding: "28px 24px",
    textAlign: "center",
    marginBottom: "20px"
  },

  guideIconLarge: {
    fontSize: "48px",
    marginBottom: "16px",
    lineHeight: 1
  },

  guideStepTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)",
    marginBottom: "12px"
  },

  guideStepText: {
    fontSize: "14px",
    color: "var(--text-secondary)",
    lineHeight: "1.7",
    maxWidth: "380px",
    margin: "0 auto"
  },

  stepDots: {
    display: "flex",
    justifyContent: "center",
    gap: "6px",
    alignItems: "center"
  },

  stepDot: {
    height: "8px",
    borderRadius: "4px",
    border: "none",
    padding: 0,
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.25s ease"
  },

  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 28px 24px",
    borderTop: "1px solid var(--glass-border)"
  },

  skipBtn: {
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: "8px 12px",
    boxShadow: "none"
  },

  navBtns: {
    display: "flex",
    gap: "8px"
  },

  prevBtn: {
    background: "rgba(120,120,128,0.15)",
    color: "var(--text-primary)",
    border: "none",
    borderRadius: "14px",
    padding: "11px 20px",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "none"
  },

  nextBtn: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "11px 24px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(10,132,255,0.4)"
  }
};

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore";
import { useState, useEffect } from "react";

import Jobs         from "./pages/Jobs";
import Applications from "./pages/Applications";
import Dashboard    from "./pages/Dashboard";
import Outreach     from "./pages/Outreach";
import OnboardingModal from "./components/OnboardingModal";

/* ─── Guide content ─────────────────────────────────────────────── */

const GUIDE_STEPS = [
  { icon: "📄", title: "Upload Your Resume",   text: "Go to Career Center, upload your .docx resume. This powers AI optimisation and accurate job match scores." },
  { icon: "🌐", title: "Browse Live Jobs",      text: "The Job Board fetches current Indian openings every session. Use filters for role, work type, state and experience level." },
  { icon: "⭐", title: "Star & Track",          text: "Star jobs you like. Hit 'Mark Applied' to move them into your Applications tracker automatically." },
  { icon: "✨", title: "Optimise for Each Role", text: "Click ✨ on any job card to send its JD to Career Center, where AI tailors your resume and writes outreach for you." },
  { icon: "📊", title: "Dashboard",             text: "Your Dashboard shows today's follow-ups, interviews, your best matching jobs, and your full application pipeline." }
];

/* ─── Component ─────────────────────────────────────────────────── */

export default function MainApp() {
  const { meta, profile } = useStore();

  const [guide,  setGuide]  = useState(false);
  const [theme,  setTheme]  = useState(() => localStorage.getItem("appl-theme") || "dark");
  const [showOnboarding, setShowOnboarding] = useState(false);

  const location = useLocation();

  useEffect(() => {
    document.body.className = theme;
    localStorage.setItem("appl-theme", theme);
  }, [theme]);

  // Show onboarding once after login if not yet completed
  useEffect(() => {
    if (!profile.setupComplete) {
      setShowOnboarding(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const NAV_ITEMS = [
    { to: "/dashboard",    label: "📊 Dashboard"    },
    { to: "/jobs",         label: "🌐 Job Board"    },
    { to: "/applications", label: "📋 Applications" },
    { to: "/outreach",     label: "✨ Career Center" }
  ];

  return (
    <div style={styles.wrapper}>

      {/* Animated background */}
      <div style={{ ...styles.background, backgroundImage: 'url("/ai-login-bg.png")' }} />
      <div style={styles.overlay} />

      <div style={styles.appContainer}>

        {/* ── Sidebar ── */}
        <div style={styles.sidebar}>

          {/* Brand + avatar */}
          <div style={styles.brandArea}>
            <div style={styles.avatarWrap}>
              {profile.name ? (
                <div style={styles.avatar}>
                  {profile.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()}
                </div>
              ) : (
                <div style={styles.avatar}>AI</div>
              )}
            </div>
            <div>
              <div style={styles.brandName}>Appl.AI</div>
              {profile.name && (
                <div style={styles.profileName}>{profile.name.split(" ")[0]}</div>
              )}
            </div>
          </div>

          <nav style={styles.nav}>
            {NAV_ITEMS.map(({ to, label }) => {
              const isActive =
                location.pathname === to ||
                (to === "/dashboard" && (location.pathname === "/" || location.pathname === ""));
              return (
                <Link
                  key={to}
                  to={to}
                  style={{
                    ...styles.navItem,
                    background: isActive ? "rgba(10,132,255,0.18)" : "transparent",
                    color:      isActive ? "#0A84FF" : "var(--text-primary)",
                    fontWeight: isActive ? "700" : "500",
                    borderLeft: isActive ? "3px solid #0A84FF" : "3px solid transparent"
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          <div style={{ flex: 1 }} />

          <div style={styles.sidebarFooter}>
            <button
              onClick={() => setTheme(t => t === "dark" ? "light" : "dark")}
              style={styles.ghostBtn}
            >
              {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>

            <button onClick={() => setGuide(true)} style={styles.ghostBtn}>
              📖 User Guide
            </button>

            <button
              onClick={() => setShowOnboarding(true)}
              style={styles.ghostBtn}
            >
              👤 Edit Profile
            </button>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              Sign Out
            </button>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={styles.mainContent}>

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

      {/* ── Onboarding Modal ── */}
      {showOnboarding && (
        <OnboardingModal onComplete={() => setShowOnboarding(false)} />
      )}

      {/* ── User Guide Modal ── */}
      {guide && (
        <div style={styles.modalOverlay} onClick={() => setGuide(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: "20px", color: "var(--text-primary)" }}>
                Getting Started
              </h2>
              <button onClick={() => setGuide(false)} style={styles.modalCloseBtn}>✕</button>
            </div>
            <div style={styles.modalBody}>
              {GUIDE_STEPS.map((step, i) => (
                <div key={i} style={styles.guideStep}>
                  <div style={styles.guideIcon}>{step.icon}</div>
                  <div>
                    <div style={styles.guideTitle}>{step.title}</div>
                    <div style={styles.guideText}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setGuide(false)} style={styles.doneBtn}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = {
  wrapper:      { position: "relative", height: "100vh", overflow: "hidden" },

  background: {
    position:          "absolute", inset: 0,
    backgroundSize:    "cover",
    backgroundPosition:"center",
    animation:         "float 30s infinite alternate ease-in-out",
    zIndex:            1
  },

  overlay: {
    position: "absolute", inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 2
  },

  appContainer: {
    position: "relative", zIndex: 3,
    display: "flex", height: "100vh"
  },

  sidebar: {
    width:              "240px",
    padding:            "20px 14px",
    display:            "flex",
    flexDirection:      "column",
    gap:                "4px",
    background:         "var(--glass-bg)",
    backdropFilter:     "blur(24px)",
    WebkitBackdropFilter: "blur(24px)",
    borderRight:        "1px solid var(--glass-border)",
    flexShrink:         0
  },

  brandArea: {
    display:     "flex",
    alignItems:  "center",
    gap:         "10px",
    marginBottom:"20px",
    paddingLeft: "4px"
  },

  avatarWrap: { flexShrink: 0 },

  avatar: {
    width:          "36px",
    height:         "36px",
    borderRadius:   "10px",
    background:     "linear-gradient(135deg,#0A84FF,#BF5AF2)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    color:          "#fff",
    fontWeight:     "800",
    fontSize:       "13px",
    letterSpacing:  "0.02em"
  },

  brandName: {
    fontSize:   "17px",
    fontWeight: "800",
    color:      "var(--text-primary)",
    letterSpacing: "-0.02em",
    lineHeight: 1.2
  },

  profileName: {
    fontSize: "11px",
    color:    "var(--text-secondary)",
    fontWeight: "500"
  },

  nav: {
    display: "flex", flexDirection: "column", gap: "2px"
  },

  navItem: {
    textDecoration: "none",
    padding:        "10px 12px",
    borderRadius:   "10px",
    fontSize:       "13px",
    transition:     "all 0.2s ease",
    display:        "block",
    marginLeft:     "-3px"
  },

  sidebarFooter: {
    display:       "flex",
    flexDirection: "column",
    gap:           "5px",
    marginTop:     "10px"
  },

  ghostBtn: {
    padding:      "9px 12px",
    borderRadius: "10px",
    border:       "1px solid var(--glass-border)",
    background:   "transparent",
    color:        "var(--text-secondary)",
    fontWeight:   "500",
    fontSize:     "12px",
    cursor:       "pointer",
    textAlign:    "left",
    boxShadow:    "none"
  },

  logoutBtn: {
    padding:      "9px 12px",
    borderRadius: "10px",
    background:   "rgba(255,59,48,0.1)",
    color:        "#FF453A",
    border:       "1px solid rgba(255,59,48,0.2)",
    fontWeight:   "600",
    fontSize:     "12px",
    cursor:       "pointer",
    boxShadow:    "none"
  },

  mainContent: {
    flex:                 1,
    padding:              "32px",
    overflowY:            "auto",
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(18px)",
    WebkitBackdropFilter: "blur(18px)"
  },

  saveIndicator: {
    position:             "fixed",
    top:                  14,
    right:                22,
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    border:               "1px solid var(--glass-border)",
    padding:              "4px 12px",
    borderRadius:         "20px",
    fontSize:             "11px",
    fontWeight:           "500",
    color:                "var(--text-secondary)",
    zIndex:               100
  },

  // Guide modal
  modalOverlay: {
    position:             "fixed",
    inset:                0,
    background:           "rgba(0,0,0,0.6)",
    backdropFilter:       "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display:              "flex",
    alignItems:           "center",
    justifyContent:       "center",
    zIndex:               1000
  },

  modal: {
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "24px",
    width:                "min(520px,92vw)",
    maxHeight:            "85vh",
    overflow:             "auto",
    boxShadow:            "0 40px 80px rgba(0,0,0,0.4)"
  },

  modalHeader: {
    display:         "flex",
    justifyContent:  "space-between",
    alignItems:      "center",
    padding:         "24px 28px 16px",
    borderBottom:    "1px solid var(--glass-border)"
  },

  modalCloseBtn: {
    background:   "rgba(120,120,128,0.15)",
    border:       "none",
    borderRadius: "50%",
    width:        "30px",
    height:       "30px",
    display:      "flex",
    alignItems:   "center",
    justifyContent:"center",
    cursor:       "pointer",
    color:        "var(--text-secondary)",
    fontSize:     "13px",
    padding:      0,
    boxShadow:    "none",
    fontWeight:   "600"
  },

  modalBody: {
    padding: "20px 28px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  guideStep: {
    display:    "flex",
    gap:        "16px",
    alignItems: "flex-start"
  },

  guideIcon: {
    fontSize:       "22px",
    flexShrink:     0,
    width:          "40px",
    height:         "40px",
    borderRadius:   "10px",
    background:     "rgba(10,132,255,0.1)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center"
  },

  guideTitle: {
    fontSize: "14px", fontWeight: "700",
    color: "var(--text-primary)", marginBottom: "3px"
  },

  guideText: {
    fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5"
  },

  modalFooter: {
    padding:         "16px 28px 24px",
    display:         "flex",
    justifyContent:  "flex-end",
    borderTop:       "1px solid var(--glass-border)"
  },

  doneBtn: {
    background:   "linear-gradient(135deg,#0A84FF,#0066CC)",
    color:        "#fff",
    border:       "none",
    borderRadius: "14px",
    padding:      "12px 28px",
    fontWeight:   "700",
    fontSize:     "14px",
    cursor:       "pointer",
    boxShadow:    "0 4px 16px rgba(10,132,255,0.4)"
  }
};

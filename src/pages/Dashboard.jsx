import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";

/* ─── Helpers ───────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Component ─────────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate    = useNavigate();
  const dashRef     = useRef(null);
  const [downloading, setDownloading] = useState(false);

  const {
    jobs, applications, profile,
    getBestJobs, getFollowupsToday, getInterviewsToday
  } = useStore();

  const bestJobs   = getBestJobs();
  const followups  = getFollowupsToday();
  const interviews = getInterviewsToday();

  const liveJobs   = jobs.filter(j => !j.manual && j.link);

  const statusCounts = {
    Applied:   applications.filter(a => a.status === "Applied").length,
    Interview: applications.filter(a => a.status === "Interview").length,
    Offer:     applications.filter(a => a.status === "Offer").length,
    Rejected:  applications.filter(a => a.status === "Rejected").length
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  /* ── Download ── */
  async function downloadDashboard() {
    if (!dashRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(dashRef.current, {
        backgroundColor: null,
        scale:           2,
        useCORS:         true,
        logging:         false
      });
      const link    = document.createElement("a");
      link.download = "Appl-AI-Dashboard.png";
      link.href     = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error(e);
    }
    setDownloading(false);
  }

  /* ── Render ── */
  return (
    <div style={styles.page}>

      {/* Download button sits OUTSIDE the capture ref */}
      <div style={styles.topBar}>
        <div />
        <button onClick={downloadDashboard} disabled={downloading} style={styles.downloadBtn}>
          {downloading ? "⏳ Capturing…" : "⬇️ Download Dashboard"}
        </button>
      </div>

      {/* ── Captured area starts here ── */}
      <div ref={dashRef} style={styles.captureArea}>

        {/* ── Profile card ── */}
        {profile.setupComplete && (
          <div style={styles.profileCard}>
            <div style={styles.profileAvatar}>
              {profile.name
                ? profile.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
                : "AI"}
            </div>
            <div style={styles.profileInfo}>
              <div style={styles.profileName}>
                {profile.name || "Your Name"}
              </div>
              <div style={styles.profileHeadline}>
                {profile.headline || "Job Seeker"}
              </div>
              {profile.linkedinUrl && (
                <a
                  href={profile.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={styles.linkedinLink}
                >
                  💼 LinkedIn Profile →
                </a>
              )}
            </div>
            {profile.skills && profile.skills.length > 0 && (
              <div style={styles.profileSkills}>
                {profile.skills.slice(0, 8).map(s => (
                  <span key={s} style={styles.skillTag}>{s}</span>
                ))}
                {profile.skills.length > 8 && (
                  <span style={styles.skillTagMore}>+{profile.skills.length - 8} more</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Hero greeting ── */}
        <div style={styles.hero}>
          <div>
            <h1 style={styles.greeting}>
              {getGreeting()}{profile.name ? ", " + profile.name.split(" ")[0] : ""} 👋
            </h1>
            <p style={styles.date}>{today}</p>
          </div>
          <button onClick={() => navigate("/jobs")} style={styles.ctaBtn}>
            🌐 Browse Jobs
          </button>
        </div>

        {/* ── Stats row ── */}
        <div style={styles.statsRow}>
          <StatCard value={liveJobs.length}            label="Live Jobs"     icon="🌐" color="#0A84FF" onClick={() => navigate("/jobs")} />
          <StatCard value={applications.length}        label="Total Applied" icon="📋" color="#30D158" onClick={() => navigate("/applications")} />
          <StatCard value={statusCounts.Interview}     label="Interviews"    icon="🎯" color="#FF9F0A" onClick={() => navigate("/applications")} />
          <StatCard value={statusCounts.Offer}         label="Offers"        icon="🏆" color="#BF5AF2" onClick={() => navigate("/applications")} />
        </div>

        {/* ── Pipeline ── */}
        {applications.length > 0 && (
          <div style={styles.pipelineCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📊 Application Pipeline</span>
              <button onClick={() => navigate("/applications")} style={styles.linkBtn}>View All →</button>
            </div>
            <div style={styles.pipeline}>
              {[
                { label: "Applied",   count: statusCounts.Applied,   color: "#0A84FF" },
                { label: "Interview", count: statusCounts.Interview,  color: "#FF9F0A" },
                { label: "Offer",     count: statusCounts.Offer,      color: "#30D158" },
                { label: "Rejected",  count: statusCounts.Rejected,   color: "#FF453A" }
              ].map(s => (
                <div key={s.label} style={styles.pipelineStage}>
                  <div style={{ ...styles.pipelineDot, background: s.color }} />
                  <div style={styles.pipelineCount}>{s.count}</div>
                  <div style={styles.pipelineLabel}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={styles.progressBarTrack}>
              {[
                { count: statusCounts.Applied,   color: "#0A84FF" },
                { count: statusCounts.Interview,  color: "#FF9F0A" },
                { count: statusCounts.Offer,      color: "#30D158" },
                { count: statusCounts.Rejected,   color: "#FF453A" }
              ].map((s, i) =>
                s.count > 0 ? (
                  <div
                    key={i}
                    style={{
                      ...styles.progressBarFill,
                      width:      ((s.count / applications.length) * 100) + "%",
                      background: s.color
                    }}
                  />
                ) : null
              )}
            </div>
          </div>
        )}

        {/* ── Three columns ── */}
        <div style={styles.grid}>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>🔥 Apply Today</span>
              <button onClick={() => navigate("/jobs")} style={styles.linkBtn}>See all →</button>
            </div>
            {bestJobs.length === 0 ? (
              <EmptyState icon="🔍" text="Load jobs from the Job Board to see recommendations." action={() => navigate("/jobs")} actionLabel="Go to Jobs" />
            ) : (
              <div style={styles.listItems}>
                {bestJobs.map(j => (
                  <div key={j.id} style={styles.listItem}>
                    <div style={styles.listItemLeft}>
                      <div style={styles.listItemAvatar}>{(j.company || "?")[0].toUpperCase()}</div>
                      <div>
                        <div style={styles.listItemTitle}>{j.role}</div>
                        <div style={styles.listItemSub}>{j.company} · {j.location}</div>
                      </div>
                    </div>
                    <button onClick={() => navigate("/jobs")} style={styles.applyPill}>Apply</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📩 Follow-ups Today</span>
              <span style={styles.badge}>{followups.length}</span>
            </div>
            {followups.length === 0 ? (
              <EmptyState icon="✉️" text="No follow-ups scheduled for today." />
            ) : (
              <div style={styles.listItems}>
                {followups.map(a => (
                  <div key={a.id} style={styles.listItem}>
                    <div style={styles.alertDot} />
                    <div>
                      <div style={styles.listItemTitle}>{a.role}</div>
                      <div style={styles.listItemSub}>{a.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>🎯 Interviews Today</span>
              <span style={styles.badge}>{interviews.length}</span>
            </div>
            {interviews.length === 0 ? (
              <EmptyState icon="📅" text="No interviews scheduled today." />
            ) : (
              <div style={styles.listItems}>
                {interviews.map(a => (
                  <div key={a.id} style={styles.listItem}>
                    <div style={{ ...styles.alertDot, background: "#FF9F0A" }} />
                    <div>
                      <div style={styles.listItemTitle}>{a.role}</div>
                      <div style={styles.listItemSub}>{a.company}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div style={styles.quickActions}>
          <p style={styles.quickLabel}>Quick Actions</p>
          <div style={styles.quickRow}>
            <QuickAction icon="🌐" label="Browse Jobs"     onClick={() => navigate("/jobs")} />
            <QuickAction icon="📋" label="Applications"    onClick={() => navigate("/applications")} />
            <QuickAction icon="✨" label="Career Center"   onClick={() => navigate("/outreach")} />
          </div>
        </div>

      </div>
      {/* ── End capture area ── */}

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatCard({ value, label, icon, color, onClick }) {
  return (
    <div style={{ ...styles.statCard, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ ...styles.statIcon, background: color + "20", color }}>{icon}</div>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

function EmptyState({ icon, text, action, actionLabel }) {
  return (
    <div style={styles.emptyState}>
      <div style={styles.emptyIcon}>{icon}</div>
      <p style={styles.emptyText}>{text}</p>
      {action && (
        <button onClick={action} style={styles.emptyBtn}>{actionLabel}</button>
      )}
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={styles.quickBtn}>
      <span style={{ fontSize: "18px" }}>{icon}</span>
      <span style={styles.quickBtnLabel}>{label}</span>
    </button>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = {
  page: {
    padding:       "4px 0 40px 0",
    display:       "flex",
    flexDirection: "column",
    gap:           "20px"
  },

  topBar: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center"
  },

  downloadBtn: {
    background:   "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    border:       "1px solid var(--glass-border)",
    color:        "var(--text-primary)",
    borderRadius: "12px",
    padding:      "9px 16px",
    fontWeight:   "600",
    fontSize:     "13px",
    cursor:       "pointer",
    boxShadow:    "none",
    transition:   "all 0.2s ease"
  },

  captureArea: {
    display:       "flex",
    flexDirection: "column",
    gap:           "20px"
  },

  // Profile card
  profileCard: {
    display:              "flex",
    alignItems:           "flex-start",
    gap:                  "16px",
    padding:              "20px 24px",
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "20px",
    flexWrap:             "wrap"
  },

  profileAvatar: {
    width:          "56px",
    height:         "56px",
    borderRadius:   "16px",
    background:     "linear-gradient(135deg,#0A84FF,#BF5AF2)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    color:          "#fff",
    fontWeight:     "800",
    fontSize:       "20px",
    flexShrink:     0
  },

  profileInfo: {
    display:       "flex",
    flexDirection: "column",
    gap:           "4px",
    flex:          1
  },

  profileName: {
    fontSize:   "18px",
    fontWeight: "800",
    color:      "var(--text-primary)"
  },

  profileHeadline: {
    fontSize: "13px",
    color:    "var(--text-secondary)"
  },

  linkedinLink: {
    fontSize:   "12px",
    fontWeight: "600",
    color:      "#0A84FF"
  },

  profileSkills: {
    display:  "flex",
    flexWrap: "wrap",
    gap:      "6px",
    width:    "100%",
    marginTop:"4px"
  },

  skillTag: {
    padding:      "3px 10px",
    borderRadius: "20px",
    fontSize:     "11px",
    fontWeight:   "600",
    background:   "rgba(10,132,255,0.1)",
    color:        "#0A84FF"
  },

  skillTagMore: {
    padding:      "3px 10px",
    borderRadius: "20px",
    fontSize:     "11px",
    fontWeight:   "600",
    background:   "rgba(120,120,128,0.1)",
    color:        "var(--text-secondary)"
  },

  hero: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    flexWrap:       "wrap",
    gap:            "12px"
  },

  greeting: {
    margin:     "0 0 4px 0",
    fontSize:   "26px",
    fontWeight: "700",
    color:      "var(--text-primary)"
  },

  date: {
    margin: 0, fontSize: "13px", color: "var(--text-secondary)"
  },

  ctaBtn: {
    background:   "linear-gradient(135deg,#0A84FF,#0066CC)",
    color:        "#fff",
    border:       "none",
    borderRadius: "14px",
    padding:      "11px 20px",
    fontWeight:   "700",
    fontSize:     "14px",
    cursor:       "pointer",
    boxShadow:    "0 4px 14px rgba(10,132,255,0.35)"
  },

  statsRow: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap:                 "12px"
  },

  statCard: {
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "18px",
    padding:              "18px 16px",
    display:              "flex",
    flexDirection:        "column",
    alignItems:           "flex-start",
    gap:                  "8px",
    transition:           "transform 0.2s ease"
  },

  statIcon: {
    width:          "36px",
    height:         "36px",
    borderRadius:   "10px",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    fontSize:       "18px"
  },

  statValue: {
    fontSize:   "28px",
    fontWeight: "800",
    color:      "var(--text-primary)",
    lineHeight: 1
  },

  statLabel: {
    fontSize: "12px", color: "var(--text-secondary)", fontWeight: "500"
  },

  pipelineCard: {
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "18px",
    padding:              "20px 24px"
  },

  cardHeader: {
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    marginBottom:   "16px"
  },

  cardTitle: {
    fontSize: "15px", fontWeight: "700", color: "var(--text-primary)"
  },

  linkBtn: {
    background: "transparent", border: "none",
    color:      "#0A84FF",     fontSize: "13px",
    fontWeight: "600",         cursor:   "pointer",
    padding:    "4px 8px",     boxShadow:"none"
  },

  pipeline: {
    display: "flex", gap: "24px", marginBottom: "14px", flexWrap: "wrap"
  },

  pipelineStage: {
    display:       "flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           "4px"
  },

  pipelineDot:  { width: "10px", height: "10px", borderRadius: "50%" },
  pipelineCount:{ fontSize: "22px", fontWeight: "800", color: "var(--text-primary)" },
  pipelineLabel:{ fontSize: "11px", color: "var(--text-secondary)", fontWeight: "500" },

  progressBarTrack: {
    height:       "6px",
    borderRadius: "10px",
    background:   "rgba(120,120,128,0.15)",
    display:      "flex",
    overflow:     "hidden"
  },

  progressBarFill: {
    height:     "100%",
    transition: "width 0.5s ease"
  },

  grid: {
    display:             "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    gap:                 "16px"
  },

  card: {
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "18px",
    padding:              "20px"
  },

  badge: {
    background:   "rgba(10,132,255,0.15)",
    color:        "#0A84FF",
    borderRadius: "20px",
    padding:      "2px 10px",
    fontSize:     "12px",
    fontWeight:   "700"
  },

  listItems:    { display: "flex", flexDirection: "column", gap: "10px" },

  listItem: {
    display:      "flex",
    justifyContent:"space-between",
    alignItems:   "center",
    padding:      "10px 12px",
    background:   "rgba(120,120,128,0.07)",
    borderRadius: "12px",
    gap:          "10px"
  },

  listItemLeft: {
    display:    "flex",
    alignItems: "center",
    gap:        "10px",
    flex:       1,
    minWidth:   0
  },

  listItemAvatar: {
    width:          "32px",
    height:         "32px",
    borderRadius:   "8px",
    background:     "linear-gradient(135deg,#0A84FF,#BF5AF2)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    color:          "#fff",
    fontWeight:     "700",
    fontSize:       "13px",
    flexShrink:     0
  },

  listItemTitle: {
    fontSize:      "13px",
    fontWeight:    "600",
    color:         "var(--text-primary)",
    whiteSpace:    "nowrap",
    overflow:      "hidden",
    textOverflow:  "ellipsis"
  },

  listItemSub: {
    fontSize:     "11px",
    color:        "var(--text-secondary)",
    whiteSpace:   "nowrap",
    overflow:     "hidden",
    textOverflow: "ellipsis"
  },

  applyPill: {
    background:   "rgba(10,132,255,0.12)",
    color:        "#0A84FF",
    border:       "1px solid rgba(10,132,255,0.2)",
    borderRadius: "20px",
    padding:      "4px 12px",
    fontSize:     "12px",
    fontWeight:   "700",
    cursor:       "pointer",
    boxShadow:    "none",
    flexShrink:   0
  },

  alertDot: {
    width:        "8px",
    height:       "8px",
    borderRadius: "50%",
    background:   "#FF453A",
    flexShrink:   0
  },

  emptyState: {
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    padding:        "20px 16px",
    gap:            "8px",
    textAlign:      "center"
  },

  emptyIcon:  { fontSize: "28px" },
  emptyText:  { margin: 0, fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" },
  emptyBtn:   {
    background: "rgba(10,132,255,0.12)", color: "#0A84FF",
    border:     "none",                  borderRadius: "10px",
    padding:    "7px 14px",              fontSize: "12px",
    fontWeight: "600",                   cursor: "pointer",
    boxShadow:  "none"
  },

  quickActions: { marginTop: "4px" },
  quickLabel: {
    margin:        "0 0 10px 4px",
    fontSize:      "12px",
    fontWeight:    "600",
    color:         "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },
  quickRow: { display: "flex", gap: "10px", flexWrap: "wrap" },
  quickBtn: {
    display:              "flex",
    alignItems:           "center",
    gap:                  "8px",
    background:           "var(--glass-bg)",
    backdropFilter:       "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border:               "1px solid var(--glass-border)",
    borderRadius:         "14px",
    padding:              "12px 18px",
    cursor:               "pointer",
    boxShadow:            "none",
    transition:           "all 0.2s ease"
  },
  quickBtnLabel: {
    fontSize: "13px", fontWeight: "600", color: "var(--text-primary)"
  }
};

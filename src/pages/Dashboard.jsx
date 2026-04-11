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
  const navigate = useNavigate();

  const { jobs, applications, getBestJobs, getFollowupsToday, getInterviewsToday } = useStore();

  const bestJobs   = getBestJobs();
  const followups  = getFollowupsToday();
  const interviews = getInterviewsToday();

  // Pipeline counts
  const statusCounts = {
    Applied:   applications.filter(a => a.status === "Applied").length,
    Interview: applications.filter(a => a.status === "Interview").length,
    Offer:     applications.filter(a => a.status === "Offer").length,
    Rejected:  applications.filter(a => a.status === "Rejected").length
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  return (
    <div style={styles.page}>

      {/* ── Hero greeting ── */}
      <div style={styles.hero}>
        <div>
          <h1 style={styles.greeting}>{getGreeting()} 👋</h1>
          <p style={styles.date}>{today}</p>
        </div>
        <button onClick={() => navigate("/jobs")} style={styles.ctaBtn}>
          🌐 Browse Jobs
        </button>
      </div>

      {/* ── Stats row ── */}
      <div style={styles.statsRow}>
        <StatCard value={jobs.filter(j => !j.manual && j.link).length} label="Live Jobs" icon="🌐" color="#0A84FF" onClick={() => navigate("/jobs")} />
        <StatCard value={applications.length}       label="Total Applied"    icon="📋" color="#30D158" onClick={() => navigate("/applications")} />
        <StatCard value={statusCounts.Interview}    label="Interviews"       icon="🎯" color="#FF9F0A" onClick={() => navigate("/applications")} />
        <StatCard value={statusCounts.Offer}        label="Offers"           icon="🏆" color="#BF5AF2" onClick={() => navigate("/applications")} />
      </div>

      {/* ── Pipeline bar ── */}
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
          {applications.length > 0 && (
            <div style={styles.progressBarTrack}>
              {[
                { count: statusCounts.Applied,   color: "#0A84FF" },
                { count: statusCounts.Interview,  color: "#FF9F0A" },
                { count: statusCounts.Offer,      color: "#30D158" },
                { count: statusCounts.Rejected,   color: "#FF453A" }
              ].map((s, i) => (
                s.count > 0 && (
                  <div
                    key={i}
                    style={{
                      ...styles.progressBarFill,
                      width: ((s.count / applications.length) * 100) + "%",
                      background: s.color
                    }}
                  />
                )
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Three column grid ── */}
      <div style={styles.grid}>

        {/* Best jobs to apply */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>🔥 Apply Today</span>
            <button onClick={() => navigate("/jobs")} style={styles.linkBtn}>See all →</button>
          </div>
          {bestJobs.length === 0 ? (
            <EmptyState icon="🔍" text="Load jobs from the Job Board to see recommendations here." action={() => navigate("/jobs")} actionLabel="Go to Jobs" />
          ) : (
            <div style={styles.listItems}>
              {bestJobs.map(j => (
                <div key={j.id} style={styles.listItem}>
                  <div style={styles.listItemLeft}>
                    <div style={styles.listItemAvatar}>
                      {(j.company || "?")[0].toUpperCase()}
                    </div>
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

        {/* Follow-ups today */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>📩 Follow-ups Today</span>
            <span style={styles.badge}>{followups.length}</span>
          </div>
          {followups.length === 0 ? (
            <EmptyState icon="✉️" text="No follow-ups scheduled for today. Set dates in Applications." />
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

        {/* Interviews today */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <span style={styles.cardTitle}>🎯 Interviews Today</span>
            <span style={styles.badge}>{interviews.length}</span>
          </div>
          {interviews.length === 0 ? (
            <EmptyState icon="📅" text="No interviews scheduled today. Add interview dates in Applications." />
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
          <QuickAction icon="🌐" label="Browse Jobs"      onClick={() => navigate("/jobs")} />
          <QuickAction icon="📋" label="Applications"     onClick={() => navigate("/applications")} />
          <QuickAction icon="✨" label="Optimise Resume"  onClick={() => navigate("/outreach")} />
        </div>
      </div>

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function StatCard({ value, label, icon, color, onClick }) {
  return (
    <div style={{ ...styles.statCard, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ ...styles.statIcon, background: color + "20", color }}>
        {icon}
      </div>
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
      <span style={styles.quickIcon}>{icon}</span>
      <span style={styles.quickBtnLabel}>{label}</span>
    </button>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = {
  page: {
    padding: "4px 0 40px 0",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "12px"
  },

  greeting: {
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  date: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)"
  },

  ctaBtn: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "11px 20px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 14px rgba(10,132,255,0.35)"
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
    gap: "12px"
  },

  statCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px",
    padding: "18px 16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    transition: "transform 0.2s ease",
  },

  statIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "18px"
  },

  statValue: {
    fontSize: "28px",
    fontWeight: "800",
    color: "var(--text-primary)",
    lineHeight: 1
  },

  statLabel: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  pipelineCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px",
    padding: "20px 24px"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  cardTitle: {
    fontSize: "15px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#0A84FF",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 8px",
    boxShadow: "none"
  },

  pipeline: {
    display: "flex",
    gap: "24px",
    marginBottom: "14px",
    flexWrap: "wrap"
  },

  pipelineStage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },

  pipelineDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%"
  },

  pipelineCount: {
    fontSize: "22px",
    fontWeight: "800",
    color: "var(--text-primary)"
  },

  pipelineLabel: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  progressBarTrack: {
    height: "6px",
    borderRadius: "10px",
    background: "rgba(120,120,128,0.15)",
    display: "flex",
    overflow: "hidden"
  },

  progressBarFill: {
    height: "100%",
    transition: "width 0.5s ease"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px"
  },

  card: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px",
    padding: "20px"
  },

  badge: {
    background: "rgba(10,132,255,0.15)",
    color: "#0A84FF",
    borderRadius: "20px",
    padding: "2px 10px",
    fontSize: "12px",
    fontWeight: "700"
  },

  listItems: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    background: "rgba(120,120,128,0.07)",
    borderRadius: "12px",
    gap: "10px"
  },

  listItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flex: 1,
    minWidth: 0
  },

  listItemAvatar: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "13px",
    flexShrink: 0
  },

  listItemTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  listItemSub: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  applyPill: {
    background: "rgba(10,132,255,0.12)",
    color: "#0A84FF",
    border: "1px solid rgba(10,132,255,0.2)",
    borderRadius: "20px",
    padding: "4px 12px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "none",
    flexShrink: 0
  },

  alertDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#FF453A",
    flexShrink: 0
  },

  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "20px 16px",
    gap: "8px",
    textAlign: "center"
  },

  emptyIcon: {
    fontSize: "28px"
  },

  emptyText: {
    margin: 0,
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: "1.5"
  },

  emptyBtn: {
    background: "rgba(10,132,255,0.12)",
    color: "#0A84FF",
    border: "none",
    borderRadius: "10px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "none"
  },

  quickActions: {
    marginTop: "4px"
  },

  quickLabel: {
    margin: "0 0 10px 4px",
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },

  quickRow: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  quickBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "14px",
    padding: "12px 18px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.2s ease"
  },

  quickIcon: {
    fontSize: "18px"
  },

  quickBtnLabel: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)"
  }
};

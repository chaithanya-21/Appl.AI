import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

/* ─── Helpers ───────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const SKILL_COLORS = {
  "Applied": "#0A84FF",
  "Interview": "#FF9F0A",
  "Offer": "#30D158",
  "Rejected": "#FF453A"
};

/* ─── Component ─────────────────────────────────────────────────── */

export default function Dashboard() {
  const navigate = useNavigate();
  const { jobs, applications, getBestJobs, getFollowupsToday, getInterviewsToday } = useStore();

  const bestJobs   = getBestJobs();
  const followups  = getFollowupsToday();
  const interviews = getInterviewsToday();

  const liveJobs = jobs.filter(j => !j.manual && j.link);

  const statusCounts = {
    Applied:   applications.filter(a => a.status === "Applied").length,
    Interview: applications.filter(a => a.status === "Interview").length,
    Offer:     applications.filter(a => a.status === "Offer").length,
    Rejected:  applications.filter(a => a.status === "Rejected").length
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  });

  // Derive top skills from job titles in bestJobs
  const SKILLS_DESIGN = ["Figma", "UI/UX", "Prototyping", "Interaction Design", "Problem Solving"];
  const SKILLS_TECH   = ["React", "Node.js", "JavaScript", "Python", "SQL"];
  const HOBBIES       = ["Networking", "Side Projects", "Open Source"];

  // Work type breakdown
  const remoteCount = liveJobs.filter(j => j.workType === "remote").length;
  const hybridCount = liveJobs.filter(j => j.workType === "hybrid").length;
  const onsiteCount = liveJobs.filter(j => j.workType === "onsite").length;

  // Recent applications (last 3)
  const recentApps = [...applications]
    .sort((a, b) => (b.id || 0) - (a.id || 0))
    .slice(0, 3);

  return (
    <div style={styles.page}>

      {/* ══════════════════════════════════════════
          ROW 1 — Profile Card + Stats + Pipeline
      ══════════════════════════════════════════ */}
      <div style={styles.topRow}>

        {/* ── Profile / CV Card ── */}
        <div style={styles.profileCard}>
          {/* Avatar */}
          <div style={styles.avatarRing}>
            <div style={styles.avatar}>
              <span style={styles.avatarInitial}>👤</span>
            </div>
          </div>

          <div style={styles.profileName}>{getGreeting()} 👋</div>
          <div style={styles.profileRole}>Job Seeker · India</div>
          <div style={styles.profileDate}>{today}</div>

          <div style={styles.profileDivider} />

          {/* Quick action pills */}
          <button onClick={() => navigate("/jobs")} style={styles.hirePill}>
            🌐 Browse Jobs
          </button>
          <button onClick={() => navigate("/outreach")} style={{ ...styles.hirePill, ...styles.outlinePill }}>
            ✨ Optimise Resume
          </button>

          <div style={styles.profileDivider} />

          {/* Links row */}
          <div style={styles.profileLinks}>
            <div style={styles.profileLink}>
              <span style={styles.profileLinkIcon}>📋</span>
              <span style={styles.profileLinkText}>{applications.length} Applications</span>
            </div>
            <div style={styles.profileLink}>
              <span style={styles.profileLinkIcon}>🎯</span>
              <span style={styles.profileLinkText}>{statusCounts.Interview} Interviews</span>
            </div>
            <div style={styles.profileLink}>
              <span style={styles.profileLinkIcon}>🏆</span>
              <span style={styles.profileLinkText}>{statusCounts.Offer} Offers</span>
            </div>
            <div style={styles.profileLink}>
              <span style={styles.profileLinkIcon}>🌐</span>
              <span style={styles.profileLinkText}>{liveJobs.length} Live Jobs</span>
            </div>
          </div>
        </div>

        {/* ── Right column: Stats + work type + pipeline ── */}
        <div style={styles.rightCol}>

          {/* Stats row */}
          <div style={styles.statsRow}>
            <StatCard value={liveJobs.length}         label="Live Jobs"     icon="🌐" color="#0A84FF" onClick={() => navigate("/jobs")} />
            <StatCard value={applications.length}     label="Applied"       icon="📋" color="#30D158" onClick={() => navigate("/applications")} />
            <StatCard value={statusCounts.Interview}  label="Interviews"    icon="🎯" color="#FF9F0A" onClick={() => navigate("/applications")} />
            <StatCard value={statusCounts.Offer}      label="Offers"        icon="🏆" color="#BF5AF2" onClick={() => navigate("/applications")} />
          </div>

          {/* Work type breakdown */}
          {liveJobs.length > 0 && (
            <div style={styles.workTypeCard}>
              <div style={styles.cardHeader}>
                <span style={styles.cardTitle}>🏢 Job Types Available</span>
              </div>
              <div style={styles.workTypeRow}>
                {[
                  { label: "Remote",  count: remoteCount, color: "#30D158" },
                  { label: "Hybrid",  count: hybridCount, color: "#FF9F0A" },
                  { label: "Onsite",  count: onsiteCount, color: "#0A84FF" }
                ].map(wt => (
                  <div key={wt.label} style={styles.workTypePill}>
                    <div style={{ ...styles.workTypeDot, background: wt.color }} />
                    <span style={styles.workTypeCount}>{wt.count}</span>
                    <span style={styles.workTypeLabel}>{wt.label}</span>
                    <div style={styles.workTypeBar}>
                      <div style={{
                        ...styles.workTypeBarFill,
                        width: liveJobs.length > 0 ? ((wt.count / liveJobs.length) * 100) + "%" : "0%",
                        background: wt.color
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pipeline */}
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
                        width: ((s.count / applications.length) * 100) + "%",
                        background: s.color
                      }}
                    />
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════
          ROW 2 — Shots / Recommended Jobs  +  Experience  +  Skills panel
      ══════════════════════════════════════════ */}
      <div style={styles.midRow}>

        {/* ── Centre: Recommended Jobs + Recent Applications ── */}
        <div style={styles.centerCol}>

          {/* Recommended Jobs (like "Recommended Shots") */}
          <div style={styles.sectionCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>🔥 Recommended Jobs</span>
              <button onClick={() => navigate("/jobs")} style={styles.linkBtn}>See all →</button>
            </div>
            {bestJobs.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🔍</div>
                <p style={styles.emptyText}>Load jobs from the Job Board to see top picks here.</p>
                <button onClick={() => navigate("/jobs")} style={styles.emptyBtn}>Go to Jobs</button>
              </div>
            ) : (
              <div style={styles.shotsGrid}>
                {bestJobs.slice(0, 3).map(j => (
                  <div key={j.id} style={styles.shotCard} onClick={() => navigate("/jobs")}>
                    <div style={styles.shotLogo}>
                      {j.logo
                        ? <img src={j.logo} alt="" style={styles.shotLogoImg} onError={e => { e.target.style.display = "none"; }} />
                        : <span style={styles.shotLogoFallback}>{(j.company || "?")[0]}</span>
                      }
                    </div>
                    <div style={styles.shotTitle}>{j.role}</div>
                    <div style={styles.shotSub}>{j.company}</div>
                    <div style={styles.shotMeta}>{j.location}</div>
                    <div style={styles.shotWorkType}>
                      <span style={{
                        ...styles.workBadge,
                        background: j.workType === "remote" ? "rgba(48,209,88,0.15)" : j.workType === "hybrid" ? "rgba(255,159,10,0.15)" : "rgba(10,132,255,0.15)",
                        color: j.workType === "remote" ? "#30D158" : j.workType === "hybrid" ? "#FF9F0A" : "#0A84FF"
                      }}>
                        {j.workType || "onsite"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Work Experience (Recent Applications) */}
          <div style={styles.sectionCard}>
            <div style={styles.cardHeader}>
              <span style={styles.cardTitle}>📋 Recent Applications</span>
              <button onClick={() => navigate("/applications")} style={styles.linkBtn}>View all →</button>
            </div>
            {recentApps.length === 0 ? (
              <div style={styles.emptyState}>
                <p style={styles.emptyText}>No applications yet. Apply to jobs from the Job Board.</p>
              </div>
            ) : (
              <div style={styles.expGrid}>
                <div style={styles.expCol}>
                  {recentApps.map((a, i) => (
                    <div key={a.id} style={styles.expItem}>
                      <div style={{ ...styles.expDot, background: SKILL_COLORS[a.status] || "#0A84FF" }} />
                      <div style={styles.expLine}>
                        <div style={styles.expPeriod}>{a.status}</div>
                        <div style={styles.expRole}>{a.role}</div>
                        <a href="#" onClick={e => { e.preventDefault(); navigate("/applications"); }} style={styles.expCompany}>{a.company}</a>
                      </div>
                    </div>
                  ))}
                </div>
                {/* Follow-ups & Interviews */}
                <div style={styles.expCol}>
                  <div style={styles.expLabel}>Today's Follow-ups</div>
                  {followups.length === 0
                    ? <div style={styles.expEmpty}>None scheduled</div>
                    : followups.map(a => (
                      <div key={a.id} style={styles.expItem}>
                        <div style={{ ...styles.expDot, background: "#FF453A" }} />
                        <div style={styles.expLine}>
                          <div style={styles.expRole}>{a.role}</div>
                          <div style={styles.expCompany}>{a.company}</div>
                        </div>
                      </div>
                    ))
                  }
                  <div style={{ ...styles.expLabel, marginTop: "16px" }}>Today's Interviews</div>
                  {interviews.length === 0
                    ? <div style={styles.expEmpty}>None scheduled</div>
                    : interviews.map(a => (
                      <div key={a.id} style={styles.expItem}>
                        <div style={{ ...styles.expDot, background: "#FF9F0A" }} />
                        <div style={styles.expLine}>
                          <div style={styles.expRole}>{a.role}</div>
                          <div style={styles.expCompany}>{a.company}</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: Skills sidebar (like screenshot) ── */}
        <div style={styles.skillsPanel}>

          {/* Search bar at top */}
          <div style={styles.skillsSearch}>
            <span style={styles.skillsSearchIcon}>🔍</span>
            <input
              placeholder="Search jobs..."
              style={styles.skillsSearchInput}
              onChange={e => {
                if (e.target.value.trim()) navigate("/jobs");
              }}
              onKeyDown={e => {
                if (e.key === "Enter") navigate("/jobs");
              }}
            />
          </div>

          {/* Design Skills */}
          <div style={styles.skillsSection}>
            <div style={styles.skillsSectionTitle}>DESIGN SKILLS</div>
            <div style={styles.skillsDivider} />
            {["User Interfaces", "Prototyping", "Interaction Design", "Problem Solving", "Design Thinking"].map(skill => (
              <div key={skill} style={styles.skillRow}>
                <span style={styles.skillName}>{skill}</span>
                <span style={styles.skillCheck}>✓</span>
              </div>
            ))}
          </div>

          {/* Tech Skills */}
          <div style={styles.skillsSection}>
            <div style={styles.skillsSectionTitle}>TECH SKILLS</div>
            <div style={styles.skillsDivider} />
            {["HTML & CSS", "JavaScript", "React / Angular", "Node.js / Python", "SQL / Databases"].map(skill => (
              <div key={skill} style={styles.skillRow}>
                <span style={styles.skillName}>{skill}</span>
                <span style={styles.skillCheck}>✓</span>
              </div>
            ))}
          </div>

          {/* Miscellaneous / Today */}
          <div style={styles.skillsSection}>
            <div style={styles.skillsSectionTitle}>TODAY</div>
            <div style={styles.skillsDivider} />
            {[
              { label: "Follow-ups", count: followups.length, max: 3 },
              { label: "Interviews", count: interviews.length, max: 3 },
              { label: "Offers",     count: statusCounts.Offer, max: 3 }
            ].map(item => (
              <div key={item.label} style={styles.skillRow}>
                <span style={styles.skillName}>{item.label}</span>
                <div style={styles.starRow}>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span key={i} style={{
                      ...styles.starIcon,
                      color: i < Math.min(item.count, 3) ? "#FF9F0A" : "rgba(120,120,128,0.3)"
                    }}>★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
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

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = {
  page: {
    padding: "4px 0 40px 0",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
  },

  // ── ROW 1 ──
  topRow: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap"
  },

  profileCard: {
    width: "220px",
    flexShrink: 0,
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px",
    padding: "24px 20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    gap: "10px"
  },

  avatarRing: {
    width: "76px",
    height: "76px",
    borderRadius: "50%",
    border: "3px solid rgba(10,132,255,0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "4px"
  },

  avatar: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },

  avatarInitial: {
    fontSize: "28px"
  },

  profileName: {
    fontSize: "17px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  profileRole: {
    fontSize: "12px",
    color: "var(--text-secondary)"
  },

  profileDate: {
    fontSize: "11px",
    color: "var(--text-tertiary, rgba(120,120,128,0.6))"
  },

  profileDivider: {
    width: "100%",
    height: "1px",
    background: "var(--glass-border)",
    margin: "4px 0"
  },

  hirePill: {
    width: "100%",
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    padding: "9px 16px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(10,132,255,0.3)"
  },

  outlinePill: {
    background: "transparent",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    boxShadow: "none"
  },

  profileLinks: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  profileLink: {
    display: "flex",
    alignItems: "center",
    gap: "8px"
  },

  profileLinkIcon: {
    fontSize: "14px",
    width: "20px",
    textAlign: "center"
  },

  profileLinkText: {
    fontSize: "12px",
    color: "var(--text-secondary)"
  },

  rightCol: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "12px"
  },

  statCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "6px",
    transition: "transform 0.2s ease"
  },

  statIcon: {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "16px"
  },

  statValue: {
    fontSize: "24px",
    fontWeight: "800",
    color: "var(--text-primary)",
    lineHeight: 1
  },

  statLabel: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  workTypeCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "16px 20px"
  },

  workTypeRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap"
  },

  workTypePill: {
    flex: 1,
    minWidth: "80px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },

  workTypeDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%"
  },

  workTypeCount: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)"
  },

  workTypeLabel: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  workTypeBar: {
    width: "100%",
    height: "4px",
    background: "rgba(120,120,128,0.15)",
    borderRadius: "4px",
    overflow: "hidden",
    marginTop: "2px"
  },

  workTypeBarFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.5s ease"
  },

  pipelineCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "16px 20px"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px"
  },

  cardTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  linkBtn: {
    background: "transparent",
    border: "none",
    color: "#0A84FF",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 8px",
    boxShadow: "none"
  },

  pipeline: {
    display: "flex",
    gap: "24px",
    marginBottom: "12px",
    flexWrap: "wrap"
  },

  pipelineStage: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px"
  },

  pipelineDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%"
  },

  pipelineCount: {
    fontSize: "20px",
    fontWeight: "800",
    color: "var(--text-primary)"
  },

  pipelineLabel: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  progressBarTrack: {
    height: "5px",
    borderRadius: "10px",
    background: "rgba(120,120,128,0.15)",
    display: "flex",
    overflow: "hidden"
  },

  progressBarFill: {
    height: "100%",
    transition: "width 0.5s ease"
  },

  // ── ROW 2 ──
  midRow: {
    display: "flex",
    gap: "20px",
    alignItems: "flex-start",
    flexWrap: "wrap"
  },

  centerCol: {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    gap: "16px"
  },

  sectionCard: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "18px",
    padding: "20px"
  },

  // Shots grid (recommended jobs)
  shotsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "12px"
  },

  shotCard: {
    background: "rgba(120,120,128,0.07)",
    border: "1px solid var(--glass-border)",
    borderRadius: "14px",
    padding: "14px 12px",
    cursor: "pointer",
    transition: "transform 0.2s ease",
    display: "flex",
    flexDirection: "column",
    gap: "6px"
  },

  shotLogo: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0A84FF22, #BF5AF222)",
    border: "1px solid var(--glass-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: "4px"
  },

  shotLogoImg: {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  },

  shotLogoFallback: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0A84FF"
  },

  shotTitle: {
    fontSize: "12px",
    fontWeight: "700",
    color: "var(--text-primary)",
    lineHeight: "1.3",
    overflow: "hidden",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical"
  },

  shotSub: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  shotMeta: {
    fontSize: "10px",
    color: "var(--text-secondary)"
  },

  shotWorkType: {
    marginTop: "2px"
  },

  workBadge: {
    fontSize: "10px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "20px",
    textTransform: "capitalize"
  },

  // Experience / Applications
  expGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px"
  },

  expCol: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  expLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.06em"
  },

  expEmpty: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontStyle: "italic"
  },

  expItem: {
    display: "flex",
    gap: "10px",
    alignItems: "flex-start"
  },

  expDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginTop: "4px",
    flexShrink: 0
  },

  expLine: {
    flex: 1,
    minWidth: 0
  },

  expPeriod: {
    fontSize: "10px",
    color: "var(--text-secondary)",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: "0.04em"
  },

  expRole: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  expCompany: {
    fontSize: "11px",
    color: "#0A84FF",
    cursor: "pointer",
    textDecoration: "none"
  },

  // ── Skills panel (right sidebar, like screenshot) ──
  skillsPanel: {
    width: "220px",
    flexShrink: 0,
    background: "#1a2133",
    borderRadius: "20px",
    padding: "0",
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)"
  },

  skillsSearch: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "14px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "#151d2e"
  },

  skillsSearchIcon: {
    fontSize: "13px",
    opacity: 0.5,
    flexShrink: 0
  },

  skillsSearchInput: {
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#F2F2F7",
    fontSize: "12px",
    width: "100%",
    padding: 0,
    backdropFilter: "none"
  },

  skillsSection: {
    padding: "14px 16px"
  },

  skillsSectionTitle: {
    fontSize: "10px",
    fontWeight: "800",
    color: "rgba(242,242,247,0.5)",
    letterSpacing: "0.1em",
    marginBottom: "8px"
  },

  skillsDivider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    marginBottom: "10px"
  },

  skillRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "8px",
    gap: "8px"
  },

  skillName: {
    fontSize: "12px",
    color: "rgba(242,242,247,0.8)",
    flex: 1
  },

  skillCheck: {
    color: "#30D158",
    fontSize: "13px",
    fontWeight: "700",
    flexShrink: 0
  },

  starRow: {
    display: "flex",
    gap: "2px"
  },

  starIcon: {
    fontSize: "13px"
  },

  // Empty states
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
  }
};

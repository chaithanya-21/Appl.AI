import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { scoreJob } from "../utils/scoreJob";

export default function JobCard({ job }) {
  const navigate = useNavigate();
  const { addApplication, deleteJob, updateJob, applications, togglePriority } = useStore();

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...job });
  const [expanded, setExpanded] = useState(false);
  const [justApplied, setJustApplied] = useState(false);

  const resumeText = localStorage.getItem("resumeText") || "";
  const score = scoreJob(job, resumeText);
  const alreadyApplied = applications?.some(a => a.jobId === job.id);

  const scoreColor =
    score >= 75 ? "#30D158" :
    score >= 50 ? "#FF9F0A" :
    score > 0   ? "#FF453A" :
    "#8E8E93";

  function markApplied() {
    if (alreadyApplied) return;
    addApplication({ jobId: job.id, role: job.role, company: job.company });
    setJustApplied(true);
    setTimeout(() => setJustApplied(false), 2000);
  }

  function copyJD() {
    navigator.clipboard.writeText(job.description || "");
  }

  function saveEdit() {
    updateJob(job.id, form);
    setEditing(false);
  }

  const workTypeColor = {
    remote: { bg: "rgba(48,209,88,0.12)", text: "#30D158" },
    hybrid: { bg: "rgba(255,159,10,0.12)", text: "#FF9F0A" },
    onsite: { bg: "rgba(10,132,255,0.12)", text: "#0A84FF" }
  };
  const wtStyle = workTypeColor[job.workType] || workTypeColor.onsite;

  const expColor = {
    junior: "#5AC8FA",
    mid: "#0A84FF",
    senior: "#BF5AF2",
    lead: "#FF9F0A"
  };

  /* ── Edit Mode ────────────────────────────────────────────────── */
  if (editing) {
    return (
      <div style={styles.card}>
        <h4 style={{ ...styles.editTitle, color: "var(--text-primary)" }}>Edit Job</h4>

        <label style={styles.inputLabel}>Role</label>
        <input
          value={form.role || ""}
          onChange={e => setForm({ ...form, role: e.target.value })}
          style={styles.input}
          placeholder="Job title"
        />

        <label style={styles.inputLabel}>Company</label>
        <input
          value={form.company || ""}
          onChange={e => setForm({ ...form, company: e.target.value })}
          style={styles.input}
          placeholder="Company name"
        />

        <label style={styles.inputLabel}>Location</label>
        <input
          value={form.location || ""}
          onChange={e => setForm({ ...form, location: e.target.value })}
          style={styles.input}
          placeholder="City, State"
        />

        <label style={styles.inputLabel}>Description</label>
        <textarea
          value={form.description || ""}
          onChange={e => setForm({ ...form, description: e.target.value })}
          style={{ ...styles.input, height: "100px", resize: "vertical" }}
          placeholder="Job description…"
        />

        <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
          <button onClick={saveEdit} style={styles.saveBtn}>💾 Save</button>
          <button onClick={() => setEditing(false)} style={styles.cancelBtn}>Cancel</button>
        </div>
      </div>
    );
  }

  /* ── Normal Mode ──────────────────────────────────────────────── */
  return (
    <div style={styles.card}>

      {/* ── Top row: Logo + star ── */}
      <div style={styles.topRow}>
        <div style={styles.logoArea}>
          {job.logo ? (
            <img src={job.logo} alt="" style={styles.logo} onError={e => { e.target.style.display = "none"; }} />
          ) : (
            <div style={styles.logoPlaceholder}>
              {(job.company || "?")[0].toUpperCase()}
            </div>
          )}
        </div>

        <button
          onClick={() => togglePriority(job.id)}
          style={styles.starBtn}
          title={job.priority ? "Remove from starred" : "Star this job"}
        >
          {job.priority ? "⭐" : "☆"}
        </button>
      </div>

      {/* ── Role & Company ── */}
      <h3 style={styles.role}>{job.role}</h3>
      <p style={styles.company}>{job.company}</p>

      {/* ── Badges ── */}
      <div style={styles.badges}>
        {job.location && (
          <span style={styles.badge}>📍 {job.location}</span>
        )}
        {job.workType && (
          <span style={{ ...styles.badge, background: wtStyle.bg, color: wtStyle.text }}>
            {job.workType === "remote" ? "🏠" : job.workType === "hybrid" ? "⚡" : "🏢"} {job.workType}
          </span>
        )}
        {job.experienceLevel && job.experienceLevel !== "any" && (
          <span style={{
            ...styles.badge,
            background: `${expColor[job.experienceLevel]}18`,
            color: expColor[job.experienceLevel] || "#8E8E93"
          }}>
            {job.experienceLevel}
          </span>
        )}
      </div>

      {/* ── Salary ── */}
      {job.salary && job.salary !== "Salary not disclosed" && (
        <p style={styles.salary}>💰 {job.salary}</p>
      )}

      {/* ── Skill Tags ── */}
      {job.skills && job.skills.length > 0 && (
        <div style={styles.skillsRow}>
          {job.skills.slice(0, 4).map(s => (
            <span key={s} style={styles.skillTag}>{s}</span>
          ))}
        </div>
      )}

      {/* ── Match Score ── */}
      <div style={styles.scoreRow}>
        <div style={styles.scoreBar}>
          <div
            style={{
              ...styles.scoreBarFill,
              width: `${score}%`,
              background: scoreColor
            }}
          />
        </div>
        <span style={{ ...styles.scoreLabel, color: scoreColor }}>
          {score}% match{!resumeText && " (upload resume for accurate score)"}
        </span>
      </div>

      {/* ── Applied badge ── */}
      {(alreadyApplied || justApplied) && (
        <div style={styles.appliedBadge}>
          ✓ Applied
        </div>
      )}

      {/* ── Description (collapsible) ── */}
      {job.description && (
        <div style={styles.descSection}>
          <p style={{ ...styles.desc, WebkitLineClamp: expanded ? "unset" : 3 }}>
            {job.description}
          </p>
          <button
            onClick={() => setExpanded(v => !v)}
            style={styles.expandBtn}
          >
            {expanded ? "Show less ▲" : "Show more ▼"}
          </button>
        </div>
      )}

      {/* ── Source & Posted date ── */}
      {(job.source || job.posted) && (
        <p style={styles.meta}>
          {job.source && <span>{job.source}</span>}
          {job.posted && (
            <span> · {new Date(job.posted).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
          )}
        </p>
      )}

      {/* ── Action Buttons ── */}
      <div style={styles.actions}>
        {job.link && (
          <a href={job.link} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
            <button style={styles.applyBtn}>🚀 Apply</button>
          </a>
        )}

        <button
          onClick={markApplied}
          disabled={alreadyApplied}
          style={{
            ...styles.markBtn,
            opacity: alreadyApplied ? 0.5 : 1,
            cursor: alreadyApplied ? "default" : "pointer"
          }}
        >
          ✔ Mark Applied
        </button>

        <button onClick={copyJD} style={styles.iconBtn} title="Copy JD">📋</button>

        <button
          onClick={() => {
            localStorage.setItem("jobJD", job.description || "");
            navigate("/outreach");
          }}
          style={styles.iconBtn}
          title="Optimize Resume"
        >
          ✨
        </button>

        {(job.manual || !job.link) && (
          <>
            <button onClick={() => setEditing(true)} style={styles.iconBtn} title="Edit">✏️</button>
            <button onClick={() => deleteJob(job.id)} style={styles.deleteBtn} title="Delete">🗑</button>
          </>
        )}
      </div>
    </div>
  );
}

/* ─── Styles — all use CSS vars so they respect dark/light theme ─── */

const styles = {
  card: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "default"
  },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "4px"
  },

  logoArea: {
    display: "flex",
    alignItems: "center"
  },

  logo: {
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    objectFit: "contain"
  },

  logoPlaceholder: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px"
  },

  starBtn: {
    background: "transparent",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "2px",
    boxShadow: "none",
    lineHeight: 1
  },

  role: {
    margin: "4px 0 2px",
    fontSize: "16px",
    fontWeight: "700",
    color: "var(--text-primary)",
    lineHeight: "1.3"
  },

  company: {
    margin: "0 0 6px",
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  badges: {
    display: "flex",
    flexWrap: "wrap",
    gap: "6px",
    marginBottom: "4px"
  },

  badge: {
    padding: "3px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    background: "rgba(120,120,128,0.12)",
    color: "var(--text-secondary)",
    whiteSpace: "nowrap"
  },

  salary: {
    margin: "2px 0",
    fontSize: "12px",
    fontWeight: "600",
    color: "#30D158"
  },

  skillsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginBottom: "2px"
  },

  skillTag: {
    padding: "3px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    background: "rgba(10,132,255,0.1)",
    color: "#0A84FF"
  },

  scoreRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "4px",
    marginBottom: "2px"
  },

  scoreBar: {
    flex: 1,
    height: "4px",
    borderRadius: "10px",
    background: "rgba(120,120,128,0.2)",
    overflow: "hidden"
  },

  scoreBarFill: {
    height: "100%",
    borderRadius: "10px",
    transition: "width 0.4s ease"
  },

  scoreLabel: {
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap"
  },

  appliedBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "700",
    background: "rgba(48,209,88,0.15)",
    color: "#30D158",
    alignSelf: "flex-start",
    border: "1px solid rgba(48,209,88,0.3)"
  },

  descSection: {
    marginTop: "4px"
  },

  desc: {
    margin: "0 0 4px",
    fontSize: "12px",
    color: "var(--text-secondary)",
    lineHeight: "1.5",
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    overflow: "hidden"
  },

  expandBtn: {
    background: "transparent",
    border: "none",
    padding: "0",
    fontSize: "11px",
    color: "#0A84FF",
    cursor: "pointer",
    fontWeight: "600",
    boxShadow: "none"
  },

  meta: {
    margin: "4px 0 0",
    fontSize: "11px",
    color: "var(--text-secondary)"
  },

  actions: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap",
    marginTop: "10px",
    paddingTop: "12px",
    borderTop: "1px solid var(--glass-border)"
  },

  applyBtn: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "7px 14px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(10,132,255,0.3)"
  },

  markBtn: {
    background: "rgba(48,209,88,0.12)",
    color: "#30D158",
    border: "1px solid rgba(48,209,88,0.25)",
    borderRadius: "10px",
    padding: "7px 12px",
    fontSize: "12px",
    fontWeight: "600",
    boxShadow: "none"
  },

  iconBtn: {
    background: "rgba(120,120,128,0.1)",
    border: "1px solid var(--glass-border)",
    borderRadius: "10px",
    padding: "7px 10px",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "none",
    color: "var(--text-primary)"
  },

  deleteBtn: {
    background: "rgba(255,59,48,0.1)",
    border: "1px solid rgba(255,59,48,0.2)",
    borderRadius: "10px",
    padding: "7px 10px",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "none",
    color: "#FF453A"
  },

  // Edit form
  editTitle: {
    margin: "0 0 12px",
    fontSize: "16px",
    fontWeight: "700"
  },

  inputLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    display: "block",
    marginBottom: "3px"
  },

  input: {
    width: "100%",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "8px"
  },

  saveBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "9px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 3px 8px rgba(10,132,255,0.3)"
  },

  cancelBtn: {
    flex: 1,
    background: "rgba(120,120,128,0.12)",
    color: "var(--text-secondary)",
    border: "1px solid var(--glass-border)",
    borderRadius: "10px",
    padding: "9px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "none"
  }
};

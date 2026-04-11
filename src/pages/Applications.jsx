import { useState } from "react";
import { useStore } from "../store/useStore";

/* ─── Constants ─────────────────────────────────────────────────── */

const COLUMNS = [
  { key: "Applied",   label: "Applied",   icon: "📤", color: "#0A84FF" },
  { key: "Interview", label: "Interview", icon: "🎯", color: "#FF9F0A" },
  { key: "Offer",     label: "Offer",     icon: "🏆", color: "#30D158" },
  { key: "Rejected",  label: "Rejected",  icon: "❌", color: "#FF453A" }
];

/* ─── Component ─────────────────────────────────────────────────── */

export default function Applications() {
  const {
    applications,
    moveApplication,
    updateNotes,
    setInterviewDate,
    markContacted,
    markReplied,
    setFollowup,
    deleteJob
  } = useStore();

  const [expandedId, setExpandedId] = useState(null);
  const [search, setSearch]         = useState("");

  const today = new Date().toISOString().slice(0, 10);

  const filtered = search.trim()
    ? applications.filter(a =>
        (a.role    || "").toLowerCase().includes(search.toLowerCase()) ||
        (a.company || "").toLowerCase().includes(search.toLowerCase())
      )
    : applications;

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Applications</h1>
          <p style={styles.pageSubtitle}>{applications.length} total · {applications.filter(a => a.status === "Interview").length} interviews</p>
        </div>

        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder="Search applications…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* ── Kanban board ── */}
      {applications.length === 0 ? (
        <div style={styles.emptyBoard}>
          <div style={styles.emptyIcon}>📋</div>
          <h3 style={styles.emptyTitle}>No applications yet</h3>
          <p style={styles.emptyText}>
            Go to the Job Board and click "Mark Applied" on jobs you've applied to.
          </p>
        </div>
      ) : (
        <div style={styles.board}>
          {COLUMNS.map(col => {
            const colApps = filtered.filter(a => a.status === col.key);
            return (
              <div key={col.key} style={styles.column}>

                {/* Column header */}
                <div style={styles.columnHeader}>
                  <div style={styles.columnTitleRow}>
                    <span style={{ fontSize: "16px" }}>{col.icon}</span>
                    <span style={styles.columnTitle}>{col.label}</span>
                    <span style={{
                      ...styles.columnCount,
                      background: col.color + "20",
                      color: col.color
                    }}>
                      {colApps.length}
                    </span>
                  </div>
                  <div style={{ ...styles.columnBar, background: col.color }} />
                </div>

                {/* Cards */}
                <div style={styles.columnCards}>
                  {colApps.length === 0 ? (
                    <div style={styles.emptyCol}>
                      <p style={styles.emptyColText}>No {col.label.toLowerCase()} yet</p>
                    </div>
                  ) : (
                    colApps.map(app => (
                      <AppCard
                        key={app.id}
                        app={app}
                        today={today}
                        expanded={expandedId === app.id}
                        onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
                        onMove={moveApplication}
                        onNotes={updateNotes}
                        onInterview={setInterviewDate}
                        onContacted={markContacted}
                        onReplied={markReplied}
                        onFollowup={setFollowup}
                        colColor={col.color}
                      />
                    ))
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── AppCard ────────────────────────────────────────────────────── */

function AppCard({ app, today, expanded, onToggle, onMove, onNotes, onInterview, onContacted, onReplied, onFollowup, colColor }) {
  const isFollowToday = app.followup === today;
  const isOverdue     = app.followup && app.followup < today;

  return (
    <div style={styles.card}>

      {/* Alert strip */}
      {(isFollowToday || isOverdue) && (
        <div style={{
          ...styles.alertStrip,
          background: isOverdue ? "rgba(255,69,58,0.12)" : "rgba(255,159,10,0.12)",
          color:      isOverdue ? "#FF453A" : "#FF9F0A",
          borderColor: isOverdue ? "rgba(255,69,58,0.2)" : "rgba(255,159,10,0.2)"
        }}>
          {isOverdue ? "⚠️ Follow-up overdue" : "🔔 Follow-up today"}
        </div>
      )}

      {/* Card header */}
      <div style={styles.cardHeader} onClick={onToggle}>
        <div style={styles.cardAvatar}>
          {(app.company || "?")[0].toUpperCase()}
        </div>
        <div style={styles.cardInfo}>
          <div style={styles.cardRole}>{app.role}</div>
          <div style={styles.cardCompany}>{app.company}</div>
        </div>
        <span style={styles.chevron}>{expanded ? "▲" : "▼"}</span>
      </div>

      {/* Recruiter status pills */}
      <div style={styles.statusPills}>
        <button
          onClick={() => onContacted(app.id)}
          style={{
            ...styles.statusPill,
            background: app.contacted ? "rgba(48,209,88,0.15)"  : "rgba(120,120,128,0.1)",
            color:      app.contacted ? "#30D158" : "var(--text-secondary)",
            border:     app.contacted ? "1px solid rgba(48,209,88,0.3)" : "1px solid var(--glass-border)"
          }}
        >
          📩 Contacted
        </button>
        <button
          onClick={() => onReplied(app.id)}
          style={{
            ...styles.statusPill,
            background: app.replied ? "rgba(10,132,255,0.15)"  : "rgba(120,120,128,0.1)",
            color:      app.replied ? "#0A84FF" : "var(--text-secondary)",
            border:     app.replied ? "1px solid rgba(10,132,255,0.3)" : "1px solid var(--glass-border)"
          }}
        >
          💬 Replied
        </button>
      </div>

      {/* Move stage buttons */}
      <div style={styles.moveBtns}>
        {COLUMNS.map(col => (
          <button
            key={col.key}
            onClick={() => onMove(app.id, col.key)}
            style={{
              ...styles.moveBtn,
              background: app.status === col.key
                ? col.color + "25"
                : "rgba(120,120,128,0.08)",
              color: app.status === col.key ? col.color : "var(--text-secondary)",
              border: app.status === col.key
                ? "1px solid " + col.color + "40"
                : "1px solid transparent",
              fontWeight: app.status === col.key ? "700" : "500"
            }}
          >
            {col.icon} {col.key}
          </button>
        ))}
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div style={styles.expanded}>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Interview Date</label>
            <input
              type="date"
              value={app.interviewDate || ""}
              onChange={e => onInterview(app.id, e.target.value)}
              style={styles.fieldInput}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Follow-up Date</label>
            <input
              type="date"
              value={app.followup || ""}
              onChange={e => onFollowup(app.id, e.target.value)}
              style={styles.fieldInput}
            />
          </div>

          <div style={styles.fieldGroup}>
            <label style={styles.fieldLabel}>Notes</label>
            <textarea
              placeholder="Add notes about this application…"
              value={app.notes || ""}
              onChange={e => onNotes(app.id, e.target.value)}
              style={styles.notesInput}
            />
          </div>

        </div>
      )}

    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────────────── */

const styles = {
  page: {
    padding: "4px 0 40px 0"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "12px"
  },

  pageTitle: {
    margin: "0 0 4px 0",
    fontSize: "28px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  pageSubtitle: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)"
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center"
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "13px",
    pointerEvents: "none"
  },

  searchInput: {
    paddingLeft: "34px",
    width: "220px",
    borderRadius: "12px",
    fontSize: "13px"
  },

  board: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    alignItems: "start"
  },

  column: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  columnHeader: {
    marginBottom: "4px"
  },

  columnTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "8px"
  },

  columnTitle: {
    fontSize: "14px",
    fontWeight: "700",
    color: "var(--text-primary)",
    flex: 1
  },

  columnCount: {
    padding: "2px 8px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  columnBar: {
    height: "3px",
    borderRadius: "2px",
    opacity: 0.6
  },

  columnCards: {
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },

  emptyCol: {
    padding: "20px 12px",
    textAlign: "center",
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    borderRadius: "14px",
    border: "1px dashed var(--glass-border)"
  },

  emptyColText: {
    margin: 0,
    fontSize: "12px",
    color: "var(--text-secondary)"
  },

  // Application card — uses CSS vars, no static dark check
  card: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    transition: "transform 0.15s ease"
  },

  alertStrip: {
    padding: "6px 10px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "600",
    border: "1px solid"
  },

  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer"
  },

  cardAvatar: {
    width: "34px",
    height: "34px",
    borderRadius: "9px",
    background: "linear-gradient(135deg, #0A84FF, #BF5AF2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: "700",
    fontSize: "14px",
    flexShrink: 0
  },

  cardInfo: {
    flex: 1,
    minWidth: 0
  },

  cardRole: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis"
  },

  cardCompany: {
    fontSize: "11px",
    color: "var(--text-secondary)"
  },

  chevron: {
    fontSize: "10px",
    color: "var(--text-secondary)"
  },

  statusPills: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },

  statusPill: {
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "none"
  },

  moveBtns: {
    display: "flex",
    gap: "4px",
    flexWrap: "wrap"
  },

  moveBtn: {
    padding: "4px 9px",
    borderRadius: "8px",
    fontSize: "11px",
    cursor: "pointer",
    boxShadow: "none",
    transition: "all 0.15s ease"
  },

  expanded: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    paddingTop: "10px",
    borderTop: "1px solid var(--glass-border)"
  },

  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "4px"
  },

  fieldLabel: {
    fontSize: "11px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em"
  },

  fieldInput: {
    fontSize: "13px",
    padding: "8px 12px",
    borderRadius: "10px"
  },

  notesInput: {
    fontSize: "13px",
    padding: "8px 12px",
    borderRadius: "10px",
    height: "80px",
    resize: "vertical"
  },

  emptyBoard: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid var(--glass-border)"
  },

  emptyIcon: { fontSize: "48px", marginBottom: "12px" },
  emptyTitle: { margin: "0 0 8px", fontSize: "20px", fontWeight: "600", color: "var(--text-primary)" },
  emptyText:  { margin: 0, color: "var(--text-secondary)", fontSize: "14px" }
};

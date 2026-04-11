import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import JobCard from "../components/JobCard";
import { fetchJobs } from "../services/fetchJobs";

/* ─── Constants ────────────────────────────────────────────────── */

const INDIAN_STATES = [
  "All States",
  "Andhra Pradesh", "Telangana", "Karnataka", "Tamil Nadu",
  "Maharashtra", "Delhi", "Gujarat", "Uttar Pradesh",
  "West Bengal", "Haryana", "Kerala", "Rajasthan",
  "Madhya Pradesh", "Punjab", "Odisha"
];

const CITY_TO_STATE = {
  hyderabad: "Telangana", secunderabad: "Telangana",
  bangalore: "Karnataka", bengaluru: "Karnataka",
  chennai: "Tamil Nadu", coimbatore: "Tamil Nadu",
  mumbai: "Maharashtra", pune: "Maharashtra", nagpur: "Maharashtra",
  delhi: "Delhi", "new delhi": "Delhi",
  gurgaon: "Haryana", gurugram: "Haryana", faridabad: "Haryana",
  noida: "Uttar Pradesh", agra: "Uttar Pradesh", lucknow: "Uttar Pradesh",
  kolkata: "West Bengal",
  ahmedabad: "Gujarat", surat: "Gujarat",
  visakhapatnam: "Andhra Pradesh", vijayawada: "Andhra Pradesh",
  kochi: "Kerala", thiruvananthapuram: "Kerala",
  jaipur: "Rajasthan",
  chandigarh: "Punjab",
  indore: "Madhya Pradesh", bhopal: "Madhya Pradesh",
  bhubaneswar: "Odisha"
};

const WORK_TYPES = ["All Types", "Remote", "Hybrid", "Onsite"];
const EXP_LEVELS = ["All Levels", "Junior", "Mid", "Senior", "Lead"];
const PAGE_SIZE = 9;

/* ─── Component ─────────────────────────────────────────────────── */

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, addJob } = useStore();

  // Filters
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState("All Types");
  const [stateFilter, setStateFilter] = useState("All States");
  const [expFilter, setExpFilter] = useState("All Levels");
  const [salaryFilter, setSalaryFilter] = useState(false); // true = only jobs with disclosed salary
  const [priorityOnly, setPriorityOnly] = useState(false);

  // Pagination & UI state
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [activeTab, setActiveTab] = useState("live"); // "live" | "saved"
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob, setNewJob] = useState({ role: "", company: "", location: "", description: "" });

  const myJobs = jobs.filter(j => j.manual || !j.link);
  const liveJobs = jobs.filter(j => !j.manual && j.link);

  /* ── Filtering ───────────────────────────────────────────────── */
  const filtered = useMemo(() => {
    let list = activeTab === "live" ? liveJobs : myJobs;

    if (search.trim()) {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(j => {
        const haystack = [j.role, j.company, j.location, j.description]
          .join(" ")
          .toLowerCase();
        return terms.every(t => haystack.includes(t));
      });
    }

    if (workType !== "All Types") {
      list = list.filter(j => j.workType === workType.toLowerCase());
    }

    if (stateFilter !== "All States") {
      list = list.filter(j => {
        const locationStr = (j.location || "").toLowerCase();
        const city = locationStr.split(",")[0].trim();
        const mappedState = CITY_TO_STATE[city];
        return (
          mappedState === stateFilter ||
          locationStr.includes(stateFilter.toLowerCase())
        );
      });
    }

    if (expFilter !== "All Levels") {
      list = list.filter(j =>
        !j.experienceLevel ||
        j.experienceLevel === "any" ||
        j.experienceLevel === expFilter.toLowerCase()
      );
    }

    if (salaryFilter) {
      list = list.filter(j => j.salary && j.salary !== "Salary not disclosed");
    }

    if (priorityOnly) {
      list = list.filter(j => j.priority);
    }

    return list;
  }, [search, workType, stateFilter, expFilter, salaryFilter, priorityOnly, liveJobs, myJobs, activeTab]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  /* ── Auto-reset page when filters change ────────────────────── */
  useEffect(() => { setPage(1); }, [search, workType, stateFilter, expFilter, salaryFilter, priorityOnly, activeTab]);

  /* ── Initial load ────────────────────────────────────────────── */
  useEffect(() => {
    const loaded = sessionStorage.getItem("jobsLoaded");
    if (!loaded) loadJobs();
  }, []);

  /* ── Load jobs ───────────────────────────────────────────────── */
  const loadJobs = useCallback(async () => {
    setLoading(true);
    setLoadingMsg("Fetching latest jobs from India…");

    try {
      const existingIds = new Set(jobs.map(j => j.id));
      const live = await fetchJobs(null, { pages: 1 });

      let added = 0;
      for (const j of live) {
        if (!existingIds.has(j.id)) {
          addJob(j);
          existingIds.add(j.id);
          added++;
        }
      }

      setLoadingMsg(added > 0 ? `✓ ${added} new jobs loaded` : "✓ Feed is up to date");
      sessionStorage.setItem("jobsLoaded", "true");
    } catch (e) {
      console.error(e);
      setLoadingMsg("⚠️ Could not load jobs. Check your API key.");
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingMsg(""), 3000);
    }
  }, [jobs, addJob]);

  function handleRefresh() {
    sessionStorage.removeItem("jobsLoaded");
    loadJobs();
  }

  function handleAddJob() {
    if (!newJob.role.trim()) return;
    addJob({
      id: Date.now(),
      role: newJob.role,
      company: newJob.company || "Unknown Company",
      location: newJob.location || "India",
      description: newJob.description || "",
      manual: true,
      workType: "onsite"
    });
    setNewJob({ role: "", company: "", location: "", description: "" });
    setShowAddModal(false);
  }

  const hasActiveFilters = search || workType !== "All Types" || stateFilter !== "All States" || expFilter !== "All Levels" || salaryFilter || priorityOnly;

  /* ── Render ──────────────────────────────────────────────────── */
  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Job Board</h1>
          <p style={styles.pageSubtitle}>
            {liveJobs.length} live jobs • {myJobs.length} saved
          </p>
        </div>
        <div style={styles.headerActions}>
          {loadingMsg && (
            <span style={styles.loadMsg}>{loadingMsg}</span>
          )}
          <button
            onClick={handleRefresh}
            disabled={loading}
            style={styles.refreshBtn}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              "↻"
            )}
            {loading ? " Loading…" : " Refresh"}
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>
            + Add Job
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabs}>
        {["live", "saved"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : styles.tabInactive)
            }}
          >
            {tab === "live" ? `🌐 Live Feed (${liveJobs.length})` : `📌 My Jobs (${myJobs.length})`}
          </button>
        ))}
      </div>

      {/* ── Filters ── */}
      <div style={styles.filterBar}>
        {/* Search */}
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder="Search role, company, or skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={styles.clearBtn}
            >✕</button>
          )}
        </div>

        {/* Work Type */}
        <div style={styles.filterGroup}>
          {WORK_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setWorkType(t)}
              style={{
                ...styles.pill,
                ...(workType === t ? styles.pillActive : styles.pillInactive)
              }}
            >
              {t === "Remote" ? "🏠 " : t === "Hybrid" ? "⚡ " : t === "Onsite" ? "🏢 " : ""}
              {t}
            </button>
          ))}
        </div>

        {/* State */}
        <select
          value={stateFilter}
          onChange={e => setStateFilter(e.target.value)}
          style={styles.select}
        >
          {INDIAN_STATES.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        {/* Experience Level */}
        <select
          value={expFilter}
          onChange={e => setExpFilter(e.target.value)}
          style={styles.select}
        >
          {EXP_LEVELS.map(e => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>

        {/* Salary toggle */}
        <button
          onClick={() => setSalaryFilter(v => !v)}
          style={{
            ...styles.toggleBtn,
            ...(salaryFilter ? styles.toggleActive : styles.toggleInactive)
          }}
        >
          💰 Salary disclosed
        </button>

        {/* Priority toggle */}
        <button
          onClick={() => setPriorityOnly(v => !v)}
          style={{
            ...styles.toggleBtn,
            ...(priorityOnly ? styles.toggleActive : styles.toggleInactive)
          }}
        >
          ⭐ Starred only
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch("");
              setWorkType("All Types");
              setStateFilter("All States");
              setExpFilter("All Levels");
              setSalaryFilter(false);
              setPriorityOnly(false);
            }}
            style={styles.clearAllBtn}
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── Results header ── */}
      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters ? " (filtered)" : ""}
        </span>
      </div>

      {/* ── Job Grid ── */}
      {paginated.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No jobs found</h3>
          <p style={styles.emptyText}>
            {hasActiveFilters
              ? "Try adjusting your filters or clearing the search."
              : "Click Refresh to load the latest jobs."}
          </p>
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSearch("");
                setWorkType("All Types");
                setStateFilter("All States");
                setExpFilter("All Levels");
                setSalaryFilter(false);
                setPriorityOnly(false);
              }}
              style={styles.refreshBtn}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={styles.grid}>
          {paginated.map(j => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{ ...styles.pageBtn, opacity: page === 1 ? 0.4 : 1 }}
          >
            ‹ Prev
          </button>

          <div style={styles.pageNumbers}>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  style={{
                    ...styles.pageBtn,
                    ...(page === pageNum ? styles.pageBtnActive : {})
                  }}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{ ...styles.pageBtn, opacity: page === totalPages ? 0.4 : 1 }}
          >
            Next ›
          </button>
        </div>
      )}

      {/* ── Add Job Modal ── */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, fontSize: "18px" }}>Add a Job Manually</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>✕</button>
            </div>

            <div style={styles.modalBody}>
              <label style={styles.label}>Job Title *</label>
              <input
                placeholder="e.g. Senior Product Manager"
                value={newJob.role}
                onChange={e => setNewJob({ ...newJob, role: e.target.value })}
                style={styles.modalInput}
              />

              <label style={styles.label}>Company</label>
              <input
                placeholder="e.g. Acme Corp"
                value={newJob.company}
                onChange={e => setNewJob({ ...newJob, company: e.target.value })}
                style={styles.modalInput}
              />

              <label style={styles.label}>Location</label>
              <input
                placeholder="e.g. Hyderabad, Telangana"
                value={newJob.location}
                onChange={e => setNewJob({ ...newJob, location: e.target.value })}
                style={styles.modalInput}
              />

              <label style={styles.label}>Job Description</label>
              <textarea
                placeholder="Paste the job description here…"
                value={newJob.description}
                onChange={e => setNewJob({ ...newJob, description: e.target.value })}
                style={{ ...styles.modalInput, height: "120px", resize: "vertical" }}
              />
            </div>

            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAddJob} style={styles.saveBtn} disabled={!newJob.role.trim()}>
                Save Job
              </button>
            </div>
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
    alignItems: "flex-start",
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

  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap"
  },

  loadMsg: {
    fontSize: "12px",
    color: "var(--text-secondary)",
    fontStyle: "italic"
  },

  refreshBtn: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    borderRadius: "12px",
    padding: "9px 16px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    boxShadow: "none"
  },

  addBtn: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    borderRadius: "12px",
    padding: "9px 18px",
    fontWeight: "600",
    fontSize: "13px",
    border: "none",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(10,132,255,0.3)"
  },

  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px"
  },

  tab: {
    padding: "10px 20px",
    borderRadius: "12px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    border: "none",
    transition: "all 0.2s ease",
    boxShadow: "none"
  },

  tabActive: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    boxShadow: "0 4px 12px rgba(10,132,255,0.3)"
  },

  tabInactive: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    color: "var(--text-secondary)",
    border: "1px solid var(--glass-border)"
  },

  filterBar: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
    padding: "16px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    borderRadius: "16px",
    border: "1px solid var(--glass-border)",
    marginBottom: "20px"
  },

  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    flex: "1",
    minWidth: "220px"
  },

  searchIcon: {
    position: "absolute",
    left: "12px",
    fontSize: "14px",
    pointerEvents: "none"
  },

  searchInput: {
    width: "100%",
    paddingLeft: "36px",
    paddingRight: "32px",
    borderRadius: "12px",
    fontSize: "14px",
    border: "1px solid var(--glass-border)",
    background: "var(--glass-bg)"
  },

  clearBtn: {
    position: "absolute",
    right: "8px",
    background: "transparent",
    border: "none",
    color: "var(--text-secondary)",
    cursor: "pointer",
    padding: "4px",
    fontSize: "12px",
    boxShadow: "none",
    borderRadius: "50%"
  },

  filterGroup: {
    display: "flex",
    gap: "6px",
    flexWrap: "wrap"
  },

  pill: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
    boxShadow: "none"
  },

  pillActive: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff"
  },

  pillInactive: {
    background: "rgba(120,120,128,0.12)",
    color: "var(--text-secondary)"
  },

  select: {
    padding: "8px 12px",
    borderRadius: "12px",
    fontSize: "13px",
    fontWeight: "500",
    border: "1px solid var(--glass-border)",
    background: "var(--glass-bg)",
    color: "var(--text-primary)",
    cursor: "pointer"
  },

  toggleBtn: {
    padding: "7px 14px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s ease",
    boxShadow: "none"
  },

  toggleActive: {
    background: "rgba(48,209,88,0.15)",
    color: "#30D158",
    border: "1px solid rgba(48,209,88,0.3)"
  },

  toggleInactive: {
    background: "rgba(120,120,128,0.12)",
    color: "var(--text-secondary)"
  },

  clearAllBtn: {
    padding: "7px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    background: "rgba(255,59,48,0.1)",
    color: "#FF3B30",
    border: "1px solid rgba(255,59,48,0.2)",
    boxShadow: "none"
  },

  resultsHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  resultsCount: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    fontWeight: "500"
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "16px"
  },

  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    borderRadius: "20px",
    border: "1px solid var(--glass-border)"
  },

  emptyIcon: {
    fontSize: "48px",
    marginBottom: "12px"
  },

  emptyTitle: {
    margin: "0 0 8px 0",
    fontSize: "20px",
    fontWeight: "600",
    color: "var(--text-primary)"
  },

  emptyText: {
    margin: "0 0 20px 0",
    color: "var(--text-secondary)",
    fontSize: "14px"
  },

  pagination: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "8px",
    marginTop: "32px"
  },

  pageNumbers: {
    display: "flex",
    gap: "6px"
  },

  pageBtn: {
    padding: "8px 14px",
    borderRadius: "10px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-primary)",
    boxShadow: "none",
    transition: "all 0.2s ease"
  },

  pageBtnActive: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    boxShadow: "0 4px 12px rgba(10,132,255,0.3)"
  },

  spinner: {
    display: "inline-block",
    width: "12px",
    height: "12px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTop: "2px solid var(--text-primary)",
    borderRadius: "50%",
    animation: "spin 0.6s linear infinite"
  },

  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000
  },

  modal: {
    background: "var(--glass-bg)",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px",
    width: "min(500px, 90vw)",
    boxShadow: "0 30px 60px rgba(0,0,0,0.3)"
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px 16px",
    borderBottom: "1px solid var(--glass-border)",
    color: "var(--text-primary)"
  },

  modalClose: {
    background: "rgba(120,120,128,0.15)",
    border: "none",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "var(--text-secondary)",
    fontSize: "13px",
    padding: 0,
    boxShadow: "none"
  },

  modalBody: {
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  label: {
    fontSize: "12px",
    fontWeight: "600",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "2px"
  },

  modalInput: {
    width: "100%",
    borderRadius: "12px",
    fontSize: "14px",
    marginBottom: "8px"
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "16px 24px 20px",
    borderTop: "1px solid var(--glass-border)"
  },

  cancelBtn: {
    background: "rgba(120,120,128,0.15)",
    color: "var(--text-secondary)",
    border: "none",
    borderRadius: "12px",
    padding: "10px 18px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "none"
  },

  saveBtn: {
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "10px 20px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(10,132,255,0.3)"
  }
};

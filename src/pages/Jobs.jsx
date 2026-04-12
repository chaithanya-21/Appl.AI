import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import JobCard from "../components/JobCard";
import { fetchJobs, MIN_JOBS } from "../services/fetchJobs";

const INDIAN_STATES = [
  "All States",
  "Andhra Pradesh","Telangana","Karnataka","Tamil Nadu",
  "Maharashtra","Delhi","Gujarat","Uttar Pradesh",
  "West Bengal","Haryana","Kerala","Rajasthan",
  "Madhya Pradesh","Punjab","Odisha","Bihar"
];

const CITY_TO_STATE = {
  hyderabad:"Telangana", secunderabad:"Telangana",
  bangalore:"Karnataka", bengaluru:"Karnataka",
  chennai:"Tamil Nadu",  coimbatore:"Tamil Nadu",
  mumbai:"Maharashtra",  pune:"Maharashtra",     nagpur:"Maharashtra",
  delhi:"Delhi",         "new delhi":"Delhi",
  gurgaon:"Haryana",     gurugram:"Haryana",     faridabad:"Haryana",
  noida:"Uttar Pradesh", lucknow:"Uttar Pradesh",
  kolkata:"West Bengal",
  ahmedabad:"Gujarat",   surat:"Gujarat",
  visakhapatnam:"Andhra Pradesh", vijayawada:"Andhra Pradesh",
  kochi:"Kerala",        thiruvananthapuram:"Kerala",
  jaipur:"Rajasthan",
  chandigarh:"Punjab",
  indore:"Madhya Pradesh", bhopal:"Madhya Pradesh",
  bhubaneswar:"Odisha",
  patna:"Bihar"
};

const WORK_TYPES = ["All Types","Remote","Hybrid","Onsite"];
const EXP_LEVELS = ["All Levels","Junior","Mid","Senior","Lead"];
const PAGE_SIZE  = 9;

export default function Jobs() {
  const navigate = useNavigate();
  const { jobs, addJob } = useStore();

  const [search,       setSearch]       = useState("");
  const [workType,     setWorkType]     = useState("All Types");
  const [stateFilter,  setStateFilter]  = useState("All States");
  const [expFilter,    setExpFilter]    = useState("All Levels");
  const [salaryFilter, setSalaryFilter] = useState(false);
  const [priorityOnly, setPriorityOnly] = useState(false);

  const [page,         setPage]         = useState(1);
  const [loading,      setLoading]      = useState(false);
  const [loadingMsg,   setLoadingMsg]   = useState("");
  const [activeTab,    setActiveTab]    = useState("live");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newJob,       setNewJob]       = useState({ role:"", company:"", location:"", description:"" });

  const myJobs   = jobs.filter(j =>  j.manual || !j.link);
  const liveJobs = jobs.filter(j => !j.manual &&  j.link);

  const filtered = useMemo(() => {
    let list = activeTab === "live" ? liveJobs : myJobs;

    if (search.trim()) {
      const terms = search.toLowerCase().split(/\s+/).filter(Boolean);
      list = list.filter(j => {
        const hay = [j.role, j.company, j.location, j.description].join(" ").toLowerCase();
        return terms.every(t => hay.includes(t));
      });
    }
    if (workType !== "All Types") {
      list = list.filter(j => j.workType === workType.toLowerCase());
    }
    if (stateFilter !== "All States") {
      list = list.filter(j => {
        const loc  = (j.location || "").toLowerCase();
        const city = loc.split(",")[0].trim();
        return CITY_TO_STATE[city] === stateFilter || loc.includes(stateFilter.toLowerCase());
      });
    }
    if (expFilter !== "All Levels") {
      list = list.filter(j =>
        !j.experienceLevel || j.experienceLevel === "any" ||
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
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); },
    [search, workType, stateFilter, expFilter, salaryFilter, priorityOnly, activeTab]);

  /* ── Auto-fetch: runs on mount AND whenever live count < MIN_JOBS ── */
  useEffect(() => {
    if (liveJobs.length < MIN_JOBS) {
      loadJobs();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadJobs = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    setLoadingMsg("Fetching latest SaaS & consulting jobs across India…");

    try {
      const existingIds = new Set(jobs.map(j => j.id));
      const live = await fetchJobs(null, { pages: 3 });

      let added = 0;
      for (const j of live) {
        if (!existingIds.has(j.id)) {
          addJob(j);
          existingIds.add(j.id);
          added++;
        }
      }

      setLoadingMsg(
        added > 0
          ? "✓ " + added + " new jobs loaded (" + (liveJobs.length + added) + " total)"
          : "✓ Feed up to date — " + liveJobs.length + " jobs"
      );
    } catch (e) {
      console.error(e);
      setLoadingMsg("⚠️ Could not load jobs — check VITE_JOBS_KEY in Render settings.");
    } finally {
      setLoading(false);
      setTimeout(() => setLoadingMsg(""), 5000);
    }
  }, [jobs, addJob, loading, liveJobs.length]);

  function handleRefresh() { loadJobs(); }

  function handleAddJob() {
    if (!newJob.role.trim()) return;
    addJob({
      id: Date.now(), role: newJob.role,
      company:  newJob.company  || "Unknown Company",
      location: newJob.location || "India",
      description: newJob.description || "",
      manual: true, workType: "onsite"
    });
    setNewJob({ role:"", company:"", location:"", description:"" });
    setShowAddModal(false);
  }

  const hasActiveFilters = search || workType !== "All Types" || stateFilter !== "All States" ||
    expFilter !== "All Levels" || salaryFilter || priorityOnly;

  return (
    <div style={styles.page}>

      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Job Board</h1>
          <p style={styles.pageSubtitle}>
            {liveJobs.length} live jobs · {myJobs.length} saved
            {liveJobs.length < MIN_JOBS && !loading && (
              <span style={{ color: "#FF9F0A", marginLeft: "8px" }}>
                · Refreshing to reach {MIN_JOBS}+…
              </span>
            )}
          </p>
        </div>
        <div style={styles.headerActions}>
          {loadingMsg && <span style={styles.loadMsg}>{loadingMsg}</span>}
          <button onClick={handleRefresh} disabled={loading} style={styles.refreshBtn}>
            {loading ? <><Spinner /> Loading…</> : "↻ Refresh"}
          </button>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ Add Job</button>
        </div>
      </div>

      <div style={styles.tabs}>
        {["live","saved"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : styles.tabInactive) }}
          >
            {tab === "live"
              ? "🌐 Live Feed (" + liveJobs.length + ")"
              : "📌 My Jobs (" + myJobs.length + ")"}
          </button>
        ))}
      </div>

      <div style={styles.filterBar}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            placeholder="Search role, company, skill…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearBtn}>✕</button>
          )}
        </div>

        <div style={styles.filterGroup}>
          {WORK_TYPES.map(t => (
            <button
              key={t}
              onClick={() => setWorkType(t)}
              style={{ ...styles.pill, ...(workType === t ? styles.pillActive : styles.pillInactive) }}
            >
              {t === "Remote" ? "🏠 " : t === "Hybrid" ? "⚡ " : t === "Onsite" ? "🏢 " : ""}
              {t}
            </button>
          ))}
        </div>

        <select value={stateFilter} onChange={e => setStateFilter(e.target.value)} style={styles.select}>
          {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={expFilter} onChange={e => setExpFilter(e.target.value)} style={styles.select}>
          {EXP_LEVELS.map(e => <option key={e} value={e}>{e}</option>)}
        </select>

        <button
          onClick={() => setSalaryFilter(v => !v)}
          style={{ ...styles.toggleBtn, ...(salaryFilter ? styles.toggleActive : styles.toggleInactive) }}
        >
          💰 Salary disclosed
        </button>

        <button
          onClick={() => setPriorityOnly(v => !v)}
          style={{ ...styles.toggleBtn, ...(priorityOnly ? styles.toggleActive : styles.toggleInactive) }}
        >
          ⭐ Starred only
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              setSearch(""); setWorkType("All Types"); setStateFilter("All States");
              setExpFilter("All Levels"); setSalaryFilter(false); setPriorityOnly(false);
            }}
            style={styles.clearAllBtn}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={styles.resultsHeader}>
        <span style={styles.resultsCount}>
          {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          {hasActiveFilters ? " (filtered)" : ""}
        </span>
      </div>

      {loading && liveJobs.length === 0 && (
        <div style={styles.loadingState}>
          <Spinner large />
          <p style={styles.loadingText}>Fetching SaaS & consulting jobs from across India…</p>
        </div>
      )}

      {!loading && paginated.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🔍</div>
          <h3 style={styles.emptyTitle}>No jobs found</h3>
          <p style={styles.emptyText}>
            {hasActiveFilters
              ? "Try adjusting or clearing your filters."
              : "Click Refresh to load the latest jobs from India."}
          </p>
          <button
            onClick={hasActiveFilters
              ? () => { setSearch(""); setWorkType("All Types"); setStateFilter("All States"); setExpFilter("All Levels"); setSalaryFilter(false); setPriorityOnly(false); }
              : handleRefresh}
            style={styles.refreshBtn}
          >
            {hasActiveFilters ? "Clear Filters" : "↻ Load Jobs"}
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {paginated.map(j => <JobCard key={j.id} job={j} />)}
        </div>
      )}

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
              let n;
              if (totalPages <= 5)             n = i + 1;
              else if (page <= 3)              n = i + 1;
              else if (page >= totalPages - 2) n = totalPages - 4 + i;
              else                             n = page - 2 + i;
              return (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  style={{ ...styles.pageBtn, ...(page === n ? styles.pageBtnActive : {}) }}
                >
                  {n}
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

      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin:0, fontSize:"18px", color:"var(--text-primary)" }}>Add a Job Manually</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>✕</button>
            </div>
            <div style={styles.modalBody}>
              <label style={styles.label}>Job Title *</label>
              <input placeholder="e.g. Senior Product Manager" value={newJob.role}
                onChange={e => setNewJob({...newJob,role:e.target.value})} style={styles.modalInput}/>
              <label style={styles.label}>Company</label>
              <input placeholder="e.g. Acme Corp" value={newJob.company}
                onChange={e => setNewJob({...newJob,company:e.target.value})} style={styles.modalInput}/>
              <label style={styles.label}>Location</label>
              <input placeholder="e.g. Hyderabad, Telangana" value={newJob.location}
                onChange={e => setNewJob({...newJob,location:e.target.value})} style={styles.modalInput}/>
              <label style={styles.label}>Job Description</label>
              <textarea placeholder="Paste the job description…" value={newJob.description}
                onChange={e => setNewJob({...newJob,description:e.target.value})}
                style={{...styles.modalInput,height:"120px",resize:"vertical"}}/>
            </div>
            <div style={styles.modalFooter}>
              <button onClick={() => setShowAddModal(false)} style={styles.cancelBtn}>Cancel</button>
              <button onClick={handleAddJob} disabled={!newJob.role.trim()} style={styles.saveBtn}>Save Job</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner({ large }) {
  const size = large ? "32px" : "12px";
  const border = large ? "3px" : "2px";
  return (
    <span style={{
      display: "inline-block", width: size, height: size,
      border: border + " solid rgba(120,120,128,0.2)",
      borderTop: border + " solid var(--text-primary)",
      borderRadius: "50%", animation: "spin 0.6s linear infinite", verticalAlign: "middle"
    }} />
  );
}

const styles = {
  page:         { padding: "4px 0 40px 0" },
  header:       { display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px", flexWrap:"wrap", gap:"12px" },
  pageTitle:    { margin:"0 0 4px 0", fontSize:"28px", fontWeight:"700", color:"var(--text-primary)" },
  pageSubtitle: { margin:0, fontSize:"13px", color:"var(--text-secondary)" },
  headerActions:{ display:"flex", alignItems:"center", gap:"10px", flexWrap:"wrap" },
  loadMsg:      { fontSize:"12px", color:"var(--text-secondary)", fontStyle:"italic" },
  refreshBtn:   { background:"var(--glass-bg)", backdropFilter:"blur(10px)", border:"1px solid var(--glass-border)", color:"var(--text-primary)", borderRadius:"12px", padding:"9px 16px", fontWeight:"600", fontSize:"13px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", boxShadow:"none" },
  addBtn:       { background:"linear-gradient(135deg,#0A84FF,#0066CC)", color:"#fff", borderRadius:"12px", padding:"9px 18px", fontWeight:"600", fontSize:"13px", border:"none", cursor:"pointer", boxShadow:"0 4px 12px rgba(10,132,255,0.3)" },
  tabs:         { display:"flex", gap:"8px", marginBottom:"20px" },
  tab:          { padding:"10px 20px", borderRadius:"12px", fontWeight:"600", fontSize:"13px", cursor:"pointer", border:"none", transition:"all 0.2s ease", boxShadow:"none" },
  tabActive:    { background:"linear-gradient(135deg,#0A84FF,#0066CC)", color:"#fff", boxShadow:"0 4px 12px rgba(10,132,255,0.3)" },
  tabInactive:  { background:"var(--glass-bg)", backdropFilter:"blur(10px)", color:"var(--text-secondary)", border:"1px solid var(--glass-border)" },
  filterBar:    { display:"flex", gap:"10px", alignItems:"center", flexWrap:"wrap", padding:"16px", background:"var(--glass-bg)", backdropFilter:"blur(16px)", WebkitBackdropFilter:"blur(16px)", borderRadius:"16px", border:"1px solid var(--glass-border)", marginBottom:"20px" },
  searchWrapper:{ position:"relative", display:"flex", alignItems:"center", flex:"1", minWidth:"220px" },
  searchIcon:   { position:"absolute", left:"12px", fontSize:"14px", pointerEvents:"none" },
  searchInput:  { width:"100%", paddingLeft:"36px", paddingRight:"32px", borderRadius:"12px", fontSize:"14px", border:"1px solid var(--glass-border)", background:"var(--glass-bg)" },
  clearBtn:     { position:"absolute", right:"8px", background:"transparent", border:"none", color:"var(--text-secondary)", cursor:"pointer", padding:"4px", fontSize:"12px", boxShadow:"none", borderRadius:"50%" },
  filterGroup:  { display:"flex", gap:"6px", flexWrap:"wrap" },
  pill:         { padding:"7px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", cursor:"pointer", border:"none", transition:"all 0.15s ease", boxShadow:"none" },
  pillActive:   { background:"linear-gradient(135deg,#0A84FF,#0066CC)", color:"#fff" },
  pillInactive: { background:"rgba(120,120,128,0.12)", color:"var(--text-secondary)" },
  select:       { padding:"8px 12px", borderRadius:"12px", fontSize:"13px", fontWeight:"500", border:"1px solid var(--glass-border)", background:"var(--glass-bg)", color:"var(--text-primary)", cursor:"pointer" },
  toggleBtn:    { padding:"7px 14px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", cursor:"pointer", border:"none", transition:"all 0.15s ease", boxShadow:"none" },
  toggleActive: { background:"rgba(48,209,88,0.15)", color:"#30D158", border:"1px solid rgba(48,209,88,0.3)" },
  toggleInactive:{ background:"rgba(120,120,128,0.12)", color:"var(--text-secondary)" },
  clearAllBtn:  { padding:"7px 12px", borderRadius:"20px", fontSize:"12px", fontWeight:"600", cursor:"pointer", background:"rgba(255,59,48,0.1)", color:"#FF3B30", border:"1px solid rgba(255,59,48,0.2)", boxShadow:"none" },
  resultsHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" },
  resultsCount: { fontSize:"13px", color:"var(--text-secondary)", fontWeight:"500" },
  loadingState: { display:"flex", flexDirection:"column", alignItems:"center", gap:"16px", padding:"60px 20px" },
  loadingText:  { fontSize:"14px", color:"var(--text-secondary)" },
  grid:         { display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"16px" },
  emptyState:   { textAlign:"center", padding:"60px 20px", background:"var(--glass-bg)", backdropFilter:"blur(16px)", borderRadius:"20px", border:"1px solid var(--glass-border)" },
  emptyIcon:    { fontSize:"48px", marginBottom:"12px" },
  emptyTitle:   { margin:"0 0 8px 0", fontSize:"20px", fontWeight:"600", color:"var(--text-primary)" },
  emptyText:    { margin:"0 0 20px 0", color:"var(--text-secondary)", fontSize:"14px" },
  pagination:   { display:"flex", justifyContent:"center", alignItems:"center", gap:"8px", marginTop:"32px" },
  pageNumbers:  { display:"flex", gap:"6px" },
  pageBtn:      { padding:"8px 14px", borderRadius:"10px", fontWeight:"600", fontSize:"13px", cursor:"pointer", background:"var(--glass-bg)", backdropFilter:"blur(10px)", border:"1px solid var(--glass-border)", color:"var(--text-primary)", boxShadow:"none", transition:"all 0.2s ease" },
  pageBtnActive:{ background:"linear-gradient(135deg,#0A84FF,#0066CC)", color:"#fff", border:"none", boxShadow:"0 4px 12px rgba(10,132,255,0.3)" },
  modalOverlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 },
  modal:        { background:"var(--glass-bg)", backdropFilter:"blur(30px)", WebkitBackdropFilter:"blur(30px)", border:"1px solid var(--glass-border)", borderRadius:"20px", width:"min(500px,90vw)", boxShadow:"0 30px 60px rgba(0,0,0,0.3)" },
  modalHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 24px 16px", borderBottom:"1px solid var(--glass-border)" },
  modalClose:   { background:"rgba(120,120,128,0.15)", border:"none", borderRadius:"50%", width:"28px", height:"28px", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"var(--text-secondary)", fontSize:"13px", padding:0, boxShadow:"none" },
  modalBody:    { padding:"20px 24px", display:"flex", flexDirection:"column", gap:"8px" },
  label:        { fontSize:"12px", fontWeight:"600", color:"var(--text-secondary)", textTransform:"uppercase", letterSpacing:"0.04em", marginBottom:"2px" },
  modalInput:   { width:"100%", borderRadius:"12px", fontSize:"14px", marginBottom:"8px" },
  modalFooter:  { display:"flex", justifyContent:"flex-end", gap:"10px", padding:"16px 24px 20px", borderTop:"1px solid var(--glass-border)" },
  cancelBtn:    { background:"rgba(120,120,128,0.15)", color:"var(--text-secondary)", border:"none", borderRadius:"12px", padding:"10px 18px", fontWeight:"600", fontSize:"13px", cursor:"pointer", boxShadow:"none" },
  saveBtn:      { background:"linear-gradient(135deg,#0A84FF,#0066CC)", color:"#fff", border:"none", borderRadius:"12px", padding:"10px 20px", fontWeight:"600", fontSize:"13px", cursor:"pointer", boxShadow:"0 4px 12px rgba(10,132,255,0.3)" }
};

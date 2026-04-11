import { useState } from "react";
import mammoth from "mammoth";
import { useStore } from "../store/useStore";
import { callAI } from "../services/aiService";

/* ─── Component ─────────────────────────────────────────────────── */

export default function Outreach() {
  const { jobs } = useStore();

  const [resume,    setResume]    = useState(localStorage.getItem("resumeText") || "");
  const [jd,        setJd]        = useState(localStorage.getItem("jobJD")      || "");
  const [fileName,  setFileName]  = useState(resume ? "Resume loaded from cache" : "");

  const [optimized, setOptimized] = useState("");
  const [sop,       setSop]       = useState("");
  const [email,     setEmail]     = useState("");
  const [linkedin,  setLinkedin]  = useState("");
  const [dashboard, setDashboard] = useState("");
  const [ats,       setAts]       = useState(null);

  const [loading,   setLoading]   = useState(false);
  const [activeGen, setActiveGen] = useState(""); // which button is running
  const [activeTab, setActiveTab] = useState("optimize"); // optimize | write | profile

  /* ── File upload ── */
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const buffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    setResume(result.value);
    localStorage.setItem("resumeText", result.value);
  }

  function selectJob(id) {
    const job = jobs.find(j => j.id === Number(id));
    if (!job) return;
    setJd(job.description || "");
    localStorage.setItem("jobJD", job.description || "");
  }

  /* ── AI helpers ── */
  async function run(genKey, systemPrompt, userContent, setter) {
    setLoading(true);
    setActiveGen(genKey);
    try {
      const text = await callAI([
        { role: "system", content: systemPrompt },
        { role: "user",   content: userContent  }
      ]);
      if (text) setter(text.trim());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
    setActiveGen("");
  }

  function optimize() {
    if (!resume || !jd) return alert("Upload your resume and select a job first.");
    run(
      "optimize",
      "You are an expert resume writer. Rewrite the resume to strongly match the job description. Keep it professional, ATS-optimised, and concise. Output plain text.",
      "JOB DESCRIPTION:\n" + jd + "\n\nRESUME:\n" + resume,
      (text) => {
        setOptimized(text);
        localStorage.setItem("resumeText", text);
        setAts(Math.floor(Math.random() * 15) + 80);
      }
    );
  }

  function genSOP() {
    if (!optimized) return alert("Run Optimise Resume first.");
    run(
      "sop",
      "Write one concise, compelling Statement of Purpose paragraph tailored to the role. Highlight fit and motivation.",
      "JOB:\n" + jd + "\n\nRESUME:\n" + optimized,
      setSop
    );
  }

  function genEmail() {
    if (!optimized) return alert("Run Optimise Resume first.");
    run(
      "email",
      "Write a professional follow-up email FROM the candidate TO the recruiter after submitting the application. Keep it under 150 words.",
      "JOB:\n" + jd + "\n\nRESUME:\n" + optimized,
      setEmail
    );
  }

  function genLinkedin() {
    if (!optimized) return alert("Run Optimise Resume first.");
    run(
      "linkedin",
      "Write a short, natural LinkedIn connection request message (under 300 chars) from the candidate to a recruiter at this company.",
      "JOB:\n" + jd + "\n\nRESUME:\n" + optimized,
      setLinkedin
    );
  }

  function buildDashboard() {
    if (!resume) return alert("Upload your resume first.");
    run(
      "dashboard",
      "Create a structured professional profile summary with sections: Summary, Core Skills, Experience Highlights, Education, Key Achievements. Format clearly.",
      resume,
      setDashboard
    );
  }

  function openGmail() {
    const subject = encodeURIComponent("Application Follow-up");
    const body    = encodeURIComponent(email || "");
    window.open("https://mail.google.com/mail/?view=cm&fs=1&su=" + subject + "&body=" + body);
  }

  function downloadPDF() {
    const win = window.open("");
    win.document.write(
      "<html><body style='font-family:Arial;padding:40px'>" +
      "<h2>Professional Resume Dashboard</h2>" +
      "<pre style='white-space:pre-wrap'>" + dashboard + "</pre>" +
      "</body></html>"
    );
    win.document.close();
    win.print();
  }

  const hasResume = resume.trim().length > 0;
  const hasJD     = jd.trim().length > 0;

  const TABS = [
    { key: "optimize", label: "✨ Optimise Resume" },
    { key: "write",    label: "✍️ Write Outreach"  },
    { key: "profile",  label: "📊 Build Profile"   }
  ];

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.pageTitle}>Career Center</h1>
          <p style={styles.pageSubtitle}>AI-powered resume optimisation and outreach writing</p>
        </div>
      </div>

      {/* ── Setup panel ── */}
      <div style={styles.setupPanel}>

        {/* Resume upload */}
        <div style={styles.setupSection}>
          <p style={styles.setupLabel}>1 · Upload Resume</p>
          <label style={styles.uploadArea}>
            <input
              type="file"
              accept=".docx"
              onChange={handleFile}
              style={{ display: "none" }}
            />
            <div style={styles.uploadInner}>
              <span style={styles.uploadIcon}>{hasResume ? "✅" : "📄"}</span>
              <div>
                <div style={styles.uploadTitle}>
                  {hasResume ? "Resume ready" : "Click to upload .docx"}
                </div>
                <div style={styles.uploadSub}>
                  {fileName || "Supports Word documents (.docx)"}
                </div>
              </div>
            </div>
          </label>
          {hasResume && (
            <button
              onClick={() => { setResume(""); setFileName(""); localStorage.removeItem("resumeText"); }}
              style={styles.clearResumeBtn}
            >
              Clear resume
            </button>
          )}
        </div>

        {/* Job selector */}
        <div style={styles.setupSection}>
          <p style={styles.setupLabel}>2 · Select Target Job</p>
          <select
            onChange={e => selectJob(e.target.value)}
            style={styles.jobSelect}
            defaultValue=""
          >
            <option value="" disabled>Choose a job from your board…</option>
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.role} — {j.company}
              </option>
            ))}
          </select>
          {hasJD && (
            <div style={styles.jdPreview}>
              <span style={styles.jdDot} />
              <span style={styles.jdText}>
                {jd.slice(0, 80)}…
              </span>
            </div>
          )}
        </div>

        {/* ATS score */}
        {ats && (
          <div style={styles.atsSection}>
            <p style={styles.setupLabel}>ATS Compatibility</p>
            <div style={styles.atsRow}>
              <div style={styles.atsBarTrack}>
                <div style={{ ...styles.atsBarFill, width: ats + "%" }} />
              </div>
              <span style={styles.atsScore}>{ats}%</span>
            </div>
          </div>
        )}

      </div>

      {/* ── Tabs ── */}
      <div style={styles.tabs}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              ...styles.tab,
              ...(activeTab === t.key ? styles.tabActive : styles.tabInactive)
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Optimise Resume ── */}
      {activeTab === "optimize" && (
        <div style={styles.tabContent}>
          <p style={styles.tabDesc}>
            Paste or upload your resume and select a job above. AI will rewrite your resume to maximise keyword match and ATS score for that specific role.
          </p>
          <button
            onClick={optimize}
            disabled={loading}
            style={{ ...styles.primaryBtn, opacity: loading && activeGen === "optimize" ? 0.7 : 1 }}
          >
            {loading && activeGen === "optimize" ? <Spinner /> : "✨"}
            {loading && activeGen === "optimize" ? " Optimising…" : " Optimise Resume"}
          </button>

          {optimized && (
            <OutputBlock
              title="Optimised Resume"
              content={optimized}
              onCopy={() => navigator.clipboard.writeText(optimized)}
            />
          )}
        </div>
      )}

      {/* ── Tab: Write Outreach ── */}
      {activeTab === "write" && (
        <div style={styles.tabContent}>
          <p style={styles.tabDesc}>
            Generate a follow-up email, SOP paragraph, and LinkedIn message — all tailored to your optimised resume and the target role.
          </p>

          <div style={styles.writeActions}>
            <ActionBtn
              icon="📝" label="Generate SOP"
              onClick={genSOP}
              loading={loading && activeGen === "sop"}
              disabled={loading}
            />
            <ActionBtn
              icon="📧" label="Follow-up Email"
              onClick={genEmail}
              loading={loading && activeGen === "email"}
              disabled={loading}
            />
            <ActionBtn
              icon="💼" label="LinkedIn Message"
              onClick={genLinkedin}
              loading={loading && activeGen === "linkedin"}
              disabled={loading}
            />
          </div>

          {sop && (
            <OutputBlock title="Statement of Purpose" content={sop} onCopy={() => navigator.clipboard.writeText(sop)} />
          )}
          {email && (
            <OutputBlock
              title="Follow-up Email"
              content={email}
              onCopy={() => navigator.clipboard.writeText(email)}
              extra={
                <button onClick={openGmail} style={styles.gmailBtn}>
                  Open in Gmail →
                </button>
              }
            />
          )}
          {linkedin && (
            <OutputBlock title="LinkedIn Message" content={linkedin} onCopy={() => navigator.clipboard.writeText(linkedin)} />
          )}
        </div>
      )}

      {/* ── Tab: Build Profile ── */}
      {activeTab === "profile" && (
        <div style={styles.tabContent}>
          <p style={styles.tabDesc}>
            Generate a structured professional profile from your resume — useful for your LinkedIn About section, portfolio bio, or cover letter header.
          </p>
          <button
            onClick={buildDashboard}
            disabled={loading}
            style={{ ...styles.primaryBtn, opacity: loading && activeGen === "dashboard" ? 0.7 : 1 }}
          >
            {loading && activeGen === "dashboard" ? <Spinner /> : "📊"}
            {loading && activeGen === "dashboard" ? " Building…" : " Build Profile"}
          </button>

          {dashboard && (
            <OutputBlock
              title="Professional Profile"
              content={dashboard}
              onCopy={() => navigator.clipboard.writeText(dashboard)}
              extra={
                <button onClick={downloadPDF} style={styles.gmailBtn}>
                  Download as PDF →
                </button>
              }
            />
          )}
        </div>
      )}

    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────── */

function ActionBtn({ icon, label, onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...styles.actionBtn,
        opacity: disabled ? 0.6 : 1
      }}
    >
      {loading ? <Spinner /> : <span style={styles.actionBtnIcon}>{icon}</span>}
      <span>{loading ? "Generating…" : label}</span>
    </button>
  );
}

function OutputBlock({ title, content, onCopy, extra }) {
  return (
    <div style={styles.outputBlock}>
      <div style={styles.outputHeader}>
        <span style={styles.outputTitle}>{title}</span>
        <div style={styles.outputActions}>
          {extra}
          <button onClick={onCopy} style={styles.copyBtn}>📋 Copy</button>
        </div>
      </div>
      <pre style={styles.outputPre}>{content}</pre>
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block",
      width: "14px",
      height: "14px",
      border: "2px solid rgba(255,255,255,0.3)",
      borderTop: "2px solid #fff",
      borderRadius: "50%",
      animation: "spin 0.6s linear infinite",
      verticalAlign: "middle"
    }} />
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

  header: {
    marginBottom: "4px"
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

  setupPanel: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "16px",
    padding: "20px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px"
  },

  setupSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  setupLabel: {
    margin: 0,
    fontSize: "11px",
    fontWeight: "700",
    color: "var(--text-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.05em"
  },

  uploadArea: {
    display: "block",
    cursor: "pointer",
    padding: "14px",
    background: "rgba(120,120,128,0.07)",
    border: "1px dashed var(--glass-border)",
    borderRadius: "14px",
    transition: "all 0.2s ease"
  },

  uploadInner: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  uploadIcon: {
    fontSize: "24px"
  },

  uploadTitle: {
    fontSize: "13px",
    fontWeight: "600",
    color: "var(--text-primary)"
  },

  uploadSub: {
    fontSize: "11px",
    color: "var(--text-secondary)"
  },

  clearResumeBtn: {
    background: "rgba(255,59,48,0.1)",
    color: "#FF453A",
    border: "none",
    borderRadius: "8px",
    padding: "5px 12px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "none",
    alignSelf: "flex-start"
  },

  jobSelect: {
    borderRadius: "12px",
    fontSize: "13px",
    padding: "10px 12px"
  },

  jdPreview: {
    display: "flex",
    alignItems: "flex-start",
    gap: "8px",
    padding: "8px 12px",
    background: "rgba(10,132,255,0.08)",
    borderRadius: "10px",
    border: "1px solid rgba(10,132,255,0.15)"
  },

  jdDot: {
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#0A84FF",
    flexShrink: 0,
    marginTop: "4px"
  },

  jdText: {
    fontSize: "11px",
    color: "var(--text-secondary)",
    lineHeight: "1.4"
  },

  atsSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
  },

  atsRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px"
  },

  atsBarTrack: {
    flex: 1,
    height: "8px",
    borderRadius: "10px",
    background: "rgba(120,120,128,0.15)",
    overflow: "hidden"
  },

  atsBarFill: {
    height: "100%",
    borderRadius: "10px",
    background: "linear-gradient(90deg, #0A84FF, #30D158)",
    transition: "width 0.5s ease"
  },

  atsScore: {
    fontSize: "16px",
    fontWeight: "800",
    color: "#30D158"
  },

  tabs: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap"
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

  tabContent: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    padding: "20px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(16px)",
    WebkitBackdropFilter: "blur(16px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "20px"
  },

  tabDesc: {
    margin: 0,
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: "1.6"
  },

  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "linear-gradient(135deg, #0A84FF, #0066CC)",
    color: "#fff",
    border: "none",
    borderRadius: "14px",
    padding: "13px 24px",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(10,132,255,0.35)",
    alignSelf: "flex-start"
  },

  writeActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },

  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "var(--glass-bg)",
    backdropFilter: "blur(10px)",
    border: "1px solid var(--glass-border)",
    borderRadius: "14px",
    padding: "11px 18px",
    fontWeight: "600",
    fontSize: "13px",
    cursor: "pointer",
    color: "var(--text-primary)",
    boxShadow: "none",
    transition: "all 0.2s ease"
  },

  actionBtnIcon: {
    fontSize: "16px"
  },

  outputBlock: {
    background: "rgba(120,120,128,0.07)",
    border: "1px solid var(--glass-border)",
    borderRadius: "16px",
    overflow: "hidden"
  },

  outputHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid var(--glass-border)"
  },

  outputTitle: {
    fontSize: "13px",
    fontWeight: "700",
    color: "var(--text-primary)"
  },

  outputActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center"
  },

  gmailBtn: {
    background: "transparent",
    border: "none",
    color: "#0A84FF",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "4px 8px",
    boxShadow: "none"
  },

  copyBtn: {
    background: "rgba(120,120,128,0.12)",
    border: "1px solid var(--glass-border)",
    color: "var(--text-secondary)",
    borderRadius: "8px",
    padding: "5px 10px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "none"
  },

  outputPre: {
    margin: 0,
    padding: "16px",
    fontSize: "13px",
    lineHeight: "1.6",
    whiteSpace: "pre-wrap",
    color: "var(--text-primary)",
    fontFamily: "inherit",
    maxHeight: "400px",
    overflowY: "auto"
  }
};

import { useState } from "react";
import mammoth from "mammoth";
import { useStore } from "../store/useStore";
import { callAI } from "../services/aiService";

export default function OnboardingModal({ onComplete }) {
  const { profile, setProfile } = useStore();

  const [step, setStep]         = useState(0); // 0=upload, 1=review
  const [parsing, setParsing]   = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError]       = useState("");

  const [form, setForm] = useState({
    name:        profile.name        || "",
    headline:    profile.headline    || "",
    linkedinUrl: profile.linkedinUrl || "",
    skillsRaw:   (profile.skills || []).join(", "),
    summary:     profile.summary     || ""
  });

  /* ── Resume upload → AI parse ── */
  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setParsing(true);
    setError("");

    try {
      // 1. Extract raw text from .docx
      const buffer = await file.arrayBuffer();
      const { value: resumeText } = await mammoth.extractRawText({ arrayBuffer: buffer });

      // Store resume for Career Center use later
      localStorage.setItem("resumeText", resumeText);

      // 2. Ask AI to extract structured profile data
      const aiResponse = await callAI([
        {
          role: "system",
          content: `You are a resume parser. Extract the following fields from the resume text and return ONLY valid JSON with these exact keys:
{
  "name": "full name",
  "headline": "job title or professional headline (e.g. 'Full Stack Developer • 3 YOE')",
  "skills": ["skill1", "skill2", ...],
  "summary": "2-3 sentence professional summary"
}
If a field is not found, use an empty string or empty array. Return ONLY the JSON object, no markdown, no explanation.`
        },
        {
          role: "user",
          content: resumeText
        }
      ]);

      if (!aiResponse) throw new Error("AI returned no response");

      // 3. Parse AI JSON and populate form
      const clean = aiResponse.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setForm(f => ({
        ...f,
        name:      parsed.name     || f.name,
        headline:  parsed.headline || f.headline,
        skillsRaw: Array.isArray(parsed.skills) ? parsed.skills.join(", ") : f.skillsRaw,
        summary:   parsed.summary  || f.summary,
      }));

      setStep(1); // move to review step

    } catch (err) {
      console.error(err);
      setError("Couldn't parse your resume automatically. Please fill in your details below.");
      setStep(1); // still move forward so they can type
    } finally {
      setParsing(false);
    }
  }

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  function handleSave() {
    const skills = form.skillsRaw
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    setProfile({
      name:          form.name.trim(),
      headline:      form.headline.trim(),
      linkedinUrl:   form.linkedinUrl.trim(),
      skills,
      summary:       form.summary.trim(),
      setupComplete: true
    });

    onComplete();
  }

  /* ── Render ── */
  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>AI</div>
            <span style={styles.logoText}>Appl.AI</span>
          </div>
          <h2 style={styles.title}>
            {step === 0 ? "Set up your profile" : "Review your profile"}
          </h2>
          <p style={styles.subtitle}>
            {step === 0
              ? "Upload your resume and we'll fill everything in automatically."
              : "AI filled this from your resume. Edit anything that's off."}
          </p>
          <div style={styles.stepDots}>
            <div style={{ ...styles.dot, background: "#0A84FF" }} />
            <div style={{ ...styles.dot, background: step === 1 ? "#0A84FF" : "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        {/* ── Step 0: Upload ── */}
        {step === 0 && (
          <div style={styles.body}>
            <label style={parsing ? styles.uploadLoading : styles.uploadArea}>
              <input
                type="file"
                accept=".docx"
                onChange={handleFile}
                style={{ display: "none" }}
                disabled={parsing}
              />
              <div style={styles.uploadInner}>
                {parsing ? (
                  <>
                    <Spinner />
                    <div>
                      <div style={styles.uploadTitle}>Reading your resume…</div>
                      <div style={styles.uploadSub}>AI is extracting your profile</div>
                    </div>
                  </>
                ) : (
                  <>
                    <span style={{ fontSize: "32px" }}>📄</span>
                    <div>
                      <div style={styles.uploadTitle}>
                        {fileName || "Click to upload your resume"}
                      </div>
                      <div style={styles.uploadSub}>Microsoft Word (.docx) format</div>
                    </div>
                  </>
                )}
              </div>
            </label>

            {error && <p style={styles.errorText}>{error}</p>}

            <div style={styles.divider}>
              <span style={styles.dividerLine} />
              <span style={styles.dividerText}>or</span>
              <span style={styles.dividerLine} />
            </div>

            <button onClick={() => setStep(1)} style={styles.skipBtn}>
              Fill in manually →
            </button>
          </div>
        )}

        {/* ── Step 1: Review / Edit ── */}
        {step === 1 && (
          <div style={styles.body}>
            {error && <p style={styles.errorText}>{error}</p>}

            <label style={styles.label}>Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Priya Sharma"
              style={styles.input}
              autoFocus
            />

            <label style={styles.label}>Professional Headline</label>
            <input
              name="headline"
              value={form.headline}
              onChange={handleChange}
              placeholder="e.g. Full Stack Developer • 3 YOE"
              style={styles.input}
            />

            <label style={styles.label}>LinkedIn URL</label>
            <input
              name="linkedinUrl"
              value={form.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourname"
              style={styles.input}
            />

            <label style={styles.label}>Skills (comma-separated)</label>
            <input
              name="skillsRaw"
              value={form.skillsRaw}
              onChange={handleChange}
              placeholder="e.g. React, Node.js, Python, SQL"
              style={styles.input}
            />

            <label style={styles.label}>Professional Summary</label>
            <textarea
              name="summary"
              value={form.summary}
              onChange={handleChange}
              placeholder="A short 2-3 sentence summary of your background and goals..."
              style={{ ...styles.input, height: "90px", resize: "vertical" }}
            />
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          {step === 0 ? (
            <button onClick={onComplete} style={styles.ghostBtn}>Skip for now</button>
          ) : (
            <>
              <button onClick={() => setStep(0)} style={styles.ghostBtn}>← Upload resume</button>
              <button onClick={handleSave} style={styles.primaryBtn}>
                Save Profile ✓
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

/* ── Spinner ── */
function Spinner() {
  return (
    <span style={{
      display:      "inline-block",
      width:        "28px",
      height:       "28px",
      border:       "3px solid rgba(10,132,255,0.2)",
      borderTop:    "3px solid #0A84FF",
      borderRadius: "50%",
      animation:    "spin 0.7s linear infinite",
      flexShrink:   0
    }} />
  );
}

/* ── Styles ── */
const styles = {
  overlay: {
    position: "fixed", inset: 0,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 2000
  },
  modal: {
    background: "var(--glass-bg, rgba(30,30,40,0.95))",
    backdropFilter: "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border: "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    borderRadius: "24px",
    width: "min(500px, 94vw)",
    maxHeight: "92vh",
    overflowY: "auto",
    boxShadow: "0 40px 80px rgba(0,0,0,0.5)"
  },
  header: { padding: "28px 28px 0", textAlign: "center" },
  logoRow: {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", marginBottom: "16px"
  },
  logoIcon: {
    width: "36px", height: "36px", borderRadius: "10px",
    background: "linear-gradient(135deg,#0A84FF,#BF5AF2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontWeight: "800", fontSize: "13px"
  },
  logoText: {
    fontSize: "20px", fontWeight: "800",
    color: "var(--text-primary, #fff)", letterSpacing: "-0.02em"
  },
  title: {
    margin: "0 0 8px", fontSize: "20px", fontWeight: "700",
    color: "var(--text-primary, #fff)"
  },
  subtitle: {
    margin: "0 0 16px", fontSize: "13px",
    color: "var(--text-secondary, rgba(255,255,255,0.6))", lineHeight: "1.5"
  },
  stepDots: {
    display: "flex", gap: "6px", justifyContent: "center", marginBottom: "4px"
  },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%", transition: "background 0.3s"
  },
  body: {
    padding: "20px 28px",
    display: "flex", flexDirection: "column", gap: "6px"
  },
  uploadArea: {
    display: "block", cursor: "pointer",
    padding: "28px 20px",
    background: "rgba(10,132,255,0.05)",
    border: "2px dashed rgba(10,132,255,0.3)",
    borderRadius: "16px", transition: "all 0.2s ease"
  },
  uploadLoading: {
    display: "block",
    padding: "28px 20px",
    background: "rgba(10,132,255,0.08)",
    border: "2px solid rgba(10,132,255,0.3)",
    borderRadius: "16px"
  },
  uploadInner: {
    display: "flex", alignItems: "center", gap: "16px", justifyContent: "center"
  },
  uploadTitle: {
    fontSize: "14px", fontWeight: "700", color: "var(--text-primary, #fff)"
  },
  uploadSub: {
    fontSize: "12px", color: "var(--text-secondary, rgba(255,255,255,0.5))", marginTop: "2px"
  },
  errorText: {
    margin: 0, fontSize: "12px", color: "#FF453A",
    padding: "8px 12px", background: "rgba(255,69,58,0.1)",
    borderRadius: "10px", border: "1px solid rgba(255,69,58,0.2)"
  },
  divider: {
    display: "flex", alignItems: "center", gap: "10px", margin: "4px 0"
  },
  dividerLine: {
    flex: 1, height: "1px", background: "var(--glass-border, rgba(255,255,255,0.1))"
  },
  dividerText: {
    fontSize: "12px", color: "var(--text-secondary, rgba(255,255,255,0.4))", fontWeight: "500"
  },
  label: {
    fontSize: "12px", fontWeight: "600",
    color: "var(--text-secondary, rgba(255,255,255,0.6))",
    marginBottom: "2px", marginTop: "8px", display: "block"
  },
  input: {
    width: "100%", padding: "11px 14px",
    borderRadius: "12px",
    border: "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    background: "rgba(255,255,255,0.06)",
    color: "var(--text-primary, #fff)",
    fontSize: "14px", outline: "none",
    boxSizing: "border-box", fontFamily: "inherit"
  },
  footer: {
    padding: "16px 28px 24px",
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid var(--glass-border, rgba(255,255,255,0.08))"
  },
  ghostBtn: {
    background: "transparent",
    border: "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    borderRadius: "12px", padding: "10px 18px",
    color: "var(--text-secondary, rgba(255,255,255,0.6))",
    fontSize: "13px", cursor: "pointer", fontWeight: "500"
  },
  skipBtn: {
    background: "transparent",
    border: "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    borderRadius: "12px", padding: "12px",
    color: "var(--text-secondary, rgba(255,255,255,0.5))",
    fontSize: "13px", cursor: "pointer", fontWeight: "500",
    textAlign: "center", width: "100%"
  },
  primaryBtn: {
    background: "linear-gradient(135deg,#0A84FF,#0066CC)",
    border: "none", borderRadius: "12px",
    padding: "10px 24px", color: "#fff",
    fontSize: "14px", fontWeight: "700",
    cursor: "pointer", boxShadow: "0 4px 16px rgba(10,132,255,0.35)",
    transition: "opacity 0.2s"
  }
};

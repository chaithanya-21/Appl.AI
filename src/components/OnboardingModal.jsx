import { useState } from "react";
import { useStore } from "../store/useStore";

export default function OnboardingModal({ onComplete }) {
  const { profile, setProfile } = useStore();

  const [form, setForm] = useState({
    name:        profile.name        || "",
    headline:    profile.headline    || "",
    linkedinUrl: profile.linkedinUrl || "",
    skillsRaw:   (profile.skills || []).join(", "),
    summary:     profile.summary     || ""
  });

  const [step, setStep] = useState(0);

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
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
  };

  const canNext = form.name.trim().length > 0;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>

        <div style={styles.header}>
          <div style={styles.logoRow}>
            <div style={styles.logoIcon}>AI</div>
            <span style={styles.logoText}>Appl.AI</span>
          </div>
          <h2 style={styles.title}>
            {step === 0 ? "Welcome! Set up your profile" : "Skills & Summary"}
          </h2>
          <p style={styles.subtitle}>
            {step === 0
              ? "This helps us personalise your job matches and AI outputs."
              : "Add your top skills and a short professional summary."}
          </p>
          <div style={styles.stepDots}>
            <div style={{ ...styles.dot, background: "#0A84FF" }} />
            <div style={{ ...styles.dot, background: step === 1 ? "#0A84FF" : "rgba(255,255,255,0.2)" }} />
          </div>
        </div>

        <div style={styles.body}>
          {step === 0 ? (
            <>
              <label style={styles.label}>Full Name *</label>
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
            </>
          ) : (
            <>
              <label style={styles.label}>Top Skills (comma-separated)</label>
              <input
                name="skillsRaw"
                value={form.skillsRaw}
                onChange={handleChange}
                placeholder="e.g. React, Node.js, Python, SQL"
                style={styles.input}
                autoFocus
              />
              <label style={styles.label}>Professional Summary</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                placeholder="A short 2-3 sentence summary of your background and goals..."
                style={{ ...styles.input, height: "110px", resize: "vertical" }}
              />
            </>
          )}
        </div>

        <div style={styles.footer}>
          {step === 0 ? (
            <>
              <button onClick={onComplete} style={styles.skipBtn}>Skip for now</button>
              <button
                onClick={() => setStep(1)}
                disabled={!canNext}
                style={{ ...styles.primaryBtn, opacity: canNext ? 1 : 0.5 }}
              >
                Next →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setStep(0)} style={styles.skipBtn}>← Back</button>
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

const styles = {
  overlay: {
    position:             "fixed",
    inset:                0,
    background:           "rgba(0,0,0,0.7)",
    backdropFilter:       "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    display:              "flex",
    alignItems:           "center",
    justifyContent:       "center",
    zIndex:               2000
  },
  modal: {
    background:           "var(--glass-bg, rgba(30,30,40,0.95))",
    backdropFilter:       "blur(30px)",
    WebkitBackdropFilter: "blur(30px)",
    border:               "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    borderRadius:         "24px",
    width:                "min(480px, 94vw)",
    maxHeight:            "90vh",
    overflowY:            "auto",
    boxShadow:            "0 40px 80px rgba(0,0,0,0.5)"
  },
  header: {
    padding:   "28px 28px 0",
    textAlign: "center"
  },
  logoRow: {
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    gap:            "8px",
    marginBottom:   "16px"
  },
  logoIcon: {
    width:          "36px",
    height:         "36px",
    borderRadius:   "10px",
    background:     "linear-gradient(135deg,#0A84FF,#BF5AF2)",
    display:        "flex",
    alignItems:     "center",
    justifyContent: "center",
    color:          "#fff",
    fontWeight:     "800",
    fontSize:       "13px"
  },
  logoText: {
    fontSize:      "20px",
    fontWeight:    "800",
    color:         "var(--text-primary, #fff)",
    letterSpacing: "-0.02em"
  },
  title: {
    margin:     "0 0 8px",
    fontSize:   "20px",
    fontWeight: "700",
    color:      "var(--text-primary, #fff)"
  },
  subtitle: {
    margin:     "0 0 16px",
    fontSize:   "13px",
    color:      "var(--text-secondary, rgba(255,255,255,0.6))",
    lineHeight: "1.5"
  },
  stepDots: {
    display:        "flex",
    gap:            "6px",
    justifyContent: "center",
    marginBottom:   "4px"
  },
  dot: {
    width:        "8px",
    height:       "8px",
    borderRadius: "50%",
    transition:   "background 0.3s"
  },
  body: {
    padding:       "20px 28px",
    display:       "flex",
    flexDirection: "column",
    gap:           "4px"
  },
  label: {
    fontSize:     "12px",
    fontWeight:   "600",
    color:        "var(--text-secondary, rgba(255,255,255,0.6))",
    marginBottom: "4px",
    marginTop:    "12px",
    display:      "block"
  },
  input: {
    width:       "100%",
    padding:     "11px 14px",
    borderRadius:"12px",
    border:      "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    background:  "rgba(255,255,255,0.06)",
    color:       "var(--text-primary, #fff)",
    fontSize:    "14px",
    outline:     "none",
    boxSizing:   "border-box",
    fontFamily:  "inherit"
  },
  footer: {
    padding:        "16px 28px 24px",
    display:        "flex",
    justifyContent: "space-between",
    alignItems:     "center",
    borderTop:      "1px solid var(--glass-border, rgba(255,255,255,0.08))"
  },
  skipBtn: {
    background:   "transparent",
    border:       "1px solid var(--glass-border, rgba(255,255,255,0.12))",
    borderRadius: "12px",
    padding:      "10px 18px",
    color:        "var(--text-secondary, rgba(255,255,255,0.6))",
    fontSize:     "13px",
    cursor:       "pointer",
    fontWeight:   "500"
  },
  primaryBtn: {
    background:   "linear-gradient(135deg,#0A84FF,#0066CC)",
    border:       "none",
    borderRadius: "12px",
    padding:      "10px 24px",
    color:        "#fff",
    fontSize:     "14px",
    fontWeight:   "700",
    cursor:       "pointer",
    boxShadow:    "0 4px 16px rgba(10,132,255,0.35)",
    transition:   "opacity 0.2s"
  }
};

import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore";
import { useState, useEffect } from "react";

import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";

export default function MainApp() {

  const { meta } = useStore();
  const [guide,setGuide]=useState(false);
  const [theme, setTheme] = useState("dark");
  const location = useLocation();

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div style={styles.wrapper}>

      <div
        style={{
          ...styles.background,
          backgroundImage: 'url("/ai-login-bg.png")'
        }}
      />

      <div style={styles.overlay} />

      <div style={styles.appContainer}>

        <div style={styles.sidebar}>
          <h2 style={{ marginBottom: "10px" }}>Appl.AI</h2>

          <Nav to="/dashboard" label="Dashboard" active={location.pathname === "/dashboard" || location.pathname === "/"} />
          <Nav to="/jobs" label="Job Board" active={location.pathname === "/jobs"} />
          <Nav to="/applications" label="Applications" active={location.pathname === "/applications"} />
          <Nav to="/outreach" label="Career Center" active={location.pathname === "/outreach"} />

          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            style={styles.themeToggle}
          >
            {theme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </button>

          <button onClick={handleLogout} style={styles.logoutButton}>
            Logout
          </button>

          <button
            onClick={()=>setGuide(true)}
            style={styles.guideButton}
          >
            User Guide
          </button>
        </div>

        <div style={styles.mainContent}>

          <div style={styles.saveIndicator}>
            Saved ✓ {new Date(meta.lastSaved).toLocaleTimeString()}
          </div>

          <Routes>
            <Route path="/" element={<Dashboard/>}/>
            <Route path="/dashboard" element={<Dashboard/>}/>
            <Route path="/jobs" element={<Jobs/>}/>
            <Route path="/applications" element={<Applications/>}/>
            <Route path="/outreach" element={<Outreach/>}/>
          </Routes>

        </div>
      </div>
    </div>
  );
}

function Nav({to,label,active}){
  return(
    <Link
      to={to}
      style={{
        ...styles.navItem,
        background: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"
      }}
    >
      {label}
    </Link>
  );
}

const styles = {
  wrapper:{
    position:"relative",
    height:"100vh",
    overflow:"hidden"
  },

  background:{
    position:"absolute",
    inset:0,
    backgroundSize:"cover",
    backgroundPosition:"center",
    animation:"float 30s infinite alternate ease-in-out",
    zIndex:1
  },

  overlay:{
    position:"absolute",
    inset:0,
    background:"rgba(0,0,0,0.35)",
    zIndex:2
  },

  appContainer:{
    position:"relative",
    zIndex:3,
    display:"flex",
    height:"100vh"
  },

  sidebar:{
    width:"240px",
    padding:"20px",
    display:"flex",
    flexDirection:"column",
    gap:"12px",
    background:"var(--glass-bg)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    borderRight:"1px solid var(--glass-border)"
  },

  navItem:{
    textDecoration:"none",
    padding:"12px",
    borderRadius:"14px",
    transition:"all 0.25s ease",
    color:"var(--text-primary)"
  },

  themeToggle:{
    padding:"10px",
    borderRadius:"14px",
    border:"1px solid var(--glass-border)",
    background:"var(--glass-bg)",
    color:"var(--text-primary)",
    fontWeight:"500",
    cursor:"pointer"
  },

  logoutButton:{
    padding:"10px",
    borderRadius:"14px",
    border:"1px solid var(--glass-border)",
    background:"var(--glass-bg)",
    color:"var(--text-primary)",
    fontWeight:"500",
    cursor:"pointer"
  },

  guideButton:{
    padding:"12px",
    borderRadius:"14px"
  },

  mainContent:{
    flex:1,
    padding:"30px",
    overflow:"auto",
    background:"var(--glass-bg)",
    backdropFilter:"blur(18px)",
    WebkitBackdropFilter:"blur(18px)"
  },

  saveIndicator:{
    position:"fixed",
    top:20,
    right:30,
    background:"var(--glass-bg)",
    backdropFilter:"blur(10px)",
    padding:"6px 12px",
    borderRadius:"10px",
    fontSize:"12px"
  }
};

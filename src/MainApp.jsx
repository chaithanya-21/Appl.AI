import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useStore } from "./store/useStore";
import { useState } from "react";

import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";

export default function MainApp() {

  const { meta } = useStore();
  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};
  const [guide,setGuide]=useState(false);
  const location = useLocation();

  return (
    <div style={styles.wrapper}>

      {/* Background */}
      <div
        style={{
          ...styles.background,
          backgroundImage: 'url("/ai-login-bg.png")'
        }}
      />

      {/* Overlay */}
      <div style={styles.overlay} />

      {/* APP LAYOUT */}
      <div style={styles.appContainer}>

        {/* SIDEBAR */}
        <div style={styles.sidebar}>
          <h2 style={{ color:"#fff" }}>Appl.AI</h2>

          <Nav to="/dashboard" label="Dashboard" active={location.pathname === "/dashboard" || location.pathname === "/"} />
          <Nav to="/jobs" label="Job Board" active={location.pathname === "/jobs"} />
          <Nav to="/applications" label="Applications" active={location.pathname === "/applications"} />
          <Nav to="/outreach" label="Career Center" active={location.pathname === "/outreach"} />

          <button
            onClick={()=>setGuide(true)}
            style={styles.guideButton}
          >
            User Guide
          </button>
        </div>

        {/* MAIN CONTENT */}
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
    background:"rgba(0,0,0,0.4)",
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
    background:"rgba(255,255,255,0.15)",
    backdropFilter:"blur(20px)",
    WebkitBackdropFilter:"blur(20px)",
    borderRight:"1px solid rgba(255,255,255,0.3)",
    color:"#fff"
  },

  navItem:{
    color:"#fff",
    textDecoration:"none",
    padding:"10px",
    borderRadius:"12px",
    transition:"0.3s"
  },

  guideButton:{
    marginTop:"auto",
    padding:"10px",
    borderRadius:"12px",
    border:"none",
    background:"rgba(255,255,255,0.2)",
    color:"#fff",
    cursor:"pointer"
  },

  mainContent:{
    flex:1,
    padding:"30px",
    overflow:"auto",
    background:"rgba(255,255,255,0.12)",
    backdropFilter:"blur(18px)",
    WebkitBackdropFilter:"blur(18px)",
    borderLeft:"1px solid rgba(255,255,255,0.2)"
  },

  saveIndicator:{
    position:"fixed",
    top:20,
    right:30,
    background:"rgba(255,255,255,0.25)",
    backdropFilter:"blur(10px)",
    padding:"6px 12px",
    borderRadius:"10px",
    color:"#fff",
    fontSize:"12px"
  }
};

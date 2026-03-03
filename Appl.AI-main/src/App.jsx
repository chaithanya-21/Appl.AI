import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useStore } from "./store/useStore";
import { useState } from "react";


import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Dashboard from "./pages/Dashboard";
import Outreach from "./pages/Outreach";

export default function App() {

  const { meta } = useStore();
  const [guide,setGuide]=useState(false);

  return (
    <Router>
      <div style={{display:"flex",height:"100vh"}}>

        {/* SIDEBAR */}
        <div style={{
          width:"220px",
          background:"#0f172a",
          color:"#fff",
          padding:"20px",
          display:"flex",
          flexDirection:"column",
          gap:"10px"
        }}>
          <h2>Appl.AI</h2>

          <Nav to="/dashboard" label="Dashboard"/>
          <Nav to="/jobs" label="Job Board"/>
          <Nav to="/applications" label="Applications"/>
          <Nav to="/outreach" label="Career Center"/>

          <button
            onClick={()=>setGuide(true)}
            style={{
              marginTop:"auto",
              background:"#2563eb",
              color:"#fff",
              border:"none",
              padding:"8px",
              borderRadius:"6px",
              cursor:"pointer"
            }}
          >
            User Guide
          </button>

        </div>

        {/* MAIN */}
        <div style={{flex:1,padding:"20px",overflow:"auto"}}>

          {/* GLOBAL SAVE INDICATOR */}
          <div style={{
            position:"fixed",
            top:10,
            right:20,
            background:"#16a34a",
            color:"#fff",
            padding:"6px 12px",
            borderRadius:"8px",
            fontSize:"12px"
          }}>
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

        {guide && <GuideModal close={()=>setGuide(false)}/>}

      </div>
    </Router>
  );
}

function Nav({to,label}){
  return(
    <Link
      to={to}
      style={{
        color:"#fff",
        textDecoration:"none",
        padding:"8px",
        borderRadius:"6px",
        background:"rgba(255,255,255,0.05)"
      }}
    >
      {label}
    </Link>
  );
}

function GuideModal({close}){
  return(
    <div style={{
      position:"fixed",
      inset:0,
      background:"rgba(0,0,0,0.4)",
      display:"flex",
      alignItems:"center",
      justifyContent:"center"
    }}>
      <div style={{
        background:"#fff",
        padding:"24px",
        borderRadius:"12px",
        width:"420px"
      }}>
        <h2>How to Use Appl.AI</h2>
        <ul>
          <li>Add or fetch jobs</li>
          <li>Apply and track progress</li>
          <li>Optimize resume per job</li>
          <li>Generate outreach packages</li>
        </ul>
        <button onClick={close} style={{marginTop:"10px"}}>Close</button>
      </div>
    </div>
  );
}
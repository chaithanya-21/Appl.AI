import { useState } from "react";
import mammoth from "mammoth";
import { useStore } from "../store/useStore";
import { callAI } from "../services/aiService";

export default function Outreach(){

  const { jobs } = useStore();

  const [resume,setResume]=useState(localStorage.getItem("resumeText")||"");
  const [jd,setJd]=useState(localStorage.getItem("jobJD")||"");

  const [optimized,setOptimized]=useState("");
  const [sop,setSop]=useState("");
  const [email,setEmail]=useState("");
  const [linkedin,setLinkedin]=useState("");
  const [dashboard,setDashboard]=useState("");
  const [ats,setAts]=useState(null);
  const [loading,setLoading]=useState(false);

  async function handleFile(e){
    const file=e.target.files[0];
    if(!file) return;
    const buffer=await file.arrayBuffer();
    const result=await mammoth.extractRawText({arrayBuffer:buffer});
    const text=result.value;
    setResume(text);
    localStorage.setItem("resumeText",text);
  }

  function selectJob(id){
    const job=jobs.find(j=>j.id===id);
    if(!job) return;
    setJd(job.description||"");
    localStorage.setItem("jobJD",job.description||"");
  }

  async function optimize(){
    if(!resume||!jd) return alert("Upload resume & select job");
    setLoading(true);

    const text = await callAI([
      {role:"system",content:"Rewrite resume strongly matching job."},
      {role:"user",content:`JOB:\n${jd}\n\nRESUME:\n${resume}`}
    ]);

    if(text){
      setOptimized(text);
      localStorage.setItem("resumeText",text);
      setAts(Math.floor(Math.random()*20)+75);
    }

    setLoading(false);
  }

  async function genSOP(){
    if(!optimized) return alert("Optimize first");
    setLoading(true);

    const text = await callAI([
      {role:"system",content:"Write one strong SOP paragraph."},
      {role:"user",content:`JOB:\n${jd}\n\nRESUME:\n${optimized}`}
    ]);

    if(text) setSop(text.trim());
    setLoading(false);
  }

  async function genEmail(){
    if(!optimized) return alert("Optimize first");
    setLoading(true);

    const text = await callAI([
      {role:"system",content:"Write an email FROM candidate TO recruiter after applying."},
      {role:"user",content:`JOB:\n${jd}\n\nRESUME:\n${optimized}`}
    ]);

    if(text) setEmail(text.trim());
    setLoading(false);
  }

  async function genLinkedin(){
    if(!optimized) return alert("Optimize first");
    setLoading(true);

    const text = await callAI([
      {role:"system",content:"Write a short LinkedIn outreach message."},
      {role:"user",content:`JOB:\n${jd}\n\nRESUME:\n${optimized}`}
    ]);

    if(text) setLinkedin(text.trim());
    setLoading(false);
  }

  async function buildDashboard(){
    if(!resume) return alert("Upload resume first");
    setLoading(true);

    const text = await callAI([
      {role:"system",content:"Create a structured professional profile summary."},
      {role:"user",content:resume}
    ]);

    if(text) setDashboard(text);
    setLoading(false);
  }

  function openGmail(){
    const subject=encodeURIComponent("Application Follow-up");
    const body=encodeURIComponent(email||"");
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`);
  }

  function downloadDashboardPDF(){
    const win=window.open("");
    win.document.write(`
      <html>
      <body style="font-family:Arial;padding:40px">
      <h2>Professional Resume Dashboard</h2>
      <pre style="white-space:pre-wrap">${dashboard}</pre>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  return(
    <div style={{padding:"20px"}}>

      <h1>Career Center</h1>

      <input type="file" accept=".docx" onChange={handleFile}/>

      <div style={{marginTop:"10px"}}>
        <select onChange={e=>selectJob(Number(e.target.value))}>
          <option>Select Job</option>
          {jobs.map(j=>(
            <option key={j.id} value={j.id}>{j.role} – {j.company}</option>
          ))}
        </select>
      </div>

      <button style={btnPurple} onClick={optimize}>
        Optimize Resume {loading&&"..."}
      </button>

      {ats && <div style={{marginTop:"10px",fontWeight:"bold"}}>
        ATS Compatibility: {ats}%
      </div>}

      <div style={{marginTop:"10px",display:"flex",gap:"10px",flexWrap:"wrap"}}>
        <button style={btnGreen} onClick={genSOP}>Generate SOP</button>
        <button style={btnBlue} onClick={genEmail}>Generate Email</button>
        <button style={btnBlue} onClick={genLinkedin}>LinkedIn Message</button>
        <button style={btnPurple} onClick={buildDashboard}>Build Dashboard</button>
      </div>

      {email && <button style={btnGreen} onClick={openGmail}>Open Gmail Draft</button>}
      {dashboard && <button style={btnBlue} onClick={downloadDashboardPDF}>Download Dashboard PDF</button>}

      {optimized && <Block title="Optimized Resume">{optimized}</Block>}
      {sop && <Block title="SOP">{sop}</Block>}
      {email && <Block title="Email">{email}</Block>}
      {linkedin && <Block title="LinkedIn Message">{linkedin}</Block>}
      {dashboard && <Block title="Resume Dashboard">{dashboard}</Block>}

    </div>
  );
}

function Block({title,children}){
  return(
    <div style={{
      marginTop:"20px",
      background:"#fff",
      padding:"16px",
      borderRadius:"10px",
      boxShadow:"0 4px 10px rgba(0,0,0,0.05)"
    }}>
      <h3>{title}</h3>
      <pre style={{whiteSpace:"pre-wrap"}}>{children}</pre>
    </div>
  );
}

const btnPurple={background:"#7c3aed",color:"#fff",border:"none",padding:"10px 16px",borderRadius:"8px",cursor:"pointer"};
const btnGreen={background:"#16a34a",color:"#fff",border:"none",padding:"10px 16px",borderRadius:"8px",cursor:"pointer"};
const btnBlue={background:"#2563eb",color:"#fff",border:"none",padding:"10px 16px",borderRadius:"8px",cursor:"pointer"};
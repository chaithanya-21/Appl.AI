import { useState } from "react";
import { useStore } from "../store/useStore";
import { scoreJob } from "../utils/scoreJob";

export default function JobCard({ job }) {

  const {addApplication,deleteJob,updateJob,applications,togglePriority}=useStore();
  const [editing,setEditing]=useState(false);
  const [form,setForm]=useState({...job});

  const resumeText=localStorage.getItem("resumeText")||"";
  const score=scoreJob(job,resumeText);

  const alreadyApplied=applications?.some(a=>a.jobId===job.id);

  function markApplied(){
    addApplication({jobId:job.id,role:job.role,company:job.company});
  }

  function copyJD(){
    navigator.clipboard.writeText(job.description||"");
  }

  function optimize(){
    localStorage.setItem("jobJD",job.description||"");
    window.location.href="/resumes";
  }

  function saveEdit(){
    updateJob(job.id,form);
    setEditing(false);
  }

  if(editing){
    return(
      <div style={card}>
        <input value={form.role||""} onChange={e=>setForm({...form,role:e.target.value})}/><br/><br/>
        <input value={form.company||""} onChange={e=>setForm({...form,company:e.target.value})}/><br/><br/>
        <input value={form.location||""} onChange={e=>setForm({...form,location:e.target.value})}/><br/><br/>
        <textarea value={form.description||""} onChange={e=>setForm({...form,description:e.target.value})}/><br/><br/>
        <button style={saveBtn} onClick={saveEdit}>💾 Save</button>
        <button style={cancelBtn} onClick={()=>setEditing(false)}>✖ Cancel</button>
      </div>
    )
  }

  return(
    <div style={card}>
      <div style={{display:"flex",justifyContent:"space-between"}}>
        <h3 style={{margin:0}}>{job.role}</h3>
        <span onClick={()=>togglePriority(job.id)} style={{cursor:"pointer",fontSize:"18px"}}>
          {job.priority?"⭐":"☆"}
        </span>
      </div>

      <p style={{color:"#555"}}>{job.company} • {job.location}</p>

      <div style={scoreBox}>
        <strong>Match Score: {score}%</strong>
      </div>

      {alreadyApplied&&<span style={badge}>Applied ✔</span>}

      {job.description&&(
        <details>
          <summary>View Description</summary>
          <p>{job.description}</p>
        </details>
      )}

      <div style={btnRow}>
        {job.link&&(
          <a href={job.link} target="_blank" rel="noreferrer">
            <button style={applyBtn}>🚀 Apply</button>
          </a>
        )}
        <button style={markBtn} onClick={markApplied}>✔ Mark As Applied</button>
        <button style={copyBtn} onClick={copyJD}>📋 Copy JD</button>

        {(job.manual||!job.link)&&(
          <>
            <button style={editBtn} onClick={()=>setEditing(true)}>✏ Edit</button>
            <button style={delBtn} onClick={()=>deleteJob(job.id)}>🗑 Delete</button>
          </>
        )}
      </div>
    </div>
  );
}

const card={background:"#fff",padding:"16px",borderRadius:"12px",boxShadow:"0 4px 12px rgba(0,0,0,0.06)",width:"280px"};
const btnRow={marginTop:"10px",display:"flex",gap:"6px",flexWrap:"wrap"};
const scoreBox={background:"#f1f5f9",padding:"6px",borderRadius:"6px",margin:"6px 0"};
const applyBtn={background:"#2563eb",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const markBtn={background:"#059669",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const copyBtn={background:"#64748b",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const optBtn={background:"#7c3aed",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const editBtn={background:"#f59e0b",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const delBtn={background:"#dc2626",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const saveBtn={background:"#059669",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const cancelBtn={background:"#6b7280",color:"#fff",border:"none",padding:"6px 10px",borderRadius:"6px"};
const badge={background:"#dcfce7",color:"#166534",padding:"4px 8px",borderRadius:"6px",fontSize:"12px"};

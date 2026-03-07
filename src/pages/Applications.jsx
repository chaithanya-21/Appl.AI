import { useStore } from "../store/useStore";

export default function Applications(){

  const {
    applications,
    moveApplication,
    updateNotes,
    setInterviewDate,
    markContacted,
    markReplied,
    setFollowup
  } = useStore();

  const columns=["Applied","Interview","Offer","Rejected"];

  const today=new Date().toISOString().slice(0,10);

  function saveAll(){
    localStorage.setItem("Appl.AI-data",JSON.stringify({
      jobs: useStore.getState().jobs,
      applications: useStore.getState().applications
    }));
    alert("Progress saved");
  }

  return(
    <div>

      <h1>Applications</h1>

      <button onClick={saveAll} style={saveBtn}>
        💾 Save Progress
      </button>

      <div style={{display:"flex",gap:"20px",marginTop:"20px"}}>

        {columns.map(col=>(
          <div key={col} style={{flex:1}}>

            <h2 style={{textAlign:"center"}}>{col}</h2>

            {applications
              .filter(a=>a.status===col)
              .map(app=>{

                const isToday=app.followup===today;
                const overdue=app.followup && app.followup<today;

                return(
                  <div key={app.id} style={card}>

                    <strong>{app.role}</strong>
                    <p style={{margin:"4px 0"}}>{app.company}</p>

                    {(isToday || overdue) && (
                      <div style={reminderBadge}>
                        {overdue ? "⚠ Follow-up overdue" : "🔔 Follow-up today"}
                      </div>
                    )}

                    {/* STATUS MOVE BUTTONS */}
                    <div style={{display:"flex",flexWrap:"wrap",gap:"6px",marginTop:"6px"}}>
                      {columns.map(s=>(
                        <button
                          key={s}
                          onClick={()=>moveApplication(app.id,s)}
                          style={{
                            background: statusColor(s),
                            color:"#fff",
                            border:"none",
                            padding:"4px 8px",
                            borderRadius:"6px",
                            cursor:"pointer",
                            opacity: app.status===s ? 1 : 0.5
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>

                    {/* NOTES */}
                    <textarea
                      placeholder="Notes"
                      value={app.notes}
                      onChange={e=>updateNotes(app.id,e.target.value)}
                      style={{marginTop:"8px",width:"100%"}}
                    />

                    {/* INTERVIEW DATE */}
                    <input
                      type="date"
                      value={app.interviewDate||""}
                      onChange={e=>setInterviewDate(app.id,e.target.value)}
                      style={{marginTop:"6px"}}
                    />

                    {/* RECRUITER TRACKING */}
                    <div style={{display:"flex",gap:"6px",marginTop:"8px"}}>

                      <button
                        onClick={()=>markContacted(app.id)}
                        style={{
                          background: app.contacted ? "#16a34a" : "#e2e8f0",
                          color: app.contacted ? "#fff" : "#000",
                          border:"none",
                          padding:"4px 8px",
                          borderRadius:"6px",
                          cursor:"pointer"
                        }}
                      >
                        📩 Contacted
                      </button>

                      <button
                        onClick={()=>markReplied(app.id)}
                        style={{
                          background: app.replied ? "#2563eb" : "#e2e8f0",
                          color: app.replied ? "#fff" : "#000",
                          border:"none",
                          padding:"4px 8px",
                          borderRadius:"6px",
                          cursor:"pointer"
                        }}
                      >
                        💬 Replied
                      </button>

                    </div>

                    {/* FOLLOWUP */}
                    <input
                      type="date"
                      value={app.followup||""}
                      onChange={e=>setFollowup(app.id,e.target.value)}
                      style={{marginTop:"6px"}}
                    />

                  </div>
                );
              })}

          </div>
        ))}

      </div>

    </div>
  );
}

/* ---------- HELPERS ---------- */

function statusColor(s){
  if(s==="Applied") return "#7c3aed";
  if(s==="Interview") return "#2563eb";
  if(s==="Offer") return "#16a34a";
  if(s==="Rejected") return "#dc2626";
  return "#64748b";
}

const reminderBadge={
  marginTop:"6px",
  padding:"4px 8px",
  borderRadius:"6px",
  background:"#fef3c7",
  color:"#92400e",
  fontSize:"12px",
  display:"inline-block"
};

const card={
  background: document.body.classList.contains("dark") ? "#111827" : "#fff",
  padding:"14px",
  borderRadius:"10px",
  marginTop:"10px",
  boxShadow:"0 4px 12px rgba(0,0,0,0.06)"
};

const saveBtn={
  background:"#2563eb",
  color:"#fff",
  border:"none",
  padding:"8px 14px",
  borderRadius:"8px",
  cursor:"pointer",
  marginTop:"10px"
};
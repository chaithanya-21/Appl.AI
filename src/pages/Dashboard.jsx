import { useStore } from "../store/useStore";
import { useNavigate } from "react-router-dom";

export default function Dashboard(){

  const navigate = useNavigate();

  const {
    getBestJobs,
    getFollowupsToday,
    getInterviewsToday
  } = useStore();

  const bestJobs = getBestJobs();
  const followups = getFollowupsToday();
  const interviews = getInterviewsToday();

  return(
    <div>

      <h1>Dashboard</h1>

      <div style={{display:"flex",gap:"20px",marginTop:"20px",flexWrap:"wrap"}}>

        {/* APPLY TODAY */}
        <Card title="🔥 Apply Today">

          {bestJobs.length===0 && <p>No recommended jobs</p>}

          {bestJobs.map(j=>(
            <div key={j.id} style={{marginTop:"8px"}}>

              <Item text={`${j.role} — ${j.company}`} />

              <button
                style={applyBtn}
                onClick={()=>navigate("/jobs")}
              >
                Apply Now
              </button>

            </div>
          ))}

        </Card>

        {/* FOLLOWUPS */}
        <Card title="📩 Followups Today">

          {followups.length===0 && <p>No followups scheduled</p>}

          {followups.map(a=>(
            <Item key={a.id} text={`${a.role} — ${a.company}`} />
          ))}

        </Card>

        {/* INTERVIEWS */}
        <Card title="🎯 Interviews Today">

          {interviews.length===0 && <p>No interviews today</p>}

          {interviews.map(a=>(
            <Item key={a.id} text={`${a.role} — ${a.company}`} />
          ))}

        </Card>

      </div>

    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function Card({title,children}){
  return(
    <div style={{
      background:"#fff",
      padding:"16px",
      borderRadius:"12px",
      minWidth:"260px",
      boxShadow:"0 4px 12px rgba(0,0,0,0.06)"
    }}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Item({text}){
  return(
    <div style={{
      marginTop:"8px",
      padding:"6px 10px",
      background:"#f1f5f9",
      borderRadius:"6px"
    }}>
      {text}
    </div>
  );
}

/* ---------- BUTTON ---------- */

const applyBtn={
  marginTop:"6px",
  background:"#7c3aed",
  color:"#fff",
  border:"none",
  padding:"4px 10px",
  borderRadius:"6px",
  cursor:"pointer"
};
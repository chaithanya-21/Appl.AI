import { useStore } from "../store/useStore";

export default function Dashboard(){

  const { jobs, applications } = useStore();

  const today=new Date().toISOString().slice(0,10);

  const followups=applications.filter(a=>a.followup===today);
  const interviews=applications.filter(a=>a.interviewDate===today);

  const bestJobs=jobs
    .filter(j=>!applications.some(a=>a.jobId===j.id))
    .sort((a,b)=>{
      const pa=b.priority?1:0;
      const pb=a.priority?1:0;
      return pa-pb;
    })
    .slice(0,5);

  return(
    <div>

      <h1>Dashboard</h1>

      <div style={{display:"flex",gap:"20px",marginTop:"20px",flexWrap:"wrap"}}>

        <Card title="🔥 Apply Today">
          {bestJobs.length===0 && <p>No jobs queued</p>}
          {bestJobs.map(j=>(
            <Item key={j.id} text={`${j.role} — ${j.company}`}/>
          ))}
        </Card>

        <Card title="📩 Followups Today">
          {followups.length===0 && <p>No followups</p>}
          {followups.map(a=>(
            <Item key={a.id} text={`${a.role} — ${a.company}`}/>
          ))}
        </Card>

        <Card title="🎯 Interviews Today">
          {interviews.length===0 && <p>No interviews</p>}
          {interviews.map(a=>(
            <Item key={a.id} text={`${a.role} — ${a.company}`}/>
          ))}
        </Card>

      </div>

    </div>
  );
}

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

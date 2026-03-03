export default function VisualDashboard({data}){

  return(
    <div id="visualDashboard" style={{
      marginTop:"30px",
      padding:"30px",
      background:"#0f172a",
      color:"#fff",
      borderRadius:"14px",
      display:"grid",
      gridTemplateColumns:"260px 1fr",
      gap:"30px"
    }}>

      {/* LEFT PROFILE */}
      <div>
        <div style={{
          width:"120px",
          height:"120px",
          borderRadius:"50%",
          background:"#334155",
          marginBottom:"20px"
        }}/>

        <h2>{data.name}</h2>
        <p>{data.role}</p>

        <h3 style={{marginTop:"30px"}}>Skills</h3>
        {data.skills?.map((s,i)=>(
          <div key={i} style={{marginTop:"6px",background:"#1e293b",padding:"6px",borderRadius:"6px"}}>
            {s}
          </div>
        ))}
      </div>

      {/* RIGHT CONTENT */}
      <div>

        <h2>About Me</h2>
        <p style={{opacity:0.9}}>{data.about}</p>

        <h2 style={{marginTop:"30px"}}>Work Experience</h2>
        {data.experience?.map((e,i)=>(
          <div key={i} style={{marginTop:"10px"}}>
            <strong>{e.role}</strong> — {e.company}
            <div style={{opacity:0.7}}>{e.years}</div>
          </div>
        ))}

        <h2 style={{marginTop:"30px"}}>Education</h2>
        {data.education?.map((e,i)=>(
          <div key={i} style={{marginTop:"10px"}}>
            <strong>{e.degree}</strong> — {e.school}
            <div style={{opacity:0.7}}>{e.years}</div>
          </div>
        ))}

      </div>

    </div>
  );
}
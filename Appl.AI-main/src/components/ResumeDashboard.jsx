export default function ResumeDashboard({ data }){

  if(!data) return null;

  return(
    <div style={wrap}>

      {/* LEFT PROFILE PANEL */}
      <div style={leftPanel}>

        <img
          src={data.photo || "https://via.placeholder.com/120"}
          style={avatar}
        />

        <h2 style={{margin:"10px 0 4px"}}>{data.name || "Your Name"}</h2>
        <div style={{opacity:.7}}>{data.role || "Professional Title"}</div>

        <p style={{marginTop:"15px",opacity:.8}}>
          {data.about || "Your profile summary will appear here."}
        </p>

        <div style={{marginTop:"20px"}}>
          <h4>Core Skills</h4>

          {(data.skills || []).map((s,i)=>(
            <Skill key={i} name={s.name} level={s.level}/>
          ))}
        </div>

      </div>

      {/* CENTER CONTENT */}
      <div style={centerPanel}>

        <Section title="Work Experience">
          {(data.experience || []).map((e,i)=>(
            <Block key={i}>
              <b>{e.role}</b> — {e.company}
              <div style={{opacity:.6,fontSize:"13px"}}>
                {e.years}
              </div>
              <div style={{marginTop:"4px"}}>
                {e.desc}
              </div>
            </Block>
          ))}
        </Section>

        <Section title="Education">
          {(data.education || []).map((e,i)=>(
            <Block key={i}>
              <b>{e.degree}</b>
              <div>{e.school}</div>
              <div style={{opacity:.6,fontSize:"13px"}}>
                {e.years}
              </div>
            </Block>
          ))}
        </Section>

      </div>

      {/* RIGHT STATS PANEL */}
      <div style={rightPanel}>

        <h3>Career Stats</h3>

        {(data.stats || []).map((s,i)=>(
          <Stat key={i} label={s.label} value={s.value}/>
        ))}

      </div>

    </div>
  );
}


/* ---------- COMPONENTS ---------- */

function Section({title,children}){
  return(
    <div style={{marginBottom:"20px"}}>
      <h3>{title}</h3>
      {children}
    </div>
  );
}

function Block({children}){
  return(
    <div style={{
      background:"#fff",
      padding:"12px",
      borderRadius:"8px",
      marginBottom:"10px",
      boxShadow:"0 2px 6px rgba(0,0,0,0.06)"
    }}>
      {children}
    </div>
  );
}

function Skill({name,level=70}){
  return(
    <div style={{marginBottom:"10px"}}>
      <div style={{fontSize:"13px",marginBottom:"2px"}}>
        {name}
      </div>
      <div style={skillBarWrap}>
        <div style={{
          ...skillFill,
          width:`${level}%`
        }}/>
      </div>
    </div>
  );
}

function Stat({label,value}){
  return(
    <div style={{
      background:"#fff",
      padding:"12px",
      borderRadius:"8px",
      marginBottom:"10px",
      boxShadow:"0 2px 6px rgba(0,0,0,0.06)"
    }}>
      <div style={{fontSize:"12px",opacity:.6}}>{label}</div>
      <div style={{fontSize:"22px",fontWeight:"600"}}>{value}</div>
    </div>
  );
}


/* ---------- STYLES ---------- */

const wrap={
  display:"grid",
  gridTemplateColumns:"260px 1fr 240px",
  gap:"20px",
  background:"#0f172a",
  padding:"20px",
  borderRadius:"16px",
  color:"#fff"
};

const leftPanel={
  background:"#1e293b",
  padding:"20px",
  borderRadius:"12px"
};

const centerPanel={
  padding:"10px"
};

const rightPanel={
  background:"#1e293b",
  padding:"20px",
  borderRadius:"12px"
};

const avatar={
  width:"120px",
  height:"120px",
  borderRadius:"50%",
  objectFit:"cover"
};

const skillBarWrap={
  width:"100%",
  height:"6px",
  background:"rgba(255,255,255,0.2)",
  borderRadius:"4px"
};

const skillFill={
  height:"6px",
  background:"#7c3aed",
  borderRadius:"4px"
};

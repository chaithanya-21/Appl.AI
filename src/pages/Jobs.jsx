import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import JobCard from "../components/JobCard";
import { fetchJobs } from "../services/fetchJobs";

// ✅ NEW: import state + mapping
import { INDIAN_STATES, CITY_TO_STATE } from "../utils/locationFilter";

export default function Jobs(){

  const navigate = useNavigate();
  const { jobs, addJob } = useStore();

  const [loading,setLoading] = useState(false);
  const [page,setPage] = useState(1);
  const [search,setSearch] = useState("");
  const [type,setType] = useState("all");

  // ✅ NEW: state filter
  const [stateFilter,setStateFilter] = useState("All");

  const pageSize=6;

  const myJobs = jobs.filter(j=>j.manual||!j.link);
  const liveJobs = jobs.filter(j=>!j.manual&&j.link);

  const filtered = useMemo(()=>{
    let list = liveJobs;

    // ---------------- SEARCH FILTER ----------------
    if(search.trim()){
      const terms = search.toLowerCase().split(" ").filter(Boolean);
      list = list.filter(j=>{
        const role=(j.role||"").toLowerCase();
        return terms.every(t=>role.includes(t));
      });
    }

    // ---------------- WORK TYPE FILTER ----------------
    if(type!=="all"){
      list=list.filter(j=>
        (j.workType||"").toLowerCase().includes(type)
      );
    }

    // ---------------- ✅ STATE FILTER ----------------
    if(stateFilter !== "All"){
      list = list.filter(j=>{
        const city = (j.location || "").split(",")[0].toLowerCase();
        const state = CITY_TO_STATE[city];

        return state === stateFilter;
      });
    }

    return list;

  },[search,type,stateFilter,liveJobs]); // ✅ added stateFilter

  const totalPages=Math.max(1,Math.ceil(filtered.length/pageSize));
  const paginatedLive=filtered.slice((page-1)*pageSize,page*pageSize);

  useEffect(()=>{
    const loaded=sessionStorage.getItem("jobsLoaded");
    if(!loaded){
      loadJobs();
      sessionStorage.setItem("jobsLoaded","true");
    }
  },[]);

  async function loadJobs(){
    setLoading(true);
    try{
      const live=await fetchJobs("consulting remote India"); // ✅ improved query
      const ids=new Set(jobs.map(j=>j.id));
      live.forEach(j=>!ids.has(j.id)&&addJob(j));
    }catch(e){console.error(e)}
    setLoading(false);
  }

  function improveResume(job){
    localStorage.setItem("jobJD",job.description||"");
    navigate("/outreach");
  }

  return(
    <div>

      <h1>Job Board</h1>

      <div style={{display:"flex",gap:"10px",margin:"20px 0"}}>

        {/* SEARCH */}
        <input
          placeholder="Search by role..."
          value={search}
          onChange={e=>{setSearch(e.target.value);setPage(1);}}
        />

        {/* WORK TYPE */}
        <select value={type} onChange={e=>{setType(e.target.value);setPage(1);}}>
          <option value="all">All</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>

        {/* ✅ NEW: STATE DROPDOWN */}
        <select
          value={stateFilter}
          onChange={e=>{setStateFilter(e.target.value);setPage(1);}}
        >
          {INDIAN_STATES.map(state=>(
            <option key={state} value={state}>
              {state}
            </option>
          ))}
        </select>

        {/* REFRESH */}
        <button onClick={loadJobs}>
          {loading?"Refreshing…":"Refresh Jobs"}
        </button>

        {/* ADD JOB */}
        <button onClick={()=>addJob({
          id:Date.now(),
          role:"New Role",
          company:"Company",
          location:"Location",
          description:"Add details here…",
          manual:true
        })}>
          + Add Job
        </button>
      </div>

      {/* PAGINATION */}
      <div style={{marginBottom:"20px"}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</button>
        <span style={{margin:"0 10px"}}>Page {page} of {totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</button>
      </div>

      <div style={{display:"flex",gap:"30px"}}>

        {/* LIVE JOBS */}
        <div style={{flex:2}}>
          <h2>Live Jobs Feed</h2>
          <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
            {paginatedLive.map(j=>(
              <div key={j.id}>
                <JobCard job={j}/>
                <button
                  onClick={()=>improveResume(j)}
                  style={{
                    marginTop:"6px",
                    background:"#7c3aed",
                    color:"#fff",
                    border:"none",
                    padding:"6px 10px",
                    borderRadius:"6px",
                    cursor:"pointer"
                  }}
                >
                  Improve Resume
                </button>
              </div>
            ))}
          </div>
        </div>

        <div style={{width:"1px",background:"#ddd"}}/>

        {/* MY JOBS */}
        <div style={{flex:1}}>
          <h2>My Added Jobs</h2>
          <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
            {myJobs.map(j=><JobCard key={j.id} job={j}/>)}
          </div>
        </div>

      </div>

    </div>
  )
}

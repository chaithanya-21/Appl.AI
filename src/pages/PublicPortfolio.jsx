import ResumeDashboard from "../components/ResumeDashboard";

export default function PublicPortfolio(){

  const params = new URLSearchParams(window.location.search);
  const dataParam = params.get("data");

  if(!dataParam){
    return <h2 style={{padding:"40px"}}>Portfolio not found</h2>;
  }

  let data=null;

  try{
    data = JSON.parse(atob(dataParam));
  }catch{
    return <h2 style={{padding:"40px"}}>Invalid portfolio link</h2>;
  }

  return(
    <div style={{padding:"40px",background:"#f1f5f9",minHeight:"100vh"}}>
      <ResumeDashboard data={data}/>
    </div>
  );
}

export default function Card({title, value}) {
  return (
    <div style={{
      background:"#fff",
      padding:"20px",
      borderRadius:"12px",
      boxShadow:"0 4px 12px rgba(0,0,0,0.05)",
      minWidth:"180px"
    }}>
      <p style={{color:"#777",marginBottom:"8px"}}>{title}</p>
      <h2 style={{margin:0}}>{value}</h2>
    </div>
  );
}

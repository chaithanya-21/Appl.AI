import { NavLink } from "react-router-dom";

export default function Sidebar() {
  const link = {
    display: "block",
    padding: "10px 14px",
    marginBottom: "6px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#333",
    fontWeight: "500"
  };

  return (
    <aside style={{
      width:"240px",
      background:"#fff",
      padding:"20px",
      borderRight:"1px solid #eee"
    }}>
      <h2 style={{marginBottom:"20px"}}>Appl.AI</h2>

      <NavLink to="/" style={link}>Dashboard</NavLink>
      <NavLink to="/jobs" style={link}>Jobs</NavLink>
      <NavLink to="/applications" style={link}>Applications</NavLink>
      <NavLink to="/resumes" style={link}>Resumes</NavLink>
      <NavLink to="/assistant" style={link}>AI Assistant</NavLink>
    </aside>
  );
}

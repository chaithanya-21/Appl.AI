import { useState } from "react";

export default function Login(){

  const [name,setName]=useState("");
  const [email,setEmail]=useState("");

  function login(){

    if(!name || !email)
      return alert("Please enter name and email");

    const user={name,email,login:Date.now()};
    localStorage.setItem("applai-user",JSON.stringify(user));

    window.location.href="/dashboard";
  }

  return(
    <div style={{
      height:"100vh",
      display:"flex",
      alignItems:"center",
      justifyContent:"center",
      background:"#f1f5f9"
    }}>
      <div style={{
        background:"#fff",
        padding:"30px",
        borderRadius:"14px",
        width:"360px",
        boxShadow:"0 8px 24px rgba(0,0,0,0.08)"
      }}>
        <h2>Welcome to Appl.AI</h2>

        <input
          placeholder="Your Name"
          value={name}
          onChange={e=>setName(e.target.value)}
          style={input}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
          style={input}
        />

        <button style={btn} onClick={login}>
          Continue to Dashboard
        </button>
      </div>
    </div>
  );
}

const input={
  width:"100%",
  marginTop:"12px",
  padding:"10px",
  borderRadius:"6px",
  border:"1px solid #cbd5f5"
};

const btn={
  marginTop:"18px",
  width:"100%",
  padding:"12px",
  background:"#7c3aed",
  color:"#fff",
  border:"none",
  borderRadius:"8px",
  cursor:"pointer",
  fontWeight:"600"
};
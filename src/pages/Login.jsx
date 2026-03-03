import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({
    username: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch("https://applai-backend.onrender.com/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const data = await res.json();

    if (data.token) {
      localStorage.setItem("token", data.token);
      navigate("/");
    } else {
      alert(data.message);
    }
  };

  return (
    <div style={styles.wrapper}>
      
      {/* Animated Background */}
      <div
        style={{
          ...styles.background,
          backgroundImage: `url(${bgImage})`
        }}
      />

      {/* Dark overlay for readability */}
      <div style={styles.overlay} />

      {/* Login Card */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px" }}>Welcome Back 👋</h2>

        <form onSubmit={handleSubmit}>
          <input
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={styles.button}>
            Login
          </button>
        </form>

        <p style={{ marginTop: "15px", color: "#555" }}>
          Don't have an account? <Link to="/signup">Signup</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: "relative",
    height: "100vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  background: {
    position: "absolute",
    width: "110%",
    height: "110%",
    top: "-5%",
    left: "-5%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: "float 20s infinite alternate ease-in-out",
    zIndex: 1
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(0,0,0,0.5)",
    zIndex: 2
  },
  card: {
    position: "relative",
    zIndex: 3,
    background: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: "16px",
    width: "350px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
    textAlign: "center"
  },
  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "8px",
    border: "1px solid #ddd",
    fontSize: "14px"
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  }
};

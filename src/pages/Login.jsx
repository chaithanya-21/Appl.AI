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
          backgroundImage: 'url("/ai-login-bg.png")'
        }}
      />

      {/* Softer Dark Overlay */}
      <div style={styles.overlay} />

      {/* Glass Login Card */}
      <div style={styles.card}>
        <h2 style={{ marginBottom: "20px", color: "#fff" }}>
          Welcome Back 👋
        </h2>

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

        <p style={{ marginTop: "15px", color: "#eee" }}>
          Don't have an account? <Link to="/signup" style={{ color: "#fff", fontWeight: "600" }}>Signup</Link>
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
    inset: 0,
    backgroundSize: "cover",
    backgroundPosition: "center",
    animation: "float 20s infinite alternate ease-in-out",
    zIndex: 1
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0.35)", // softer so background is visible
    zIndex: 2
  },

  card: {
    position: "relative",
    zIndex: 3,
    background: "rgba(255, 255, 255, 0.15)", // translucent
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    padding: "45px",
    borderRadius: "20px",
    width: "380px",
    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.3)",
    textAlign: "center"
  },

  input: {
    width: "100%",
    padding: "12px",
    marginBottom: "15px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.4)",
    background: "rgba(255,255,255,0.2)",
    color: "#fff",
    fontSize: "14px",
    outline: "none"
  },

  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #2563eb, #1e40af)",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "0.3s"
  }
};

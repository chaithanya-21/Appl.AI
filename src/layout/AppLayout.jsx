import Sidebar from "../components/Sidebar";

export default function AppLayout({ children }) {
  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>

      {/* FIXED SIDEBAR */}
      <div
        style={{
          width: "240px",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          background: "#fff",
          borderRight: "1px solid #eee",
          zIndex: 10
        }}
      >
        <Sidebar />
      </div>

      {/* CONTENT AREA */}
      <main
        style={{
          marginLeft: "260px",   // 👈 push content slightly more right
          paddingTop: "20px",    // 👈 prevent top clipping
          height: "100vh",
          overflowY: "auto",
          padding: "32px",
          background: "#f5f6f8"
        }}
      >
        {children}
      </main>

    </div>
  );
}

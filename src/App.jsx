import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Outreach from "./pages/Outreach";
import UserGuide from "./pages/UserGuide";

function Navigation() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="flex justify-between items-center px-6 py-4 glass-card small">
      <div className="text-lg font-semibold">Appl.AI</div>

      <div className="flex gap-4 items-center">
        <Link
          to="/"
          className={location.pathname === "/" ? "text-blue-400" : ""}
        >
          Home
        </Link>

        <Link
          to="/jobs"
          className={location.pathname === "/jobs" ? "text-blue-400" : ""}
        >
          Job Board
        </Link>

        <Link
          to="/applications"
          className={
            location.pathname === "/applications" ? "text-blue-400" : ""
          }
        >
          Applications
        </Link>

        <Link
          to="/outreach"
          className={
            location.pathname === "/outreach" ? "text-blue-400" : ""
          }
        >
          Career Centre
        </Link>

        <button onClick={() => navigate("/userguide")}>
          User Guide
        </button>
      </div>
    </nav>
  );
}

function App() {
  // 🔥 Force permanent dark mode
  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Navigation />

      <div className="p-6">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/outreach" element={<Outreach />} />
          <Route path="/userguide" element={<UserGuide />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

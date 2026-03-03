import { useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useLocation,
} from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Outreach from "./pages/Outreach";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PublicPortfolio from "./pages/PublicPortfolio";
import Resumes from "./pages/Resumes";

function Navigation() {
  const location = useLocation();

  return (
    <nav className="flex justify-between items-center px-6 py-4 glass-card small">
      <div className="text-lg font-semibold">Appl.AI</div>

      <div className="flex gap-4 items-center">
        <Link to="/" className={location.pathname === "/" ? "text-blue-400" : ""}>
          Home
        </Link>

        <Link to="/jobs" className={location.pathname === "/jobs" ? "text-blue-400" : ""}>
          Job Board
        </Link>

        <Link to="/applications" className={location.pathname === "/applications" ? "text-blue-400" : ""}>
          Applications
        </Link>

        <Link to="/outreach" className={location.pathname === "/outreach" ? "text-blue-400" : ""}>
          Career Centre
        </Link>
      </div>
    </nav>
  );
}

function App() {
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
          <Route path="/assistant" element={<Assistant />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/portfolio" element={<PublicPortfolio />} />
          <Route path="/resumes" element={<Resumes />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Applications from "./pages/Applications";
import Outreach from "./pages/Outreach";
import Assistant from "./pages/Assistant";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PublicPortfolio from "./pages/PublicPortfolio";
import Resumes from "./pages/Resumes";

function App() {

  // Keep permanent dark mode
  useEffect(() => {
    document.body.classList.add("dark");
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/portfolio" element={<PublicPortfolio />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/applications" element={<Applications />} />
            <Route path="/outreach" element={<Outreach />} />
            <Route path="/assistant" element={<Assistant />} />
            <Route path="/resumes" element={<Resumes />} />
          </Route>
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

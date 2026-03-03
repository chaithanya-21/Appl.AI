import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import MainApp from "./MainApp";

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected App */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

import DashBoard from "./pages/DashBoard";
import Signin from "./pages/Signin";
import SignUp from "./pages/SignUp";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="relative min-h-screen bg-white">
      {/* Top right buttons */}
      <div className="absolute top-6 right-8 flex gap-3">
        <button
          className="px-4 py-2 text-base font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition"
          onClick={() => navigate("/signin")}
        >
          Sign In
        </button>
        <button
          className="px-4 py-2 text-base font-medium text-blue-500 border border-blue-500 rounded hover:bg-blue-50 transition"
          onClick={() => navigate("/signup")}
        >
          Sign Up
        </button>
      </div>
      {/* Centered landing content */}
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">
          Welcome to Second Brain
        </h1>
        <button
          className="px-6 py-3 text-lg font-semibold text-white bg-green-500 rounded hover:bg-green-600 transition"
          onClick={() => navigate("/dashboard")}
        >
          Get Started
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<Signin />} />
        <Route path="/dashboard" element={<DashBoard />} />
      </Routes>
    </BrowserRouter>
  );
}

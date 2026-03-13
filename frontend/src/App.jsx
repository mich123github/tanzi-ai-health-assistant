import React, { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import SymptomChecker from "./pages/SymptomChecker";
import DiseaseLookup from "./pages/DiseaseLookup";
import Education from "./pages/Education";
import Quizzes from "./pages/Quizzes";
import FacilityLocator from "./pages/FacilityLocator";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";
import { FaBars, FaTimes, FaMoon, FaSun } from "react-icons/fa";

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  const location = useLocation();
  const hideLayout = location.pathname === "/" || location.pathname === "/login" || location.pathname === "/register";

  // Apply dark mode class to <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar Overlay */}
      {!hideLayout && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!hideLayout && (
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 transform ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out z-50 shadow-lg`}
        >
          <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="font-bold text-lg">AI Health Portal</h1>
            <button onClick={() => setSidebarOpen(false)}>
              <FaTimes className="text-xl" />
            </button>
          </div>
          <nav className="flex flex-col gap-4 p-4">
            <Link to="/home" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Home</Link>
            <Link to="/symptom-checker" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Symptom Checker</Link>
            <Link to="/disease-lookup" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Disease Lookup</Link>
            <Link to="/education" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Education</Link>
            <Link to="/quizzes" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Quizzes</Link>
            <Link to="/locator" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Locator</Link>
            <Link to="/chat" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Chat</Link>
            <Link to="/dashboard" onClick={() => setSidebarOpen(false)} className="hover:text-teal-600 dark:hover:text-teal-400">Dashboard</Link>
          </nav>
          {/* Dark Mode Toggle */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <span className="text-sm">Theme</span>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {darkMode ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-800" />}
            </button>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        {!hideLayout && (
          <header className="bg-teal-600 dark:bg-gray-800 text-white p-4 flex justify-between items-center">
            <button onClick={() => setSidebarOpen(true)}>
              <FaBars className="text-2xl" />
            </button>
            <h1 className="font-bold text-lg">AI Health Portal</h1>
          </header>
        )}

        {/* Page Content */}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/home" element={<Home />} />
            <Route path="/symptom-checker" element={<SymptomChecker />} />
            <Route path="/disease-lookup" element={<DiseaseLookup />} />
            <Route path="/education" element={<Education />} />
            <Route path="/quizzes" element={<Quizzes />} />
            <Route path="/locator" element={<FacilityLocator />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

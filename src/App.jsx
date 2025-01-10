import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Dashboard from "./Dashboard";
import Forms from "./Forms";
import AdminMedicines from "./Diagnosis-Medicines"; // Import the medicines page

function App() {
  const location = useLocation();

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <aside className="main-sidebar sidebar-dark-primary elevation-4">
        <a href="#" className="brand-link">
          <span className="brand-text font-weight-light">SKP Clinic Admin</span>
        </a>
        <div className="sidebar">
          <nav className="mt-2">
            <ul
              className="nav nav-pills nav-sidebar flex-column"
              role="menu"
              data-accordion="false"
            >

              <li className="nav-item">
                <Link
                  to="/"
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-tachometer-alt"></i>
                  <p>Dashboard</p>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/forms"
                  className={`nav-link ${
                    location.pathname === "/forms" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-edit"></i>
                  <p>Forms</p>
                </Link>
              </li>

              <li className="nav-item">
                <Link
                  to="/medicines"
                  className={`nav-link ${
                    location.pathname === "/medicines" ? "active" : ""
                  }`}
                >
                  <i className="nav-icon fas fa-pills"></i>
                  <p>Manage Medicines</p>
                </Link>
              </li>

            </ul>
          </nav>
        </div>
      </aside>

      {/* Content Wrapper */}
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/forms" element={<Forms />} />
        <Route path="/medicines" element={<AdminMedicines />} /> 
      </Routes>
    </div>
  );
}

export default App;
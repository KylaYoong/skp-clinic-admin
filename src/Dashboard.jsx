import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, PieController, BarController } from "chart.js";
import { db } from "./firebase-config"; // Import Firestore configuration

// Register Chart.js components to be used for creating charts
Chart.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
  PieController,
  BarController
);

function Dashboard() {
  // State variables to hold widget data
  const [newPatients, setNewPatients] = useState(0);
  const [completedPatients, setCompletedPatients] = useState(0);
  const [pendingPatients, setPendingPatients] = useState(0);
  const [averageWaitTime, setAverageWaitTime] = useState("0 min");

  // Refs to access and manipulate chart elements
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);

  // Fetch data from Firestore and update widget values
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "patients"), (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());

      // Calculate metrics for widgets
      const newCount = data.filter((patient) => patient.status === "new").length;
      const completedCount = data.filter((patient) => patient.status === "completed").length;
      const pendingCount = data.filter((patient) => patient.status === "pending").length;
      const totalWaitTime = data.reduce((acc, patient) => acc + (patient.waitTime || 0), 0);
      const avgWaitTime = data.length > 0 ? Math.round(totalWaitTime / data.length) : 0;

      // Update state
      setNewPatients(newCount);
      setCompletedPatients(completedCount);
      setPendingPatients(pendingCount);
      setAverageWaitTime(`${avgWaitTime} min`);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, []);

  // Initialize and update charts
  useEffect(() => {
    // Function to initialize the pie chart
    const initializePieChart = () => {
      const ctx = pieChartRef.current.getContext("2d");

      // Destroy previous instance to avoid overlapping charts
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      // Create the pie chart
      pieChartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Waiting", "Completed"],
          datasets: [
            {
              data: [pendingPatients, completedPatients],
              backgroundColor: ["#17a2b8", "#28a745"], // Colors for the pie chart
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom", // Place legend below the chart
            },
          },
        },
      });
    };

    // Function to initialize the bar chart
    const initializeBarChart = () => {
      const ctx = barChartRef.current.getContext("2d");

      // Destroy previous instance to avoid overlapping charts
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      // Create the bar chart
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "New Patients",
              data: [10, 15, 8, 12, 14, 18, 5], // Replace with real-time data if available
              backgroundColor: "#17a2b8",
            },
            {
              label: "Completed Patients",
              data: [8, 12, 6, 10, 13, 15, 3], // Replace with real-time data if available
              backgroundColor: "#28a745",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top", // Place legend at the top
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Days of the Week", // Label for X-axis
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Patients", // Label for Y-axis
              },
              beginAtZero: true, // Start Y-axis at 0
            },
          },
        },
      });
    };

    // Initialize both charts
    initializePieChart();
    initializeBarChart();

    // Cleanup chart instances on unmount
    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, [pendingPatients, completedPatients]); // Re-run chart updates when data changes

  return (
    <div className="content-wrapper">
      {/* Header Section */}
      <div className="content-header">
        <div className="container-fluid">
          <h1 className="m-0">Welcome to SKP Clinic Admin</h1>
        </div>
      </div>

      {/* Main Content Section */}
      <section className="content">
        <div className="container-fluid">
          {/* Widgets Row */}
          <div className="row">
            {/* New Patients Widget */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>{newPatients}</h3>
                  <p>New Patients</p>
                </div>
              </div>
            </div>

            {/* Completed Patients Widget */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>{completedPatients}</h3>
                  <p>Completed</p>
                </div>
              </div>
            </div>

            {/* Pending Patients Widget */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>{pendingPatients}</h3>
                  <p>Pending Patients</p>
                </div>
              </div>
            </div>

            {/* Average Wait Time Widget */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-secondary">
                <div className="inner">
                  <h3>{averageWaitTime}</h3>
                  <p>Average Waiting Time</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="row mt-4">
            {/* Pie Chart Card */}
            <div className="col-md-4">
              <div className="card" style={{ height: "400px" }}>
                <div className="card-header">
                  <h3 className="card-title">Queue Summary</h3>
                </div>
                <div className="card-body d-flex justify-content-center align-items-center">
                  <canvas ref={pieChartRef} width="300" height="300"></canvas>
                </div>
              </div>
            </div>

            {/* Bar Chart Card */}
            <div className="col-md-8">
              <div className="card" style={{ height: "400px" }}>
                <div className="card-header">
                  <h3 className="card-title">Weekly Patients Trend</h3>
                </div>
                <div className="card-body">
                  <canvas ref={barChartRef} width="600" height="300"></canvas>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;

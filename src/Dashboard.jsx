import React, { useRef, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, PieController, BarController } from "chart.js";

// Register Chart.js components
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
  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);

  useEffect(() => {
    // Initialize the pie chart
    const initializePieChart = () => {
      const ctx = pieChartRef.current.getContext("2d");

      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }

      pieChartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Waiting", "Completed"],
          datasets: [
            {
              data: [60, 40],
              backgroundColor: ["#17a2b8", "#28a745"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    };

    // Initialize the bar chart
    const initializeBarChart = () => {
      const ctx = barChartRef.current.getContext("2d");

      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          datasets: [
            {
              label: "New Patients",
              data: [10, 15, 8, 12, 14, 18, 5],
              backgroundColor: "#17a2b8",
            },
            {
              label: "Completed Patients",
              data: [8, 12, 6, 10, 13, 15, 3],
              backgroundColor: "#28a745",
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            x: {
              title: {
                display: true,
                text: "Days of the Week",
              },
            },
            y: {
              title: {
                display: true,
                text: "Number of Patients",
              },
              beginAtZero: true,
            },
          },
        },
      });
    };

    initializePieChart();
    initializeBarChart();

    return () => {
      if (pieChartInstance.current) {
        pieChartInstance.current.destroy();
      }
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <h1 className="m-0">Welcome to SKP Clinic Admin</h1>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Widgets */}
            <div className="col-lg-3 col-6">
              <div className="small-box bg-info">
                <div className="inner">
                  <h3>10</h3>
                  <p>New Patients</p>
                </div>
                <div className="icon">
                  <i className="ion ion-person-add"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-success">
                <div className="inner">
                  <h3>5</h3>
                  <p>Completed</p>
                </div>
                <div className="icon">
                  <i className="ion ion-checkmark-circled"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-warning">
                <div className="inner">
                  <h3>3</h3>
                  <p>Pending Patients</p>
                </div>
                <div className="icon">
                  <i className="ion ion-alert-circled"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
            <div className="col-lg-3 col-6">
              <div className="small-box bg-secondary">
                <div className="inner">
                  <h3>15 min</h3>
                  <p>Average Waiting Time</p>
                </div>
                <div className="icon">
                  <i className="ion ion-clock"></i>
                </div>
                <a href="#" className="small-box-footer">
                  More info <i className="fas fa-arrow-circle-right"></i>
                </a>
              </div>
            </div>
          </div>

          <div className="row mt-4">
            {/* Pie Chart */}
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

            {/* Bar Chart */}
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

import React, { useState, useEffect, useRef } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title, PieController, BarController } from "chart.js";
import { db } from "./firebase-config"; // Firestore configuration

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

function AdminDashboard() {
  const [newPatients, setNewPatients] = useState(0);
  const [completedPatients, setCompletedPatients] = useState(0);
  const [pendingPatients, setPendingPatients] = useState(0);
  const [averageWaitTime, setAverageWaitTime] = useState("0 min");
  const [weekDates, setWeekDates] = useState([]);

  const pieChartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartInstance = useRef(null);
  const barChartInstance = useRef(null);

  const calculateWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const offset = (dayOfWeek === 0) ? -6 : 1 - dayOfWeek; // Start week on Monday
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + offset);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(`${date.toLocaleDateString()} (${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]})`);
    }
    setWeekDates(dates);
  };

  useEffect(() => {
    calculateWeekDates();
  }, []);

  const calculateAverageWaitingTime = (patients) => {
    const waitingTimes = patients
      .filter((p) => p.timeIn && p.timeOut)
      .map((p) => {
        try {
          const timeIn = new Date(`1970-01-01T${p.timeIn}`);
          const timeOut = new Date(`1970-01-01T${p.timeOut}`);
          return (timeOut - timeIn) / (60 * 1000);
        } catch {
          return null;
        }
      })
      .filter((time) => time !== null);

    if (waitingTimes.length === 0) return "0 min";

    const avg = waitingTimes.reduce((sum, time) => sum + time, 0) / waitingTimes.length;
    return `${Math.round(avg)} min`;
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "queue"), (snapshot) => {
      const patients = snapshot.docs.map((doc) => doc.data());

      // Debugging Firestore data
      console.log("Fetched Patients:", patients);

      const today = new Date();
      const todayPatients = patients.filter((p) => {
        const timestamp = p.timestamp.toDate();
        return (
          timestamp.getFullYear() === today.getFullYear() &&
          timestamp.getMonth() === today.getMonth() &&
          timestamp.getDate() === today.getDate()
        );
      });

      const weeklyData = Array(7).fill(0).map(() => ({ new: 0, completed: 0 }));

      patients.forEach((p) => {
        const timestamp = p.timestamp.toDate();
        let dayOfWeek = timestamp.getDay();
        dayOfWeek = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Shift Sunday to the end
        if (p.status === "Completed") {
          weeklyData[dayOfWeek].completed += 1;
        }
        weeklyData[dayOfWeek].new += 1;
      });
      

      //   if (p.status === "Completed") {
      //     weeklyData[dayOfWeek].completed += 1;
      //   }
      //   weeklyData[dayOfWeek].new += 1;
      // });

      setNewPatients(todayPatients.length);
      setCompletedPatients(todayPatients.filter((p) => p.status === "Completed").length);
      setPendingPatients(todayPatients.filter((p) => p.status === "Waiting").length);
      setAverageWaitTime(calculateAverageWaitingTime(todayPatients));

      if (barChartInstance.current) {
        barChartInstance.current.data.labels = weekDates;
        barChartInstance.current.data.datasets[0].data = weeklyData.map((d) => d.new);
        barChartInstance.current.data.datasets[1].data = weeklyData.map((d) => d.completed);
        barChartInstance.current.update();
      }

      if (pieChartInstance.current) {
        pieChartInstance.current.data.datasets[0].data = [
          pendingPatients || 0,
          completedPatients || 0,
        ];
        pieChartInstance.current.update();
      }
    });

    return () => unsubscribe();
  }, [weekDates, pendingPatients, completedPatients]);

  useEffect(() => {
    const initializePieChart = () => {
      const ctx = pieChartRef.current.getContext("2d");
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      pieChartInstance.current = new Chart(ctx, {
        type: "pie",
        data: {
          labels: ["Waiting", "Completed"],
          datasets: [
            {
              data: [pendingPatients, completedPatients],
              backgroundColor: ["#17a2b8", "#28a745"],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
          },
        },
      });
    };

    const initializeBarChart = () => {
      const ctx = barChartRef.current.getContext("2d");
      if (barChartInstance.current) barChartInstance.current.destroy();
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: weekDates,
          datasets: [
            {
              label: "New Patients",
              data: Array(7).fill(0),
              backgroundColor: "#17a2b8",
              categoryPercentage: 0.6,
              barPercentage: 0.8,
            },
            {
              label: "Completed Patients",
              data: Array(7).fill(0),
              backgroundColor: "#28a745",
              categoryPercentage: 0.6,
              barPercentage: 0.8,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "top" },
          },
          scales: {
            x: { title: { display: true, text: "Days of the Week" } },
            y: {
              title: { display: true, text: "Number of Patients" },
              beginAtZero: true,
              ticks: { stepSize: 1 },
            },
          },
        },
      });
    };

    initializePieChart();
    initializeBarChart();

    return () => {
      if (pieChartInstance.current) pieChartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
    };
  }, [pendingPatients, completedPatients, weekDates]);

 // chart
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
              <div className="icon">
                <i className="fas fa-user-plus"></i> {/* New Patient Icon */}
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
              <div className="icon">
                <i className="fas fa-check-circle"></i> {/* Completed Icon */}
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
              <div className="icon">
                <i className="fas fa-clock"></i> {/* Pending Icon */}
              </div>
            </div>
          </div>

          {/* Average Waiting Time Widget */}
          <div className="col-lg-3 col-6">
            <div className="small-box bg-secondary">
              <div className="inner">
                <h3>{averageWaitTime}</h3>
                <p>Average Waiting Time</p>
              </div>
              <div className="icon">
                <i className="fas fa-hourglass-half"></i> {/* Waiting Time Icon */}
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

export default AdminDashboard;


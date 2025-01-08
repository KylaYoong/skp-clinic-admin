import React, { useEffect, useState } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";
import "./TVQueueDisplay.css";

const TVQueueDisplay = () => {
  const [currentServing, setCurrentServing] = useState(null);
  const [upcomingPatients, setUpcomingPatients] = useState([]);
  const [completedPatients, setCompletedPatients] = useState([]);
  const [currentTime, setCurrentTime] = useState("");

  const announceQueueNumber = (queueNumber) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(`Now serving ${queueNumber}`);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const date = now.toLocaleDateString("en-GB");
      const time = now.toLocaleTimeString("en-US", { hour12: true });
      setCurrentTime(`${date} ${time}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const queueRef = collection(db, "queue");
    const q = query(queueRef, orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const patients = snapshot.docs.map((doc) => doc.data());
      const serving = patients.find((p) => p.status === "being attended");
      if (serving) announceQueueNumber(serving.queueNumber);
      setCurrentServing(serving || null);
      setUpcomingPatients(patients.filter((p) => p.status === "waiting"));
      setCompletedPatients(patients.filter((p) => p.status === "completed"));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="tv-display">
      <div className="header">
        <div className="date">{currentTime.split(" ")[0]}</div>
        <div className="time">{currentTime.split(" ").slice(1).join(" ")}</div>
      </div>
      <div className="main-container">
        <div className="horizontal-section">
          <div className="now-serving-horizontal">
            <h2>Now Serving</h2>
            <div className="queue-number">{currentServing?.queueNumber || "None"}</div>
          </div>
        </div>
        <div className="waiting-completed">
          <div className="waiting-left-side">
            <div className="section">
              <h2>Waiting</h2>
              {upcomingPatients.map((p) => (
                <div key={p.id} className="queue-item">{p.queueNumber}</div>
              ))}
            </div>
          </div>
          <div className="completed-section">
            <h2>Completed</h2>
            {completedPatients.map((p) => (
              <div key={p.id} className="completed-item">{p.queueNumber}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TVQueueDisplay;

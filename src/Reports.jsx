import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";
// import { fetchReportData } from "./reportUtils"; // Utility for querying Firestore
import { fieldMappings, fetchReportDataRealTime } from "./reportUtils";
import "./Reports.css"; // Custom styles for the Reports page

import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";


const Reports = () => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  const handleFieldChange = (event) => {
    const { value, checked } = event.target;
    setSelectedFields((prev) =>
      checked ? [...prev, value] : prev.filter((field) => field !== value)
    );
  };

  const generateReport = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (selectedFields.length === 0) {
      alert("Please select at least one field.");
      return;
    }
  
    try {
      // Stop previous listeners if any
      if (window.unsubscribeReport) {
        window.unsubscribeReport();
      }
  
      // Start listening for real-time updates
      window.unsubscribeReport = fetchReportDataRealTime(
        startDate,
        endDate,
        selectedFields,
        (data) => {
          if (data.length === 0) {
            alert("No data found for the selected criteria.");
          } else {
            setReportData(data);
            console.log("Real-time report data updated:", data);
          }
        }
      );
  
      alert("Real-time data sync started. Generating report!");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate the report. Please try again.");
    }
  };
  
  // Ensure cleanup on component unmount
  useEffect(() => {
    return () => {
      if (window.unsubscribeReport) {
        window.unsubscribeReport();
      }
    };
  }, []);


  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert("No data to export. Generate the report first.");
      return;
    }

    const doc = new jsPDF();
    const headers = selectedFields.map((field) => field.toUpperCase());
    const rows = reportData.map((item) =>
      selectedFields.map((field) => item[field] || "")
    );

    doc.text("Report", 10, 10);
    let y = 20;
    doc.text(headers.join(" | "), 10, y);
    y += 10;
    rows.forEach((row) => {
      doc.text(row.join(" | "), 10, y);
      y += 10;
    });
    doc.save("report.pdf");
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert("No data to export. Generate the report first.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };
  



  return (
    <div className="report-container">
      <h2>Generate Report</h2>
      <div className="field-selection">

        <label>
          <input
            type="checkbox"
            value="emp ID"
            onChange={handleFieldChange}
          />{" "}
          Emp ID
        </label>

        <label>
          <input
            type="checkbox"
            value="department"
            onChange={handleFieldChange}
          />{" "}
          Department
        </label>

        <label>
          <input
            type="checkbox"
            value="name"
            onChange={handleFieldChange}
          />{" "}
          Name
        </label>

        <label>
          <input
            type="checkbox"
            value="diagnosis"
            // value="consultationData.diagnosis"
            onChange={handleFieldChange}
          />{" "}
          Diagnosis
        </label>

        <label>
          <input
            type="checkbox"
            value="medicines"
            onChange={handleFieldChange}
          />{" "}
          Medicine
        </label>

        <label>
          <input
            type="checkbox"
            value="amount"
            // value="consultationData.amount"
            onChange={handleFieldChange}
          />{" "}
          Amount
        </label>

        <label>
          <input
            type="checkbox"
            value="MC"
            // value="consultationData.mc"
            onChange={handleFieldChange}
          />{" "}
          MC?
        </label>

      </div>

      <div className="date-range">
        <label>
          Start Date:{" "}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </label>
        <label>
          End Date:{" "}
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </label>
      </div>
      
      <div className="report-actions">
        <button onClick={generateReport}>Generate Report</button>
        <div className="export-buttons">
            <button onClick={exportToPDF}>Export as PDF</button>
            <button onClick={exportToExcel}>Export as Excel</button>
        </div>
      </div>

      <div className="report-preview">
        <h3>Report Preview</h3>
        <table>
          <thead>
            <tr>
              {selectedFields.map((field, index) => (
                <th key={index}>{field.toUpperCase()}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, index) => (
              <tr key={index}>
                {selectedFields.map((field, subIndex) => (
                  <td key={subIndex}>{row[field]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;

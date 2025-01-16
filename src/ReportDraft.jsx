import React, { useState } from "react";
import { fetchReportData } from "./reportUtils"; // Utility for querying Firestore
import "./Reports.css"; // Custom styles for the Reports page
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";


const Reports = () => {
  // State for selected fields and date range
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

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
      return;
    }
    if (selectedFields.length === 0) {
      alert("Please select at least one field.");
      return;
    }

    try {
      const data = await fetchReportData(startDate, endDate, selectedFields);
      setReportData(data);
      alert("Report generated! Data is ready for export.");
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate the report. Please try again.");
    }
  };

  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert("No data to export. Generate the report first.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Report", 10, 10);

    // Add table data to PDF
    const headers = selectedFields.map((field) => field.toUpperCase());
    const rows = reportData.map((item) =>
      selectedFields.map((field) => item[field] || "")
    );

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
            onChange={handleFieldChange}
          />{" "}
          Amount
        </label>

        <label>
          <input
            type="checkbox"
            value="MC"
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





// old
import React, { useState, useEffect } from "react";
import { fieldMappings, fetchReportDataRealTime } from "./reportUtils";
import "./Reports.css";
import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";

const Reports = () => {
  const [selectedFields, setSelectedFields] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportData, setReportData] = useState([]);

  // Field display names mapping
  const fieldDisplayNames = {
    name: "Name",
    department: "Department",
    "consultationData.diagnosis": "Diagnosis",
    "consultationData.medicines": "Medicine",
    "consultationData.amount": "Amount",
    "consultationData.mc": "MC?",
  };

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
      if (window.unsubscribeReport) {
        window.unsubscribeReport();
      }
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
    const headers = selectedFields.map(
      (field) => fieldDisplayNames[field] || field.toUpperCase()
    );
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
        {Object.keys(fieldMappings).map((key) => (
          <label key={key}>
            <input
              type="checkbox"
              value={fieldMappings[key]}
              onChange={handleFieldChange}
            />{" "}
            {fieldDisplayNames[fieldMappings[key]] || key}
          </label>
        ))}
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
                <th key={index}>
                  {fieldDisplayNames[field] || field.toUpperCase()}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {selectedFields.map((field, colIndex) => (
                  <td key={colIndex}>{row[field]}</td>
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

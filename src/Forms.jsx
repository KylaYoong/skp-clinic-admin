import React, { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "./firebase-config";


function Forms() {
  const [patientData, setPatientData] = useState({
    employeeID: "",
    name: "",
    gender: "",
    dob: "",
    department: "",
  });

  const [queueData, setQueueData] = useState({
    patientID: "",
  });

  const [departments, setDepartments] = useState(["HR", "IT", "SCM"]);
  const [newDepartment, setNewDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle input changes for patient form
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input changes for queue form
  const handleQueueInputChange = (e) => {
    const { name, value } = e.target;
    setQueueData((prev) => ({ ...prev, [name]: value }));
  };

  // Add new department
  const addDepartment = () => {
    if (newDepartment && !departments.includes(newDepartment)) {
      setDepartments((prev) => [...prev, newDepartment]);
      setNewDepartment("");
      alert("New department added successfully!");
    } else {
      alert("Please enter a valid and unique department name.");
    }
  };

  // Submit patient data to Firestore
  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!patientData.employeeID || !patientData.name || !patientData.gender || !patientData.dob || !patientData.department) {
        alert("Please fill in all required fields!");
        return;
      }

      await addDoc(collection(db, "employees"), {
        ...patientData,
        timestamp: new Date(),
      });
      alert("Patient registered successfully!");
      setPatientData({
        employeeID: "",
        name: "",
        gender: "",
        dob: "",
        department: "",
      });
    } catch (error) {
      console.error("Error adding patient data:", error);
      alert("Error registering patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit queue data to Firestore
  const handleQueueSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const employeeQuery = query(collection(db, "employees"), where("employeeID", "==", queueData.patientID));
      const employeeSnapshot = await getDocs(employeeQuery);

      if (employeeSnapshot.empty) {
        alert("Patient ID not found in employees collection. Please register the patient first.");
        return;
      }

      await addDoc(collection(db, "queue"), {
        patientID: queueData.patientID,
        status: "waiting",
        timestamp: new Date(),
      });
      alert("Queue data added successfully!");
      setQueueData({
        patientID: "",
      });
    } catch (error) {
      console.error("Error adding queue data:", error);
      alert("Error adding to queue. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          <h1 className="m-0">Forms</h1>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="row">
            {/* Register Patient Form */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Register Patient</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handlePatientSubmit}>
                    <div className="mb-3">
                      <label htmlFor="employeeID" className="form-label">
                        Employee ID
                      </label>
                      <input
                        type="text"
                        id="employeeID"
                        name="employeeID"
                        className="form-control"
                        value={patientData.employeeID}
                        onChange={handlePatientInputChange}
                        placeholder="Enter Employee ID"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        value={patientData.name}
                        onChange={handlePatientInputChange}
                        placeholder="Enter Name"
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Gender</label>
                      <div>
                        <input
                          type="radio"
                          id="male"
                          name="gender"
                          value="male"
                          checked={patientData.gender === "male"}
                          onChange={handlePatientInputChange}
                          required
                        />
                        <label htmlFor="male" className="ms-2 me-4">
                          Male
                        </label>
                        <input
                          type="radio"
                          id="female"
                          name="gender"
                          value="female"
                          checked={patientData.gender === "female"}
                          onChange={handlePatientInputChange}
                          required
                        />
                        <label htmlFor="female" className="ms-2">Female</label>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label htmlFor="dob" className="form-label">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        id="dob"
                        name="dob"
                        className="form-control"
                        value={patientData.dob}
                        onChange={handlePatientInputChange}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label htmlFor="department" className="form-label">
                        Department
                      </label>
                      <select
                        id="department"
                        name="department"
                        className="form-control"
                        value={patientData.department}
                        onChange={handlePatientInputChange}
                        required
                      >
                        <option value="">Select</option>
                        {departments.map((dept, index) => (
                          <option key={index} value={dept}>
                            {dept}
                          </option>
                        ))}
                      </select>
                      <div className="mt-2 d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control me-2"
                          value={newDepartment}
                          onChange={(e) => setNewDepartment(e.target.value)}
                          placeholder="Add new department"
                        />
                        <button type="button" className="btn btn-secondary" onClick={addDepartment}>
                          +
                        </button>
                      </div>
                    </div>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Queue Data Input Form */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Queue Data Input</h3>
                </div>
                <div className="card-body">
                  <form onSubmit={handleQueueSubmit}>
                    <div className="mb-3">
                      <label htmlFor="patientID" className="form-label">
                        Patient ID
                      </label>
                      <input
                        type="text"
                        id="patientID"
                        name="patientID"
                        className="form-control"
                        value={queueData.patientID}
                        onChange={handleQueueInputChange}
                        placeholder="Enter Patient ID"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? "Submitting..." : "Add to Queue"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Forms;

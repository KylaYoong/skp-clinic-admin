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

  // const [queueData, setQueueData] = useState({
  //   patientID: "",
  // });

  // Initialize state to store departments fetched from Firestore
  const [departments, setDepartments] = useState([]);
  // Initialize state to hold the value of a new department being added
  const [newDepartment, setNewDepartment] = useState("");

  const [loading, setLoading] = useState(false);

  // Function to fetch all departments from Firestore
  const fetchDepartments = async () => {
    try {
      // Retrieve all documents from the "departments" collection in Firestore
      const snapshot = await getDocs(collection(db, "departments"));
      // Map through the documents and create an array of objects with id and name
      const deptData = snapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        name: doc.data().name, // Name field from Firestore document
      }));
      // Update the state with the fetched department data
      setDepartments(deptData);
    } catch (error) {
      // Log any error that occurs during fetching
      console.error("Error fetching departments:", error);
    }
  };
  
  // useEffect to fetch departments when the component mounts
  useEffect(() => {
    fetchDepartments(); // Call the fetchDepartments function
  }, []); // Empty dependency array ensures this runs only once on component mount

  // Function to add a new department to Firestore
  const addDepartment = async () => {
    if (newDepartment.trim() === "") {
      alert("Please enter a valid department name.");
      return;
    }
  
    if (departments.some((dept) => dept.name === newDepartment.trim())) {
      alert("This department already exists.");
      return;
    }
  
    try {
      // Attempt to add the new department to Firestore
      const newDeptDoc = await addDoc(collection(db, "departments"), {
        name: newDepartment.trim(),
      });
  
      setDepartments((prev) => [
        ...prev,
        { id: newDeptDoc.id, name: newDepartment.trim() },
      ]);
  
      setNewDepartment("");
      alert("New department added successfully!");
    } catch (error) {
      console.error("Error adding department:", error.message);
      alert(`Failed to add department: ${error.message}`);
    }
  };
  
  
  
  // Function to delete a department from Firestore
  const deleteDepartment = async (id) => {
    try {
      // Delete the department document from the "departments" collection
      await deleteDoc(doc(db, "departments", id));
      // Update the state by removing the deleted department from the list
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
      alert("Department deleted successfully!"); // Notify the user
    } catch (error) {
      // Log any error that occurs during deletion
      console.error("Error deleting department:", error);
    }
  };

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

  // Add new department
  // const addDepartment = () => {
  //   if (newDepartment && !departments.includes(newDepartment)) {
  //     setDepartments((prev) => [...prev, newDepartment]);
  //     setNewDepartment("");
  //     alert("New department added successfully!");
  //   } else {
  //     alert("Please enter a valid and unique department name.");
  //   }
  // };

  // Add a deleteDepartment function
  // const deleteDepartment = (departmentToDelete) => {
  //   setDepartments((prev) => prev.filter((dept) => dept !== departmentToDelete));
  //   alert(`Department "${departmentToDelete}" deleted successfully!`);
  // };



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
                        {departments.map((dept) => (
                          <option key={dept.id} value={dept.name}>
                            {dept.name}
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
                        <button onClick={addDepartment} className="btn-add">
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


            {/* Delete Departments */}
            <div className="col-md-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Manage Departments</h3>
                </div>
                <div className="card-body">
                <ul className="list-group">
                  {departments.map((dept) => (
                    <li key={dept.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {dept.name}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => deleteDepartment(dept.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>

                </div>
              </div>
            </div>  {/* End of Delete Departments */}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Forms;
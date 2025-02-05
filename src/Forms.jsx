import React, { useState, useEffect } from "react";
import { collection, addDoc, deleteDoc, getDocs, query, where, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase-config";
import * as XLSX from "xlsx";

function Forms() {
  const [patientData, setPatientData] = useState({
    employeeID: "",
    name: "",
    gender: "",
    dob: "",
    icPassport: "",
    nationality: "",
    department: "",
    company: "",
  });

  const [departments, setDepartments] = useState([]);  // Initialize state to store departments fetched from Firestore
  const [newDepartment, setNewDepartment] = useState("");  // Initialize state to hold the value of a new department being added

  const [nationalities, setNationalities] = useState([]);
  const [newNationality, setNewNationality] = useState("");

  const companies = ["SKPJB", "SKPBM", "SKPBP"];

  // manage and track the loading state of the application, 
  // specifically during asynchronous operations like form submissions or data fetching
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null); // State for the uploaded Excel file

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
      // Reference the specific document in the "departments" collection
      const departmentDoc = doc(db, "departments", id);
  
      // Delete the department document
      await deleteDoc(departmentDoc);
  
      // Update the state by removing the deleted department from the list
      setDepartments((prev) => prev.filter((dept) => dept.id !== id));
  
      alert("Department deleted successfully!");
    } catch (error) {
      console.error("Error deleting department:", error.message);
      alert(`Failed to delete department: ${error.message}`);
    }
  };
  

  // Function to fetch all nationalities from Firestore
  const fetchNationalities = async () => {
    try {
      // Retrieve all documents from the "nationalities" collection in Firestore
      const snapshot = await getDocs(collection(db, "nationalities"));
      // Map through the documents and create an array of objects with id and name
      const nationalityData = snapshot.docs.map((doc) => ({
        id: doc.id, // Firestore document ID
        name: doc.data().name, // Name field from Firestore document
      }));
      // Update the state with the fetched nationality data
      setNationalities(nationalityData);
    } catch (error) {
      // Log any error that occurs during fetching
      console.error("Error fetching nationalities:", error);
    }
  };


  // Function to add a new nationalit to Firestore
  const addNationality = async () => {
    if (newNationality.trim() === "") {
      alert("Please enter a valid nationality.");
      return;
    }
  
    if (nationalities.some((natl) => natl.name === newNationality.trim())) {
      alert("This nationality already exists.");
      return;
    }
  
    try {
      // Attempt to add the new nationalit to Firestore
      const newNationalityDoc = await addDoc(collection(db, "nationalities"), {
        name: newNationality.trim(),
      });
  
      setNationalities((prev) => [
        ...prev,
        { id: newNationalityDoc.id, name: newNationality.trim() },
      ]);
  
      setNewNationality("");
      alert("New nationality added successfully!");
    } catch (error) {
      console.error("Error adding nationality:", error.message);
      alert(`Failed to add nationality: ${error.message}`);
    }
  };
    
  // Function to delete a nationality from Firestore
  const deleteNationality = async (id) => {
    try {
      // Delete the nationality document from the "nationalities" collection
      await deleteDoc(doc(db, "nationalities", id));
      // Update the state by removing the deleted department from the list
      setNationalities((prev) => prev.filter((natl) => natl.id !== id));
      alert("Nationality deleted successfully!"); // Notify the user
    } catch (error) {
      // Log any error that occurs during deletion
      console.error("Error deleting nationality:", error);
    }
  };

  // Handle input changes for patient form
  const handlePatientInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle input changes for queue form
  // const handleQueueInputChange = (e) => {
  //   const { name, value } = e.target;
  //   setQueueData((prev) => ({ ...prev, [name]: value }));
  // };


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
        icPassport: "",
        nationality: "",
        department: "",
        company: "",
      });
    } catch (error) {
      console.error("Error adding patient data:", error);
      alert("Error registering patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect to fetch departments when the component mounts
  useEffect(() => {
    fetchDepartments();
    fetchNationalities();
  }, []);  // Empty dependency array ensures this runs only once on component mount


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

  // Function to handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]); // Store file in state
  };

  const importExcel = async () => {
    if (!file) {
      alert("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onload = async (e) => {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, { range: 1 });

        // Firestore batch operation
        const batch = writeBatch(db);

        data.forEach((row) => {
          const docRef = doc(collection(db, "employees"));
          batch.set(docRef, {
            employeeID: row["Emp ID"] || "",
            name: row["Name"] || "",
            gender: row["Gender"] || "",
            race: row["Race"] || "",
            icPassport: row["NRIC No."] || "",
            passportNo: row["Passport No."] || "",
            nationality: row["Nationality"] || "",
            department: row["Department"] || "",
            base: row["Base"] || "",
            company: row["Company"] || "",
            timestamp: new Date(),
          });
        });

        // Commit batch operation
        await batch.commit();
        console.log("Data imported successfully:", data); // ✅ Debugging step
        alert("Data imported successfully!");
      };
    } catch (error) {
      console.error("Error importing Excel file:", error);
      alert("Error processing file.");
    } finally {
      setLoading(false);
    }
  };

 

  return (
    <div className="forms">
    <div className="content-wrapper">
      <div className="content-header">
        <div className="container-fluid">
          {/* <h1 className="m-0">Forms</h1> */}
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

                    {/* Employee ID */}
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

                    {/* Name */}
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

                    {/* Gender */}
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

                    {/* Date of Birth */}
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

                    {/* IC/Passport No. */}
                    <div className="mb-3">
                      <label htmlFor="icPassport" className="form-label">
                        IC/Passport No.
                      </label>
                      <input
                        type="text"
                        id="icPassport"
                        name="icPassport"
                        className="form-control"
                        value={patientData.icPassport}
                        onChange={handlePatientInputChange}
                        placeholder="Enter IC/Passport No."
                      />
                    </div>

                    {/* Nationality dropdown */}
                    <div className="mb-3">
                      <label htmlFor="nationality" className="form-label">
                        Nationality
                      </label>
                      <select
                        id="nationality"
                        name="nationality"
                        className="form-control"
                        value={patientData.nationality}
                        onChange={handlePatientInputChange}
                      >
                        <option value="">Select</option>
                        {nationalities.map((natl) => (
                          <option key={natl.id} value={natl.name}>
                            {natl.name}
                          </option>
                        ))}
                      </select>

                      <div className="mt-2 d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control me-2"
                          value={newNationality}
                          onChange={(e) => setNewNationality(e.target.value)}
                          placeholder="Add new nationality"
                        />
                        <button
                          type="button"
                          onClick={addNationality}
                          className="btn-add"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Department */}
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
                        <button
                          type="button"
                          onClick={addDepartment}
                          className="btn-add"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Company */}
                    <div className="mb-3">
                      <label htmlFor="company" className="form-label">
                        Company
                      </label>
                      <select
                        id="company"
                        name="company"
                        className="form-control"
                        value={patientData.company}
                        onChange={handlePatientInputChange}
                      >
                        <option value="">Select</option>
                        {companies.map((company, index) => (
                          <option key={index} value={company}>
                            {company}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </form>
                </div>
              </div>
            </div>  {/* End of Register Patient Form */}


            {/* Delete Departments */}
            {/* <div className="col-md-6">
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
            </div>   */}
            {/* End of Delete Departments */}


            {/* Excel File Upload Section */}
            {/* <div className="col-md-6">
            <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Import Excel File - Employee Data</h3>
                </div>
                <div className="card-body">
                <ul className="list-group">
                  {departments.map((dept) => (
                    <li key={dept.id} className="list-group-item d-flex justify-content-between align-items-center">
                      {dept.name}
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => importexcel(dept.id)}
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
                </div>
              </div>
            </div> */}

            <div className="col-md-6">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Import Excel File - Employee Data</h3>
                  </div>
                  <div className="card-body">
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      className="form-control mb-2"
                      onChange={handleFileChange}
                    />
                    <button
                      className="btn btn-primary"
                      onClick={importExcel}
                      disabled={loading}
                    >
                      {loading ? "Importing..." : "Import Data"}
                    </button>
                  </div>
                </div>
              </div>


          </div>
        </div>
      </section>
    </div>
  </div>
  );
} 


export default Forms;
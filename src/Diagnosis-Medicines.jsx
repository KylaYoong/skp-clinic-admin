import React, { useState, useEffect } from "react";
import { db } from "./firebase-config"; // Your Firebase config
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
} from "firebase/firestore";
import "./Diagnosis-Medicines.css";


function DiagnosisMedicines() {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [medicines, setMedicines] = useState([]);
  const [newMedicine, setNewMedicine] = useState("");

  const toggleSidebar = () => {
    setIsSidebarExpanded((prev) => !prev);
  };

  const fetchMedicines = async () => {
    const medicinesSnapshot = await getDocs(collection(db, "medicines"));
    const medicinesData = medicinesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setMedicines(medicinesData);
  };

  const addMedicine = async () => {
    if (!newMedicine) return;
    await addDoc(collection(db, "medicines"), { name: newMedicine });
    setNewMedicine("");
    fetchMedicines();
  };

  const updateMedicine = async (id, name) => {
    const medicineDoc = doc(db, "medicines", id);
    await updateDoc(medicineDoc, { name });
    fetchMedicines();
  };

  const deleteMedicine = async (id) => {
    const medicineDoc = doc(db, "medicines", id);
    await deleteDoc(medicineDoc);
    fetchMedicines();
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="manage-medicines-container">
      <h1>Manage Medicines</h1>
      <div>
        <input
          type="text"
          placeholder="New Medicine"
          value={newMedicine}
          onChange={(e) => setNewMedicine(e.target.value)}
        />
        <button onClick={addMedicine}>Add Medicine</button>
      </div>
      <ul className="manage-medicines-list">
        {medicines.map((medicine) => (
          <li key={medicine.id}>
            <input
              type="text"
              value={medicine.name}
              onChange={(e) => updateMedicine(medicine.id, e.target.value)}
            />
            <button onClick={() => deleteMedicine(medicine.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
  
}

export default DiagnosisMedicines;

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";

// Field mappings
export const fieldMappings = {
  "emp ID": "employeeID",
  department: "department",
  name: "name",
  diagnosis: "consultationData.diagnosis",
  medicine: "consultationData.medicines",
  amount: "consultationData.amount",
  mc: "consultationData.mc",
};

export function fetchReportDataRealTime(startDate, endDate, selectedFields, callback) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const q = query(
    collection(db, "queue"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end)
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map((doc) => {
      const record = doc.data();
      const filteredRecord = {};

      selectedFields.forEach((field) => {
        const dbField = fieldMappings[field] || field; // Map to Firestore field
        if (dbField.includes(".")) {
          const [nestedField, subField] = dbField.split(".");
          const value = record[nestedField]?.[subField] || "";
          filteredRecord[field] = field === "amount" ? Number(value) || 0 : value; // Convert 'amount' to number
        } else {
          const value = record[dbField] || "";
          filteredRecord[field] = field === "amount" ? Number(value) || 0 : value; // Convert 'amount' to number
        }
      });

      return filteredRecord;
    });

    callback(data); // Pass the filtered data to the callback
  });

  return unsubscribe; // Return the unsubscribe function
}

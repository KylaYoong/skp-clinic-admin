import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./firebase-config";

// Maps user-friendly field names to Firestore document field names. 
// Nested fields are represented with dot notation for accessing deeper object structures.
export const fieldMappings = {
  "emp ID": "employeeID",
  department: "department",
  name: "name",
  diagnosis: "consultationData.diagnosis",
  medicine: "consultationData.medicines",
  amount: "consultationData.amount",
  mc: "consultationData.mc",
};

// Main function to fetch data in real-time from Firestore based on provided dates and selected fields
export function fetchReportDataRealTime(startDate, endDate, selectedFields, callback) {
  // Converts date strings into Date objects for querying Firestore
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Creates a Firestore query for documents in the queue collection within the specified date range.
  const q = query(
    collection(db, "queue"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end)
  );

  // Sets up a real-time listener for the query. Updates are pushed to the callback when data changes.
  const unsubscribe = onSnapshot(q, (snapshot) => {
    // Iterates over the documents returned by the query. Extracts and filters data based on selectedFields.
    const data = snapshot.docs.map((doc) => {
      const record = doc.data();
      const filteredRecord = {};

      // For each selected field, maps it to the corresponding Firestore field using fieldMappings.
      // Handles nested fields using dot notation
      selectedFields.forEach((field) => {
        const dbField = fieldMappings[field] || field; // Map to Firestore field
        if (dbField.includes(".")) {
          const [nestedField, subField] = dbField.split(".");
          const value = record[nestedField]?.[subField] || "";
          // Converts the amount field to a number
          filteredRecord[field] = field === "amount" ? Number(value) || 0 : value; // Convert 'amount' to number
        } else {
          const value = record[dbField] || "";
          filteredRecord[field] = field === "amount" ? Number(value) || 0 : value; // Convert 'amount' to number
        }
      });

      return filteredRecord;  // Returns the filtered and formatted record for each document
    });

    callback(data); // Passes the processed data to the provided callback function
  });

  return unsubscribe; // Return the unsubscribe function
}
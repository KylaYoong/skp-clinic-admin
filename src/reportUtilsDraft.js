import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

// Maps user-friendly field names to Firestore document field names
export const fieldMappings = {
  "Emp ID": "employeeID",
  department: "department",
  name: "name",
  diagnosis: "consultationData.diagnosis",
  medicine: "consultationData.medicines",
  amount: "consultationData.amount",
  mc: "consultationData.mc",
};

// Fetch report data in real-time
export async function fetchReportDataRealTime(startDate, endDate, selectedFields, callback) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const q = query(
    collection(db, "queue"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const record = doc.data();
        const filteredRecord = {};

        selectedFields.forEach((field) => {
          const dbField = field;
          if (dbField.includes(".")) {
            const [nestedField, subField] = dbField.split(".");
            const value = record[nestedField]?.[subField] || "";
  
            // Handle arrays (e.g., diagnosis or medicines)
            if (Array.isArray(record[nestedField])) {
              filteredRecord[field] = record[nestedField]
                .map((item) => item[subField] || "")
                .join(", ");
            } else {
              filteredRecord[field] = field === "amount" ? Number(value) || 0 : value;
            }
          } else {
            const value = record[dbField] || "";
            filteredRecord[field] = field === "amount" ? Number(value) || 0 : value;
          }
        });
        
        // Fetch the name and department fields from the employees collection
        if ((selectedFields.includes("name") || selectedFields.includes("department")) && record.employeeID) {
          const empQuery = query(
            collection(db, "employees"),
            where("employeeID", "==", record.employeeID)
          );
          const empSnapshot = await getDocs(empQuery);
          empSnapshot.forEach((empDoc) => {
            const employeeData = empDoc.data();
            record.name = selectedFields.includes("name") ? employeeData.name || "" : record.name;
            record.department = selectedFields.includes("department") ? employeeData.department || "" : record.department;
          });
        }

        selectedFields.forEach((field) => {
          const dbField = field;
          if (dbField.includes(".")) {
            const [nestedField, subField] = dbField.split(".");
            const value = record[nestedField]?.[subField] || "";
            filteredRecord[field] = field === "amount" ? Number(value) || 0 : value;
          } else {
            const value = record[dbField] || "";
            filteredRecord[field] = field === "amount" ? Number(value) || 0 : value;
          }
        });

        return filteredRecord;
      })
    );

    callback(data);
  });

  return unsubscribe;
}



// olddd
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

// Maps user-friendly field names to Firestore document field names
export const fieldMappings = {
  "Emp ID": "employeeID",
  department: "department",
  name: "name",
  diagnosis: "consultationData.diagnosis",
  medicine: "consultationData.medicines",
  amount: "consultationData.amount",
  mc: "consultationData.mc",
};

// Fetch report data in real-time
export async function fetchReportDataRealTime(startDate, endDate, selectedFields, callback) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const q = query(
    collection(db, "queue"),
    where("timestamp", ">=", start),
    where("timestamp", "<=", end)
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    const data = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const record = doc.data();
        const filteredRecord = {};

        selectedFields.forEach((field) => {
          const dbField = field;
          if (dbField.includes(".")) {
            const [nestedField, subField] = dbField.split(".");
            const value = record[nestedField]?.[subField] || "";

            // Handle arrays for fields like diagnosis and medicines
            if (Array.isArray(record[nestedField])) {
              filteredRecord[field] = record[nestedField]
                .map((item) => item[subField] || "")
                .join(", ");
            } else {
              filteredRecord[field] = value;
            }
          } else {
            const value = record[dbField] || "";
            filteredRecord[field] = value;
          }
        });

        return filteredRecord;
      })
    );

    callback(data);
  });

  return unsubscribe;
}
import { collection, query, where, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

export const fieldMappings = {
  "Emp ID": "employeeID",
  department: "department",
  name: "name",
  diagnosis: "consultationData.diagnosis",
  medicine: "consultationData.medicines",
  amount: "consultationData.amount",
  mc: "consultationData.mc",
};

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

        // Handle employee data if needed
        if ((selectedFields.includes("name") || selectedFields.includes("department")) && record.employeeID) {
          const empQuery = query(
            collection(db, "employees"),
            where("employeeID", "==", record.employeeID)
          );
          const empSnapshot = await getDocs(empQuery);
          if (!empSnapshot.empty) {
            const employeeData = empSnapshot.docs[0].data();
            record.name = employeeData.name || "";
            record.department = employeeData.department || "";
          }
        }

        // Handle all selected fields
        for (const field of selectedFields) {
          if (field.includes(".")) {
            const [nestedField, subField] = field.split(".");
            const nestedValue = record[nestedField];

            if (nestedField === "consultationData") {
              if (subField === "diagnosis" || subField === "medicines") {
                // Handle diagnosis and medicines specifically
                if (nestedValue && Array.isArray(nestedValue[subField])) {
                  // If it's an array of strings
                  if (typeof nestedValue[subField][0] === 'string') {
                    filteredRecord[field] = nestedValue[subField].join(", ");
                  }
                  // If it's an array of objects with a name or value property
                  else if (typeof nestedValue[subField][0] === 'object') {
                    filteredRecord[field] = nestedValue[subField]
                      .map(item => item.name || item.value || "")
                      .filter(Boolean)
                      .join(", ");
                  }
                } else {
                  filteredRecord[field] = "";
                }
              } else {
                // Handle other consultationData fields
                filteredRecord[field] = nestedValue?.[subField]?.toString() || "";
              }
            }
          } else {
            // Handle regular fields
            filteredRecord[field] = record[field]?.toString() || "";
          }
        }

        return filteredRecord;
      })
    );

    callback(data);
  });

  return unsubscribe;
}
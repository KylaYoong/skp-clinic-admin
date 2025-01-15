import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase-config";

export async function fetchReportData(startDate, endDate, selectedFields) {
  const q = query(
    collection(db, "queue"),
    where("date", ">=", new Date(startDate)),
    where("date", "<=", new Date(endDate))
  );

  const snapshot = await getDocs(q);
  const data = [];
  snapshot.forEach((doc) => {
    const record = doc.data();
    const filteredRecord = {};
    selectedFields.forEach((field) => {
      filteredRecord[field] = record[field];
    });
    data.push(filteredRecord);
  });
  return data;
}

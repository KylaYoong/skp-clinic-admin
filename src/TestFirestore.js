import React, { useEffect } from "react";
import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase-config";

function TestFirestore() {
  useEffect(() => {
    async function testFirestore() {
      try {
        await addDoc(collection(db, "employees"), {
          testField: "This is a test",
          timestamp: new Date(),
        });
        console.log("Test document added successfully!");
      } catch (error) {
        console.error("Error adding test document:", error);
      }
    }

    testFirestore();
  }, []);

  return <div>Testing Firestore... Check the console for results.</div>;
}

export default TestFirestore;

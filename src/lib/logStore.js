import { addDoc, collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "./firebase";

export function subscribeUserLogs(userId, onData, onError) {
  const logsRef = collection(db, "users", userId, "logs");
  const logsQuery = query(logsRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    logsQuery,
    (snapshot) => {
      const rows = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      onData(rows);
    },
    (error) => {
      if (onError) {
        onError(error);
      }
    },
  );
}

export async function addUserLog(userId, payload) {
  const logsRef = collection(db, "users", userId, "logs");
  await addDoc(logsRef, {
    ...payload,
    createdAt: payload.createdAt || new Date().toISOString(),
  });
}

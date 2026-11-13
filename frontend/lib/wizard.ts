import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";

export async function saveWizard(projectId: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, "projects", projectId), { ...data, updatedAt: serverTimestamp() });
}
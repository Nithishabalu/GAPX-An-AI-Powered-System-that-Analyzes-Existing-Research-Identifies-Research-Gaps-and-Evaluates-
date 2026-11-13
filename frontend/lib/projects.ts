import {
  collection, doc, getDoc, getDocs, query, where,
  runTransaction, serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type Project = {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  createdAt?: { toDate: () => Date };
};

// Creates GAPX-<year>-<001, 002, ...> using a counter document
export async function createProject(ownerId: string, title: string, description: string) {
  const year = new Date().getFullYear();
  const counterRef = doc(db, "counters", String(year));

  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const next = (snap.exists() ? (snap.data().count as number) : 0) + 1;
    const id = `GAPX-${year}-${String(next).padStart(3, "0")}`;
    tx.set(counterRef, { count: next });
    tx.set(doc(db, "projects", id), {
      title,
      description,
      ownerId,
      status: "created",
      createdAt: serverTimestamp(),
    });
    return id;
  });
}

export async function listProjects(ownerId: string): Promise<Project[]> {
  const q = query(collection(db, "projects"), where("ownerId", "==", ownerId));
  const snap = await getDocs(q);
  const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, "id">) }));
  return items.sort((a, b) => (b.createdAt?.toDate().getTime() ?? 0) - (a.createdAt?.toDate().getTime() ?? 0));
}

export async function getProject(id: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, "projects", id));
  return snap.exists() ? ({ id: snap.id, ...(snap.data() as Omit<Project, "id">) }) : null;
}
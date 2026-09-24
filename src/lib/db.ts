import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  type CollectionReference,
  type DocumentData,
  type QueryConstraint,
  type WithFieldValue,
} from "firebase/firestore";
import { db } from "./firebase";
import { nowIso } from "./utils";

export const COL = {
  users: "users",
  genesis: "genesis",
  settings: "settings",
  news: "news",
  events: "events",
  projects: "projects",
  opportunities: "opportunities",
  resources: "resources",
  executives: "executives",
  divisions: "divisions",
  committees: "committees",
  achievements: "achievements",
  gallery: "gallery",
  showcase: "showcase",
  alumni: "alumni",
  contacts: "contacts",
  elections: "elections",
  positions: "positions",
  candidates: "candidates",
  votes: "votes",
  fees: "fees",
} as const;

export type CollectionName = (typeof COL)[keyof typeof COL];

export function col(name: CollectionName): CollectionReference<DocumentData> {
  return collection(db(), name);
}

export function ref(name: CollectionName, id: string) {
  return doc(db(), name, id);
}

export async function createDoc<T extends DocumentData>(
  name: CollectionName,
  data: WithFieldValue<T>,
): Promise<string> {
  const docRef = await addDoc(col(name), data);
  return docRef.id;
}

/** Create with a deterministic id (used for votes & fee records to enforce uniqueness). */
export async function setDocAt<T extends DocumentData>(
  name: CollectionName,
  id: string,
  data: WithFieldValue<T>,
): Promise<void> {
  await setDoc(ref(name, id), data);
}

export async function updateDocAt(
  name: CollectionName,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(ref(name, id), { ...data, updatedAt: nowIso() });
}

export async function updateDocRaw(
  name: CollectionName,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  await updateDoc(ref(name, id), data);
}

export async function deleteDocAt(name: CollectionName, id: string): Promise<void> {
  await deleteDoc(ref(name, id));
}

export async function fetchAll<T>(
  name: CollectionName,
  constraints: QueryConstraint[] = [],
): Promise<T[]> {
  const snap = await getDocs(query(col(name), ...constraints));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

export async function fetchOne<T>(name: CollectionName, id: string): Promise<T | null> {
  const snap = await getDoc(ref(name, id));
  return snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null;
}

export async function fetchPublished<T extends { published: boolean }>(
  name: CollectionName,
  extra: QueryConstraint[] = [],
): Promise<T[]> {
  return fetchAll<T>(name, [where("published", "==", true), ...extra]);
}

export async function fetchLatest<T>(name: CollectionName, count: number): Promise<T[]> {
  const snap = await getDocs(query(col(name), orderBy("createdAt", "desc"), limit(count)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T);
}

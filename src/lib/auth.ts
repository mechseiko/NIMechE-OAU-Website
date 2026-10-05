import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth } from "./firebase";
import { COL, ref } from "./db";
import type { UserProfile } from "@/types";
import type { RegisterInput } from "@/lib/validation";

/**
 * Every new account is created as a plain "member". Administrator access is
 * granted only by setting `role: "admin"` on the user's profile document in
 * Firestore (there is no self-serve or first-account bootstrap). The /admin
 * dashboard and the security rules both require role === "admin".
 */
export async function registerAccount(input: RegisterInput): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth(), input.email, input.password);
  const user = credential.user;
  await updateProfile(user, { displayName: input.displayName });

  const profile: UserProfile = {
    uid: user.uid,
    email: user.email ?? input.email,
    displayName: input.displayName,
    role: "member",
    matricNumber: input.matricNumber || undefined,
    level: input.level || undefined,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref(COL.users, user.uid), { ...profile, createdAt: serverTimestamp() });

  return user;
}

export async function loginAccount(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth(), email, password);
  return credential.user;
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider();
  const credential = await signInWithPopup(auth(), provider);
  const user = credential.user;
  const userRef = ref(COL.users, user.uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "Member",
      photoURL: user.photoURL ?? undefined,
      role: "member",
      createdAt: serverTimestamp(),
    });
  }
  return user;
}

export async function logoutAccount(): Promise<void> {
  await signOut(auth());
}

export async function requestPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth(), email);
}

export function watchAuth(cb: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth(), cb);
}

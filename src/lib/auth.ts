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
import { getDoc, runTransaction, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import { COL, ref } from "./db";
import { nowIso } from "./utils";
import type { Genesis, RegisterInput, UserProfile } from "@/types";

/**
 * First-ever account becomes Super Admin via an atomic "genesis" claim:
 * the transaction flips meta/genesis.claimed, so concurrent sign-ups can
 * never both receive the role. Everyone after that is a member.
 */
export async function registerAccount(input: RegisterInput): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth(), input.email, input.password);
  const user = credential.user;
  await updateProfile(user, { displayName: input.displayName });

  await runTransaction(db(), async (tx) => {
    const genesisRef = ref(COL.genesis, "genesis");
    const userRef = ref(COL.users, user.uid);
    const genesisSnap = await tx.get(genesisRef);
    const genesis = genesisSnap.exists() ? (genesisSnap.data() as Genesis) : null;
    const isFirst = !genesis || genesis.claimed !== true;

    const profile: UserProfile = {
      uid: user.uid,
      email: user.email ?? input.email,
      displayName: input.displayName,
      role: isFirst ? "super_admin" : "member",
      matricNumber: input.matricNumber || undefined,
      level: input.level || undefined,
      createdAt: nowIso(),
    };
    tx.set(userRef, { ...profile, createdAt: serverTimestamp() });
    if (isFirst) {
      tx.set(genesisRef, {
        id: "genesis",
        claimed: true,
        claimedBy: user.uid,
        claimedAt: nowIso(),
      });
    }
  });

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
    const genesisSnap = await getDoc(ref(COL.genesis, "genesis"));
    const isFirst = !genesisSnap.exists() || (genesisSnap.data() as Genesis).claimed !== true;
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email ?? "",
      displayName: user.displayName ?? "Member",
      photoURL: user.photoURL ?? undefined,
      role: isFirst ? "super_admin" : "member",
      createdAt: serverTimestamp(),
    });
    if (isFirst) {
      await setDoc(ref(COL.genesis, "genesis"), {
        id: "genesis",
        claimed: true,
        claimedBy: user.uid,
        claimedAt: nowIso(),
      });
    }
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

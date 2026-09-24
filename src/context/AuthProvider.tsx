"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onSnapshot } from "firebase/firestore";
import type { User } from "firebase/auth";
import { watchAuth } from "@/lib/auth";
import { COL, ref } from "@/lib/db";
import { isFirebaseConfigured } from "@/lib/firebase";
import type { Role, UserProfile } from "@/types";

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: Role | null;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  canEdit: boolean;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  role: null,
  isAdmin: false,
  isSuperAdmin: false,
  canEdit: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return watchAuth((nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const unsubscribe = onSnapshot(
        ref(COL.users, nextUser.uid),
        (snap) => {
          setProfile(snap.exists() ? ({ id: snap.id, ...snap.data() } as unknown as UserProfile) : null);
          setLoading(false);
        },
        () => setLoading(false),
      );
      return () => unsubscribe();
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      user,
      profile,
      loading,
      role,
      isAdmin: role === "admin" || role === "super_admin",
      isSuperAdmin: role === "super_admin",
      canEdit: role === "admin" || role === "super_admin" || role === "editor",
    };
  }, [user, profile, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

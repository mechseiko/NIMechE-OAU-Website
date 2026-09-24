"use client";

import { useEffect, useMemo, useState } from "react";
import { doc, onSnapshot, query, type QueryConstraint } from "firebase/firestore";
import { col } from "@/lib/db";
import { db, isFirebaseConfigured } from "@/lib/firebase";
import type { CollectionName } from "@/lib/db";

interface CollectionState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

/** Real-time collection subscription. Returns an empty state when Firebase is
 *  not configured yet so public pages still render gracefully. */
export function useCollection<T>(
  collectionName: CollectionName | null,
  constraints: QueryConstraint[] = [],
): CollectionState<T> {
  const [state, setState] = useState<CollectionState<T>>({
    data: [],
    loading: Boolean(collectionName) && isFirebaseConfigured,
    error: null,
  });

  const constraintKey = useMemo(() => constraints.map(String).join("|"), [constraints]);

  useEffect(() => {
    if (!collectionName || !isFirebaseConfigured) {
      setState({ data: [], loading: false, error: null });
      return;
    }
    const unsubscribe = onSnapshot(
      query(col(collectionName), ...constraints),
      (snap) => {
        setState({
          data: snap.docs.map((d) => ({ id: d.id, ...d.data() })) as T[],
          loading: false,
          error: null,
        });
      },
      (err) => setState({ data: [], loading: false, error: err.message }),
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionName, constraintKey]);

  return state;
}

export function useDoc<T>(
  collectionName: CollectionName | null,
  id: string | null,
): { data: T | null; loading: boolean } {
  const [state, setState] = useState<{ data: T | null; loading: boolean }>({
    data: null,
    loading: Boolean(collectionName && id) && isFirebaseConfigured,
  });

  useEffect(() => {
    if (!collectionName || !id || !isFirebaseConfigured) {
      setState({ data: null, loading: false });
      return;
    }
    const unsubscribe = onSnapshot(
      doc(db(), collectionName, id),
      (snap) => {
        setState({
          data: snap.exists() ? ({ id: snap.id, ...snap.data() } as T) : null,
          loading: false,
        });
      },
      () => setState((s) => ({ ...s, loading: false })),
    );
    return unsubscribe;
  }, [collectionName, id]);

  return state;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface A11yState {
  scale: number; // 100 | 112.5 | 125 ...
  highContrast: boolean;
  underlinedLinks: boolean;
  reducedMotion: boolean;
}

interface A11yContextValue extends A11yState {
  increaseFont: () => void;
  decreaseFont: () => void;
  resetFont: () => void;
  toggleContrast: () => void;
  toggleLinks: () => void;
  toggleMotion: () => void;
}

const STORAGE_KEY = "nimeche-a11y";
const STEPS = [100, 112.5, 125, 137.5, 150];

const A11yContext = createContext<A11yContextValue | null>(null);

export function A11yProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<A11yState>({
    scale: 100,
    highContrast: false,
    underlinedLinks: false,
    reducedMotion: false,
  });

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setState((prev) => ({ ...prev, ...JSON.parse(raw) }));
    } catch {
      /* private mode */
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--a11y-scale", `${state.scale}%`);
    root.dataset.contrast = state.highContrast ? "high" : "normal";
    root.dataset.links = state.underlinedLinks ? "underlined" : "normal";
    root.dataset.motion = state.reducedMotion ? "reduced" : "normal";
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const increaseFont = useCallback(
    () =>
      setState((s) => ({
        ...s,
        scale: STEPS[Math.min(STEPS.indexOf(s.scale) + 1, STEPS.length - 1)] ?? 100,
      })),
    [],
  );
  const decreaseFont = useCallback(
    () => setState((s) => ({ ...s, scale: STEPS[Math.max(STEPS.indexOf(s.scale) - 1, 0)] ?? 100 })),
    [],
  );
  const resetFont = useCallback(() => setState((s) => ({ ...s, scale: 100 })), []);
  const toggleContrast = useCallback(() => setState((s) => ({ ...s, highContrast: !s.highContrast })), []);
  const toggleLinks = useCallback(() => setState((s) => ({ ...s, underlinedLinks: !s.underlinedLinks })), []);
  const toggleMotion = useCallback(() => setState((s) => ({ ...s, reducedMotion: !s.reducedMotion })), []);

  const value = useMemo(
    () => ({
      ...state,
      increaseFont,
      decreaseFont,
      resetFont,
      toggleContrast,
      toggleLinks,
      toggleMotion,
    }),
    [state, increaseFont, decreaseFont, resetFont, toggleContrast, toggleLinks, toggleMotion],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
}

export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) throw new Error("useA11y must be used within A11yProvider");
  return ctx;
}

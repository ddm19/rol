import { useEffect, useState } from "react";

export function useLocalStorageState<T>(key: string, initial: T, debounceMs = 300) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {}
    }, debounceMs);
    return () => clearTimeout(id);
  }, [key, state, debounceMs]);

  const reset = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setState(initial);
  };

  return [state, setState, reset] as const;
}

import { useEffect, useRef, useState } from "react"

export function useDebouncedState<T>(value: T, delay = 600) {
  const [debounced, setDebounced] = useState(value)
  const first = useRef(true)
  useEffect(() => {
    if (first.current) {
      first.current = false
      setDebounced(value)
      return
    }
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}
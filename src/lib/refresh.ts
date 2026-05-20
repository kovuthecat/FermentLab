import { useState, useEffect } from "react";

let _counter = 0;
const _subs = new Set<() => void>();

export function triggerRefresh() {
  _counter++;
  _subs.forEach((fn) => fn());
}

export function useDataVersion() {
  const [v, setV] = useState(_counter);
  useEffect(() => {
    const fn = () => setV((c) => c + 1);
    _subs.add(fn);
    return () => {
      _subs.delete(fn);
    };
  }, []);
  return v;
}

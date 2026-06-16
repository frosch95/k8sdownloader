import { useState, useCallback, useMemo } from "react";
import { fetchPods } from "../utils/api";
import { extractErrorMessage } from "../utils/kubeconfig";
import type { PodInfo } from "../types";

export function usePods() {
  const [pods, setPods] = useState<PodInfo[]>([]);
  const [selected, setSelected] = useState<PodInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (contextName: string, namespace: string) => {
    if (!contextName || !namespace) return;
    setLoading(true);
    setError(null);
    setPods([]);
    setSelected(null);
    try {
      const result = await fetchPods(contextName, namespace);
      setPods(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ pods, selected, setSelected, loading, error, setError, load }),
    [pods, selected, loading, error, load]
  );
}

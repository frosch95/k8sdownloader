import { useState, useCallback, useMemo } from "react";
import { fetchNamespaces } from "../utils/api";
import { extractErrorMessage } from "../utils/kubeconfig";
import type { NamespaceInfo } from "../types";

export function useNamespaces() {
  const [namespaces, setNamespaces] = useState<NamespaceInfo[]>([]);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (contextName: string) => {
    if (!contextName) return;
    setLoading(true);
    setError(null);
    setNamespaces([]);
    setSelected("");
    try {
      const result = await fetchNamespaces(contextName);
      setNamespaces(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  return useMemo(
    () => ({ namespaces, selected, setSelected, loading, error, setError, load }),
    [namespaces, selected, loading, error, load]
  );
}

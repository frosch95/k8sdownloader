import { useState, useCallback, useMemo } from "react";
import { fetchFiles } from "../utils/api";
import { extractErrorMessage } from "../utils/kubeconfig";
import type { FileEntry } from "../types";

export function useFileSystem() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [currentPath, setCurrentPath] = useState("/");
  const [pathHistory, setPathHistory] = useState<string[]>(["/"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigateTo = useCallback(
    async (
      contextName: string,
      namespace: string,
      podName: string,
      containerName: string | null,
      dirPath: string
    ) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFiles(
          contextName, namespace, podName, containerName, dirPath
        );
        setFiles(result);
        setCurrentPath(dirPath);
        setPathHistory((prev) => [...prev, dirPath]);
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const goBack = useCallback((): string => {
    if (pathHistory.length <= 1) return "/";
    const newHistory = pathHistory.slice(0, -1);
    setPathHistory(newHistory);
    return newHistory[newHistory.length - 1];
  }, [pathHistory]);

  const reset = useCallback(() => {
    setFiles([]);
    setCurrentPath("/");
    setPathHistory(["/"]);
    setError(null);
  }, []);

  return useMemo(
    () => ({ files, currentPath, loading, error, setError, navigateTo, goBack, reset }),
    [files, currentPath, loading, error, navigateTo, goBack, reset]
  );
}

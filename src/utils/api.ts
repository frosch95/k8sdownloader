import type { ContextInfo, NamespaceInfo, PodInfo, FileEntry } from "../types";

// Re-export the ElectronAPI type from the preload for type safety
declare global {
  interface Window {
    electronAPI: {
      getContexts: () => Promise<ContextInfo[]>;
      getNamespaces: (contextName: string) => Promise<NamespaceInfo[]>;
      getPods: (
        contextName: string,
        namespace: string
      ) => Promise<PodInfo[]>;
      listFiles: (
        contextName: string,
        namespace: string,
        podName: string,
        containerName: string | null,
        dirPath: string
      ) => Promise<FileEntry[]>;
      showSaveDialog: (defaultName: string) => Promise<string | null>;
      downloadFile: (
        contextName: string,
        namespace: string,
        podName: string,
        containerName: string | null,
        sourcePath: string,
        destPath: string
      ) => Promise<void>;
    };
  }
}

const api = () => window.electronAPI;

export async function fetchContexts(): Promise<ContextInfo[]> {
  return api().getContexts();
}

export async function fetchNamespaces(
  contextName: string
): Promise<NamespaceInfo[]> {
  return api().getNamespaces(contextName);
}

export async function fetchPods(
  contextName: string,
  namespace: string
): Promise<PodInfo[]> {
  return api().getPods(contextName, namespace);
}

export async function fetchFiles(
  contextName: string,
  namespace: string,
  podName: string,
  containerName: string | null,
  dirPath: string
): Promise<FileEntry[]> {
  return api().listFiles(
    contextName,
    namespace,
    podName,
    containerName,
    dirPath
  );
}

export async function saveAndDownload(
  contextName: string,
  namespace: string,
  podName: string,
  containerName: string | null,
  sourcePath: string,
  defaultFileName: string
): Promise<void> {
  const destPath = await api().showSaveDialog(defaultFileName);
  if (!destPath) return; // User cancelled
  return api().downloadFile(
    contextName,
    namespace,
    podName,
    containerName,
    sourcePath,
    destPath
  );
}

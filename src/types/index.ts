export interface ContextInfo {
  name: string;
  cluster: string;
  user: string;
}

export interface NamespaceInfo {
  name: string;
}

export interface PodInfo {
  name: string;
  namespace: string;
  status: string;
  containers: string[];
}

export interface FileEntry {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modified: string;
}

export type ConnectionStep = "context" | "namespace" | "pod" | "browse";

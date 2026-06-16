import { useCallback, useState } from "react";
import { saveAndDownload } from "../utils/api";
import { formatFileSize, getFileIcon, getParentPath } from "../utils/kubeconfig";
import type { FileEntry } from "../types";

interface FileExplorerProps {
  files: FileEntry[];
  currentPath: string;
  loading: boolean;
  disabled: boolean;
  contextName: string;
  namespace: string;
  podName: string;
  containerName: string | null;
  onNavigate: (dirPath: string) => void;
  onBack: (dirPath: string) => void;
  onError: (message: string) => void;
}

export function FileExplorer({
  files,
  currentPath,
  loading,
  disabled,
  contextName,
  namespace,
  podName,
  containerName,
  onNavigate,
  onBack,
  onError,
}: FileExplorerProps) {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    if (currentPath === "/") return;
    const parent = getParentPath(currentPath);
    onBack(parent);
    onNavigate(parent);
  }, [currentPath, onBack, onNavigate]);

  const handleDownload = useCallback(
    async (entry: FileEntry) => {
      if (entry.isDir) return;
      setDownloading(entry.name);
      try {
        await saveAndDownload(
          contextName,
          namespace,
          podName,
          containerName,
          entry.path,
          entry.name
        );
      } catch (err) {
        onError(
          `Failed to download ${entry.name}: ${
            err instanceof Error ? err.message : "Unknown error"
          }`
        );
      } finally {
        setDownloading(null);
      }
    },
    [contextName, namespace, podName, containerName, onError]
  );

  const breadcrumbs = currentPath
    .split("/")
    .filter(Boolean)
    .reduce<{ label: string; path: string }[]>((acc, part) => {
      const prev = acc.length > 0 ? acc[acc.length - 1].path : "";
      acc.push({ label: part, path: `${prev}/${part}` });
      return acc;
    }, []);

  if (disabled) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-k8s-muted text-sm">
          Select a context, namespace, and pod to browse files
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Breadcrumb bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-k8s-darker border-b border-k8s-border overflow-x-auto">
        <button
          onClick={handleBack}
          disabled={currentPath === "/"}
          className="shrink-0 p-1 rounded hover:bg-k8s-surface/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Go up"
        >
          <svg className="w-4 h-4 text-k8s-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={() => onNavigate("/")}
          className="shrink-0 text-sm text-k8s-blue hover:text-k8s-blue/80 transition-colors"
        >
          /
        </button>

        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.path} className="flex items-center gap-1.5 text-sm">
            <span className="text-k8s-muted/50">/</span>
            {i === breadcrumbs.length - 1 ? (
              <span className="text-k8s-text font-medium truncate max-w-[200px]">
                {crumb.label}
              </span>
            ) : (
              <button
                onClick={() => onNavigate(crumb.path)}
                className="text-k8s-blue hover:text-k8s-blue/80 transition-colors truncate max-w-[200px]"
              >
                {crumb.label}
              </button>
            )}
          </span>
        ))}
      </div>

      {/* File list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center gap-3 text-k8s-muted">
              <span className="animate-spin text-xl">⏳</span>
              <span className="text-sm">Loading files…</span>
            </div>
          </div>
        ) : files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-k8s-muted text-sm">Empty directory</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-k8s-darker">
              <tr className="text-left text-xs text-k8s-muted uppercase tracking-wider">
                <th className="px-4 py-2 font-medium">Name</th>
                <th className="px-4 py-2 font-medium hidden sm:table-cell">Size</th>
                <th className="px-4 py-2 font-medium hidden md:table-cell">Modified</th>
                <th className="px-4 py-2 font-medium w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-k8s-border/30">
              {files.map((entry) => (
                <tr
                  key={entry.path}
                  className={`transition-colors ${
                    entry.isDir
                      ? "hover:bg-k8s-surface/30 cursor-pointer"
                      : "hover:bg-k8s-surface/20"
                  }`}
                  onDoubleClick={() => entry.isDir && onNavigate(entry.path)}
                >
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() => entry.isDir && onNavigate(entry.path)}
                      className="flex items-center gap-2 text-left w-full"
                      disabled={!entry.isDir}
                    >
                      <span className="text-lg">{getFileIcon(entry.isDir)}</span>
                      <span
                        className={`truncate max-w-[250px] sm:max-w-[400px] ${
                          entry.isDir ? "text-k8s-blue font-medium" : "text-k8s-text"
                        }`}
                      >
                        {entry.name}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-k8s-muted hidden sm:table-cell">
                    {entry.isDir ? "—" : formatFileSize(entry.size)}
                  </td>
                  <td className="px-4 py-2.5 text-k8s-muted hidden md:table-cell">
                    {entry.modified}
                  </td>
                  <td className="px-4 py-2.5">
                    {!entry.isDir && (
                      <button
                        onClick={() => handleDownload(entry)}
                        disabled={downloading === entry.name}
                        className="p-1.5 rounded-lg hover:bg-k8s-blue/10 text-k8s-blue transition-colors disabled:opacity-40"
                        title="Download file"
                      >
                        {downloading === entry.name ? (
                          <span className="animate-spin inline-block">⏳</span>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-k8s-darker border-t border-k8s-border text-xs text-k8s-muted">
        <span>
          {files.length} item{files.length !== 1 ? "s" : ""}
        </span>
        <span>
          {contextName} / {namespace} / {podName}
        </span>
      </div>
    </div>
  );
}

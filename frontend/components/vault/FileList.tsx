"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import {
  HiOutlineDownload,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineLockClosed,
  HiOutlineRefresh,
} from "react-icons/hi";

interface EncryptedFileRecord {
  id: string;
  original_filename: string;
  storage_path: string;
  encrypted_key: string;
  iv: string;
  salt: string;
  file_size: number;
  created_at: string;
}

interface FileListProps {
  refreshTrigger: number;
}

export default function FileList({ refreshTrigger }: FileListProps) {
  const [files, setFiles] = useState<EncryptedFileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    const supabase = createSupabaseBrowser();
    const { data, error } = await supabase
      .from("encrypted_files")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load files: " + error.message);
    } else {
      setFiles(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles, refreshTrigger]);

  const handleDownload = (file: EncryptedFileRecord) => {
    void performDownload(file);
  };

  const performDownload = async (file: EncryptedFileRecord) => {
    setDownloadingId(file.id);

    try {
      const response = await fetch(`/api/vault/${file.id}/download`);
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.error?.message || "Failed to download file");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.original_filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("File downloaded!");
    } catch (err: any) {
      toast.error(err.message || "Download failed");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (file: EncryptedFileRecord) => {
    if (!confirm(`Delete "${file.original_filename}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(file.id);
    const supabase = createSupabaseBrowser();

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("encrypted-files")
      .remove([file.storage_path]);

    if (storageError) {
      toast.error("Failed to delete file from storage: " + storageError.message);
      setDeletingId(null);
      return;
    }

    // Delete from DB
    const { error: dbError } = await supabase
      .from("encrypted_files")
      .delete()
      .eq("id", file.id);

    if (dbError) {
      toast.error("Failed to delete file record: " + dbError.message);
    } else {
      toast.success("File deleted");
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    }
    setDeletingId(null);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <AiOutlineLoading3Quarters className="w-6 h-6 animate-spin text-indigo-500" />
        <span className="ml-2 text-sm text-zinc-500">Loading your vault...</span>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="inline-flex p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-800/50">
          <HiOutlineLockClosed className="w-10 h-10 text-zinc-400 dark:text-zinc-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            Your vault is empty
          </p>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
            Upload a file to get started — it will be encrypted by the server before being stored
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {files.length} file{files.length !== 1 ? "s" : ""} in your vault
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchFiles}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <HiOutlineRefresh className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>

        {files.map((file) => (
          <div
            key={file.id}
            className="group flex items-center gap-4 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-indigo-200 dark:hover:border-indigo-500/20 hover:shadow-sm transition-all duration-200"
          >
            {/* File icon */}
            <div className="shrink-0 p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10">
              <HiOutlineDocumentText className="w-5 h-5 text-indigo-500" />
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                {file.original_filename}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatFileSize(file.file_size)}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {formatDate(file.created_at)}
                </span>
                <span className="text-zinc-300 dark:text-zinc-700">•</span>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <HiOutlineLockClosed className="w-3 h-3" />
                  Server encrypted
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDownload(file)}
                disabled={downloadingId === file.id || deletingId === file.id}
                className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg"
              >
                {downloadingId === file.id ? (
                  <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                  <HiOutlineDownload className="w-4 h-4" />
                )}
                <span className="ml-1 text-xs">Download</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(file)}
                disabled={deletingId === file.id || downloadingId === file.id}
                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg"
              >
                {deletingId === file.id ? (
                  <AiOutlineLoading3Quarters className="w-4 h-4 animate-spin" />
                ) : (
                  <HiOutlineTrash className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

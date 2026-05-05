"use client";

import React, { useState, useCallback, useRef } from "react";
import { createSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  AiOutlineLoading3Quarters,
  AiOutlineCloudUpload,
} from "react-icons/ai";
import { HiOutlineDocumentAdd } from "react-icons/hi";

interface FileUploadProps {
  onUploadComplete: () => void;
}

type UploadStage = "idle" | "encrypting" | "done";

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [stage, setStage] = useState<UploadStage>("idle");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
      }
    },
    []
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first");
      return;
    }

    try {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to upload files");
      }

      setStage("encrypting");
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/vault/upload", {
        method: "POST",
        body: formData,
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.error?.message || "Upload failed");
      }

      setStage("done");
      toast.success("File encrypted on the server and uploaded successfully!");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setStage("idle"), 1500);
      onUploadComplete();
    } catch (err: any) {
      setStage("idle");
      toast.error(err.message || "Upload failed");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const stageLabels: Record<UploadStage, string> = {
    idle: "",
    encrypting: "Encrypting on server...",
    done: "Upload complete!",
  };

  return (
    <>
      <div className="space-y-4">
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300",
            dragOver
              ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/5 scale-[1.01]"
              : "border-zinc-200 dark:border-zinc-700/50 hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800/30"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            disabled={stage !== "idle"}
          />
          <div className="flex flex-col items-center gap-3">
            <div
              className={cn(
                "p-3 rounded-2xl transition-colors",
                dragOver
                  ? "bg-indigo-100 dark:bg-indigo-500/10"
                  : "bg-zinc-100 dark:bg-zinc-800"
              )}
            >
              <HiOutlineDocumentAdd
                className={cn(
                  "w-8 h-8 transition-colors",
                  dragOver
                    ? "text-indigo-500"
                    : "text-zinc-400 dark:text-zinc-500"
                )}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {selectedFile
                  ? selectedFile.name
                  : "Drop a file here or click to browse"}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {selectedFile
                  ? formatFileSize(selectedFile.size)
                  : "Files are encrypted on the server before being stored"}
              </p>
            </div>
          </div>
        </div>

        {/* Upload button + status */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || stage !== "idle"}
            className="flex-1 h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-medium transition-all duration-300 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stage !== "idle" ? (
              <>
                <AiOutlineLoading3Quarters className="w-4 h-4 mr-2 animate-spin" />
                {stageLabels[stage]}
              </>
            ) : (
              <>
                <AiOutlineCloudUpload className="w-5 h-5 mr-2" />
                Encrypt & Upload
              </>
            )}
          </Button>
          {selectedFile && stage === "idle" && (
            <Button
              variant="outline"
              onClick={() => {
                setSelectedFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="rounded-xl border-zinc-200 dark:border-zinc-700"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

    </>
  );
}

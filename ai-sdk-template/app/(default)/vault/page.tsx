"use client";

import React, { useState } from "react";
import FileUpload from "@/components/vault/FileUpload";
import FileList from "@/components/vault/FileList";
import { HiOutlineShieldCheck } from "react-icons/hi";

export default function VaultPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleUploadComplete = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
            <HiOutlineShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              Secure File Vault
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Server-side encrypted file storage — AES-256-GCM with PBKDF2 key wrapping
            </p>
          </div>
        </div>
      </div>

      {/* Security badge */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-200 dark:border-emerald-500/20">
        <HiOutlineShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-0.5">
          <p className="font-semibold">Server-Managed Encryption</p>
          <p className="text-emerald-600 dark:text-emerald-400">
            Files are encrypted on the backend before upload. You only see the encryption status while it happens.
          </p>
        </div>
      </div>

      {/* Upload section */}
      <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          Upload File
        </h2>
        <FileUpload onUploadComplete={handleUploadComplete} />
      </div>

      {/* File list */}
      <div className="p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900/50">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-4">
          Your Encrypted Files
        </h2>
        <FileList refreshTrigger={refreshTrigger} />
      </div>

      {/* Info section */}
      <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
          How it works
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-zinc-600 dark:text-zinc-400">
          <div className="space-y-1">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">1. Encrypt</p>
            <p>The server generates a fresh AES-256-GCM key and wraps it with a server secret.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">2. Store</p>
            <p>Only the encrypted blob and its metadata are stored in Supabase.</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-indigo-600 dark:text-indigo-400">3. Download</p>
            <p>The backend unwraps the key and decrypts the file when you download it.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

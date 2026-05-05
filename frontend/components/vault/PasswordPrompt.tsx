"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa6";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { cn } from "@/lib/utils";

interface PasswordPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (password: string) => Promise<void>;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export default function PasswordPrompt({
  open,
  onOpenChange,
  onSubmit,
  title = "Enter Encryption Password",
  description = "This password is used to encrypt/decrypt your file. Remember it — there is no recovery if lost.",
  submitLabel = "Continue",
}: PasswordPromptProps) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit(password);
      setPassword("");
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!loading) {
      setPassword("");
      setError("");
      onOpenChange(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm text-zinc-500 dark:text-zinc-400">
              {description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-3">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your encryption password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 pr-10"
                autoFocus
              />
              <div
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <FaRegEye className="w-4 h-4" />
                ) : (
                  <FaRegEyeSlash className="w-4 h-4" />
                )}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={loading}
              className="rounded-xl border-zinc-200 dark:border-zinc-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20"
            >
              <AiOutlineLoading3Quarters
                className={cn("w-4 h-4 mr-1", !loading ? "hidden" : "animate-spin")}
              />
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

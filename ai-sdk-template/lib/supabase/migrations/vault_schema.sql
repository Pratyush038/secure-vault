-- =============================================================
-- Secure Cloud File Vault — Database Schema
-- =============================================================
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- 1. Create the encrypted_files table
CREATE TABLE IF NOT EXISTS encrypted_files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  original_filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  encrypted_key TEXT NOT NULL,      -- base64-encoded AES key wrapped with PBKDF2-derived key
  iv TEXT NOT NULL,                 -- base64-encoded 96-bit IV for AES-GCM
  salt TEXT NOT NULL,               -- base64-encoded 128-bit PBKDF2 salt
  file_size BIGINT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE encrypted_files ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policy: users can only see/manage their own files
CREATE POLICY "Users can manage their own files"
  ON encrypted_files
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create index for fast user lookups
CREATE INDEX IF NOT EXISTS idx_encrypted_files_user_id
  ON encrypted_files(user_id);

-- =============================================================
-- Supabase Storage Setup (run in SQL Editor)
-- =============================================================
-- Create the storage bucket for encrypted files
INSERT INTO storage.buckets (id, name, public)
VALUES ('encrypted-files', 'encrypted-files', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: users can upload to their own folder
CREATE POLICY "Users can upload encrypted files"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'encrypted-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: users can read their own files
CREATE POLICY "Users can read own encrypted files"
  ON storage.objects
  FOR SELECT
  USING (
    bucket_id = 'encrypted-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policy: users can delete their own files
CREATE POLICY "Users can delete own encrypted files"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'encrypted-files'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

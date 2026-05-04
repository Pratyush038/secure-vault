/**
 * encryption.ts — Client-Side E2E Encryption Module
 *
 * Uses the Web Crypto API exclusively (no third-party crypto libraries).
 *
 * Encryption flow:
 *   1. Generate random AES-256-GCM key + 96-bit IV
 *   2. Encrypt file content with AES-256-GCM (provides confidentiality + integrity via auth tag)
 *   3. Generate random 128-bit salt
 *   4. Derive a wrapping key from user password via PBKDF2 (600k iterations, SHA-256)
 *   5. Wrap (encrypt) the AES key using AES-KW with the derived wrapping key
 *   6. Return: { encryptedBlob, encryptedKey (base64), iv (base64), salt (base64) }
 *
 * Decryption flow:
 *   1. Re-derive wrapping key from password + stored salt
 *   2. Unwrap (decrypt) the AES key — fails cleanly if wrong password
 *   3. Decrypt file with AES-256-GCM using the unwrapped key + IV
 *   4. GCM auth tag verification ensures data integrity (rejects tampered ciphertext)
 */

// ─── Helpers ──────────────────────────────────────────────────────────

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ─── Key Derivation ───────────────────────────────────────────────────

const PBKDF2_ITERATIONS = 600_000;

/**
 * Derive an AES-256 wrapping key from a password and salt using PBKDF2.
 */
async function deriveWrappingKey(
  password: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-KW", length: 256 },
    false,
    ["wrapKey", "unwrapKey"]
  );
}

// ─── Encryption ───────────────────────────────────────────────────────

export interface EncryptionResult {
  encryptedBlob: Blob;
  encryptedKey: string; // base64
  iv: string;           // base64
  salt: string;         // base64
}

/**
 * Encrypt a file client-side using AES-256-GCM with password-based key wrapping.
 *
 * @param file - The file to encrypt
 * @param password - User's encryption password (used to derive the key-wrapping key)
 * @returns EncryptionResult with encrypted blob and metadata
 */
export async function encryptFile(
  file: File,
  password: string
): Promise<EncryptionResult> {
  // 1. Read file into ArrayBuffer
  const fileData = await file.arrayBuffer();

  // 2. Generate random AES-256-GCM key
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable — needed for wrapping
    ["encrypt", "decrypt"]
  );

  // 3. Generate random 96-bit IV (recommended size for AES-GCM)
  const iv = crypto.getRandomValues(new Uint8Array(12));

  // 4. Encrypt file data with AES-256-GCM
  // The auth tag is automatically appended to the ciphertext by Web Crypto
  const encryptedData = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    fileData
  );

  // 5. Generate random salt for PBKDF2
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 6. Derive wrapping key from password
  const wrappingKey = await deriveWrappingKey(password, salt);

  // 7. Wrap the AES key using AES-KW
  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, wrappingKey, "AES-KW");

  return {
    encryptedBlob: new Blob([encryptedData], { type: "application/octet-stream" }),
    encryptedKey: arrayBufferToBase64(wrappedKey),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

// ─── Decryption ───────────────────────────────────────────────────────

/**
 * Decrypt an encrypted file using the user's password.
 *
 * @param encryptedData - The encrypted file data as ArrayBuffer
 * @param encryptedKey  - Base64-encoded wrapped AES key
 * @param iv            - Base64-encoded IV
 * @param salt          - Base64-encoded PBKDF2 salt
 * @param password      - User's encryption password
 * @returns Decrypted file data as ArrayBuffer
 * @throws Error if password is wrong (AES-KW unwrap fails) or data is tampered (GCM auth tag fails)
 */
export async function decryptFile(
  encryptedData: ArrayBuffer,
  encryptedKey: string,
  iv: string,
  salt: string,
  password: string
): Promise<ArrayBuffer> {
  // 1. Decode base64 metadata
  const saltBytes = new Uint8Array(base64ToArrayBuffer(salt));
  const ivBytes = new Uint8Array(base64ToArrayBuffer(iv));
  const wrappedKeyBytes = base64ToArrayBuffer(encryptedKey);

  // 2. Re-derive the wrapping key from password + salt
  const wrappingKey = await deriveWrappingKey(password, saltBytes);

  // 3. Unwrap the AES key — throws if wrong password
  let aesKey: CryptoKey;
  try {
    aesKey = await crypto.subtle.unwrapKey(
      "raw",
      wrappedKeyBytes,
      wrappingKey,
      "AES-KW",
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  } catch {
    throw new Error("Wrong encryption password. Unable to decrypt the file key.");
  }

  // 4. Decrypt file data — throws if data is tampered (GCM auth tag mismatch)
  try {
    const decryptedData = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes },
      aesKey,
      encryptedData
    );
    return decryptedData;
  } catch {
    throw new Error("Decryption failed. The file may have been tampered with.");
  }
}

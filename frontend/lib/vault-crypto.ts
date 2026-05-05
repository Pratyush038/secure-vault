import "server-only";

const PBKDF2_ITERATIONS = 600_000;

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";

  for (let index = 0; index < bytes.byteLength; index++) {
    binary += String.fromCharCode(bytes[index]);
  }

  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index++) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function getVaultEncryptionSecret(): string {
  const secret =
    process.env.VAULT_ENCRYPTION_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ADMIN;

  if (!secret) {
    throw new Error("VAULT_ENCRYPTION_SECRET is required for server-side vault encryption.");
  }

  return secret;
}

async function deriveWrappingKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
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

export interface VaultEncryptionResult {
  encryptedBlob: Blob;
  encryptedKey: string;
  iv: string;
  salt: string;
}

export async function encryptFileOnServer(file: File): Promise<VaultEncryptionResult> {
  const secret = getVaultEncryptionSecret();
  const fileData = await file.arrayBuffer();

  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedData = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, fileData);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const wrappingKey = await deriveWrappingKey(secret, salt);
  const wrappedKey = await crypto.subtle.wrapKey("raw", aesKey, wrappingKey, "AES-KW");

  return {
    encryptedBlob: new Blob([encryptedData], { type: "application/octet-stream" }),
    encryptedKey: arrayBufferToBase64(wrappedKey),
    iv: arrayBufferToBase64(iv.buffer),
    salt: arrayBufferToBase64(salt.buffer),
  };
}

export async function decryptFileOnServer(
  encryptedData: ArrayBuffer,
  encryptedKey: string,
  iv: string,
  salt: string
): Promise<ArrayBuffer> {
  const secret = getVaultEncryptionSecret();
  const saltBytes = new Uint8Array(base64ToArrayBuffer(salt));
  const ivBytes = new Uint8Array(base64ToArrayBuffer(iv));
  const wrappedKeyBytes = base64ToArrayBuffer(encryptedKey);
  const wrappingKey = await deriveWrappingKey(secret, saltBytes);

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
    throw new Error("Failed to unlock the encrypted file on the server.");
  }

  try {
    return await crypto.subtle.decrypt({ name: "AES-GCM", iv: ivBytes }, aesKey, encryptedData);
  } catch {
    throw new Error("Decryption failed. The encrypted file may be corrupted.");
  }
}
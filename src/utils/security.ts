/**
 * Security and Cryptographic Utilities
 * Safe password hashing using browser Web Crypto SHA-256
 */

export async function hashPassword(plainText: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function verifyPassword(plainText: string, storedHashOrPlain: string): Promise<boolean> {
  // If stored value is already a SHA-256 hash (64 hex characters)
  if (storedHashOrPlain.length === 64 && /^[0-9a-f]+$/i.test(storedHashOrPlain)) {
    const hashed = await hashPassword(plainText);
    return hashed.toLowerCase() === storedHashOrPlain.toLowerCase();
  }
  // Fallback for default seed accounts
  return plainText === storedHashOrPlain;
}

export function generateSecureTemporaryKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const array = new Uint8Array(8);
  window.crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join('');
}

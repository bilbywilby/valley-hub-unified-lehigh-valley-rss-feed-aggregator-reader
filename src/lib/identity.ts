import { db } from './db';
/**
 * Utility for managing user identity using the Web Crypto API.
 * Uses global 'crypto' instead of 'window.crypto' for Service Worker compatibility.
 */
export async function getOrCreateIdentity() {
  const existing = await db.identity.toArray();
  if (existing.length > 0) {
    return existing[0];
  }
  // Generate P-256 key pair
  // Note: 'crypto' is available in both Window and Worker scopes
  const cryptoObj = typeof crypto !== 'undefined' ? crypto : (typeof window !== 'undefined' ? window.crypto : null);
  if (!cryptoObj || !cryptoObj.subtle) {
    throw new Error('Web Crypto API not supported in this environment');
  }
  const keyPair = await cryptoObj.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false, // non-extractable private key for maximum security
    ['sign', 'verify']
  );
  const publicJwk = await cryptoObj.subtle.exportKey('jwk', keyPair.publicKey);
  const jwkString = JSON.stringify(publicJwk);
  // Derive nodeId from public key hash
  const msgUint8 = new TextEncoder().encode(jwkString);
  const hashBuffer = await cryptoObj.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const nodeId = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  const identity = {
    nodeId,
    publicJwk: jwkString,
    createdAt: Date.now(),
  };
  await db.identity.add(identity);
  return identity;
}
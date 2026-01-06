import { db } from './db';
export async function getOrCreateIdentity() {
  const existing = await db.identity.toArray();
  if (existing.length > 0) {
    return existing[0];
  }
  // Generate P-256 key pair
  const keyPair = await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    false, // non-extractable private key
    ['sign', 'verify']
  );
  const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const jwkString = JSON.stringify(publicJwk);
  // Simple nodeId derivation from public key hash
  const msgUint8 = new TextEncoder().encode(jwkString);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgUint8);
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
// ============================================================================
// DRIFTFIELD — CSPRNG CORE
// Cryptographically secure random number generation
// ============================================================================

/**
 * Request N cryptographically secure random bytes.
 * Uses Web Crypto API (browser) or Node crypto (server).
 */
export function getRandomBytes(count: number): Uint8Array {
  const buffer = new Uint8Array(count);
  if (typeof globalThis.crypto !== 'undefined' && globalThis.crypto.getRandomValues) {
    globalThis.crypto.getRandomValues(buffer);
  } else {
    // Node.js fallback
    const nodeCrypto = require('crypto');
    const nodeBuffer = nodeCrypto.randomBytes(count);
    buffer.set(new Uint8Array(nodeBuffer.buffer, nodeBuffer.byteOffset, nodeBuffer.byteLength));
  }
  return buffer;
}

/**
 * Generate a cryptographically secure random float in [0, 1).
 * Uses 32 bits of entropy for ~9 digits of precision.
 */
export function randomFloat(): number {
  const bytes = getRandomBytes(4);
  const uint32 = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
  return uint32 / 0x100000000;
}

/**
 * Generate a cryptographically secure random integer in [0, max).
 * Uses rejection sampling to avoid modulo bias.
 */
export function randomInt(max: number): number {
  if (max <= 0) throw new Error('randomInt: max must be positive');
  if (max === 1) return 0;

  // Find the largest multiple of max that fits in 32 bits
  const limit = 0x100000000;
  const remainder = limit % max;
  const threshold = limit - remainder;

  // Rejection sampling: discard values that would cause bias
  let result: number;
  do {
    const bytes = getRandomBytes(4);
    result = (bytes[0] << 24 | bytes[1] << 16 | bytes[2] << 8 | bytes[3]) >>> 0;
  } while (result >= threshold);

  return result % max;
}

/**
 * Generate N random floats, returning both the values and the raw bytes
 * (the raw bytes are needed for statistical analysis).
 */
export function randomFloatsWithBytes(count: number): { values: number[]; rawBytes: Uint8Array } {
  const bytesNeeded = count * 4;
  const rawBytes = getRandomBytes(bytesNeeded);
  const values: number[] = [];

  for (let i = 0; i < count; i++) {
    const offset = i * 4;
    const uint32 = (
      rawBytes[offset] << 24 |
      rawBytes[offset + 1] << 16 |
      rawBytes[offset + 2] << 8 |
      rawBytes[offset + 3]
    ) >>> 0;
    values.push(uint32 / 0x100000000);
  }

  return { values, rawBytes };
}

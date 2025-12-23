import { createHmac, randomBytes } from 'crypto';

// TOTP (Time-based One-Time Password) implementation
// Compatible with Google Authenticator, Authy, etc.

const BASE32_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_CHARS[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_CHARS[(value << (5 - bits)) & 31];
  }

  return output;
}

function base32Decode(encoded: string): Buffer {
  const cleanInput = encoded.replace(/=+$/, '').toUpperCase();
  const output: number[] = [];
  let bits = 0;
  let value = 0;

  for (let i = 0; i < cleanInput.length; i++) {
    const idx = BASE32_CHARS.indexOf(cleanInput[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(output);
}

export function generateSecret(): string {
  // Generate 20 random bytes (160 bits) for the secret
  const buffer = randomBytes(20);
  return base32Encode(buffer);
}

function generateHOTP(secret: string, counter: bigint): string {
  const secretBuffer = base32Decode(secret);

  // Convert counter to 8-byte buffer (big-endian)
  const counterBuffer = Buffer.alloc(8);
  counterBuffer.writeBigUInt64BE(counter);

  // Create HMAC-SHA1
  const hmac = createHmac('sha1', secretBuffer);
  hmac.update(counterBuffer);
  const hmacResult = hmac.digest();

  // Dynamic truncation
  const offset = hmacResult[hmacResult.length - 1] & 0x0f;
  const code =
    ((hmacResult[offset] & 0x7f) << 24) |
    ((hmacResult[offset + 1] & 0xff) << 16) |
    ((hmacResult[offset + 2] & 0xff) << 8) |
    (hmacResult[offset + 3] & 0xff);

  // Get 6-digit code
  const otp = code % 1000000;
  return otp.toString().padStart(6, '0');
}

export function generateTOTP(secret: string, timeStep = 30): string {
  const counter = BigInt(Math.floor(Date.now() / 1000 / timeStep));
  return generateHOTP(secret, counter);
}

export function verifyTOTP(
  secret: string,
  token: string,
  window = 1,
  timeStep = 30
): boolean {
  const currentCounter = BigInt(Math.floor(Date.now() / 1000 / timeStep));

  // Check current and surrounding time windows
  for (let i = -window; i <= window; i++) {
    const counter = currentCounter + BigInt(i);
    const expectedToken = generateHOTP(secret, counter);
    if (expectedToken === token) {
      return true;
    }
  }

  return false;
}

export function generateTOTPUri(
  secret: string,
  accountName: string,
  issuer = 'Playforge'
): string {
  const encodedIssuer = encodeURIComponent(issuer);
  const encodedAccount = encodeURIComponent(accountName);
  return `otpauth://totp/${encodedIssuer}:${encodedAccount}?secret=${secret}&issuer=${encodedIssuer}&algorithm=SHA1&digits=6&period=30`;
}

export function generateBackupCodes(count = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    const buffer = randomBytes(4);
    const code = buffer.toString('hex').toUpperCase();
    // Format as XXXX-XXXX
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`);
  }
  return codes;
}

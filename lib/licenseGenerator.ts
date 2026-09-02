import { customAlphabet } from 'nanoid';

/**
 * Generate license key in format: KASIR-XXXX-YYYY-ZZZZ
 */
export function generateLicenseKey(): string {
  // Use nanoid for cryptographically secure random strings
  // Exclude similar-looking characters: 0, O, I, 1, L
  const alphabet = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  const nanoid = customAlphabet(alphabet, 4);
  
  const part1 = nanoid();
  const part2 = nanoid();
  const part3 = nanoid();
  
  return `KASIR-${part1}-${part2}-${part3}`;
}

/**
 * Generate multiple license keys
 */
export function generateBatchLicenseKeys(count: number): string[] {
  const keys: string[] = [];
  const keysSet = new Set<string>();
  
  while (keys.length < count) {
    const key = generateLicenseKey();
    if (!keysSet.has(key)) {
      keys.push(key);
      keysSet.add(key);
    }
  }
  
  return keys;
}

/**
 * Validate license key format
 */
export function validateLicenseKeyFormat(key: string): boolean {
  const pattern = /^KASIR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(key);
}

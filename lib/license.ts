/**
 * License Key Generator & Validator
 */

/**
 * Generate random license key
 * Format: KASIR-XXXX-YYYY-ZZZZ
 */
export function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars (0, O, I, 1)
  
  const randomSegment = (length: number): string => {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const part1 = randomSegment(4);
  const part2 = randomSegment(4);
  const part3 = randomSegment(4);

  return `KASIR-${part1}-${part2}-${part3}`;
}

/**
 * Validate license key format
 */
export function validateLicenseFormat(licenseKey: string): boolean {
  const pattern = /^KASIR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
  return pattern.test(licenseKey.trim().toUpperCase());
}

/**
 * Generate multiple unique license keys
 */
export function generateBulkLicenses(count: number): string[] {
  const licenses: string[] = [];
  const unique = new Set<string>();

  while (licenses.length < count) {
    const key = generateLicenseKey();
    if (!unique.has(key)) {
      unique.add(key);
      licenses.push(key);
    }
  }

  return licenses;
}

/**
 * Format license key with proper spacing
 * Input: "KASIRA7B9D4F2X9K1" or "kasir-a7b9-d4f2-x9k1"
 * Output: "KASIR-A7B9-D4F2-X9K1"
 */
export function formatLicenseKey(input: string): string {
  // Remove all non-alphanumeric characters and convert to uppercase
  const cleaned = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  
  // Ensure it starts with KASIR
  let formatted = cleaned.startsWith('KASIR') ? cleaned : 'KASIR' + cleaned;
  
  // Take only the needed characters (17 chars total)
  formatted = formatted.slice(0, 17);
  
  // Insert dashes: KASIR-XXXX-YYYY-ZZZZ
  if (formatted.length >= 5) {
    const parts = [
      formatted.slice(0, 5),  // KASIR
      formatted.slice(5, 9),  // XXXX
      formatted.slice(9, 13), // YYYY
      formatted.slice(13, 17) // ZZZZ
    ].filter(p => p.length > 0);
    
    return parts.join('-');
  }
  
  return formatted;
}

/**
 * Check if license key is strong (no sequential patterns)
 */
export function isStrongLicenseKey(licenseKey: string): boolean {
  const key = licenseKey.replace(/-/g, '').slice(5); // Remove KASIR- prefix
  
  // Check for sequential patterns (AAA, 111, ABC, 123)
  const hasSequentialChars = /(.)\1{2,}/.test(key);
  const hasSequentialNumbers = /(012|123|234|345|456|567|678|789)/.test(key);
  const hasSequentialLetters = /(ABC|BCD|CDE|DEF|EFG|FGH|GHI|HIJ|IJK|JKL|KLM|LMN|MNO|NOP|OPQ|PQR|QRS|RST|STU|TUV|UVW|VWX|WXY|XYZ)/.test(key);
  
  return !hasSequentialChars && !hasSequentialNumbers && !hasSequentialLetters;
}

/**
 * Generate bulk licenses to file (for batch processing)
 */
export function exportLicensesToCSV(licenses: string[]): string {
  const header = 'License Key,Status,Generated At\n';
  const rows = licenses.map(key => {
    return `${key},PENDING,${new Date().toISOString()}`;
  }).join('\n');
  
  return header + rows;
}

/**
 * Parse CSV to license keys
 */
export function importLicensesFromCSV(csvContent: string): string[] {
  const lines = csvContent.split('\n').slice(1); // Skip header
  const licenses: string[] = [];
  
  for (const line of lines) {
    const [key] = line.split(',');
    if (key && validateLicenseFormat(key.trim())) {
      licenses.push(key.trim());
    }
  }
  
  return licenses;
}

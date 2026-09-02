import { neon } from '@neondatabase/serverless';

// Validate DATABASE_URL exists
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const sql = neon(process.env.DATABASE_URL);

export interface License {
  id: string;
  license_key: string;
  device_id: string | null;
  device_name: string | null;
  status: 'PENDING' | 'ACTIVE' | 'REVOKED';
  activated_at: string | null;
  reset_count: number;
  created_at: string;
}

// Server-only database helpers
export async function getAllLicenses(): Promise<License[]> {
  const result = await sql`
    SELECT * FROM licenses 
    ORDER BY created_at DESC
  `;
  return result as License[];
}

export async function getLicenseByKey(licenseKey: string): Promise<License | null> {
  const result = await sql`
    SELECT * FROM licenses 
    WHERE license_key = ${licenseKey}
    LIMIT 1
  `;
  return (result[0] as License) || null;
}

export async function createLicense(licenseKey: string): Promise<License> {
  const result = await sql`
    INSERT INTO licenses (license_key, status, reset_count)
    VALUES (${licenseKey}, 'PENDING', 0)
    RETURNING *
  `;
  return result[0] as License;
}

export async function updateLicense(
  id: string, 
  data: {
    device_id?: string | null;
    device_name?: string | null;
    status?: 'PENDING' | 'ACTIVE' | 'REVOKED';
    activated_at?: string | null;
    reset_count?: number;
  }
): Promise<License | null> {
  // Build SET clause dynamically
  const fields: string[] = [];
  
  if (data.device_id !== undefined) fields.push(`device_id = ${data.device_id === null ? 'NULL' : `'${data.device_id}'`}`);
  if (data.device_name !== undefined) fields.push(`device_name = ${data.device_name === null ? 'NULL' : `'${data.device_name}'`}`);
  if (data.status) fields.push(`status = '${data.status}'`);
  if (data.activated_at !== undefined) fields.push(`activated_at = ${data.activated_at === null ? 'NULL' : `'${data.activated_at}'`}`);
  if (data.reset_count !== undefined) fields.push(`reset_count = ${data.reset_count}`);

  if (fields.length === 0) return null;

  const result = await sql`
    UPDATE licenses 
    SET ${sql.unsafe(fields.join(', '))}
    WHERE id = ${id}
    RETURNING *
  `;
  
  return (result[0] as License) || null;
}

export async function logActivation(
  licenseKey: string,
  deviceId: string,
  deviceName: string,
  action: string,
  success: boolean,
  errorMessage: string | null
): Promise<void> {
  await sql`
    INSERT INTO activation_logs 
    (license_key, device_id, device_name, action, success, error_message)
    VALUES (${licenseKey}, ${deviceId}, ${deviceName}, ${action}, ${success}, ${errorMessage})
  `;
}

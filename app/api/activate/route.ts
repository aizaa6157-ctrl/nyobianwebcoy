/**
 * License Activation API Endpoint (Next.js 14 App Router)
 * POST /api/activate
 * 
 * Body:
 * {
 *   licenseKey: string,
 *   deviceId: string,
 *   deviceName: string
 * }
 */

import { neon } from '@neondatabase/serverless';
import { NextRequest, NextResponse } from 'next/server';

const sql = neon(process.env.DATABASE_URL || '');

interface ActivationRequest {
  licenseKey: string;
  deviceId: string;
  deviceName: string;
}

interface ActivationResponse {
  success: boolean;
  message: string;
  token?: string;
  licenseInfo?: {
    licenseKey: string;
    deviceId: string;
    deviceName: string;
    activatedAt: string;
    status: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: ActivationRequest = await request.json();
    const { licenseKey, deviceId, deviceName } = body;

    // Validation
    if (!licenseKey || !deviceId || !deviceName) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    const normalizedKey = licenseKey.trim().toUpperCase();

    // Validate format
    const licensePattern = /^KASIR-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;
    if (!licensePattern.test(normalizedKey)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Format license key tidak valid',
        },
        { status: 400 }
      );
    }

    // Check if license exists
    const licenseResult = await sql`
      SELECT * FROM licenses 
      WHERE license_key = ${normalizedKey}
      LIMIT 1
    `;
    
    const license = licenseResult[0];

    if (!license) {
      // Log failed attempt
      await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', false, 'License tidak ditemukan');
      
      return NextResponse.json(
        {
          success: false,
          message: 'License key tidak ditemukan. Periksa kembali.',
        },
        { status: 404 }
      );
    }

    // Check if revoked
    if (license.status === 'REVOKED') {
      await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', false, 'License revoked');
      
      return NextResponse.json(
        {
          success: false,
          message: 'License ini sudah di-revoke. Hubungi penjual.',
        },
        { status: 403 }
      );
    }

    // Check if already activated on DIFFERENT device
    if (license.status === 'ACTIVE' && license.device_id !== deviceId) {
      await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', false, 'Already activated on different device');
      
      return NextResponse.json(
        {
          success: false,
          message: `License sudah aktif di device lain:\n${license.device_name}\n\nHubungi penjual untuk reset device.`,
        },
        { status: 403 }
      );
    }

    // Check if already activated on THIS device (re-activation)
    if (license.status === 'ACTIVE' && license.device_id === deviceId) {
      // Allow re-activation (return success)
      const licenseInfo = {
        licenseKey: license.license_key,
        deviceId: license.device_id,
        deviceName: license.device_name,
        activatedAt: license.activated_at,
        status: license.status,
      };

      await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', true, null);

      return NextResponse.json({
        success: true,
        message: 'License sudah aktif di device ini',
        token: generateToken(licenseInfo),
        licenseInfo,
      });
    }

    // ACTIVATE LICENSE (First time activation)
    const now = new Date().toISOString();
    
    const updatedResult = await sql`
      UPDATE licenses 
      SET device_id = ${deviceId},
          device_name = ${deviceName},
          status = 'ACTIVE',
          activated_at = ${now}
      WHERE license_key = ${normalizedKey}
      RETURNING *
    `;
    
    const updatedLicense = updatedResult[0];

    if (!updatedLicense) {
      await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', false, 'Update failed');
      
      return NextResponse.json(
        {
          success: false,
          message: 'Gagal aktivasi. Coba lagi nanti.',
        },
        { status: 500 }
      );
    }

    // Success!
    const licenseInfo = {
      licenseKey: updatedLicense.license_key,
      deviceId: updatedLicense.device_id,
      deviceName: updatedLicense.device_name,
      activatedAt: updatedLicense.activated_at,
      status: updatedLicense.status,
    };

    await logActivation(normalizedKey, deviceId, deviceName, 'ACTIVATE', true, null);

    return NextResponse.json({
      success: true,
      message: 'Aktivasi berhasil!',
      token: generateToken(licenseInfo),
      licenseInfo,
    });

  } catch (error: any) {
    console.error('Activation error:', error);
    
    return NextResponse.json(
      {
        success: false,
        message: 'Server error. Coba lagi nanti.',
      },
      { status: 500 }
    );
  }
}

/**
 * Generate activation token (simple JWT-like)
 */
function generateToken(licenseInfo: any): string {
  // Simple base64 encoding (for offline storage)
  // Not for security, just for data integrity
  const payload = JSON.stringify(licenseInfo);
  return Buffer.from(payload).toString('base64');
}

/**
 * Log activation attempt
 */
async function logActivation(
  licenseKey: string,
  deviceId: string,
  deviceName: string,
  action: string,
  success: boolean,
  errorMessage: string | null
) {
  try {
    await sql`
      INSERT INTO activation_logs 
      (license_key, device_id, device_name, action, success, error_message)
      VALUES (${licenseKey}, ${deviceId}, ${deviceName}, ${action}, ${success}, ${errorMessage})
    `;
  } catch (error) {
    // Ignore logging errors
    console.error('Log error:', error);
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getAllLicenses, createLicense, updateLicense } from '@/lib/database';

// GET /api/licenses - Get all licenses
export async function GET() {
  try {
    const licenses = await getAllLicenses();
    return NextResponse.json({ success: true, data: licenses });
  } catch (error: any) {
    console.error('Error fetching licenses:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST /api/licenses - Create new license
export async function POST(request: NextRequest) {
  try {
    const { licenseKey } = await request.json();
    
    if (!licenseKey) {
      return NextResponse.json(
        { success: false, error: 'License key required' },
        { status: 400 }
      );
    }

    const license = await createLicense(licenseKey);
    return NextResponse.json({ success: true, data: license });
  } catch (error: any) {
    console.error('Error creating license:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PATCH /api/licenses - Update license
export async function PATCH(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'License ID required' },
        { status: 400 }
      );
    }

    const license = await updateLicense(id, data);
    return NextResponse.json({ success: true, data: license });
  } catch (error: any) {
    console.error('Error updating license:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

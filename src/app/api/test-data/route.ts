import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export const dynamic = 'force-static';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) return NextResponse.json({ error: 'Missing file name' }, { status: 400 });

    const safeName = path.basename(name);
    const filePath = path.resolve(process.cwd(), 'test-data', safeName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fs.promises.readFile(filePath);

    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${safeName}"`);

    return new NextResponse(fileBuffer, { status: 200, headers });
  } catch (err) {
    console.error('Error serving test file', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

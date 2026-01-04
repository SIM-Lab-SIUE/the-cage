import { NextResponse } from 'next/server';

// Simple image proxy to allow the frontend to fetch images from internal Snipe-IT hosts
// Usage: /api/image-proxy?u=<encoded-url>
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const u = searchParams.get('u');
    if (!u) {
      return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    let target = u;
    // If the URL looks relative (starts with '/'), try to prefix with SNIPE_IT_API_URL env
    if (target.startsWith('/')) {
      const base = process.env.SNIPE_IT_API_URL || process.env.SNIPEIT_API_URL || '';
      if (base) {
        target = `${base.replace(/\/$/, '')}/${target.replace(/^\//, '')}`;
      }
    }

    const res = await fetch(target);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch image' }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    const body = await res.arrayBuffer();

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        // Allow caching for a short period
        'Cache-Control': 'public, max-age=60',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    return NextResponse.json({ error: 'Proxy error' }, { status: 500 });
  }
}

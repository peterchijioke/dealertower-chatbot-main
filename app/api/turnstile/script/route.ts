// API Route: /api/turnstile/script - Proxy for Turnstile script to hide Cloudflare URLs
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Proxying Turnstile script request...');

    // Fetch the Turnstile script from Cloudflare
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/api.js', {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        'Accept': request.headers.get('Accept') || '*/*',
        'Accept-Encoding': request.headers.get('Accept-Encoding') || 'gzip, deflate, br',
        'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
      },
    });

    if (!response.ok) {
      console.error('❌ Failed to fetch Turnstile script:', {
        status: response.status,
        statusText: response.statusText,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json(
        { error: 'Failed to load Turnstile script' },
        { status: response.status }
      );
    }

    const scriptContent = await response.text();
    
    // Get the host from the request headers
    const host = request.headers.get('host') || 'localhost:3000';
    
    // Replace Cloudflare URLs with our proxy URLs to hide them from network tab
    const modifiedScript = scriptContent
      .replace(/https:\/\/challenges\.cloudflare\.com\/turnstile\/v0\/api\/js/g, '/api/turnstile/challenge')
      .replace(/challenges\.cloudflare\.com/g, host);
    
    console.log('✅ Turnstile script proxied successfully:', {
      originalSize: scriptContent.length,
      modifiedSize: modifiedScript.length,
      urlsReplaced: scriptContent !== modifiedScript,
      host: host,
      timestamp: new Date().toISOString()
    });

    // Return the script with proper headers
    return new NextResponse(modifiedScript, {
      status: 200,
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Turnstile script proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

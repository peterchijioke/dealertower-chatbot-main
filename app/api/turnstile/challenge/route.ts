// API Route: /api/turnstile/challenge - Proxy for Turnstile challenge requests to hide Cloudflare URLs
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Proxying Turnstile challenge request...');

    const body = await request.text();
    
    // Forward the request to Cloudflare Turnstile
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/api/js', {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('Content-Type') || 'application/x-www-form-urlencoded',
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        'Accept': request.headers.get('Accept') || '*/*',
        'Accept-Encoding': request.headers.get('Accept-Encoding') || 'gzip, deflate, br',
        'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
        'Origin': 'https://challenges.cloudflare.com',
        'Referer': request.headers.get('Referer') || '',
      },
      body: body,
    });

    console.log('📤 Turnstile challenge response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('Content-Type'),
      timestamp: new Date().toISOString()
    });

    const responseData = await response.text();

    // Return the response with proper headers
    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('❌ Turnstile challenge proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Proxying Turnstile challenge GET request...');

    const url = new URL(request.url);
    const params = url.searchParams;
    
    // Build the Cloudflare URL with query parameters
    const cloudflareUrl = new URL('https://challenges.cloudflare.com/turnstile/v0/api/js');
    params.forEach((value, key) => {
      cloudflareUrl.searchParams.set(key, value);
    });

    const response = await fetch(cloudflareUrl.toString(), {
      method: 'GET',
      headers: {
        'User-Agent': request.headers.get('User-Agent') || 'Mozilla/5.0',
        'Accept': request.headers.get('Accept') || '*/*',
        'Accept-Encoding': request.headers.get('Accept-Encoding') || 'gzip, deflate, br',
        'Accept-Language': request.headers.get('Accept-Language') || 'en-US,en;q=0.9',
        'Referer': request.headers.get('Referer') || '',
      },
    });

    console.log('📤 Turnstile challenge GET response:', {
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('Content-Type'),
      timestamp: new Date().toISOString()
    });

    const responseData = await response.text();

    return new NextResponse(responseData, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/javascript',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    console.error('❌ Turnstile challenge GET proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const urlParam = searchParams.get('url');

  if (!urlParam) {
    return new NextResponse('URL parameter is required', {status: 400});
  }

  // Ensure the URL has a protocol, defaulting to http for localhost
  let url = urlParam;
  if (!url.startsWith('http')) {
    if (url.includes('localhost')) {
      url = `http://${url}`;
    } else {
      url = `https://${url}`;
    }
  }

  try {
    const response = await fetch(url, {
        headers: {
            'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });
    if (!response.ok) {
      const errorText = await response.text();
      return new NextResponse(`Failed to fetch URL: ${errorText || response.statusText}`, {
        status: response.status,
      });
    }

    const html = await response.text();

    const headers = new Headers(response.headers);
    headers.set('Content-Type', 'text/html');

    return new NextResponse(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error: any) {
    console.error('Fetch HTML error:', error);
    let errorMessage = 'An unknown error occurred while trying to fetch the URL.';
    if (error.cause && typeof error.cause === 'object' && 'code' in error.cause) {
      if(error.cause.code === 'ECONNREFUSED') {
          errorMessage = `Connection refused at ${url}. Please ensure your local server is running and accessible.`;
      } else {
          errorMessage = `A network error occurred: ${error.cause.code}`;
      }
    } else if (error instanceof Error) {
        errorMessage = error.message;
    }
    return new NextResponse(errorMessage, {status: 500});
  }
}

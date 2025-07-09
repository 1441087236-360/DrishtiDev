import {NextRequest, NextResponse} from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const {searchParams} = new URL(request.url);
  const urlParam = searchParams.get('url');
  const previewId = searchParams.get('previewId');

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
      return new NextResponse(`Failed to fetch URL: ${response.statusText}`, {
        status: response.status,
      });
    }

    // We only want to modify HTML content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('text/html')) {
        return response;
    }

    let html = await response.text();

    // 1. Inject <base> tag to fix relative paths
    const baseTag = `<base href="${url}">`;
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`);
    } else {
      // Fallback for pages without a <head> tag
      html = baseTag + html;
    }

    // 2. Inject eruda and URL reporting scripts
    const injectionScripts = `
      <script>
        (function() {
          const previewId = '${previewId}';

          function reportUrl() {
            if (window.parent) {
              window.parent.postMessage({ 
                type: 'drishtidev-url-update', 
                url: window.location.href,
                previewId: previewId 
              }, '*');
            }
          }
          
          // Report on initial load, after a slight delay for SPAs
          setTimeout(reportUrl, 100);

          // Monkey-patch history.pushState for SPAs
          const originalPushState = history.pushState;
          history.pushState = function() {
            originalPushState.apply(this, arguments);
            reportUrl();
          };

          // Listen for popstate (back/forward buttons)
          window.addEventListener('popstate', reportUrl);
        })();
      </script>
      <script src="https://cdn.jsdelivr.net/npm/eruda"></script>
      <script>eruda.init();</script>
    `;
    html = html.replace('</body>', `${injectionScripts}</body>`);

    const headers = new Headers(response.headers);
    // Remove security headers that might block the script or iframe rendering
    headers.delete('Content-Security-Policy');
    headers.delete('X-Frame-Options');
    headers.set('Content-Type', 'text/html');

    return new NextResponse(html, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error fetching the URL.', {status: 500});
  }
}

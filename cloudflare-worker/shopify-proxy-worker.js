
// Shopify Proxy Worker
// This worker acts as a secure proxy between your frontend and Shopify's Admin API

// Your Shopify credentials - will be set as environment variables in Cloudflare
// DO NOT HARD-CODE THESE VALUES IN PRODUCTION
// const SHOPIFY_STORE_URL = '1d8ac2-1f.myshopify.com';
// const SHOPIFY_ACCESS_TOKEN = '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';

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCors();
  }

  // Get URL pathname
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+/, '');

  // Only allow specific API endpoints
  if (path === 'shop') {
    return await handleShopInfo(request);
  } else if (path === 'products') {
    return await handleProducts(request);
  } else if (path === 'orders') {
    return await handleOrders(request);
  } else {
    return new Response('Not Found', { status: 404 });
  }
}

async function handleShopInfo(request) {
  try {
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/admin/api/2024-01/shop.json`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API error (${response.status}): ${errorText}`);
      return corsResponse({ error: `Shopify API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    
    return corsResponse(data);
  } catch (error) {
    console.error('Failed to fetch shop info:', error);
    return corsResponse({ error: 'Failed to fetch shop info' }, 500);
  }
}

async function handleProducts(request) {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get('limit') || '250';
    
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/admin/api/2024-01/products.json?limit=${limit}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API error (${response.status}): ${errorText}`);
      return corsResponse({ error: `Shopify API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    
    return corsResponse(data);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return corsResponse({ error: 'Failed to fetch products' }, 500);
  }
}

async function handleOrders(request) {
  try {
    const url = new URL(request.url);
    
    // Get all query parameters and forward them to Shopify
    const params = new URLSearchParams();
    for (const [key, value] of url.searchParams.entries()) {
      params.append(key, value);
    }
    
    const response = await fetch(`https://${SHOPIFY_STORE_URL}/admin/api/2024-01/orders.json?${params}`, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API error (${response.status}): ${errorText}`);
      return corsResponse({ error: `Shopify API error: ${response.status}` }, response.status);
    }

    const data = await response.json();
    
    return corsResponse(data);
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return corsResponse({ error: 'Failed to fetch orders' }, 500);
  }
}

function handleCors() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400'
    }
  });
}

function corsResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  });
}

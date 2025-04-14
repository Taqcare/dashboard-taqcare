
import { Handler } from '@netlify/functions';

const handler: Handler = async (event, context) => {
  // Set CORS headers to allow requests only from our frontend
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  try {
    // Shopify API endpoint
    const shopifyUrl = 'https://1d8ac2-1f.myshopify.com/admin/api/2024-01/shop.json';
    
    // Make the request to Shopify API
    const response = await fetch(shopifyUrl, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': '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',
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(data)
    };
  } catch (error) {
    console.error('Error fetching Shopify data:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to fetch data from Shopify',
        details: error instanceof Error ? error.message : String(error) 
      })
    };
  }
};

export { handler };

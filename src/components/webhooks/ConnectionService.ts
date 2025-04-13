
import axios from 'axios';
import { PlatformStatus } from './PlatformCard';

export const testConnection = async (platform: PlatformStatus) => {
  try {
    switch (platform.name) {
      case 'Shopify': {
        if (!platform.accessToken) {
          throw new Error('Missing Shopify access token');
        }

        // Determinar a base URL conforme o ambiente
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')
          ? '/admin/api/2024-01/shop.json'
          : `https://${import.meta.env.VITE_SHOPIFY_STORE_URL}/admin/api/2024-01/shop.json`;
        
        // Configurar headers para produção ou desenvolvimento
        const headers = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')
          ? {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          : {
              'X-Shopify-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            };

        const shopifyResponse = await axios.get(baseUrl, { headers });
        
        if (!shopifyResponse.data?.shop) {
          throw new Error('Invalid Shopify response structure');
        }
        
        return { isConnected: true, error: undefined };
      }

      case 'Facebook': {
        // Determinar a base URL conforme o ambiente
        const baseUrl = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com')
          ? '/graph.facebook.com/v19.0/debug_token'
          : `https://graph.facebook.com/v19.0/debug_token`;
        
        // Construir parâmetros da URL
        const params = new URLSearchParams({
          input_token: import.meta.env.VITE_FB_ACCESS_TOKEN || '',
          access_token: import.meta.env.VITE_FB_ACCESS_TOKEN || ''
        });
        
        const fbResponse = await axios.get(`${baseUrl}?${params.toString()}`, {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });
        
        if (!fbResponse.data?.data?.is_valid) {
          throw new Error('Invalid Facebook token');
        }
        
        return { isConnected: true, error: undefined };
      }

      default:
        throw new Error(`Unknown platform: ${platform.name}`);
    }
  } catch (error) {
    console.error(`Error testing ${platform.name} connection:`, error);
    return { 
      isConnected: false, 
      error: error instanceof Error ? error.message : 'Connection failed' 
    };
  }
};

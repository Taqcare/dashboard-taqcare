
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { ProxyOptions } from 'vite';

// Hardcoded environment variables
const ENV_VARIABLES = {
  VITE_SHOPIFY_ACCESS_TOKEN: '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',
  VITE_SHOPIFY_STORE_URL: '1d8ac2-1f.myshopify.com',
  VITE_SHOPIFY_API_KEY: '11c6d1d0936e73524a0e6df63919e77b',
  VITE_SHOPIFY_API_SECRET: 'fedbda17cf840554a0598c23ceba0b70',
  VITE_FB_APP_ID: '1364226285028583',
  VITE_FB_BUSINESS_ID: '317173661178378',
  VITE_FB_ACCESS_TOKEN: 'EAAJGXh10g8wBOysBjX8k7GciQnk9kBnPrKRbzEs0xMYZCJS7zwI7sbbccZBbjR5paEWZAC4936b5twzl7GxH9NqVt3JcUMnZCo9RcwaZB34IG7mdLJ0IsKMAejDhz9AdCRxUujA1whVhGl4QZCG3NNIsjROVlMU95DXvT2JsIu4bDEr5rZBmYbdqHKmhBgWRRj2OQXY2omL',
  VITE_FB_AD_ACCOUNT_ID: '1048482983703833',
  VITE_APPMAX_API_KEY: '9DAC4B41-6C39A6A1-69FA157F-F8CF3D26',
  VITE_APPMAX_SECRET_KEY: '$2y$10$iORVz0iZfy45evKPY7gyAeV4KGmjeLrmtDSEhLDPaR0qLlOQUMaJ'
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const proxyConfig: Record<string, ProxyOptions> = {
    '/admin/api': {
      target: `https://${ENV_VARIABLES.VITE_SHOPIFY_STORE_URL}`,
      changeOrigin: true,
      secure: true,
      headers: {
        'X-Shopify-Access-Token': ENV_VARIABLES.VITE_SHOPIFY_ACCESS_TOKEN,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    },
    '/graph.facebook.com': {
      target: 'https://graph.facebook.com',
      changeOrigin: true,
      secure: true,
      rewrite: (path) => path.replace(/^\/graph\.facebook\.com/, ''),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    }
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    define: {
      'process.env': ENV_VARIABLES
    },
    server: {
      port: 8080,
      host: true,
      proxy: proxyConfig,
      hmr: {
        timeout: 30000
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            charts: ['recharts'],
            icons: ['lucide-react']
          }
        }
      }
    }
  };
});

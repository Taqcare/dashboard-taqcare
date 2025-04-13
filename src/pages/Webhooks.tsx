
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import axios from 'axios';

interface PlatformStatus {
  name: string;
  isConnected: boolean;
  apiKey: string;
  secretKey?: string;
  accessToken?: string;
  lastChecked: Date;
  error?: string;
}

const Webhooks = () => {
  const [platforms, setPlatforms] = useState<PlatformStatus[]>([
    {
      name: 'Shopify',
      isConnected: true,
      apiKey: import.meta.env.VITE_SHOPIFY_API_KEY || '',
      accessToken: import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || '',
      lastChecked: new Date(),
    },
    {
      name: 'Facebook',
      isConnected: true,
      apiKey: import.meta.env.VITE_FB_APP_ID || '',
      accessToken: import.meta.env.VITE_FB_ACCESS_TOKEN || '',
      lastChecked: new Date(),
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Determine if we're in development or production
  const isDev = window.location.hostname === 'localhost' || 
                window.location.hostname.includes('lovableproject.com');

  const testConnection = async (platform: PlatformStatus) => {
    try {
      switch (platform.name) {
        case 'Shopify': {
          if (!platform.accessToken) {
            throw new Error('Missing Shopify access token');
          }

          let response;
          if (isDev) {
            // In development, use the proxy
            response = await axios.get('/admin/api/2024-01/shop.json', {
              timeout: 10000
            });
          } else {
            // In production, use the Netlify redirect
            response = await axios.get('/api/shopify/shop.json', {
              timeout: 10000,
              headers: {
                'X-Shopify-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
                'Content-Type': 'application/json'
              }
            });
          }
          
          if (!response.data?.shop) {
            throw new Error('Invalid Shopify response structure');
          }
          
          return { isConnected: true, error: undefined };
        }

        case 'Facebook': {
          let response;
          if (isDev) {
            // In development, use the proxy
            response = await axios.get('/graph.facebook.com/v19.0/debug_token', {
              params: {
                input_token: import.meta.env.VITE_FB_ACCESS_TOKEN || '',
                access_token: import.meta.env.VITE_FB_ACCESS_TOKEN || ''
              }
            });
          } else {
            // In production, use the Netlify redirect
            response = await axios.get('/api/facebook/debug_token', {
              params: {
                input_token: import.meta.env.VITE_FB_ACCESS_TOKEN || '',
                access_token: import.meta.env.VITE_FB_ACCESS_TOKEN || ''
              }
            });
          }
          
          if (!response.data?.data?.is_valid) {
            throw new Error('Invalid Facebook token');
          }
          
          return { isConnected: true, error: undefined };
        }

        default:
          throw new Error(`Unknown platform: ${platform.name}`);
      }
    } catch (error) {
      console.error(`Error testing ${platform.name} connection:`, error);
      let errorMessage = 'Connection failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (axios.isAxiosError(error) && error.response) {
        errorMessage = `Error ${error.response.status}: ${error.response.statusText || 'Server error'}`;
      } else if (axios.isAxiosError(error) && error.message.includes('Network Error')) {
        errorMessage = 'Network error, please check your connection';
      }
      
      return { 
        isConnected: false, 
        error: errorMessage
      };
    }
  };

  const refreshConnections = async () => {
    setIsRefreshing(true);
    
    try {
      const updatedPlatforms = await Promise.all(
        platforms.map(async (platform) => {
          const { isConnected, error } = await testConnection(platform);
          return {
            ...platform,
            isConnected,
            error,
            lastChecked: new Date()
          };
        })
      );

      setPlatforms(updatedPlatforms);
    } catch (error) {
      console.error('Error refreshing connections:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshConnections();
  }, []);

  const maskKey = (key: string) => {
    if (!key) return '—';
    return `${key.slice(0, 8)}...${key.slice(-4)}`;
  };

  const getStatusIcon = (platform: PlatformStatus) => {
    if (platform.isConnected) {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    }
    if (platform.error) {
      return <XCircle className="h-6 w-6 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="section-title">Webhooks & Integrations</h1>
        <button
          onClick={refreshConnections}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh Status
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {platforms.map((platform) => (
          <div key={platform.name} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {getStatusIcon(platform)}
                </div>
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{platform.name}</h2>
                  <p className="text-sm text-gray-500">
                    Last checked: {platform.lastChecked.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-sm ${
                platform.isConnected 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {platform.isConnected ? 'Connected' : 'Disconnected'}
              </div>
            </div>

            {platform.error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 flex-shrink-0" />
                <span>{platform.error}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">API Key</span>
                <code className="px-2 py-1 bg-gray-100 rounded">
                  {maskKey(platform.apiKey)}
                </code>
              </div>

              {platform.accessToken && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Access Token</span>
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {maskKey(platform.accessToken)}
                  </code>
                </div>
              )}

              {platform.name === 'Shopify' && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Store URL</span>
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {import.meta.env.VITE_SHOPIFY_STORE_URL || '—'}
                  </code>
                </div>
              )}
            </div>

            {platform.name === 'Facebook' && platform.isConnected && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Business ID</span>
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {maskKey(import.meta.env.VITE_FB_BUSINESS_ID || '')}
                  </code>
                </div>
                <div className="flex items-center justify-between text-sm mt-3">
                  <span className="text-gray-600">Ad Account ID</span>
                  <code className="px-2 py-1 bg-gray-100 rounded">
                    {maskKey(import.meta.env.VITE_FB_AD_ACCOUNT_ID || '')}
                  </code>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Webhooks;


import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import PlatformCard, { PlatformStatus } from '../components/webhooks/PlatformCard';
import { testConnection } from '../components/webhooks/ConnectionService';
import ShopifyServerTest from '../components/ShopifyServerTest';

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

      {/* Novo componente de teste server-side */}
      <ShopifyServerTest />

      <div className="grid grid-cols-1 gap-6">
        {platforms.map((platform) => (
          <PlatformCard key={platform.name} platform={platform} />
        ))}
      </div>
    </div>
  );
};

export default Webhooks;

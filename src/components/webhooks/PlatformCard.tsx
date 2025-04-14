
import React from 'react';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export interface PlatformStatus {
  name: string;
  isConnected: boolean;
  apiKey: string;
  secretKey?: string;
  accessToken?: string;
  lastChecked: Date;
  error?: string;
}

interface PlatformCardProps {
  platform: PlatformStatus;
}

const PlatformCard: React.FC<PlatformCardProps> = ({ platform }) => {
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
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
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
        <div className={`px-3 py-1 rounded-full text-sm w-fit ${
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
          <span className="break-words">{platform.error}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
          <span className="text-gray-600">API Key</span>
          <code className="mt-1 md:mt-0 px-2 py-1 bg-gray-100 rounded break-all">
            {maskKey(platform.apiKey)}
          </code>
        </div>

        {platform.accessToken && (
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
            <span className="text-gray-600">Access Token</span>
            <code className="mt-1 md:mt-0 px-2 py-1 bg-gray-100 rounded break-all">
              {maskKey(platform.accessToken)}
            </code>
          </div>
        )}

        {platform.name === 'Shopify' && (
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
            <span className="text-gray-600">Store URL</span>
            <code className="mt-1 md:mt-0 px-2 py-1 bg-gray-100 rounded break-all">
              {import.meta.env.VITE_SHOPIFY_STORE_URL || '—'}
            </code>
          </div>
        )}
      </div>

      {platform.name === 'Facebook' && platform.isConnected && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm">
            <span className="text-gray-600">Business ID</span>
            <code className="mt-1 md:mt-0 px-2 py-1 bg-gray-100 rounded break-all">
              {maskKey(import.meta.env.VITE_FB_BUSINESS_ID || '')}
            </code>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between text-sm mt-3">
            <span className="text-gray-600">Ad Account ID</span>
            <code className="mt-1 md:mt-0 px-2 py-1 bg-gray-100 rounded break-all">
              {maskKey(import.meta.env.VITE_FB_AD_ACCOUNT_ID || '')}
            </code>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlatformCard;

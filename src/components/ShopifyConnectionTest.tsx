
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { testWorkerConnection } from '../services/shopifyWorker';

const ShopifyConnectionTest = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shopInfo, setShopInfo] = useState<any>(null);

  const checkConnection = async () => {
    setStatus('loading');
    setErrorMessage('');

    try {
      const result = await testWorkerConnection();
      
      if (result.isConnected) {
        setStatus('success');
        setShopInfo(result.shopInfo);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('Shopify error response:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Erro ao conectar com Shopify Worker');
    }
  };

  return (
    <div className="bg-white rounded-[10px] shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Status da Conexão Shopify</h2>
        <button
          onClick={checkConnection}
          disabled={status === 'loading'}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {status === 'loading' ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Testar Conexão
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <span className="font-medium text-gray-700">Worker URL:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-sm">
            {`https://shopify-proxy-worker.alexsjesus561.workers.dev`}
          </code>
        </div>

        {status !== 'idle' && (
          <div className={`flex items-center gap-2 p-4 rounded-lg ${
            status === 'success' 
              ? 'bg-green-50 text-green-700' 
              : status === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-gray-50 text-gray-700'
          }`}>
            {status === 'success' ? (
              <>
                <CheckCircle className="h-5 w-5" />
                <span>Conexão estabelecida com sucesso!</span>
              </>
            ) : status === 'error' ? (
              <>
                <AlertCircle className="h-5 w-5" />
                <span>{errorMessage}</span>
              </>
            ) : (
              <span>Testando conexão...</span>
            )}
          </div>
        )}

        {status === 'success' && shopInfo && (
          <div className="mt-4">
            <h3 className="font-medium text-gray-800 mb-2">Informações da Loja:</h3>
            <div className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(shopInfo, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyConnectionTest;

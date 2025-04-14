
import React, { useState } from 'react';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

const ShopifyServerTest = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [shopInfo, setShopInfo] = useState<any>(null);

  const testConnection = async () => {
    setStatus('loading');
    setErrorMessage('');
    setShopInfo(null);

    try {
      // Call our server-side function
      const response = await axios.get('/functions/getShopifyShopInfo');
      
      if (response.data?.shop) {
        setStatus('success');
        setShopInfo(response.data.shop);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Shopify error response:', error);
      setStatus('error');
      if (error.response?.status === 401) {
        setErrorMessage('Token de acesso inválido ou expirado');
      } else if (error.response?.status === 404) {
        setErrorMessage('URL da loja inválida');
      } else {
        setErrorMessage(error.message || 'Erro ao conectar com Shopify');
      }
    }
  };

  return (
    <div className="bg-white rounded-[10px] shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900">Status da Conexão Shopify (Server)</h2>
        <button
          onClick={testConnection}
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
          <span className="font-medium text-gray-700">Store URL:</span>
          <code className="px-2 py-1 bg-gray-100 rounded text-sm">
            {import.meta.env.VITE_SHOPIFY_STORE_URL}
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

        {shopInfo && (
          <div className="mt-4">
            <h3 className="text-md font-medium mb-2">Informações da Loja:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p><strong>Nome:</strong> {shopInfo.name}</p>
              <p><strong>Email:</strong> {shopInfo.email}</p>
              <p><strong>Domínio:</strong> {shopInfo.domain}</p>
              <p><strong>País:</strong> {shopInfo.country_name}</p>
              <p><strong>Plano:</strong> {shopInfo.plan_name}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopifyServerTest;

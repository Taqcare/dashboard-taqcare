
import axios from 'axios';

/**
 * Função para obter informações da loja Shopify
 * Esta função é adaptada para funcionar tanto em ambiente de desenvolvimento quanto em produção
 */
export const getShopifyShopInfo = async () => {
  try {
    const isProduction = import.meta.env.PROD;
    const shopifyStoreUrl = import.meta.env.VITE_SHOPIFY_STORE_URL || '1d8ac2-1f.myshopify.com';
    const shopifyAccessToken = import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN || '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';
    
    // Headers comuns para ambos os ambientes
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    let response;
    
    if (isProduction) {
      // Em produção, temos que lidar com CORS de forma diferente
      // Opção 1: Tentar com mode: 'cors' e headers CORS específicos
      try {
        const productionHeaders = {
          ...headers,
          'X-Shopify-Access-Token': shopifyAccessToken,
          'Origin': window.location.origin
        };
        
        response = await fetch(
          `https://${shopifyStoreUrl}/admin/api/2024-01/shop.json`,
          { 
            method: 'GET',
            headers: productionHeaders,
            mode: 'cors',
            credentials: 'omit'
          }
        );
      } catch (corsError) {
        console.warn('Tentativa CORS falhou, usando o proxy como fallback:', corsError);
        
        // Se falhar, tentar com o endpoint relativo que será processado pelo proxy
        response = await fetch(
          '/admin/api/2024-01/shop.json',
          { 
            method: 'GET',
            headers: {
              ...headers,
              'X-Shopify-Access-Token': shopifyAccessToken
            }
          }
        );
      }
      
      if (!response.ok) {
        throw new Error(`Erro na resposta: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data?.shop) {
        throw new Error('Dados da loja não encontrados na resposta');
      }
      
      return data.shop;
    } else {
      // Em desenvolvimento, usa o proxy configurado no vite.config.ts
      response = await axios.get('/admin/api/2024-01/shop.json', { headers });
      
      if (!response.data?.shop) {
        throw new Error('Dados da loja não encontrados na resposta');
      }
      
      return response.data.shop;
    }
  } catch (error: any) {
    console.error('Erro ao obter informações da loja Shopify:', error);
    
    if (error.response?.status === 401 || error.status === 401) {
      throw new Error('Token de acesso Shopify inválido ou expirado');
    } else if (error.response?.status === 404 || error.status === 404) {
      throw new Error('URL da loja Shopify inválida');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Tempo limite de conexão excedido. Tente novamente.');
    }
    
    throw new Error(`Erro ao acessar a API da Shopify: ${error.message || 'Erro desconhecido'}`);
  }
};

/**
 * Verifica se a conexão com a Shopify está funcionando
 * @returns Um objeto indicando o status da conexão
 */
export const testShopifyConnection = async () => {
  try {
    const shopInfo = await getShopifyShopInfo();
    return {
      isConnected: true,
      shopInfo
    };
  } catch (error: any) {
    return {
      isConnected: false,
      error: error.message || 'Erro ao conectar com Shopify'
    };
  }
};

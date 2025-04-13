
import axios from 'axios';

/**
 * Função para obter informações da loja Shopify
 * Esta função utiliza o proxy configurado no vite.config.ts para evitar problemas de CORS
 * e manter o token de acesso seguro no lado do servidor
 */
export const getShopifyShopInfo = async () => {
  try {
    // Usa o proxy configurado no vite.config.ts
    // Em desenvolvimento, isso será redirecionado através do proxy
    // Em produção, usará a URL completa com o token nos headers
    const response = await axios.get('/admin/api/2024-01/shop.json', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.data?.shop) {
      throw new Error('Dados da loja não encontrados na resposta');
    }

    return response.data.shop;
  } catch (error: any) {
    console.error('Erro ao obter informações da loja Shopify:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Token de acesso Shopify inválido ou expirado');
    } else if (error.response?.status === 404) {
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

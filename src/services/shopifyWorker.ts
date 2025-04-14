
import axios from 'axios';

// Base URL for the Cloudflare Worker
// You'll need to update this with your actual worker URL after deployment
const WORKER_BASE_URL = 'https://shopify-proxy-worker.your-worker-subdomain.workers.dev';

// Get shop information
export const getShopInfo = async () => {
  try {
    const response = await axios.get(`${WORKER_BASE_URL}/shop`, {
      timeout: 10000
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching shop info from worker:', error);
    throw error;
  }
};

// Get products
export const getProducts = async (limit = 250) => {
  try {
    const response = await axios.get(`${WORKER_BASE_URL}/products`, {
      params: { limit },
      timeout: 10000
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching products from worker:', error);
    throw error;
  }
};

// Get orders with custom parameters
export const getOrders = async (params: Record<string, any> = {}) => {
  try {
    const response = await axios.get(`${WORKER_BASE_URL}/orders`, {
      params,
      timeout: 10000
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders from worker:', error);
    throw error;
  }
};

// Test the worker connection
export const testWorkerConnection = async () => {
  try {
    const response = await axios.get(`${WORKER_BASE_URL}/shop`, {
      timeout: 10000
    });
    
    if (response.data?.shop) {
      return { isConnected: true, shopInfo: response.data.shop };
    } else {
      return { isConnected: false, error: 'Invalid response from worker' };
    }
  } catch (error: any) {
    console.error('Error testing worker connection:', error);
    return { 
      isConnected: false, 
      error: error.message || 'Failed to connect to worker'
    };
  }
};

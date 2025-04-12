import axios from 'axios';
import axiosRetry from 'axios-retry';

const exchangeApi = axios.create({
  baseURL: 'https://api.exchangerate-api.com/v4/latest',
  timeout: 10000
});

axiosRetry(exchangeApi, {
  retries: 3,
  retryDelay: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 5000),
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.code === 'ECONNABORTED' ||
           error.response?.status === 429 ||
           (error.response?.status >= 500 && error.response?.status <= 599);
  }
});

export const getUSDtoBRL = async (): Promise<number> => {
  try {
    const response = await exchangeApi.get('/USD');
    return response.data.rates.BRL || 5; // Default to 5 if rate not available
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    return 5; // Default exchange rate if API fails
  }
};
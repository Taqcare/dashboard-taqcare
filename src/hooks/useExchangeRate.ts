import useSWR from 'swr';
import { getUSDtoBRL } from '../services/exchange';

export const useExchangeRate = () => {
  const { data: rate, error } = useSWR('exchange-rate', getUSDtoBRL, {
    refreshInterval: 3600000, // Refresh every hour
    revalidateOnFocus: false,
    dedupingInterval: 3600000
  });

  return {
    rate: rate || 5, // Default to 5 if not available
    isLoading: !error && !rate,
    isError: error
  };
};
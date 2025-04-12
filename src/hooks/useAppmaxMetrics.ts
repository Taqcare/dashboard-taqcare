import { useCallback } from 'react';
import type { AppmaxMetrics } from '../services/appmax';
import { fetchAppmaxMetrics } from '../services/appmax';

export const useAppmaxMetrics = (timeframe: string) => {
  const mutate = useCallback(async () => {
    // No-op since we're not using the API anymore
  }, []);

  return {
    metrics: null,
    isLoading: false,
    isError: false,
    mutate
  };
};
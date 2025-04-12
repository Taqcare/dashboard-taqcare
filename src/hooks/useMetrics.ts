import { useState, useCallback } from 'react';
import type { Metrics } from '../types';
import { fetchMetrics, fetchShopifyData, fetchAppmaxData, fetchMetaAdsData } from '../services/api';

export const useMetrics = () => {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async (dateRange: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const [metricsData, shopifyData, appmaxData, metaAdsData] = await Promise.all([
        fetchMetrics(dateRange),
        fetchShopifyData(dateRange),
        fetchAppmaxData(dateRange),
        fetchMetaAdsData(dateRange)
      ]);

      // Combine and process all data
      const combinedData = {
        ...metricsData,
        shopify: shopifyData,
        appmax: appmaxData,
        metaAds: metaAdsData
      };

      setMetrics(combinedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    metrics,
    isLoading,
    error,
    refreshData
  };
};
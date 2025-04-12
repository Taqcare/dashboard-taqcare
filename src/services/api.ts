import axios from 'axios';
import type { Metrics } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
});

export const fetchMetrics = async (dateRange: string): Promise<Metrics> => {
  try {
    const response = await api.get(`/metrics?range=${dateRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

export const fetchShopifyData = async (dateRange: string) => {
  try {
    const response = await api.get(`/shopify/metrics?range=${dateRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Shopify data:', error);
    throw error;
  }
};

export const fetchAppmaxData = async (dateRange: string) => {
  try {
    const response = await api.get(`/appmax/metrics?range=${dateRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Appmax data:', error);
    throw error;
  }
};

export const fetchMetaAdsData = async (dateRange: string) => {
  try {
    const response = await api.get(`/meta-ads/metrics?range=${dateRange}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Meta Ads data:', error);
    throw error;
  }
};
import axios from 'axios';
import axiosRetry from 'axios-retry';

export interface FacebookMetrics {
  spend: number;
  impressions: number;
  clicks: number;
  purchases: number;
  revenue: number;
  error?: {
    type: 'token_expired' | 'api_error' | 'network_error';
    message: string;
  };
}

interface TokenDebugResponse {
  data: {
    app_id: string;
    type: string;
    application: string;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
  };
}

const facebookApi = axios.create({
  baseURL: 'https://graph.facebook.com/v19.0',
  timeout: 60000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
});

// Configure retry logic
axiosRetry(facebookApi, {
  retries: 3,
  retryDelay: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 10000),
  retryCondition: (error) => {
    // Don't retry on auth errors
    if (error.response?.status === 400 && error.response?.data?.error?.code === 190) {
      return false;
    }
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.code === 'ECONNABORTED' ||
           error.response?.status === 429 ||
           (error.response?.status >= 500 && error.response?.status <= 599);
  }
});

const validateToken = async (token: string): Promise<boolean> => {
  try {
    const response = await facebookApi.get<TokenDebugResponse>('/debug_token', {
      params: {
        input_token: token,
        access_token: token
      }
    });

    return response.data?.data?.is_valid || false;
  } catch (error) {
    return false;
  }
};

export const fetchFacebookMetrics = async (startDate: string, endDate: string): Promise<FacebookMetrics> => {
  try {
    const adAccountId = import.meta.env.VITE_FB_AD_ACCOUNT_ID;
    const accessToken = import.meta.env.VITE_FB_ACCESS_TOKEN;

    if (!adAccountId || !accessToken) {
      return {
        spend: 0,
        impressions: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0,
        error: {
          type: 'api_error',
          message: 'Facebook credentials not configured'
        }
      };
    }

    // Get campaign insights
    const response = await facebookApi.get(`/act_${adAccountId}/insights`, {
      params: {
        access_token: accessToken,
        level: 'account',
        fields: 'spend,impressions,clicks',
        time_range: JSON.stringify({
          since: startDate,
          until: endDate
        }),
        limit: 1000
      }
    });

    if (!response.data?.data?.length) {
      return {
        spend: 0,
        impressions: 0,
        clicks: 0,
        purchases: 0,
        revenue: 0
      };
    }

    const data = response.data.data[0];
    return {
      spend: parseFloat(data.spend || '0'),
      impressions: parseInt(data.impressions || '0', 10),
      clicks: parseInt(data.clicks || '0', 10),
      purchases: 0,
      revenue: 0
    };

  } catch (error: any) {
    console.error('Error fetching Facebook metrics:', error);
    
    return {
      spend: 0,
      impressions: 0,
      clicks: 0,
      purchases: 0,
      revenue: 0,
      error: {
        type: 'api_error',
        message: error.response?.data?.error?.message || 'Error fetching Facebook metrics'
      }
    };
  }
};
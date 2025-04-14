import axios from 'axios';
import axiosRetry from 'axios-retry';
import { format, startOfDay, endOfDay } from 'date-fns';
import { zonedTimeToUtc, utcToZonedTime } from 'date-fns-tz';
import { getShopInfo, getProducts, getOrders } from './shopifyWorker';

export interface ShopifyMetrics {
  totalRevenue: number;
  paidRevenue: number;
  orderCount: number;
  paidOrderCount: number;
  aov: number;
  cogs: number;
  shippingCost: number;
  paymentMethods: {
    pix: number;
    creditCard: number;
  };
  taxes: {
    orderTaxes: number;  // 7.23% of each paid order
    prcTaxes: number;    // Fixed PRC tax per paid order
  };
}

export interface ShopifyProduct {
  id: number;
  title: string;
  price: string;
  productCost: number;
  image: string;
  variants: Array<{
    id: number;
    title: string;
    price: string;
  }>;
}

export interface ShippingRate {
  id: string;
  name: string;
  description: string;
  price: string;
  shippingCost: number;
  processingTime: string;
  origin: string;
  destination: string;
}

const shopifyApi = axios.create({
  baseURL: '/admin/api/2024-01',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Shopify-Access-Token': import.meta.env.VITE_SHOPIFY_ACCESS_TOKEN,
    'Keep-Alive': 'timeout=30, max=100'
  }
});

axiosRetry(shopifyApi, {
  retries: 3,
  retryDelay: (retryCount) => Math.min(1000 * Math.pow(2, retryCount), 5000),
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
           error.code === 'ECONNABORTED' ||
           error.response?.status === 429 ||
           error.response?.status === 408 ||
           error.response?.status === 502 ||
           (error.response?.status >= 500 && error.response?.status <= 599);
  }
});

const formatShopifyDate = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ssxxx");
};

const calculateOrderShippingCost = (order: any, shippingCosts: Record<string, number>): number => {
  const shippingLine = order.shipping_lines?.[0];
  if (!shippingLine) return 0;

  const shippingTitle = shippingLine.title?.toLowerCase() || '';
  
  if (shippingTitle.includes('grátis') || shippingTitle.includes('free')) {
    return shippingCosts['free-shipping'] || 0;
  } else if (shippingTitle.includes('premium')) {
    return shippingCosts['premium-shipping'] || 0;
  }

  return 0;
};

const fetchOrdersBatch = async (startDateTime: string, endDateTime: string, lastId = 0): Promise<any[]> => {
  try {
    const response = await shopifyApi.get('/orders.json', {
      params: {
        created_at_min: startDateTime,
        created_at_max: endDateTime,
        status: 'any',
        limit: 50,
        since_id: lastId,
        fields: 'id,total_price,financial_status,created_at,cancelled_at,closed_at,fulfillment_status,line_items,shipping_lines,gateway,payment_details'
      }
    });

    if (!response.data?.orders) {
      return [];
    }

    return response.data.orders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      
      return orderDate >= startDate && orderDate <= endDate;
    });
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Shopify access token');
    }
    throw error;
  }
};

export const fetchProducts = async (): Promise<ShopifyProduct[]> => {
  try {
    const response = await shopifyApi.get('/products.json', {
      params: {
        limit: 250,
        fields: 'id,title,variants,image'
      }
    });

    if (!response.data?.products) {
      return [];
    }

    return response.data.products.map((product: any) => ({
      id: product.id,
      title: product.title,
      price: product.variants[0]?.price || '0',
      productCost: 0,
      image: product.image?.src || '',
      variants: product.variants.map((variant: any) => ({
        id: variant.id,
        title: variant.title,
        price: variant.price || '0'
      }))
    }));
  } catch (error: any) {
    if (error.response?.status === 401) {
      throw new Error('Invalid Shopify access token');
    }
    throw error;
  }
};

export const fetchShippingRates = async (): Promise<ShippingRate[]> => {
  return [
    {
      id: 'free-shipping',
      name: 'FRETE GRÁTIS',
      description: 'De 7 a 14 dias | Da Alemanha até a sua casa',
      price: '0.00',
      shippingCost: 0,
      processingTime: '7-14 dias',
      origin: 'PRC China',
      destination: 'Brasil'
    },
    {
      id: 'premium-shipping',
      name: 'FRETE PREMIUM',
      description: 'De 7 a 14 dias | Segurança Premium no seu Pedido',
      price: '29.00',
      shippingCost: 0,
      processingTime: '7-14 dias',
      origin: 'PRC China',
      destination: 'Brasil'
    }
  ];
};

const isPaidOrder = (order: any): boolean => {
  if (order.cancelled_at) return false;
  if (order.closed_at && !['paid', 'partially_paid', 'partially_refunded', 'refunded'].includes(order.financial_status)) {
    return false;
  }
  return ['paid', 'partially_paid'].includes(order.financial_status);
};

const calculateOrderCOGS = (order: any, productCosts: Record<number, number>): number => {
  if (!order.line_items || !Array.isArray(order.line_items)) return 0;
  return order.line_items.reduce((total: number, item: any) => {
    const productId = item.product_id;
    const quantity = parseInt(item.quantity, 10) || 0;
    const cost = productCosts[productId] || 0;
    return total + (cost * quantity);
  }, 0);
};

const isPixPayment = (order: any): boolean => {
  const gateway = order.gateway?.toLowerCase() || '';
  return gateway.includes('pix') || gateway.includes('pagbank_pix');
};

const calculateOrderTaxes = (order: any, taxRate: number, prcTaxPerOrder: number): { orderTax: number; prcTax: number } => {
  if (!isPaidOrder(order)) return { orderTax: 0, prcTax: 0 };
  
  const orderTotal = parseFloat(order.total_price || '0');
  return {
    orderTax: (orderTotal * taxRate) / 100,
    prcTax: prcTaxPerOrder
  };
};

export const fetchShopifyMetrics = async (startDate: string, endDate: string): Promise<ShopifyMetrics> => {
  try {
    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    // Load saved tax rates
    const savedTaxesIof = localStorage.getItem('taxesIof');
    const savedPrcTaxes = localStorage.getItem('prcTaxes');
    
    const taxRate = savedTaxesIof ? JSON.parse(savedTaxesIof)[0]?.value || 7.23 : 7.23;
    const prcTaxPerOrder = savedPrcTaxes ? JSON.parse(savedPrcTaxes)[0]?.value || 0 : 0;

    const savedProductCosts = localStorage.getItem('productCosts');
    const savedShippingCosts = localStorage.getItem('shippingCosts');
    const productCosts = savedProductCosts ? JSON.parse(savedProductCosts) : {};
    const shippingCosts = savedShippingCosts ? JSON.parse(savedShippingCosts) : {};

    const timeZone = 'America/Sao_Paulo';
    const start = zonedTimeToUtc(startOfDay(new Date(startDate)), timeZone);
    const end = zonedTimeToUtc(endOfDay(new Date(endDate)), timeZone);
    
    const startDateTime = format(start, "yyyy-MM-dd'T'HH:mm:ssxxx");
    const endDateTime = format(end, "yyyy-MM-dd'T'HH:mm:ssxxx");

    // Fetch orders using the Cloudflare Worker
    const response = await getOrders({
      created_at_min: startDateTime,
      created_at_max: endDateTime,
      status: 'any',
      limit: 250,
      fields: 'id,total_price,financial_status,created_at,cancelled_at,closed_at,fulfillment_status,line_items,shipping_lines,gateway,payment_details'
    });

    if (!response?.orders) {
      throw new Error('Failed to fetch orders from Shopify worker');
    }

    const allOrders = response.orders;

    // Filter orders based on their creation date
    const filteredOrders = allOrders.filter((order: any) => {
      const orderDate = new Date(order.created_at);
      const startDate = new Date(startDateTime);
      const endDate = new Date(endDateTime);
      
      return orderDate >= startDate && orderDate <= endDate;
    });

    const paidOrders = filteredOrders.filter(isPaidOrder);

    // Calculate taxes for all paid orders
    const taxes = paidOrders.reduce((acc, order) => {
      const { orderTax, prcTax } = calculateOrderTaxes(order, taxRate, prcTaxPerOrder);
      return {
        orderTaxes: acc.orderTaxes + orderTax,
        prcTaxes: acc.prcTaxes + prcTax
      };
    }, { orderTaxes: 0, prcTaxes: 0 });

    const totalRevenue = filteredOrders.reduce((sum: number, order: any) => {
      const price = parseFloat(order.total_price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const paidRevenue = paidOrders.reduce((sum: number, order: any) => {
      const price = parseFloat(order.total_price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const pixRevenue = paidOrders.reduce((sum: number, order: any) => {
      if (!isPixPayment(order)) return sum;
      const price = parseFloat(order.total_price || '0');
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const creditCardRevenue = paidRevenue - pixRevenue;

    const cogs = paidOrders.reduce((sum: number, order: any) => {
      return sum + calculateOrderCOGS(order, productCosts);
    }, 0);

    const shippingCost = Object.keys(shippingCosts).length > 0 
      ? paidOrders.reduce((sum: number, order: any) => {
          return sum + calculateOrderShippingCost(order, shippingCosts);
        }, 0)
      : 0;

    const orderCount = filteredOrders.length;
    const paidOrderCount = paidOrders.length;
    const aov = paidOrderCount > 0 ? paidRevenue / paidOrderCount : 0;

    return {
      totalRevenue,
      paidRevenue,
      orderCount,
      paidOrderCount,
      aov,
      cogs,
      shippingCost,
      paymentMethods: {
        pix: pixRevenue,
        creditCard: creditCardRevenue
      },
      taxes
    };
  } catch (error: any) {
    console.error('Error fetching Shopify metrics:', error);
    throw error;
  }
};

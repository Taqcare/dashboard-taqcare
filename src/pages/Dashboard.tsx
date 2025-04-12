import React, { useState, useCallback } from 'react';
import { DollarSign, TrendingUp, Calculator, Package, Receipt, Truck, Ban as Bank, RefreshCw, Banknote, Store, ShoppingBag, AlertCircle } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import DatePicker from '../components/DatePicker';
import { useShopifyMetrics } from '../hooks/useShopifyMetrics';
import { useFacebookMetrics } from '../hooks/useFacebookMetrics';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { calculateAppmaxMetrics } from '../services/appmax';

const mockData = Array.from({ length: 30 }, (_, i) => ({
  date: new Date(2024, 2, i + 1).toISOString(),
  value: Math.random() * 100
}));

const MetaAdsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="9.99981" cy="2.42364" r="1.64825" fill="#1877F2"/>
    <circle cx="9.99981" cy="17.576" r="1.64825" fill="#FFA000"/>
    <circle cx="17.5754" cy="9.99981" r="1.64825" transform="rotate(90 17.5754 9.99981)" fill="#FFFA3D"/>
    <circle cx="2.42401" cy="9.99981" r="1.64825" transform="rotate(90 2.42401 9.99981)" fill="#23AC6A"/>
    <circle cx="15.3564" cy="4.6425" r="1.64825" transform="rotate(45 15.3564 4.6425)" fill="#CB2027"/>
    <circle cx="4.64258" cy="15.3564" r="1.64825" transform="rotate(45 4.64258 15.3564)" fill="#5725EA"/>
    <circle cx="15.3565" cy="15.3564" r="1.64825" transform="rotate(135 15.3565 15.3564)" fill="#23AC6A"/>
    <circle cx="4.64265" cy="4.64258" r="1.64825" transform="rotate(135 4.64265 4.64258)" fill="black"/>
  </svg>
);

const ShopifyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 108.44 122.88" style={{ enableBackground: 'new 0 0 108.44 122.88' }}>
    <path fillRule="evenodd" clipRule="evenodd" fill="#95BF47" d="M94.98,23.66c-0.09-0.62-0.63-0.96-1.08-1c-0.45-0.04-9.19-0.17-9.19-0.17s-7.32-7.1-8.04-7.83 c-0.72-0.72-2.13-0.5-2.68-0.34c-0.01,0-1.37,0.43-3.68,1.14c-0.38-1.25-0.95-2.78-1.76-4.32c-2.6-4.97-6.42-7.6-11.03-7.61 c-0.01,0-0.01,0-0.02,0c-0.32,0-0.64,0.03-0.96,0.06c-0.14-0.16-0.27-0.32-0.42-0.48c-2.01-2.15-4.58-3.19-7.67-3.1 c-5.95,0.17-11.88,4.47-16.69,12.11c-3.38,5.37-5.96,12.12-6.69,17.35c-6.83,2.12-11.61,3.6-11.72,3.63 c-3.45,1.08-3.56,1.19-4.01,4.44C9.03,39.99,0,109.8,0,109.8l75.65,13.08l32.79-8.15C108.44,114.73,95.06,24.28,94.98,23.66 L94.98,23.66z M66.52,16.63c-1.74,0.54-3.72,1.15-5.87,1.82c-0.04-3.01-0.4-7.21-1.81-10.83C63.36,8.47,65.58,13.58,66.52,16.63 L66.52,16.63z M56.69,19.68c-3.96,1.23-8.29,2.57-12.63,3.91c1.22-4.67,3.54-9.33,6.38-12.38c1.06-1.14,2.54-2.4,4.29-3.12 C56.38,11.52,56.73,16.39,56.69,19.68L56.69,19.68z M48.58,3.97c1.4-0.03,2.57,0.28,3.58,0.94C50.55,5.74,49,6.94,47.54,8.5 c-3.78,4.06-6.68,10.35-7.83,16.43c-3.6,1.11-7.13,2.21-10.37,3.21C31.38,18.58,39.4,4.23,48.58,3.97L48.58,3.97z"/>
    <path fillRule="evenodd" clipRule="evenodd" fill="#5E8E3E" d="M93.9,22.66c-0.45-0.04-9.19-0.17-9.19-0.17s-7.32-7.1-8.04-7.83c-0.27-0.27-0.63-0.41-1.02-0.47l0,108.68 l32.78-8.15c0,0-13.38-90.44-13.46-91.06C94.9,23.04,94.35,22.7,93.9,22.66L93.9,22.66z"/>
    <path fillRule="evenodd" clipRule="evenodd" fill="#FFFFFF" d="M57.48,39.52l-3.81,14.25c0,0-4.25-1.93-9.28-1.62c-7.38,0.47-7.46,5.12-7.39,6.29 c0.4,6.37,17.16,7.76,18.11,22.69c0.74,11.74-6.23,19.77-16.27,20.41c-12.05,0.76-18.69-6.35-18.69-6.35l2.55-10.86 c0,0,6.68,5.04,12.02,4.7c3.49-0.22,4.74-3.06,4.61-5.07c-0.52-8.31-14.18-7.82-15.04-21.48c-0.73-11.49,6.82-23.14,23.48-24.19 C54.2,37.88,57.48,39.52,57.48,39.52L57.48,39.52z"/>
  </svg>
);

const AppmaxIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8L12 4L20 8V16L12 20L4 16V8Z" fill="#28D8EC" />
    <path d="M12 12L4 8M12 12V20M12 12L20 8" stroke="#3C6AFE" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 4L20 8L12 12L4 8L12 4Z" fill="#9B6AF9" fillOpacity="0.3" />
  </svg>
);

const Section = ({ title, icon: Icon, children, columns = 3 }) => (
  <div className="mb-8">
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="h-5 w-5 text-gray-600" />}
      <h2 className="section-title">{title}</h2>
    </div>
    <div className={`grid grid-cols-1 gap-4 ${
      columns === 4 
        ? 'sm:grid-cols-2 lg:grid-cols-4' 
        : columns === 3 
        ? 'sm:grid-cols-2 lg:grid-cols-3' 
        : columns === 2 
        ? 'sm:grid-cols-2' 
        : ''
    }`}>
      {children}
    </div>
  </div>
);

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState('Today');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { metrics: shopifyMetrics, isLoading: shopifyLoading, isError: shopifyError, mutate: mutateShopify } = useShopifyMetrics(timeframe);
  const { metrics: facebookMetrics, isLoading: facebookLoading, isError: facebookError, mutate: mutateFacebook } = useFacebookMetrics(timeframe);
  const { rate: exchangeRate } = useExchangeRate();

  // Load tax rates from localStorage
  const savedTaxesIof = localStorage.getItem('taxesIof');
  const savedPrcTaxes = localStorage.getItem('prcTaxes');
  const taxesIof = savedTaxesIof ? JSON.parse(savedTaxesIof) : [{ value: 7.23 }];
  const prcTaxes = savedPrcTaxes ? JSON.parse(savedPrcTaxes) : [{ value: 0 }];

  const handleDateChange = useCallback((value: string, startDate?: Date, endDate?: Date) => {
    setTimeframe(value);
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([mutateShopify(), mutateFacebook()]);
    setIsRefreshing(false);
  };

  const roas = facebookMetrics?.spend ? (shopifyMetrics?.paidRevenue ?? 0) / facebookMetrics.spend : 0;
  const cogsUSD = (shopifyMetrics?.cogs ?? 0) / exchangeRate;
  const shippingCostUSD = (shopifyMetrics?.shippingCost ?? 0) / exchangeRate;

  const appmaxMetrics = calculateAppmaxMetrics(shopifyMetrics);
  
  // Calculate Net Profit including all costs
  const netProfit = appmaxMetrics.totalRevenue - 
                   (shopifyMetrics?.cogs ?? 0) - 
                   (facebookMetrics?.spend ?? 0) - 
                   (shopifyMetrics?.shippingCost ?? 0) - 
                   (shopifyMetrics?.taxes?.prcTaxes ?? 0) - 
                   (shopifyMetrics?.taxes?.orderTaxes ?? 0);

  const taxRate = taxesIof[0]?.value || 7.23;
  const prcTaxPerOrder = prcTaxes[0]?.value || 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h1 className="section-title">Dashboard</h1>
          <DatePicker value={timeframe} onChange={handleDateChange} />
        </div>

        <button 
          onClick={handleRefresh}
          className="p-2 rounded-[10px] border border-gray-200 hover:bg-gray-50 transition-colors"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-5 w-5 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <Section title="Faturamento" icon={DollarSign} columns={3}>
        <MetricCard
          title="Shopify - Total"
          value={shopifyMetrics?.totalRevenue ?? 0}
          customIcon={<ShopifyIcon />}
          chartData={mockData}
        />
        <MetricCard
          title="Shopify - Pagos"
          value={shopifyMetrics?.paidRevenue ?? 0}
          customIcon={<ShopifyIcon />}
          chartData={mockData}
        />
        <MetricCard
          title="Appmax"
          value={appmaxMetrics.totalRevenue}
          customIcon={<AppmaxIcon />}
          chartData={mockData}
        />
      </Section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <MetricCard
          title="Pedidos não pagos"
          value={shopifyMetrics?.totalRevenue ? (shopifyMetrics.totalRevenue - (shopifyMetrics.paidRevenue ?? 0)) : 0}
          customIcon={<ShopifyIcon />}
          description="Diferença entre faturamento total e pagos"
        />
        <MetricCard
          title="Shopify Taxas"
          value={(shopifyMetrics?.paidRevenue ?? 0) * 0.01}
          customIcon={<ShopifyIcon />}
          description="1% do valor de faturamento pagos"
        />
        <MetricCard
          title="Appmax Taxas"
          value={appmaxMetrics.transactionFees}
          customIcon={<AppmaxIcon />}
          description="Pix: 0.99% | Cartão: 4.99% + 0.99%"
        />
      </div>

      <Section title="Lucro" icon={Banknote} columns={1}>
        <MetricCard
          title="Net Profit"
          value={netProfit}
          icon={DollarSign}
          chartData={mockData}
          description="Appmax - COGS - Anúncios - Shipping - PRC - Impostos"
        />
      </Section>

      <Section title="Meta Ads" icon={TrendingUp} columns={2}>
        <MetricCard
          title="Custo Anúncios"
          value={facebookMetrics?.spend ?? 0}
          customIcon={<MetaAdsIcon />}
          chartData={mockData}
          error={facebookMetrics?.error}
        />
        <MetricCard
          title="ROAS"
          value={roas}
          format="decimal"
          customIcon={<MetaAdsIcon />}
          chartData={mockData}
          toFixed={2}
          description="Shopify pagos / Custo anúncios"
        />
      </Section>

      <Section title="Store" icon={Store} columns={2}>
        <MetricCard
          title="AOV"
          value={shopifyMetrics?.aov ?? 0}
          icon={DollarSign}
          chartData={mockData}
        />
        <MetricCard
          title="Pedidos Pagos"
          value={shopifyMetrics?.paidOrderCount ?? 0}
          icon={ShoppingBag}
          format="decimal"
          chartData={mockData}
          toFixed={0}
        />
      </Section>

      <Section title="Custos" icon={Calculator} columns={4}>
        <MetricCard
          title="COGS"
          value={shopifyMetrics?.cogs ?? 0}
          secondaryValue={{
            value: cogsUSD,
            currency: 'USD'
          }}
          icon={Package}
        />
        <MetricCard
          title="Shipping Cost"
          value={shopifyMetrics?.shippingCost ?? 0}
          secondaryValue={{
            value: shippingCostUSD,
            currency: 'USD'
          }}
          icon={Truck}
        />
        <MetricCard
          title="PRC Taxes"
          value={shopifyMetrics?.taxes?.prcTaxes ?? 0}
          icon={Receipt}
          description={`R$ ${prcTaxPerOrder} per paid order`}
        />
        <MetricCard
          title="Impostos + IOF"
          value={shopifyMetrics?.taxes?.orderTaxes ?? 0}
          icon={Bank}
          description={`${taxRate}% of order value`}
        />
      </Section>

      {facebookMetrics?.error?.type === 'token_expired' && (
        <div className="fixed bottom-4 right-4 bg-red-50 text-red-700 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span>{facebookMetrics.error.message}</span>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
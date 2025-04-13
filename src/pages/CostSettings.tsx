
import React, { useState, useEffect } from 'react';
import { Package, Truck, ChevronDown, Plus, Receipt, Ban as Bank, Search, RefreshCw, Save, ImageOff, Percent } from 'lucide-react';
import { fetchProducts, fetchShippingRates, type ShopifyProduct, type ShippingRate } from '../services/shopify';

interface CostItem {
  id: string;
  name: string;
  value: number;
  type: 'fixed' | 'percentage';
}

const PRODUCT_COSTS_KEY = 'productCosts';
const SHIPPING_COSTS_KEY = 'shippingCosts';
const PRC_TAXES_KEY = 'prcTaxes';
const TAXES_IOF_KEY = 'taxesIof';

const CostSettings = () => {
  const [cogsExpanded, setCogsExpanded] = useState(true);
  const [shippingExpanded, setShippingExpanded] = useState(false);
  const [prcTaxesExpanded, setPrcTaxesExpanded] = useState(false);
  const [taxesIofExpanded, setTaxesIofExpanded] = useState(false);
  
  // Products state
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [productCosts, setProductCosts] = useState<Record<number, number>>(() => {
    const savedCosts = localStorage.getItem(PRODUCT_COSTS_KEY);
    return savedCosts ? JSON.parse(savedCosts) : {};
  });
  
  // Shipping state
  const [shippingRates, setShippingRates] = useState<ShippingRate[]>([]);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [shippingCosts, setShippingCosts] = useState<Record<number, number>>(() => {
    const savedCosts = localStorage.getItem(SHIPPING_COSTS_KEY);
    return savedCosts ? JSON.parse(savedCosts) : {};
  });
  
  // PRC Taxes state
  const [prcTaxes, setPrcTaxes] = useState<CostItem[]>(() => {
    const savedTaxes = localStorage.getItem(PRC_TAXES_KEY);
    return savedTaxes ? JSON.parse(savedTaxes) : [
      { id: '1', name: 'PRC Tax per Order', value: 0, type: 'fixed' }
    ];
  });

  // Taxes + IOF state
  const [taxesIof, setTaxesIof] = useState<CostItem[]>(() => {
    const savedTaxes = localStorage.getItem(TAXES_IOF_KEY);
    return savedTaxes ? JSON.parse(savedTaxes) : [
      { id: '1', name: 'Impostos', value: 7.23, type: 'percentage' }
    ];
  });
  
  const [unsavedChanges, setUnsavedChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedProducts = await fetchProducts();
      
      // Merge fetched products with saved costs
      const productsWithCosts = fetchedProducts.map(product => ({
        ...product,
        productCost: productCosts[product.id] || 0
      }));
      
      setProducts(productsWithCosts);
    } catch (err) {
      setError('Failed to load products from Shopify');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadShippingRates = async () => {
    try {
      setShippingLoading(true);
      setShippingError(null);
      const rates = await fetchShippingRates();
      setShippingRates(rates.map(rate => ({
        ...rate,
        shippingCost: shippingCosts[rate.id] || 0
      })));
    } catch (err) {
      setShippingError('Failed to load shipping rates');
      console.error('Error loading shipping rates:', err);
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadShippingRates();
  }, []);

  const handleProductCostChange = (productId: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setProductCosts(prev => ({
      ...prev,
      [productId]: numericValue
    }));
    setUnsavedChanges(prev => ({
      ...prev,
      [`product-${productId}`]: true
    }));
  };

  const handleShippingCostChange = (rateId: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setShippingCosts(prev => ({
      ...prev,
      [rateId]: numericValue
    }));
    setUnsavedChanges(prev => ({
      ...prev,
      [`shipping-${rateId}`]: true
    }));
  };

  const handlePrcTaxChange = (index: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setPrcTaxes(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: numericValue };
      return updated;
    });
    setUnsavedChanges(prev => ({
      ...prev,
      'prc-taxes': true
    }));
  };

  const handleTaxesIofChange = (index: number, value: string) => {
    const numericValue = parseFloat(value) || 0;
    setTaxesIof(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], value: numericValue };
      return updated;
    });
    setUnsavedChanges(prev => ({
      ...prev,
      'taxes-iof': true
    }));
  };

  const handleSaveProductCost = async (productId: number) => {
    try {
      setSaving(true);
      
      // Save to localStorage
      localStorage.setItem(PRODUCT_COSTS_KEY, JSON.stringify(productCosts));
      
      // Update products state to reflect the saved cost
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, productCost: productCosts[productId] || 0 }
            : product
        )
      );
      
      setUnsavedChanges(prev => ({
        ...prev,
        [`product-${productId}`]: false
      }));
    } catch (err) {
      console.error('Error saving product cost:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveShippingCost = async (rateId: number) => {
    try {
      setSaving(true);
      localStorage.setItem(SHIPPING_COSTS_KEY, JSON.stringify(shippingCosts));
      
      setUnsavedChanges(prev => ({
        ...prev,
        [`shipping-${rateId}`]: false
      }));
    } catch (err) {
      console.error('Error saving shipping cost:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePrcTaxes = async () => {
    try {
      setSaving(true);
      localStorage.setItem(PRC_TAXES_KEY, JSON.stringify(prcTaxes));
      setUnsavedChanges(prev => ({ ...prev, 'prc-taxes': false }));
    } catch (err) {
      console.error('Error saving PRC taxes:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTaxesIof = async () => {
    try {
      setSaving(true);
      localStorage.setItem(TAXES_IOF_KEY, JSON.stringify(taxesIof));
      setUnsavedChanges(prev => ({ ...prev, 'taxes-iof': false }));
    } catch (err) {
      console.error('Error saving taxes and IOF:', err);
    } finally {
      setSaving(false);
    }
  };

  const calculateProfit = (price: number, cost: number) => {
    return price - cost;
  };

  const calculateProfitMargin = (price: number, cost: number) => {
    if (price === 0) return 0;
    return ((price - cost) / price) * 100;
  };

  const calculateTaxExample = (orderValue: number) => {
    return taxesIof[0]?.value ? (orderValue * taxesIof[0].value) / 100 : 0;
  };

  const filteredProducts = products.filter(product => 
    product.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-3 md:p-6">
      <h1 className="section-title mb-6">Cost Settings</h1>
      
      {/* Cost of Goods Section */}
      <div className="bg-white rounded-[10px] shadow-sm mb-4 md:mb-6">
        <button
          className="w-full px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between text-left"
          onClick={() => setCogsExpanded(!cogsExpanded)}
        >
          <div className="flex items-center gap-3 mb-3 md:mb-0">
            <Package className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Cost of Goods</span>
          </div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-3 md:gap-4">
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-auto pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  loadProducts();
                }}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${cogsExpanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>

        {cogsExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="border-t border-gray-100 pt-4">
              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}
              
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Image
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profit
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Margin
                        </th>
                        <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-3 md:px-4 py-4 text-center text-gray-500">
                            Loading products...
                          </td>
                        </tr>
                      ) : filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 md:px-4 py-4 text-center text-gray-500">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        filteredProducts.map((product) => {
                          const price = parseFloat(product.price);
                          const cost = productCosts[product.id] || 0;
                          const profit = calculateProfit(price, cost);
                          const margin = calculateProfitMargin(price, cost);

                          return (
                            <tr key={product.id}>
                              <td className="px-3 md:px-4 py-3 w-16 md:w-20">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-lg"
                                  />
                                ) : (
                                  <div className="h-12 w-12 md:h-16 md:w-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                    <ImageOff className="h-5 w-5 md:h-6 md:w-6 text-gray-400" />
                                  </div>
                                )}
                              </td>
                              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-900 max-w-[150px] truncate">
                                {product.title}
                              </td>
                              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                                R$ {price.toFixed(2)}
                              </td>
                              <td className="px-3 md:px-4 py-3">
                                <div className="relative w-24 md:w-32">
                                  <span className="absolute left-2 md:left-3 top-2 text-gray-500">R$</span>
                                  <input
                                    type="number"
                                    value={productCosts[product.id] || ''}
                                    onChange={(e) => handleProductCostChange(product.id, e.target.value)}
                                    className="w-full pl-7 md:pl-8 pr-2 md:pr-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>
                                R$ {profit.toFixed(2)}
                              </td>
                              <td className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>
                                {margin.toFixed(1)}%
                              </td>
                              <td className="px-3 md:px-4 py-3 text-right">
                                {unsavedChanges[`product-${product.id}`] && (
                                  <button
                                    onClick={() => handleSaveProductCost(product.id)}
                                    disabled={saving}
                                    className="inline-flex items-center px-2 md:px-3 py-1 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Save
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Shipping Section */}
      <div className="bg-white rounded-[10px] shadow-sm mb-4 md:mb-6">
        <button
          className="w-full px-4 md:px-6 py-4 flex flex-col md:flex-row md:items-center justify-between text-left"
          onClick={() => setShippingExpanded(!shippingExpanded)}
        >
          <div className="flex items-center gap-3 mb-2 md:mb-0">
            <Truck className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Shipping</span>
          </div>
          <div className="flex items-center justify-between md:justify-start gap-2">
            <span className="text-xs md:text-sm text-gray-500">
              Processing Location: PRC China
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${shippingExpanded ? 'rotate-180' : ''}`} />
          </div>
        </button>

        {shippingExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="border-t border-gray-100 pt-4">
              {shippingError && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  {shippingError}
                </div>
              )}
              
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <div className="inline-block min-w-full align-middle">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Price
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Profit
                        </th>
                        <th className="px-3 md:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Margin
                        </th>
                        <th className="px-3 md:px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {shippingLoading ? (
                        <tr>
                          <td colSpan={7} className="px-3 md:px-4 py-4 text-center text-gray-500">
                            Loading shipping rates...
                          </td>
                        </tr>
                      ) : shippingRates.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-3 md:px-4 py-4 text-center text-gray-500">
                            No shipping rates found
                          </td>
                        </tr>
                      ) : (
                        shippingRates.map((rate) => {
                          const price = parseFloat(rate.price);
                          const cost = shippingCosts[rate.id] || 0;
                          const profit = calculateProfit(price, cost);
                          const margin = calculateProfitMargin(price, cost);

                          return (
                            <tr key={rate.id}>
                              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-900">
                                {rate.name}
                              </td>
                              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-600 max-w-[100px] md:max-w-none truncate md:whitespace-normal">
                                {rate.description}
                              </td>
                              <td className="px-3 md:px-4 py-3 text-xs md:text-sm text-gray-900 whitespace-nowrap">
                                {price === 0 ? 'Grátis' : `R$ ${price.toFixed(2)}`}
                              </td>
                              <td className="px-3 md:px-4 py-3">
                                <div className="relative w-24 md:w-32">
                                  <span className="absolute left-2 md:left-3 top-2 text-gray-500">R$</span>
                                  <input
                                    type="number"
                                    value={shippingCosts[rate.id] || ''}
                                    onChange={(e) => handleShippingCostChange(rate.id, e.target.value)}
                                    className="w-full pl-7 md:pl-8 pr-2 md:pr-3 py-2 text-xs md:text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="0.00"
                                    step="0.01"
                                  />
                                </div>
                              </td>
                              <td className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>
                                R$ {profit.toFixed(2)}
                              </td>
                              <td className={`px-3 md:px-4 py-3 text-xs md:text-sm font-medium ${margin >= 0 ? 'text-green-600' : 'text-red-600'} whitespace-nowrap`}>
                                {margin.toFixed(1)}%
                              </td>
                              <td className="px-3 md:px-4 py-3 text-right">
                                {unsavedChanges[`shipping-${rate.id}`] && (
                                  <button
                                    onClick={() => handleSaveShippingCost(rate.id)}
                                    disabled={saving}
                                    className="inline-flex items-center px-2 md:px-3 py-1 bg-blue-600 text-white text-xs md:text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                                  >
                                    <Save className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                                    Save
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRC Taxes Section */}
      <div className="bg-white rounded-[10px] shadow-sm mb-4 md:mb-6">
        <button
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between text-left"
          onClick={() => setPrcTaxesExpanded(!prcTaxesExpanded)}
        >
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">PRC Taxes</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${prcTaxesExpanded ? 'rotate-180' : ''}`} />
        </button>

        {prcTaxesExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="border-t border-gray-100 pt-4">
              {prcTaxes.map((tax, index) => (
                <div key={tax.id} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                  <input
                    type="text"
                    value={tax.name}
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="Name"
                    readOnly
                  />
                  <div className="relative w-full md:w-48">
                    <span className="absolute left-3 top-2 text-gray-500">R$</span>
                    <input
                      type="number"
                      value={tax.value}
                      onChange={(e) => handlePrcTaxChange(index, e.target.value)}
                      className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="0.00"
                      step="0.01"
                    />
                  </div>
                </div>
              ))}
              {unsavedChanges['prc-taxes'] && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSavePrcTaxes}
                    disabled={saving}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Taxes + IOF Section */}
      <div className="bg-white rounded-[10px] shadow-sm mb-4 md:mb-6">
        <button
          className="w-full px-4 md:px-6 py-4 flex items-center justify-between text-left"
          onClick={() => setTaxesIofExpanded(!taxesIofExpanded)}
        >
          <div className="flex items-center gap-3">
            <Bank className="h-5 w-5 text-gray-500" />
            <span className="font-medium text-gray-900">Impostos + IOF</span>
          </div>
          <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${taxesIofExpanded ? 'rotate-180' : ''}`} />
        </button>

        {taxesIofExpanded && (
          <div className="px-4 md:px-6 pb-4 md:pb-6">
            <div className="border-t border-gray-100 pt-4">
              {taxesIof.map((tax, index) => (
                <div key={tax.id} className="space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <input
                      type="text"
                      value={tax.name}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Name"
                      readOnly
                    />
                    <div className="relative w-full md:w-48">
                      <span className="absolute left-3 top-2 text-gray-500"><Percent className="h-4 w-4" /></span>
                      <input
                        type="number"
                        value={tax.value}
                        onChange={(e) => handleTaxesIofChange(index, e.target.value)}
                        className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                  
                  {/* Example calculation */}
                  <div className="bg-gray-50 p-3 md:p-4 rounded-lg">
                    <h3 className="text-xs md:text-sm font-medium text-gray-700 mb-2">Example Calculation</h3>
                    <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                      <div className="md:flex-1">
                        <span className="text-xs md:text-sm text-gray-600">Order Value: R$ 679,00</span>
                      </div>
                      <div className="text-xs md:text-sm font-medium text-gray-900">
                        Tax Amount: R$ {calculateTaxExample(679).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {unsavedChanges['taxes-iof'] && (
                <div className="flex justify-end mt-4">
                  <button
                    onClick={handleSaveTaxesIof}
                    disabled={saving}
                    className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CostSettings;

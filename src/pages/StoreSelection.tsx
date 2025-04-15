import React from 'react';
import { useNavigate } from 'react-router-dom';

const StoreSelection = () => {
  const navigate = useNavigate();

  const stores = [
    {
      id: 'br',
      name: 'Taqcare BR',
      description: 'Brazilian Store Dashboard',
    },
    {
      id: 'us',
      name: 'Taqcare US',
      description: 'United States Store Dashboard',
    }
  ];

  return (
    <div className="min-h-screen bg-[#111827] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Welcome to Taqcare Dashboard</h1>
          <p className="text-lg text-gray-400">Select a store to continue</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => navigate(`/${store.id}`)}
              className="bg-white rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-left"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#111827] p-3 rounded-lg">
                  <img 
                    src="https://cdn.shopify.com/s/files/1/0668/4396/7665/files/Logos_6ec5eb45-f5e0-437d-a920-52dfd5cb8ca7.webp?v=1742442431"
                    alt="Taqcare Logo"
                    className="h-6 w-6 object-contain"
                  />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">{store.name}</h2>
              </div>
              <p className="text-gray-600">{store.description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoreSelection;
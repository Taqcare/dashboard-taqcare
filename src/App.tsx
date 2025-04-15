
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import CostSettings from './pages/CostSettings';
import Webhooks from './pages/Webhooks';
import Employees from './pages/Employees';
import StoreSelection from './pages/StoreSelection';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Routes>
      <Route path="/" element={<StoreSelection />} />
      
      {/* BR Store Routes */}
      <Route
        path="/br/*"
        element={
          <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            <button
              className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div 
              className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } fixed inset-y-0 left-0 transform md:relative md:translate-x-0 z-40 transition duration-200 ease-in-out`}
            >
              <Sidebar store="br" onCloseMobile={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pt-16 md:pt-0">
                <Routes>
                  <Route path="/" element={<Dashboard store="br" />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/webhooks" element={<Webhooks store="br" />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/cost-settings" element={<CostSettings />} />
                </Routes>
              </main>
            </div>
          </div>
        }
      />

      {/* US Store Routes */}
      <Route
        path="/us/*"
        element={
          <div className="flex flex-col md:flex-row h-screen bg-gray-100">
            <button
              className="md:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-lg shadow"
              onClick={toggleSidebar}
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div 
              className={`${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              } fixed inset-y-0 left-0 transform md:relative md:translate-x-0 z-40 transition duration-200 ease-in-out`}
            >
              <Sidebar store="us" onCloseMobile={() => setSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col overflow-hidden w-full">
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 pt-16 md:pt-0">
                <Routes>
                  <Route path="/" element={<Dashboard store="us" />} />
                  <Route path="/wallets" element={<Wallets />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/webhooks" element={<Webhooks store="us" />} />
                  <Route path="/employees" element={<Employees />} />
                  <Route path="/cost-settings" element={<CostSettings />} />
                </Routes>
              </main>
            </div>
          </div>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

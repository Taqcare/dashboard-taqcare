import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Wallets from './pages/Wallets';
import Transactions from './pages/Transactions';
import CostSettings from './pages/CostSettings';
import Webhooks from './pages/Webhooks';
import Employees from './pages/Employees';
import StoreSelection from './pages/StoreSelection';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StoreSelection />} />
        
        {/* BR Store Routes */}
        <Route
          path="/br/*"
          element={
            <div className="flex h-screen bg-gray-100">
              <Sidebar store="br" />
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
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
            <div className="flex h-screen bg-gray-100">
              <Sidebar store="us" />
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
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
    </Router>
  );
}

export default App;
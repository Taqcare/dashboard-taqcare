
import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Search, Filter } from 'lucide-react';
import type { Transaction } from '../types';

const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const transactions = [
    { 
      transaction_id: 1, 
      wallet_id: 1, 
      amount: 100, 
      transaction_type: 'credit' as const,
      description: 'Payment received',
      created_at: '2024-03-15T10:00:00Z'
    },
    { 
      transaction_id: 2, 
      wallet_id: 1, 
      amount: 50, 
      transaction_type: 'debit' as const,
      description: 'Service payment',
      created_at: '2024-03-15T11:30:00Z'
    },
  ];

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Transactions</h1>
        
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <select 
            className="w-full sm:w-auto border border-gray-300 rounded-lg px-4 py-2"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="credit">Credit</option>
            <option value="debit">Debit</option>
          </select>
        </div>
      </div>

      {/* Mobile View - Card Layout */}
      <div className="block sm:hidden space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.transaction_id} className="bg-white rounded-lg shadow p-4">
            <div className="flex justify-between items-start mb-3">
              <span className="text-sm font-medium text-gray-900">
                #{transaction.transaction_id}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                transaction.transaction_type === 'credit' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transaction.transaction_type === 'credit' ? (
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 mr-1" />
                )}
                {transaction.transaction_type}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Amount</span>
                <span className={`text-sm font-medium ${transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                  ${transaction.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Description</span>
                <span className="text-sm text-gray-900">{transaction.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Date</span>
                <span className="text-sm text-gray-900">
                  {new Date(transaction.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table Layout */}
      <div className="hidden sm:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    #{transaction.transaction_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.transaction_type === 'credit' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {transaction.transaction_type === 'credit' ? (
                        <ArrowUpRight className="w-3 h-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="w-3 h-3 mr-1" />
                      )}
                      {transaction.transaction_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={transaction.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'}>
                      ${transaction.amount.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Transactions;

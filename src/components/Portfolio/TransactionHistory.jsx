import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiClock, FiTrendingUp, FiTrendingDown, FiArrowUpRight, FiArrowDownLeft, FiFilter } = FiIcons;

const TransactionHistory = () => {
  const [filter, setFilter] = useState('all');

  const transactions = [
    {
      id: '1',
      type: 'buy',
      symbol: 'BTC',
      amount: '0.125',
      price: '$43,200',
      total: '$5,400',
      status: 'completed',
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      fee: '$5.40',
    },
    {
      id: '2',
      type: 'sell',
      symbol: 'ETH',
      amount: '2.5',
      price: '$2,640',
      total: '$6,600',
      status: 'completed',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      fee: '$6.60',
    },
    {
      id: '3',
      type: 'buy',
      symbol: 'ADA',
      amount: '1,500',
      price: '$0.45',
      total: '$675',
      status: 'completed',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      fee: '$0.68',
    },
    {
      id: '4',
      type: 'sell',
      symbol: 'DOT',
      amount: '85',
      price: '$7.20',
      total: '$612',
      status: 'completed',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      fee: '$0.61',
    },
    {
      id: '5',
      type: 'buy',
      symbol: 'BTC',
      amount: '0.075',
      price: '$42,800',
      total: '$3,210',
      status: 'pending',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      fee: '$3.21',
    },
  ];

  const filteredTransactions = transactions.filter(tx => {
    if (filter === 'all') return true;
    return tx.type === filter;
  });

  const getTransactionIcon = (type) => {
    return type === 'buy' ? FiArrowDownLeft : FiArrowUpRight;
  };

  const getTransactionColor = (type) => {
    return type === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'pending':
        return 'text-yellow-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Transaction History</h2>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-dark-700 text-white px-3 py-1 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none text-sm"
            >
              <option value="all">All</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          
          <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
            Export
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTransactions.map((transaction, index) => (
          <motion.div
            key={transaction.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600 hover:border-dark-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${transaction.type === 'buy' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <SafeIcon
                    icon={getTransactionIcon(transaction.type)}
                    className={`w-4 h-4 ${getTransactionColor(transaction.type)}`}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-white capitalize">{transaction.type}</span>
                    <span className="text-gray-400">{transaction.symbol}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <SafeIcon icon={FiClock} className="w-3 h-3" />
                    <span>{formatDistanceToNow(transaction.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{transaction.total}</div>
                <div className={`text-sm capitalize ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-gray-400 mb-1">Amount</div>
                <div className="text-white">{transaction.amount} {transaction.symbol}</div>
              </div>
              
              <div>
                <div className="text-gray-400 mb-1">Price</div>
                <div className="text-white">{transaction.price}</div>
              </div>
              
              <div>
                <div className="text-gray-400 mb-1">Total</div>
                <div className="text-white">{transaction.total}</div>
              </div>
              
              <div>
                <div className="text-gray-400 mb-1">Fee</div>
                <div className="text-white">{transaction.fee}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <button className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
          Load More Transactions
        </button>
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
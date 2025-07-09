import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent } = FiIcons;

const PortfolioOverview = () => {
  const holdings = [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      amount: '0.45',
      value: '$19,575.00',
      change: '+5.2%',
      changeValue: '+$967.50',
      isPositive: true,
      allocation: 45,
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      amount: '4.8',
      value: '$12,720.00',
      change: '-1.8%',
      changeValue: '-$234.00',
      isPositive: false,
      allocation: 30,
    },
    {
      symbol: 'ADA',
      name: 'Cardano',
      amount: '8,750',
      value: '$3,937.50',
      change: '+3.8%',
      changeValue: '+$144.30',
      isPositive: true,
      allocation: 15,
    },
    {
      symbol: 'DOT',
      name: 'Polkadot',
      amount: '245',
      value: '$1,715.00',
      change: '+2.1%',
      changeValue: '+$35.28',
      isPositive: true,
      allocation: 7,
    },
    {
      symbol: 'CASH',
      name: 'USD Cash',
      amount: '802.50',
      value: '$802.50',
      change: '0.0%',
      changeValue: '$0.00',
      isPositive: true,
      allocation: 3,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Holdings</h2>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiDollarSign} className="w-5 h-5 text-green-400" />
          <span className="text-sm text-green-400">$37,750.00 Total</span>
        </div>
      </div>

      <div className="space-y-4">
        {holdings.map((holding, index) => (
          <motion.div
            key={holding.symbol}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600 hover:border-dark-500 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{holding.symbol}</span>
                </div>
                <div>
                  <h3 className="font-medium text-white">{holding.name}</h3>
                  <p className="text-sm text-gray-400">{holding.amount} {holding.symbol}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-white font-medium">{holding.value}</div>
                <div className="flex items-center space-x-1">
                  <SafeIcon
                    icon={holding.isPositive ? FiTrendingUp : FiTrendingDown}
                    className={`w-3 h-3 ${holding.isPositive ? 'text-green-400' : 'text-red-400'}`}
                  />
                  <span className={`text-sm ${holding.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {holding.change}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${holding.allocation}%` }}
                  />
                </div>
              </div>
              <div className="text-sm text-gray-400">{holding.allocation}%</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortfolioOverview;
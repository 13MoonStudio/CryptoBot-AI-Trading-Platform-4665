import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiTrendingUp, FiTrendingDown, FiActivity } = FiIcons;

const MarketOverview = ({ marketData }) => {
  const symbols = Object.keys(marketData);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Market Overview</h2>
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiActivity} className="w-5 h-5 text-primary-400" />
          <span className="text-sm text-primary-400">Live Data</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {symbols.map((symbol) => {
          const data = marketData[symbol];
          const isPositive = data.change > 0;
          
          return (
            <motion.div
              key={symbol}
              whileHover={{ scale: 1.02 }}
              className="bg-dark-700 rounded-lg p-4 border border-dark-600"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-white">{symbol}</span>
                <SafeIcon
                  icon={isPositive ? FiTrendingUp : FiTrendingDown}
                  className={`w-4 h-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`}
                />
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                ${data.price.toFixed(2)}
              </div>
              <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{data.change.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-400 mt-2">
                Vol: {(data.volume / 1000).toFixed(1)}K
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default MarketOverview;
import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTrading } from '../../contexts/TradingContext';

const { FiZap, FiTrendingUp, FiTrendingDown, FiClock } = FiIcons;

const RecentSignals = () => {
  const { signals } = useTrading();

  // Mock recent signals if none exist
  const recentSignals = signals.length > 0 ? signals.slice(0, 5) : [
    {
      id: '1',
      symbol: 'BTCUSDT',
      type: 'LONG',
      price: 43500,
      confidence: 87,
      timestamp: new Date(Date.now() - 300000), // 5 minutes ago
      reasoning: 'G-Channel buy signal with strong volume confirmation',
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      type: 'SHORT',
      price: 2650,
      confidence: 82,
      timestamp: new Date(Date.now() - 600000), // 10 minutes ago
      reasoning: 'Bearish divergence detected with G-Channel sell signal',
    },
    {
      id: '3',
      symbol: 'ADAUSDT',
      type: 'LONG',
      price: 0.45,
      confidence: 75,
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      reasoning: 'EMA crossover with positive market sentiment',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Recent Signals</h2>
        <SafeIcon icon={FiZap} className="w-6 h-6 text-yellow-400" />
      </div>

      <div className="space-y-4">
        {recentSignals.map((signal, index) => (
          <motion.div
            key={signal.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <SafeIcon
                  icon={signal.type === 'LONG' ? FiTrendingUp : FiTrendingDown}
                  className={`w-4 h-4 ${signal.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}
                />
                <span className="font-medium text-white">{signal.symbol}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  signal.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                }`}>
                  {signal.type}
                </span>
              </div>
              <div className="text-sm text-gray-400">{signal.confidence}%</div>
            </div>
            
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">${signal.price.toFixed(2)}</span>
              <div className="flex items-center space-x-1 text-xs text-gray-400">
                <SafeIcon icon={FiClock} className="w-3 h-3" />
                <span>{formatDistanceToNow(signal.timestamp, { addSuffix: true })}</span>
              </div>
            </div>
            
            <p className="text-xs text-gray-400">{signal.reasoning}</p>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-2 text-sm text-primary-400 hover:text-primary-300 transition-colors">
        View All Signals
      </button>
    </motion.div>
  );
};

export default RecentSignals;
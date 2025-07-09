import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiTarget, FiTrendingUp, FiCalendar } = FiIcons;

const StrategyPerformance = () => {
  const [timeframe, setTimeframe] = useState('30d');

  const performanceData = {
    '7d': [
      { date: 'Mon', pnl: 125, trades: 8, winRate: 87.5 },
      { date: 'Tue', pnl: 230, trades: 12, winRate: 83.3 },
      { date: 'Wed', pnl: 180, trades: 10, winRate: 80.0 },
      { date: 'Thu', pnl: 310, trades: 15, winRate: 86.7 },
      { date: 'Fri', pnl: 275, trades: 11, winRate: 81.8 },
      { date: 'Sat', pnl: 195, trades: 9, winRate: 88.9 },
      { date: 'Sun', pnl: 220, trades: 13, winRate: 84.6 },
    ],
    '30d': [
      { date: 'Week 1', pnl: 1250, trades: 85, winRate: 82.4 },
      { date: 'Week 2', pnl: 1680, trades: 92, winRate: 83.7 },
      { date: 'Week 3', pnl: 1420, trades: 78, winRate: 80.8 },
      { date: 'Week 4', pnl: 1890, trades: 105, winRate: 84.8 },
    ],
  };

  const timeframes = [
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
  ];

  const currentData = performanceData[timeframe];
  const totalPnL = currentData.reduce((sum, item) => sum + item.pnl, 0);
  const totalTrades = currentData.reduce((sum, item) => sum + item.trades, 0);
  const avgWinRate = currentData.reduce((sum, item) => sum + item.winRate, 0) / currentData.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiTarget} className="w-6 h-6 text-green-400" />
          <h2 className="text-xl font-bold text-white">Strategy Performance</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          {timeframes.map((tf) => (
            <button
              key={tf.key}
              onClick={() => setTimeframe(tf.key)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                timeframe === tf.key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">
            ${totalPnL.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">Total P&L</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">
            {totalTrades}
          </div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">
            {avgWinRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Avg Win Rate</div>
        </div>
      </div>

      {/* P&L Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Win Rate Chart */}
      <div className="h-48">
        <h3 className="text-lg font-medium text-white mb-4">Win Rate Distribution</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            <Bar dataKey="winRate" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default StrategyPerformance;
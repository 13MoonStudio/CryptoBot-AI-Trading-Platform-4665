import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPlay, FiBarChart3, FiSettings, FiDownload } = FiIcons;

const BacktestResults = () => {
  const [selectedStrategy, setSelectedStrategy] = useState('g-channel');

  const backtestData = {
    'g-channel': {
      name: 'G-Channel + EMA',
      period: 'Jan 2023 - Dec 2024',
      totalReturn: 287.5,
      winRate: 82.3,
      profitFactor: 2.74,
      maxDrawdown: 6.8,
      sharpeRatio: 1.89,
      trades: 2847,
      avgTrade: 157.3,
      monthlyReturns: [
        { month: 'Jan', return: 12.5 },
        { month: 'Feb', return: 18.2 },
        { month: 'Mar', return: -3.1 },
        { month: 'Apr', return: 24.7 },
        { month: 'May', return: 15.9 },
        { month: 'Jun', return: 8.3 },
        { month: 'Jul', return: 22.1 },
        { month: 'Aug', return: 11.6 },
        { month: 'Sep', return: -1.8 },
        { month: 'Oct', return: 19.4 },
        { month: 'Nov', return: 16.2 },
        { month: 'Dec', return: 13.8 },
      ],
    },
    'ema-crossover': {
      name: 'EMA Crossover',
      period: 'Jan 2023 - Dec 2024',
      totalReturn: 185.2,
      winRate: 65.7,
      profitFactor: 1.89,
      maxDrawdown: 12.3,
      sharpeRatio: 1.42,
      trades: 1523,
      avgTrade: 89.6,
      monthlyReturns: [
        { month: 'Jan', return: 8.1 },
        { month: 'Feb', return: 12.5 },
        { month: 'Mar', return: -5.8 },
        { month: 'Apr', return: 16.3 },
        { month: 'May', return: 9.7 },
        { month: 'Jun', return: 4.2 },
        { month: 'Jul', return: 14.8 },
        { month: 'Aug', return: 7.9 },
        { month: 'Sep', return: -8.2 },
        { month: 'Oct', return: 13.1 },
        { month: 'Nov', return: 11.4 },
        { month: 'Dec', return: 9.6 },
      ],
    },
  };

  const strategies = [
    { key: 'g-channel', name: 'G-Channel + EMA' },
    { key: 'ema-crossover', name: 'EMA Crossover' },
  ];

  const currentStrategy = backtestData[selectedStrategy];

  const performanceMetrics = [
    {
      title: 'Total Return',
      value: `${currentStrategy.totalReturn}%`,
      icon: FiBarChart3,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Win Rate',
      value: `${currentStrategy.winRate}%`,
      icon: FiPlay,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Profit Factor',
      value: currentStrategy.profitFactor,
      icon: FiSettings,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Sharpe Ratio',
      value: currentStrategy.sharpeRatio,
      icon: FiDownload,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Backtest Results</h2>
        <div className="flex items-center space-x-2">
          {strategies.map((strategy) => (
            <button
              key={strategy.key}
              onClick={() => setSelectedStrategy(strategy.key)}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedStrategy === strategy.key
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              {strategy.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
          <span>Testing Period: {currentStrategy.period}</span>
          <span>Total Trades: {currentStrategy.trades}</span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {performanceMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-3 border border-dark-600"
          >
            <div className={`p-2 rounded-lg ${metric.bgColor} mb-2 w-fit`}>
              <SafeIcon icon={metric.icon} className={`w-4 h-4 ${metric.color}`} />
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-gray-400">{metric.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Monthly Returns Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Monthly Returns</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={currentStrategy.monthlyReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}%`, 'Return']}
              />
              <Bar
                dataKey="return"
                fill={(data) => (data.return >= 0 ? '#10B981' : '#EF4444')}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Strategy Details */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Strategy Details</h3>
        
        <div className="bg-dark-700 rounded-lg p-4 border border-dark-600">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-400 mb-1">Max Drawdown</div>
              <div className="text-white font-medium">{currentStrategy.maxDrawdown}%</div>
            </div>
            <div>
              <div className="text-sm text-gray-400 mb-1">Avg. Trade</div>
              <div className="text-white font-medium">${currentStrategy.avgTrade}</div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-dark-600">
            <div className="flex justify-between">
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                Run New Backtest
              </button>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors text-sm">
                Export Results
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default BacktestResults;
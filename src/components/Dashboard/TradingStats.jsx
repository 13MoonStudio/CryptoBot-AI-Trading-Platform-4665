import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBarChart3, FiTrendingUp } = FiIcons;

const TradingStats = ({ performance }) => {
  // Mock performance data for chart
  const performanceData = [
    { time: '00:00', pnl: 0 },
    { time: '04:00', pnl: 150 },
    { time: '08:00', pnl: 280 },
    { time: '12:00', pnl: 420 },
    { time: '16:00', pnl: 380 },
    { time: '20:00', pnl: 520 },
    { time: '24:00', pnl: 680 },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Trading Performance</h2>
        <SafeIcon icon={FiBarChart3} className="w-6 h-6 text-primary-400" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-white mb-1">
            {performance.totalTrades}
          </div>
          <div className="text-sm text-gray-400">Total Trades</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">
            {performance.winRate.toFixed(1)}%
          </div>
          <div className="text-sm text-gray-400">Win Rate</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">
            {performance.profitFactor.toFixed(2)}
          </div>
          <div className="text-sm text-gray-400">Profit Factor</div>
        </div>
      </div>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
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
              strokeWidth={2}
              dot={{ fill: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default TradingStats;
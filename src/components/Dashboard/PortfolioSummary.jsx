import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPieChart, FiDollarSign } = FiIcons;

const PortfolioSummary = () => {
  const portfolioData = [
    { name: 'BTC', value: 45, color: '#F59E0B' },
    { name: 'ETH', value: 30, color: '#3B82F6' },
    { name: 'ADA', value: 15, color: '#10B981' },
    { name: 'Cash', value: 10, color: '#6B7280' },
  ];

  const totalValue = 25750;
  const todayChange = 1250;
  const todayChangePercent = 5.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Portfolio</h2>
        <SafeIcon icon={FiPieChart} className="w-6 h-6 text-primary-400" />
      </div>

      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-white mb-1">
          ${totalValue.toLocaleString()}
        </div>
        <div className="flex items-center justify-center space-x-2">
          <SafeIcon icon={FiDollarSign} className="w-4 h-4 text-green-400" />
          <span className="text-green-400">
            +${todayChange.toLocaleString()} ({todayChangePercent}%)
          </span>
        </div>
      </div>

      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={portfolioData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {portfolioData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {portfolioData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.name}</span>
            </div>
            <span className="text-white font-medium">{item.value}%</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default PortfolioSummary;
import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiPieChart, FiTrendingUp } = FiIcons;

const AssetAllocation = () => {
  const allocationData = [
    { name: 'Bitcoin', value: 45, color: '#F59E0B', amount: '$19,575' },
    { name: 'Ethereum', value: 30, color: '#3B82F6', amount: '$12,720' },
    { name: 'Cardano', value: 15, color: '#10B981', amount: '$3,937' },
    { name: 'Polkadot', value: 7, color: '#8B5CF6', amount: '$1,715' },
    { name: 'Cash', value: 3, color: '#6B7280', amount: '$802' },
  ];

  const targetAllocation = [
    { name: 'Bitcoin', current: 45, target: 50, status: 'underweight' },
    { name: 'Ethereum', current: 30, target: 25, status: 'overweight' },
    { name: 'Cardano', current: 15, target: 15, status: 'balanced' },
    { name: 'Polkadot', current: 7, target: 7, status: 'balanced' },
    { name: 'Cash', current: 3, target: 3, status: 'balanced' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'overweight':
        return 'text-red-400';
      case 'underweight':
        return 'text-yellow-400';
      default:
        return 'text-green-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Asset Allocation</h2>
        <SafeIcon icon={FiPieChart} className="w-6 h-6 text-primary-400" />
      </div>

      {/* Pie Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={allocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {allocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value, name) => [
                `${value}% (${allocationData.find(d => d.name === name)?.amount})`,
                name
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Allocation Legend */}
      <div className="space-y-3 mb-6">
        {allocationData.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-300">{item.name}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{item.value}%</div>
              <div className="text-xs text-gray-400">{item.amount}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Target vs Current */}
      <div className="border-t border-dark-700 pt-6">
        <h3 className="text-lg font-medium text-white mb-4">Target Allocation</h3>
        
        <div className="space-y-3">
          {targetAllocation.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-gray-300 text-sm">{item.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  item.status === 'overweight' ? 'bg-red-500/20 text-red-400' :
                  item.status === 'underweight' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {item.status}
                </span>
              </div>
              <div className="text-right">
                <div className="text-white text-sm">
                  {item.current}% / {item.target}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Rebalance Button */}
      <button className="w-full mt-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all duration-200 font-medium">
        Rebalance Portfolio
      </button>
    </motion.div>
  );
};

export default AssetAllocation;
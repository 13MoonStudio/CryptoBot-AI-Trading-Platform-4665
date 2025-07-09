import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBarChart3, FiTrendingUp } = FiIcons;

const PerformanceChart = () => {
  const [timeframe, setTimeframe] = useState('7d');

  const performanceData = {
    '24h': [
      { time: '00:00', value: 25000, benchmark: 24800 },
      { time: '04:00', value: 25150, benchmark: 24900 },
      { time: '08:00', value: 25280, benchmark: 25050 },
      { time: '12:00', value: 25420, benchmark: 25200 },
      { time: '16:00', value: 25380, benchmark: 25180 },
      { time: '20:00', value: 25520, benchmark: 25320 },
      { time: '24:00', value: 25750, benchmark: 25450 },
    ],
    '7d': [
      { time: 'Mon', value: 24500, benchmark: 24200 },
      { time: 'Tue', value: 24800, benchmark: 24400 },
      { time: 'Wed', value: 25100, benchmark: 24700 },
      { time: 'Thu', value: 25300, benchmark: 24900 },
      { time: 'Fri', value: 25600, benchmark: 25200 },
      { time: 'Sat', value: 25400, benchmark: 25100 },
      { time: 'Sun', value: 25750, benchmark: 25350 },
    ],
    '30d': [
      { time: 'Week 1', value: 22000, benchmark: 21800 },
      { time: 'Week 2', value: 23200, benchmark: 22900 },
      { time: 'Week 3', value: 24100, benchmark: 23600 },
      { time: 'Week 4', value: 25750, benchmark: 24800 },
    ],
  };

  const timeframes = [
    { key: '24h', label: '24H' },
    { key: '7d', label: '7D' },
    { key: '30d', label: '30D' },
  ];

  const currentData = performanceData[timeframe];
  const latestValue = currentData[currentData.length - 1].value;
  const firstValue = currentData[0].value;
  const change = latestValue - firstValue;
  const changePercent = (change / firstValue) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Performance</h2>
          <div className="flex items-center space-x-4 mt-2">
            <div className="text-2xl font-bold text-white">
              ${latestValue.toLocaleString()}
            </div>
            <div className={`flex items-center space-x-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              <SafeIcon icon={change >= 0 ? FiTrendingUp : FiTrendingUp} className="w-4 h-4" />
              <span className="text-sm">
                {change >= 0 ? '+' : ''}${change.toFixed(0)} ({changePercent.toFixed(1)}%)
              </span>
            </div>
          </div>
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

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
              formatter={(value, name) => [
                `$${value.toLocaleString()}`,
                name === 'value' ? 'Portfolio' : 'Benchmark'
              ]}
            />
            
            {/* Benchmark Line */}
            <Line
              type="monotone"
              dataKey="benchmark"
              stroke="#6B7280"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 5"
            />
            
            {/* Portfolio Area */}
            <Area
              type="monotone"
              dataKey="value"
              stroke="#10B981"
              strokeWidth={3}
              fill="url(#colorValue)"
              fillOpacity={0.3}
            />
            
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-dark-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">+18.2%</div>
          <div className="text-sm text-gray-400">Monthly Return</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">1.85</div>
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">-5.2%</div>
          <div className="text-sm text-gray-400">Max Drawdown</div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceChart;
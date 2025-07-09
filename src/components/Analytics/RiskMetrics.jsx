import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiShield, FiAlertTriangle, FiTrendingDown, FiTarget } = FiIcons;

const RiskMetrics = () => {
  const drawdownData = [
    { date: '1', drawdown: 0 },
    { date: '2', drawdown: -1.2 },
    { date: '3', drawdown: -2.1 },
    { date: '4', drawdown: -1.8 },
    { date: '5', drawdown: -3.5 },
    { date: '6', drawdown: -2.9 },
    { date: '7', drawdown: -4.2 },
    { date: '8', drawdown: -3.1 },
    { date: '9', drawdown: -2.3 },
    { date: '10', drawdown: -1.5 },
    { date: '11', drawdown: -0.8 },
    { date: '12', drawdown: 0 },
  ];

  const riskMetrics = [
    {
      title: 'Value at Risk (VaR)',
      value: '$1,247',
      description: '95% confidence, 1-day horizon',
      icon: FiAlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
    },
    {
      title: 'Maximum Drawdown',
      value: '6.8%',
      description: 'Largest peak-to-trough decline',
      icon: FiTrendingDown,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      title: 'Sharpe Ratio',
      value: '1.89',
      description: 'Risk-adjusted return measure',
      icon: FiTarget,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Portfolio Beta',
      value: '0.85',
      description: 'Correlation with market',
      icon: FiShield,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
  ];

  const riskLevels = [
    { category: 'Position Size Risk', level: 25, status: 'Low' },
    { category: 'Concentration Risk', level: 45, status: 'Medium' },
    { category: 'Market Risk', level: 65, status: 'High' },
    { category: 'Liquidity Risk', level: 15, status: 'Very Low' },
  ];

  const getRiskColor = (level) => {
    if (level <= 25) return 'text-green-400';
    if (level <= 50) return 'text-yellow-400';
    if (level <= 75) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskBgColor = (level) => {
    if (level <= 25) return 'bg-green-500';
    if (level <= 50) return 'bg-yellow-500';
    if (level <= 75) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiShield} className="w-6 h-6 text-orange-400" />
          <h2 className="text-xl font-bold text-white">Risk Metrics</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-orange-400">Monitoring</span>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {riskMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600"
          >
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <SafeIcon icon={metric.icon} className={`w-4 h-4 ${metric.color}`} />
              </div>
              <span className={`text-lg font-bold ${metric.color}`}>{metric.value}</span>
            </div>
            <div className="text-white font-medium text-sm">{metric.title}</div>
            <div className="text-xs text-gray-400">{metric.description}</div>
          </motion.div>
        ))}
      </div>

      {/* Drawdown Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Drawdown History</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={drawdownData}>
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
              <Area
                type="monotone"
                dataKey="drawdown"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Risk Levels */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Risk Assessment</h3>
        <div className="space-y-3">
          {riskLevels.map((risk, index) => (
            <motion.div
              key={risk.category}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-dark-600"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-white font-medium">{risk.category}</span>
                  <span className={`text-sm ${getRiskColor(risk.level)}`}>{risk.status}</span>
                </div>
                <div className="w-full bg-dark-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${getRiskBgColor(risk.level)}`}
                    style={{ width: `${risk.level}%` }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <span className={`text-sm font-medium ${getRiskColor(risk.level)}`}>
                  {risk.level}%
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default RiskMetrics;
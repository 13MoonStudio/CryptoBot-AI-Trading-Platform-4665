import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import StrategyPerformance from '../components/Analytics/StrategyPerformance';
import MarketAnalysis from '../components/Analytics/MarketAnalysis';
import RiskMetrics from '../components/Analytics/RiskMetrics';
import BacktestResults from '../components/Analytics/BacktestResults';

const { FiBarChart3, FiTarget, FiTrendingUp, FiShield } = FiIcons;

const Analytics = () => {
  const metrics = [
    {
      title: 'Strategy Win Rate',
      value: '82.3%',
      change: '+0.5%',
      icon: FiTarget,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Profit Factor',
      value: '2.74',
      change: '+0.12',
      icon: FiTrendingUp,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Sharpe Ratio',
      value: '1.89',
      change: '+0.05',
      icon: FiBarChart3,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
    {
      title: 'Max Drawdown',
      value: '6.8%',
      change: '-0.2%',
      icon: FiShield,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Analytics - CryptoBot AI Pro</title>
        <meta name="description" content="Advanced analytics and performance metrics for cryptocurrency trading strategies." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Advanced Analytics</h1>
            <p className="text-gray-400 mt-2">
              Deep insights into your trading performance and market conditions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors">
              Export Data
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${metric.bgColor}`}>
                  <SafeIcon icon={metric.icon} className={`w-6 h-6 ${metric.color}`} />
                </div>
                <span className="text-sm text-green-400">{metric.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{metric.value}</h3>
              <p className="text-gray-400 text-sm">{metric.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StrategyPerformance />
          <MarketAnalysis />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskMetrics />
          <BacktestResults />
        </div>
      </div>
    </>
  );
};

export default Analytics;
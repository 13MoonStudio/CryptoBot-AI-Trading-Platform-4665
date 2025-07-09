import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import PortfolioOverview from '../components/Portfolio/PortfolioOverview';
import AssetAllocation from '../components/Portfolio/AssetAllocation';
import PerformanceChart from '../components/Portfolio/PerformanceChart';
import TransactionHistory from '../components/Portfolio/TransactionHistory';

const { FiPieChart, FiTrendingUp, FiDollarSign, FiPercent } = FiIcons;

const Portfolio = () => {
  const stats = [
    {
      title: 'Total Balance',
      value: '$25,750.00',
      change: '+$1,250.00',
      changePercent: '+5.1%',
      icon: FiDollarSign,
      color: 'text-green-400',
    },
    {
      title: 'Today\'s P&L',
      value: '+$847.50',
      change: '+3.4%',
      changePercent: 'vs yesterday',
      icon: FiTrendingUp,
      color: 'text-green-400',
    },
    {
      title: 'Portfolio Growth',
      value: '+24.8%',
      change: 'This month',
      changePercent: '+18.2% vs last month',
      icon: FiPercent,
      color: 'text-blue-400',
    },
    {
      title: 'Asset Diversity',
      value: '8 Assets',
      change: '+2 new',
      changePercent: 'This week',
      icon: FiPieChart,
      color: 'text-purple-400',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Portfolio - CryptoBot AI Pro</title>
        <meta name="description" content="Comprehensive portfolio overview with real-time performance tracking and asset allocation." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Portfolio Overview</h1>
            <p className="text-gray-400 mt-2">
              Track your cryptocurrency investments and trading performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-800 rounded-xl p-6 border border-dark-700"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-${stat.color.split('-')[1]}-500/20`}>
                  <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm mb-2">{stat.title}</p>
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${stat.color}`}>{stat.change}</span>
                <span className="text-xs text-gray-500">{stat.changePercent}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <PortfolioOverview />
            <PerformanceChart />
            <TransactionHistory />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AssetAllocation />
          </div>
        </div>
      </div>
    </>
  );
};

export default Portfolio;
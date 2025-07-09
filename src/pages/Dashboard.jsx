import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useWallet } from '../contexts/WalletContext';
import { useTrading } from '../contexts/TradingContext';
import { useApp } from '../contexts/AppContext';
import MarketOverview from '../components/Dashboard/MarketOverview';
import TradingStats from '../components/Dashboard/TradingStats';
import RecentSignals from '../components/Dashboard/RecentSignals';
import PortfolioSummary from '../components/Dashboard/PortfolioSummary';
import AIInsights from '../components/Dashboard/AIInsights';

const { FiTrendingUp, FiDollarSign, FiTarget, FiActivity } = FiIcons;

const Dashboard = () => {
  const { isConnected } = useWallet();
  const { performance, marketData, strategy, aiAnalysis } = useTrading();
  const { addNotification } = useApp();

  useEffect(() => {
    if (isConnected) {
      addNotification({
        type: 'success',
        title: 'Welcome Back!',
        message: 'Your wallet is connected and ready for trading.',
      });
    }
  }, [isConnected, addNotification]);

  const stats = [
    {
      title: 'Total P&L',
      value: `$${performance.totalPnL.toFixed(2)}`,
      change: '+12.5%',
      icon: FiDollarSign,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
    },
    {
      title: 'Win Rate',
      value: `${performance.winRate.toFixed(1)}%`,
      change: '+2.1%',
      icon: FiTarget,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
    },
    {
      title: 'Active Trades',
      value: '7',
      change: '+3',
      icon: FiActivity,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
    },
    {
      title: 'Strategy Score',
      value: '82%',
      change: '+0.5%',
      icon: FiTrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - CryptoBot AI Pro</title>
        <meta name="description" content="Advanced cryptocurrency trading dashboard with AI-powered insights and G-Channel strategy." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Trading Dashboard</h1>
            <p className="text-gray-400 mt-2">
              Monitor your AI-powered trading performance and market insights
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Live Trading Active</span>
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
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <SafeIcon icon={stat.icon} className={`w-6 h-6 ${stat.color}`} />
                </div>
                <span className="text-sm text-green-400">{stat.change}</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
              <p className="text-gray-400 text-sm">{stat.title}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <MarketOverview marketData={marketData} />
            <TradingStats performance={performance} />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <AIInsights analysis={aiAnalysis} />
            <RecentSignals />
            <PortfolioSummary />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
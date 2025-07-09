import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import TradingChart from '../components/Trading/TradingChart';
import OrderPanel from '../components/Trading/OrderPanel';
import PositionsList from '../components/Trading/PositionsList';
import StrategyControls from '../components/Trading/StrategyControls';
import PerpetualEngine from '../components/Trading/PerpetualEngine';
import N8nWorkflows from '../components/Automation/N8nWorkflows';
import N8nAgentWorkflows from '../components/Automation/N8nAgentWorkflows';
import { useTrading } from '../contexts/TradingContext';

const { FiZap, FiTrendingUp, FiSettings, FiBrain } = FiIcons;

const Trading = () => {
  const { marketData, positions, strategy } = useTrading();
  const [activeTab, setActiveTab] = useState('manual');

  const tabs = [
    { id: 'manual', label: 'Manual Trading', icon: FiTrendingUp },
    { id: 'perpetual', label: 'Perpetual Engine', icon: FiZap },
    { id: 'automation', label: 'Workflows', icon: FiSettings },
    { id: 'agents', label: 'AI Agents', icon: FiBrain }
  ];

  return (
    <>
      <Helmet>
        <title>Trading - CryptoBot AI Pro</title>
        <meta
          name="description"
          content="Advanced cryptocurrency trading interface with G-Channel strategy, Perpetual Engine, and AI agents."
        />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Advanced Trading</h1>
            <p className="text-gray-400 mt-2">
              Execute trades with AI-powered strategies, automation, and autonomous agents
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  strategy.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`}
              ></div>
              <span className={`text-sm ${strategy.enabled ? 'text-green-400' : 'text-gray-400'}`}>
                {strategy.enabled ? 'Strategy Active' : 'Strategy Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Trading Tabs */}
        <div className="flex items-center space-x-1 bg-dark-800 rounded-lg p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700'
              }`}
            >
              <SafeIcon icon={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'manual' && (
            <>
              {/* Manual Trading Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Trading Chart - Takes up 3 columns */}
                <div className="lg:col-span-3">
                  <TradingChart marketData={marketData} />
                </div>
                {/* Order Panel - Takes up 1 column */}
                <div className="space-y-6">
                  <OrderPanel />
                  <StrategyControls />
                </div>
              </div>
              {/* Positions List */}
              <PositionsList positions={positions} />
            </>
          )}

          {activeTab === 'perpetual' && (
            <div className="space-y-6">
              <PerpetualEngine />
              {/* Positions List for Perpetual Engine */}
              <PositionsList positions={positions} />
            </div>
          )}

          {activeTab === 'automation' && (
            <div className="space-y-6">
              <N8nWorkflows />
              {/* Integration Status */}
              <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
                <h3 className="text-lg font-medium text-white mb-4">Integration Status</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">Perpetual Engine</span>
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-400">Active and monitoring</div>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">n8n Workflows</span>
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-400">2 workflows running</div>
                  </div>
                  <div className="bg-dark-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-300">G-Channel Strategy</span>
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                    </div>
                    <div className="text-sm text-gray-400">Monitoring signals</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'agents' && (
            <div className="space-y-6">
              <N8nAgentWorkflows />
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
};

export default Trading;
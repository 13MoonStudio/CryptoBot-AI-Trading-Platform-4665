import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { usePerpetualEngine } from '../../contexts/PerpetualEngineContext';

const { 
  FiZap, 
  FiTrendingUp, 
  FiShield, 
  FiTarget, 
  FiDollarSign,
  FiPlay,
  FiPause,
  FiSettings,
  FiRefreshCw
} = FiIcons;

const PerpetualEngine = () => {
  const { 
    engine, 
    isActive, 
    status, 
    startEngine, 
    stopEngine, 
    updateConfig 
  } = usePerpetualEngine();

  const [config, setConfig] = useState({
    initialVault: 1000,
    minVaultReserve: 0.5,
    profitReinvestmentRate: 0.7,
    baseTradingUnit: 0.01,
    maxDailyExposure: 0.1,
    buyThreshold: {
      rsi: { min: 0, max: 30 },
      priceDeviation: -0.02,
      volumeIncrease: 1.5,
      fearGreedIndex: { min: 0, max: 25 }
    },
    sellThreshold: {
      profitTarget: 0.02,
      rsi: { min: 70, max: 100 },
      trailingStop: 0.01,
      timeLimit: 86400000
    }
  });

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleNestedConfigChange = (parent, key, value) => {
    setConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
  };

  const handleStart = () => {
    updateConfig(config);
    startEngine();
  };

  const vaultMetrics = [
    {
      title: 'Total Vault',
      value: `$${status?.vault?.total?.toFixed(2) || '0.00'}`,
      change: status?.dailyStats?.netProfit > 0 ? `+$${status.dailyStats.netProfit.toFixed(2)}` : '$0.00',
      icon: FiDollarSign,
      color: 'text-green-400'
    },
    {
      title: 'Available',
      value: `$${status?.vault?.available?.toFixed(2) || '0.00'}`,
      change: `${((status?.vault?.available / status?.vault?.total) * 100 || 0).toFixed(1)}%`,
      icon: FiTarget,
      color: 'text-blue-400'
    },
    {
      title: 'Invested',
      value: `$${status?.vault?.invested?.toFixed(2) || '0.00'}`,
      change: `${status?.positions?.length || 0} positions`,
      icon: FiTrendingUp,
      color: 'text-purple-400'
    },
    {
      title: 'Profits',
      value: `$${status?.vault?.profits?.toFixed(2) || '0.00'}`,
      change: `${status?.performance?.compoundGrowth?.toFixed(2) || '0.00'}%`,
      icon: FiZap,
      color: 'text-yellow-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiZap} className="w-6 h-6 text-yellow-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Perpetual Profit Engine</h2>
            <p className="text-sm text-gray-400">Always in the Black Trading System</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
          <span className={`text-sm ${isActive ? 'text-green-400' : 'text-gray-400'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {/* Vault Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {vaultMetrics.map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="bg-dark-700 rounded-lg p-4 border border-dark-600"
          >
            <div className="flex items-center justify-between mb-2">
              <SafeIcon icon={metric.icon} className={`w-5 h-5 ${metric.color}`} />
              <span className="text-xs text-gray-400">{metric.change}</span>
            </div>
            <div className={`text-lg font-bold ${metric.color}`}>{metric.value}</div>
            <div className="text-xs text-gray-400">{metric.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Daily Performance */}
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Daily Performance</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">
              {status?.dailyStats?.trades || 0}
            </div>
            <div className="text-sm text-gray-400">Trades</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {status?.dailyStats?.buys || 0}
            </div>
            <div className="text-sm text-gray-400">Buys</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">
              {status?.dailyStats?.sells || 0}
            </div>
            <div className="text-sm text-gray-400">Sells</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {status?.dailyStats?.winRate?.toFixed(1) || '0.0'}%
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Configuration Panel */}
      <div className="bg-dark-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-medium text-white mb-4">Engine Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Initial Vault ($)
            </label>
            <input
              type="number"
              value={config.initialVault}
              onChange={(e) => handleConfigChange('initialVault', Number(e.target.value))}
              className="w-full px-3 py-2 bg-dark-600 border border-dark-500 rounded-lg text-white focus:border-primary-500 focus:outline-none"
              disabled={isActive}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Vault Reserve (%)
            </label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.1"
              value={config.minVaultReserve}
              onChange={(e) => handleConfigChange('minVaultReserve', Number(e.target.value))}
              className="w-full"
              disabled={isActive}
            />
            <div className="text-sm text-gray-400 mt-1">
              {(config.minVaultReserve * 100).toFixed(0)}%
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Profit Reinvestment Rate (%)
            </label>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.1"
              value={config.profitReinvestmentRate}
              onChange={(e) => handleConfigChange('profitReinvestmentRate', Number(e.target.value))}
              className="w-full"
              disabled={isActive}
            />
            <div className="text-sm text-gray-400 mt-1">
              {(config.profitReinvestmentRate * 100).toFixed(0)}%
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Base Trading Unit (%)
            </label>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.005"
              value={config.baseTradingUnit}
              onChange={(e) => handleConfigChange('baseTradingUnit', Number(e.target.value))}
              className="w-full"
              disabled={isActive}
            />
            <div className="text-sm text-gray-400 mt-1">
              {(config.baseTradingUnit * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Buy/Sell Thresholds */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-dark-700 rounded-lg p-4">
          <h4 className="text-md font-medium text-white mb-3">Buy Thresholds</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">RSI Max</label>
              <input
                type="number"
                value={config.buyThreshold.rsi.max}
                onChange={(e) => handleNestedConfigChange('buyThreshold', 'rsi', {
                  ...config.buyThreshold.rsi,
                  max: Number(e.target.value)
                })}
                className="w-full px-2 py-1 bg-dark-600 border border-dark-500 rounded text-white text-sm"
                disabled={isActive}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Price Deviation (%)</label>
              <input
                type="number"
                step="0.01"
                value={config.buyThreshold.priceDeviation * 100}
                onChange={(e) => handleNestedConfigChange('buyThreshold', 'priceDeviation', Number(e.target.value) / 100)}
                className="w-full px-2 py-1 bg-dark-600 border border-dark-500 rounded text-white text-sm"
                disabled={isActive}
              />
            </div>
          </div>
        </div>
        
        <div className="bg-dark-700 rounded-lg p-4">
          <h4 className="text-md font-medium text-white mb-3">Sell Thresholds</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Profit Target (%)</label>
              <input
                type="number"
                step="0.01"
                value={config.sellThreshold.profitTarget * 100}
                onChange={(e) => handleNestedConfigChange('sellThreshold', 'profitTarget', Number(e.target.value) / 100)}
                className="w-full px-2 py-1 bg-dark-600 border border-dark-500 rounded text-white text-sm"
                disabled={isActive}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Trailing Stop (%)</label>
              <input
                type="number"
                step="0.01"
                value={config.sellThreshold.trailingStop * 100}
                onChange={(e) => handleNestedConfigChange('sellThreshold', 'trailingStop', Number(e.target.value) / 100)}
                className="w-full px-2 py-1 bg-dark-600 border border-dark-500 rounded text-white text-sm"
                disabled={isActive}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Positions */}
      {status?.positions?.length > 0 && (
        <div className="bg-dark-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-medium text-white mb-4">
            Active Positions ({status.positions.length})
          </h3>
          <div className="space-y-2">
            {status.positions.map((position, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-dark-600 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="font-medium text-white">{position.symbol}</span>
                  <span className="text-sm text-gray-400">
                    ${position.avgPrice?.toFixed(2)}
                  </span>
                </div>
                <div className="text-right">
                  <div className={`font-medium ${
                    position.unrealizedProfit > 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {position.unrealizedProfit > 0 ? '+' : ''}
                    {(position.unrealizedProfit * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-400">
                    Stage {position.stage}/3
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={isActive ? stopEngine : handleStart}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              isActive 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            <SafeIcon icon={isActive ? FiPause : FiPlay} className="w-5 h-5" />
            <span>{isActive ? 'Stop Engine' : 'Start Engine'}</span>
          </button>
          
          <button className="flex items-center space-x-2 px-4 py-3 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
            <SafeIcon icon={FiSettings} className="w-5 h-5" />
            <span>Advanced Settings</span>
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-3 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
            <SafeIcon icon={FiRefreshCw} className="w-5 h-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default PerpetualEngine;
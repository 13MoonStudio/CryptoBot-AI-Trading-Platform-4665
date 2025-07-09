import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTrading } from '../../contexts/TradingContext';

const { FiPlay, FiPause, FiSettings, FiTarget, FiTrendingUp } = FiIcons;

const StrategyControls = () => {
  const { strategy, enableStrategy, disableStrategy } = useTrading();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <h2 className="text-xl font-bold text-white mb-6">Strategy Controls</h2>

      {/* Strategy Status */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-gray-300">G-Channel + EMA</span>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${strategy.enabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
            <span className={`text-sm ${strategy.enabled ? 'text-green-400' : 'text-gray-400'}`}>
              {strategy.enabled ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div className="bg-dark-700 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Win Rate</span>
            <span className="text-sm font-medium text-green-400">82%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Profit Factor</span>
            <span className="text-sm font-medium text-blue-400">2.7</span>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="space-y-3 mb-6">
        <button
          onClick={strategy.enabled ? disableStrategy : enableStrategy}
          className={`w-full flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
            strategy.enabled
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          }`}
        >
          <SafeIcon icon={strategy.enabled ? FiPause : FiPlay} className="w-5 h-5" />
          <span>{strategy.enabled ? 'Stop Strategy' : 'Start Strategy'}</span>
        </button>
        
        <button className="w-full flex items-center justify-center space-x-2 py-3 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors">
          <SafeIcon icon={FiSettings} className="w-5 h-5" />
          <span>Configure Settings</span>
        </button>
      </div>

      {/* Strategy Parameters */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-white">Parameters</h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">G-Channel Length</span>
            <span className="text-sm text-white">{strategy.parameters.gChannelLength}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">EMA Length</span>
            <span className="text-sm text-white">{strategy.parameters.emaLength}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">ATR Length</span>
            <span className="text-sm text-white">{strategy.parameters.atrLength}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Stop Loss Multiplier</span>
            <span className="text-sm text-white">{strategy.parameters.stopMultiplier}x</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Take Profit Multiplier</span>
            <span className="text-sm text-white">{strategy.parameters.takeMultiplier}x</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-dark-700">
        <h3 className="text-lg font-medium text-white mb-4">Today's Performance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">+$1,247</div>
            <div className="text-xs text-gray-400">Total P&L</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-400">12</div>
            <div className="text-xs text-gray-400">Trades</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StrategyControls;
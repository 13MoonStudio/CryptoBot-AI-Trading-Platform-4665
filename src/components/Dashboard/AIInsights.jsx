import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBrain, FiTrendingUp, FiTrendingDown, FiMinus, FiTarget } = FiIcons;

const AIInsights = ({ analysis }) => {
  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'BUY':
        return FiTrendingUp;
      case 'SELL':
        return FiTrendingDown;
      default:
        return FiMinus;
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'BUY':
        return 'text-green-400';
      case 'SELL':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'BULLISH':
        return 'text-green-400';
      case 'BEARISH':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">AI Insights</h2>
        <SafeIcon icon={FiBrain} className="w-6 h-6 text-purple-400" />
      </div>

      <div className="space-y-4">
        {/* Confidence Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300">Confidence Score</span>
            <span className="text-white font-medium">{analysis.confidence}%</span>
          </div>
          <div className="w-full bg-dark-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analysis.confidence}%` }}
            />
          </div>
        </div>

        {/* Signal */}
        <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon
              icon={getSignalIcon(analysis.signal)}
              className={`w-5 h-5 ${getSignalColor(analysis.signal)}`}
            />
            <span className="text-white font-medium">Signal</span>
          </div>
          <span className={`font-medium ${getSignalColor(analysis.signal)}`}>
            {analysis.signal}
          </span>
        </div>

        {/* Market Sentiment */}
        <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
          <div className="flex items-center space-x-3">
            <SafeIcon icon={FiTarget} className="w-5 h-5 text-blue-400" />
            <span className="text-white font-medium">Market Sentiment</span>
          </div>
          <span className={`font-medium ${getSentimentColor(analysis.marketSentiment)}`}>
            {analysis.marketSentiment}
          </span>
        </div>

        {/* AI Reasoning */}
        <div>
          <h3 className="text-white font-medium mb-2">Analysis</h3>
          <p className="text-gray-400 text-sm leading-relaxed">
            {analysis.reasoning || 'AI is analyzing current market conditions and will provide insights shortly.'}
          </p>
        </div>

        {/* Action Button */}
        <button className="w-full mt-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-200 font-medium">
          Get Detailed Analysis
        </button>
      </div>
    </motion.div>
  );
};

export default AIInsights;
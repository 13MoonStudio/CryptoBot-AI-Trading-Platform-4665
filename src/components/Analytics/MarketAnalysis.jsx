import React from 'react';
import { motion } from 'framer-motion';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiActivity, FiTrendingUp, FiTrendingDown, FiTarget } = FiIcons;

const MarketAnalysis = () => {
  const marketMetrics = [
    { metric: 'Volatility', value: 75, fullMark: 100 },
    { metric: 'Volume', value: 85, fullMark: 100 },
    { metric: 'Momentum', value: 68, fullMark: 100 },
    { metric: 'Support', value: 92, fullMark: 100 },
    { metric: 'Resistance', value: 78, fullMark: 100 },
    { metric: 'Trend Strength', value: 88, fullMark: 100 },
  ];

  const marketConditions = [
    {
      condition: 'Bullish Momentum',
      strength: 85,
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      description: 'Strong upward price movement with high volume',
    },
    {
      condition: 'High Volatility',
      strength: 78,
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      description: 'Increased price swings creating trading opportunities',
    },
    {
      condition: 'Strong Support',
      strength: 92,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      description: 'Solid price floor with buying interest',
    },
    {
      condition: 'Resistance Level',
      strength: 65,
      color: 'text-red-400',
      bgColor: 'bg-red-500/20',
      description: 'Price ceiling with potential selling pressure',
    },
  ];

  const aiInsights = [
    {
      title: 'Market Sentiment',
      value: 'Bullish',
      confidence: 87,
      icon: FiTrendingUp,
      color: 'text-green-400',
    },
    {
      title: 'Volatility Forecast',
      value: 'High',
      confidence: 92,
      icon: FiActivity,
      color: 'text-yellow-400',
    },
    {
      title: 'Trend Direction',
      value: 'Upward',
      confidence: 78,
      icon: FiTarget,
      color: 'text-blue-400',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiActivity} className="w-6 h-6 text-primary-400" />
          <h2 className="text-xl font-bold text-white">Market Analysis</h2>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-green-400">Live Analysis</span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={marketMetrics}>
            <PolarGrid stroke="#374151" />
            <PolarAngleAxis dataKey="metric" className="text-gray-400" />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
            <Radar
              name="Market Metrics"
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-white mb-4">AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiInsights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-700 rounded-lg p-4 border border-dark-600"
            >
              <div className="flex items-center justify-between mb-2">
                <SafeIcon icon={insight.icon} className={`w-5 h-5 ${insight.color}`} />
                <span className="text-xs text-gray-400">{insight.confidence}%</span>
              </div>
              <div className="text-white font-medium">{insight.value}</div>
              <div className="text-xs text-gray-400">{insight.title}</div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Market Conditions */}
      <div>
        <h3 className="text-lg font-medium text-white mb-4">Market Conditions</h3>
        <div className="space-y-3">
          {marketConditions.map((condition, index) => (
            <motion.div
              key={condition.condition}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 bg-dark-700 rounded-lg border border-dark-600"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-1">
                  <span className="text-white font-medium">{condition.condition}</span>
                  <span className={`text-sm ${condition.color}`}>{condition.strength}%</span>
                </div>
                <p className="text-xs text-gray-400">{condition.description}</p>
              </div>
              <div className="ml-4">
                <div className="w-16 bg-dark-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${condition.bgColor.replace('/20', '')}`}
                    style={{ width: `${condition.strength}%` }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default MarketAnalysis;
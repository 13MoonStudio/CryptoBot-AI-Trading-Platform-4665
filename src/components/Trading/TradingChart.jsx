import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiMaximize2, FiSettings, FiTrendingUp, FiActivity } = FiIcons;

const TradingChart = ({ marketData }) => {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('5m');
  const [chartData, setChartData] = useState([]);

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = () => {
      const data = [];
      const basePrice = marketData[selectedSymbol]?.price || 43500;
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(Date.now() - (100 - i) * 60000);
        const price = basePrice + (Math.random() - 0.5) * 1000;
        const volume = Math.floor(Math.random() * 1000) + 500;
        
        // G-Channel calculation (simplified)
        const gUpper = price * 1.02;
        const gLower = price * 0.98;
        const gMid = (gUpper + gLower) / 2;
        const ema200 = price * 0.995; // Mock EMA
        
        data.push({
          time: timestamp.toLocaleTimeString(),
          price,
          volume,
          gUpper,
          gLower,
          gMid,
          ema200,
        });
      }
      
      setChartData(data);
    };

    generateChartData();
    const interval = setInterval(generateChartData, 5000);
    return () => clearInterval(interval);
  }, [selectedSymbol, marketData]);

  const symbols = Object.keys(marketData);
  const timeframes = ['1m', '3m', '5m', '15m', '1h', '4h', '1d'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">Trading Chart</h2>
          <div className="flex items-center space-x-2">
            <SafeIcon icon={FiActivity} className="w-5 h-5 text-green-400" />
            <span className="text-sm text-green-400">Live</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Symbol Selector */}
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="bg-dark-700 text-white px-3 py-2 rounded-lg border border-dark-600 focus:border-primary-500 focus:outline-none"
          >
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
          
          {/* Timeframe Selector */}
          <div className="flex items-center space-x-1">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  timeframe === tf
                    ? 'bg-primary-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          
          <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
            <SafeIcon icon={FiSettings} className="w-5 h-5 text-gray-400" />
          </button>
          
          <button className="p-2 rounded-lg hover:bg-dark-700 transition-colors">
            <SafeIcon icon={FiMaximize2} className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Price Display */}
      <div className="flex items-center space-x-6 mb-6">
        <div>
          <span className="text-2xl font-bold text-white">
            ${marketData[selectedSymbol]?.price.toFixed(2)}
          </span>
          <span className={`ml-2 text-sm ${
            marketData[selectedSymbol]?.change > 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {marketData[selectedSymbol]?.change > 0 ? '+' : ''}
            {marketData[selectedSymbol]?.change.toFixed(2)}%
          </span>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-400">
          <span>24h Vol: {(marketData[selectedSymbol]?.volume / 1000).toFixed(1)}K</span>
          <span>•</span>
          <span>High: ${(marketData[selectedSymbol]?.price * 1.05).toFixed(2)}</span>
          <span>•</span>
          <span>Low: ${(marketData[selectedSymbol]?.price * 0.95).toFixed(2)}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="time" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: '1px solid #374151',
                borderRadius: '8px',
              }}
            />
            
            {/* G-Channel Lines */}
            <Line
              type="monotone"
              dataKey="gUpper"
              stroke="#3B82F6"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="gLower"
              stroke="#3B82F6"
              strokeWidth={1}
              dot={false}
              strokeDasharray="5 5"
            />
            <Line
              type="monotone"
              dataKey="gMid"
              stroke="#F59E0B"
              strokeWidth={2}
              dot={false}
            />
            
            {/* EMA Line */}
            <Line
              type="monotone"
              dataKey="ema200"
              stroke="#EF4444"
              strokeWidth={2}
              dot={false}
            />
            
            {/* Price Area */}
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorPrice)"
              fillOpacity={0.3}
            />
            
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Legend */}
      <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-green-400"></div>
          <span className="text-gray-400">Price</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-yellow-400"></div>
          <span className="text-gray-400">G-Channel Mid</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-blue-400 opacity-50"></div>
          <span className="text-gray-400">G-Channel Bands</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-1 bg-red-400"></div>
          <span className="text-gray-400">EMA 200</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TradingChart;
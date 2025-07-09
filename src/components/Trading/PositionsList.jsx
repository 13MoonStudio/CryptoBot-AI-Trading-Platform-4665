import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTrading } from '../../contexts/TradingContext';

const { FiTrendingUp, FiTrendingDown, FiX, FiDollarSign, FiPercent } = FiIcons;

const PositionsList = ({ positions }) => {
  const { closePosition, marketData } = useTrading();

  const calculatePnL = (position) => {
    const currentPrice = marketData[position.symbol]?.price || position.entryPrice;
    const pnl = position.type === 'LONG' 
      ? (currentPrice - position.entryPrice) * position.size
      : (position.entryPrice - currentPrice) * position.size;
    return pnl;
  };

  const calculatePnLPercent = (position) => {
    const pnl = calculatePnL(position);
    return (pnl / (position.entryPrice * position.size)) * 100;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-white">Open Positions</h2>
        <span className="text-sm text-gray-400">
          {positions.length} position{positions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {positions.length === 0 ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiTrendingUp} className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">No open positions</p>
          <p className="text-sm text-gray-500 mt-2">
            Your trades will appear here once you place an order
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {positions.map((position, index) => {
            const pnl = calculatePnL(position);
            const pnlPercent = calculatePnLPercent(position);
            const isProfit = pnl > 0;
            
            return (
              <motion.div
                key={position.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-dark-700 rounded-lg p-4 border border-dark-600"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <SafeIcon
                      icon={position.type === 'LONG' ? FiTrendingUp : FiTrendingDown}
                      className={`w-5 h-5 ${position.type === 'LONG' ? 'text-green-400' : 'text-red-400'}`}
                    />
                    <div>
                      <h3 className="font-medium text-white">{position.symbol}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        position.type === 'LONG' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {position.type}
                      </span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => closePosition(position.id)}
                    className="p-2 rounded-lg hover:bg-dark-600 transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4 text-gray-400" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-gray-400 mb-1">Entry Price</div>
                    <div className="text-white font-medium">${position.entryPrice.toFixed(2)}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">Size</div>
                    <div className="text-white font-medium">{position.size}</div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">P&L</div>
                    <div className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}${pnl.toFixed(2)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-gray-400 mb-1">P&L %</div>
                    <div className={`font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                      {isProfit ? '+' : ''}{pnlPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-dark-600">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-gray-400">Stop Loss: </span>
                      <span className="text-red-400">${position.stopLoss.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Take Profit: </span>
                      <span className="text-green-400">${position.takeProfit.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default PositionsList;
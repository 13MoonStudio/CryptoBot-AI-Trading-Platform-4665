import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTrading } from '../../contexts/TradingContext';
import { useWallet } from '../../contexts/WalletContext';
import toast from 'react-hot-toast';

const { FiTrendingUp, FiTrendingDown, FiDollarSign, FiPercent, FiTarget } = FiIcons;

const OrderPanel = () => {
  const [orderType, setOrderType] = useState('market');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  
  const { isTrading, executeTrade, marketData } = useTrading();
  const { isConnected } = useWallet();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!amount) {
      toast.error('Please enter an amount');
      return;
    }

    const signal = {
      id: Date.now().toString(),
      symbol: 'BTCUSDT',
      type: side.toUpperCase(),
      price: orderType === 'market' ? marketData.BTCUSDT?.price : parseFloat(price),
      timestamp: new Date(),
      confidence: 85,
      reasoning: `Manual ${side} order executed`,
    };

    await executeTrade(signal);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <h2 className="text-xl font-bold text-white mb-6">Place Order</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Order Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Order Type
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setOrderType('market')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'market'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Market
            </button>
            <button
              type="button"
              onClick={() => setOrderType('limit')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                orderType === 'limit'
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              Limit
            </button>
          </div>
        </div>

        {/* Side */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Side
          </label>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setSide('buy')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                side === 'buy'
                  ? 'bg-green-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              <SafeIcon icon={FiTrendingUp} className="w-4 h-4" />
              <span>Buy</span>
            </button>
            <button
              type="button"
              onClick={() => setSide('sell')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                side === 'sell'
                  ? 'bg-red-500 text-white'
                  : 'bg-dark-700 text-gray-400 hover:text-white'
              }`}
            >
              <SafeIcon icon={FiTrendingDown} className="w-4 h-4" />
              <span>Sell</span>
            </button>
          </div>
        </div>

        {/* Price (for limit orders) */}
        {orderType === 'limit' && (
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Price
            </label>
            <div className="relative">
              <SafeIcon icon={FiDollarSign} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <div className="relative">
            <SafeIcon icon={FiPercent} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Stop Loss */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Stop Loss (Optional)
          </label>
          <div className="relative">
            <SafeIcon icon={FiTarget} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Take Profit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Take Profit (Optional)
          </label>
          <div className="relative">
            <SafeIcon icon={FiTarget} className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              placeholder="0.00"
              className="w-full pl-10 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isTrading || !isConnected}
          className={`w-full py-3 rounded-lg font-medium transition-colors ${
            side === 'buy'
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-red-500 hover:bg-red-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isTrading ? 'Executing...' : `${side === 'buy' ? 'Buy' : 'Sell'} ${orderType === 'market' ? 'Market' : 'Limit'}`}
        </button>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {['25%', '50%', '75%', '100%'].map((percent) => (
            <button
              key={percent}
              type="button"
              onClick={() => setAmount(percent)}
              className="py-2 px-3 bg-dark-700 text-gray-400 rounded-lg hover:text-white hover:bg-dark-600 transition-colors text-sm"
            >
              {percent}
            </button>
          ))}
        </div>
      </form>
    </motion.div>
  );
};

export default OrderPanel;
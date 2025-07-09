import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useWallet } from '../../contexts/WalletContext';
import { useApp } from '../../contexts/AppContext';
import WalletConnection from '../Wallet/WalletConnection';
import NotificationCenter from '../Common/NotificationCenter';

const { FiMenu, FiBell, FiUser, FiWifi, FiWifiOff } = FiIcons;

const Header = ({ onMenuClick }) => {
  const { isConnected, address, walletType } = useWallet();
  const { notifications } = useApp();

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <header className="bg-dark-900 border-b border-dark-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <SafeIcon icon={FiMenu} className="w-6 h-6 text-gray-400" />
          </button>
          
          <div className="hidden md:flex items-center space-x-4">
            <h2 className="text-xl font-semibold text-white">Trading Dashboard</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Live Market</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <SafeIcon 
              icon={isConnected ? FiWifi : FiWifiOff} 
              className={`w-5 h-5 ${isConnected ? 'text-green-400' : 'text-red-400'}`} 
            />
            <span className={`text-sm hidden sm:inline ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          {/* Notifications */}
          <NotificationCenter notifications={notifications} />

          {/* Wallet Connection */}
          <WalletConnection />

          {/* User Profile */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-800 transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
            </div>
            {isConnected && (
              <div className="hidden md:block">
                <div className="text-sm font-medium text-white">
                  {walletType === 'debit' ? 'Debit Card' : formatAddress(address)}
                </div>
                <div className="text-xs text-gray-400 capitalize">{walletType}</div>
              </div>
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Header;
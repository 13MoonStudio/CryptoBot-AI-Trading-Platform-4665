import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useWallet } from '../../contexts/WalletContext';

const { FiWallet, FiChevronDown, FiCheck, FiLoader } = FiIcons;

const WalletConnection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const {
    isConnected,
    isConnecting,
    walletType,
    address,
    connectMetaMask,
    connectPhantom,
    connectDebitCard,
    disconnectWallet,
  } = useWallet();

  const walletOptions = [
    {
      id: 'metamask',
      name: 'MetaMask',
      icon: '🦊',
      description: 'Connect using MetaMask wallet',
      connect: connectMetaMask,
    },
    {
      id: 'phantom',
      name: 'Phantom',
      icon: '👻',
      description: 'Connect using Phantom wallet',
      connect: connectPhantom,
    },
    {
      id: 'debit',
      name: 'Debit Card',
      icon: '💳',
      description: 'Connect using debit card',
      connect: connectDebitCard,
    },
  ];

  const handleWalletConnect = async (wallet) => {
    setIsOpen(false);
    await wallet.connect();
  };

  const formatAddress = (addr) => {
    if (!addr) return '';
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-200 ${
          isConnected
            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
            : 'bg-dark-800 text-gray-300 hover:bg-dark-700 border border-dark-600'
        }`}
      >
        <SafeIcon icon={FiWallet} className="w-5 h-5" />
        <span className="font-medium">
          {isConnecting ? 'Connecting...' : isConnected ? formatAddress(address) : 'Connect Wallet'}
        </span>
        {isConnecting ? (
          <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
        ) : (
          <SafeIcon icon={FiChevronDown} className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-80 bg-dark-800 border border-dark-600 rounded-xl shadow-xl z-50"
          >
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">
                {isConnected ? 'Wallet Connected' : 'Connect Your Wallet'}
              </h3>

              {isConnected ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">
                        {walletOptions.find(w => w.id === walletType)?.icon}
                      </div>
                      <div>
                        <div className="font-medium text-white">
                          {walletOptions.find(w => w.id === walletType)?.name}
                        </div>
                        <div className="text-sm text-gray-400">{formatAddress(address)}</div>
                      </div>
                    </div>
                    <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-400" />
                  </div>
                  
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsOpen(false);
                    }}
                    className="w-full py-2 px-4 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {walletOptions.map((wallet) => (
                    <motion.button
                      key={wallet.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleWalletConnect(wallet)}
                      disabled={isConnecting}
                      className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-700 transition-colors disabled:opacity-50"
                    >
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white">{wallet.name}</div>
                        <div className="text-sm text-gray-400">{wallet.description}</div>
                      </div>
                      {isConnecting && (
                        <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin text-primary-400" />
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletConnection;
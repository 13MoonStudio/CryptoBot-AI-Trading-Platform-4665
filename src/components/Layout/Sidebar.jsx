import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { 
  FiHome, 
  FiTrendingUp, 
  FiPieChart, 
  FiBarChart3, 
  FiSettings, 
  FiBot, 
  FiZap,
  FiShield,
  FiTarget
} = FiIcons;

const Sidebar = ({ onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: FiHome, label: 'Dashboard', color: 'text-blue-400' },
    { path: '/trading', icon: FiTrendingUp, label: 'Trading', color: 'text-green-400' },
    { path: '/portfolio', icon: FiPieChart, label: 'Portfolio', color: 'text-purple-400' },
    { path: '/analytics', icon: FiBarChart3, label: 'Analytics', color: 'text-orange-400' },
    { path: '/settings', icon: FiSettings, label: 'Settings', color: 'text-gray-400' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-full flex-col bg-dark-900 border-r border-dark-700">
      {/* Logo */}
      <div className="flex items-center justify-center p-6 border-b border-dark-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl">
            <SafeIcon icon={FiBot} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">CryptoBot</h1>
            <p className="text-xs text-gray-400">AI Pro</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className="block"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-dark-800'
              }`}
            >
              <SafeIcon icon={item.icon} className={`w-5 h-5 ${isActive(item.path) ? 'text-primary-400' : item.color}`} />
              <span className="font-medium">{item.label}</span>
            </motion.div>
          </Link>
        ))}
      </nav>

      {/* Strategy Status */}
      <div className="px-4 py-4 border-t border-dark-700">
        <div className="bg-dark-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-300">G-Channel Strategy</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400">Active</span>
            </div>
          </div>
          <div className="text-xs text-gray-400">82% Win Rate</div>
          <div className="mt-2 flex items-center space-x-2">
            <SafeIcon icon={FiTarget} className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-300">24/7 Monitoring</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-dark-700">
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
          <SafeIcon icon={FiShield} className="w-4 h-4" />
          <span>Secured & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
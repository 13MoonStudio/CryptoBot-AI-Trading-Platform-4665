import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useApp } from '../contexts/AppContext';

const { 
  FiSettings, 
  FiShield, 
  FiPercent, 
  FiToggleLeft, 
  FiToggleRight, 
  FiSliders, 
  FiBell,
  FiSave
} = FiIcons;

const Settings = () => {
  const { settings, updateSettings } = useApp();
  const [localSettings, setLocalSettings] = useState({
    ...settings
  });

  const handleToggle = (key) => {
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key]
    });
  };

  const handleNotificationToggle = (key) => {
    setLocalSettings({
      ...localSettings,
      notifications: {
        ...localSettings.notifications,
        [key]: !localSettings.notifications[key]
      }
    });
  };

  const handleRiskLevelChange = (value) => {
    setLocalSettings({
      ...localSettings,
      riskLevel: value
    });
  };

  const handleNumberChange = (key, value) => {
    setLocalSettings({
      ...localSettings,
      [key]: Number(value)
    });
  };

  const saveSettings = () => {
    updateSettings(localSettings);
  };

  return (
    <>
      <Helmet>
        <title>Settings - CryptoBot AI Pro</title>
        <meta name="description" content="Configure your trading settings, risk parameters, and notification preferences." />
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Settings</h1>
            <p className="text-gray-400 mt-2">
              Configure your trading preferences and system settings
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveSettings}
            className="flex items-center space-x-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <SafeIcon icon={FiSave} className="w-5 h-5" />
            <span>Save Changes</span>
          </motion.button>
        </div>

        {/* Trading Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiSettings} className="w-6 h-6 text-primary-400" />
            <h2 className="text-xl font-bold text-white">Trading Settings</h2>
          </div>

          <div className="space-y-6">
            {/* Auto Trading */}
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Automated Trading</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Enable AI-powered automated trading with G-Channel strategy
                </p>
              </div>
              <button
                onClick={() => handleToggle('autoTrade')}
                className="relative"
              >
                <SafeIcon 
                  icon={localSettings.autoTrade ? FiToggleRight : FiToggleLeft} 
                  className={`w-12 h-6 ${localSettings.autoTrade ? 'text-green-400' : 'text-gray-600'}`} 
                />
              </button>
            </div>

            {/* Risk Level */}
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">Risk Level</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Set your preferred risk tolerance for automated trading
                  </p>
                </div>
                <div className="text-white font-medium capitalize">
                  {localSettings.riskLevel}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                {['low', 'medium', 'high'].map((level) => (
                  <button
                    key={level}
                    onClick={() => handleRiskLevelChange(level)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      localSettings.riskLevel === level
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-600 text-gray-400 hover:text-white'
                    }`}
                  >
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Position Size */}
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-white">Maximum Position Size</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum percentage of portfolio per trade
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={localSettings.maxPositionSize}
                    onChange={(e) => handleNumberChange('maxPositionSize', e.target.value)}
                    className="w-16 bg-dark-600 text-white px-2 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none text-center"
                  />
                  <span className="text-white">%</span>
                </div>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${(localSettings.maxPositionSize / 50) * 100}%` }}
                />
              </div>
            </div>

            {/* Stop Loss */}
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">Default Stop Loss</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Default stop loss percentage for trades
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0.5"
                    max="10"
                    step="0.5"
                    value={localSettings.stopLossPercent}
                    onChange={(e) => handleNumberChange('stopLossPercent', e.target.value)}
                    className="w-16 bg-dark-600 text-white px-2 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none text-center"
                  />
                  <span className="text-white">%</span>
                </div>
              </div>
            </div>

            {/* Take Profit */}
            <div className="p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="font-medium text-white">Default Take Profit</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    Default take profit percentage for trades
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="50"
                    step="0.5"
                    value={localSettings.takeProfitPercent}
                    onChange={(e) => handleNumberChange('takeProfitPercent', e.target.value)}
                    className="w-16 bg-dark-600 text-white px-2 py-1 rounded border border-dark-500 focus:border-primary-500 focus:outline-none text-center"
                  />
                  <span className="text-white">%</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiBell} className="w-6 h-6 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Notification Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Email Notifications</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Receive important alerts via email
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('email')}
                className="relative"
              >
                <SafeIcon 
                  icon={localSettings.notifications.email ? FiToggleRight : FiToggleLeft} 
                  className={`w-12 h-6 ${localSettings.notifications.email ? 'text-green-400' : 'text-gray-600'}`} 
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Push Notifications</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Receive real-time alerts in browser
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('push')}
                className="relative"
              >
                <SafeIcon 
                  icon={localSettings.notifications.push ? FiToggleRight : FiToggleLeft} 
                  className={`w-12 h-6 ${localSettings.notifications.push ? 'text-green-400' : 'text-gray-600'}`} 
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Trade Notifications</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Get notified about executed trades
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('trades')}
                className="relative"
              >
                <SafeIcon 
                  icon={localSettings.notifications.trades ? FiToggleRight : FiToggleLeft} 
                  className={`w-12 h-6 ${localSettings.notifications.trades ? 'text-green-400' : 'text-gray-600'}`} 
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-dark-700 rounded-lg">
              <div>
                <h3 className="font-medium text-white">Signal Notifications</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Get notified about new trading signals
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('signals')}
                className="relative"
              >
                <SafeIcon 
                  icon={localSettings.notifications.signals ? FiToggleRight : FiToggleLeft} 
                  className={`w-12 h-6 ${localSettings.notifications.signals ? 'text-green-400' : 'text-gray-600'}`} 
                />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-800 rounded-xl p-6 border border-dark-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <SafeIcon icon={FiShield} className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Security Settings</h2>
          </div>

          <div className="p-4 bg-dark-700 rounded-lg mb-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Enhance your account security with 2FA
                </p>
              </div>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                Enable 2FA
              </button>
            </div>
          </div>

          <div className="p-4 bg-dark-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-white">API Key Management</h3>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your exchange API keys
                </p>
              </div>
              <button className="px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors text-sm">
                Manage Keys
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Settings;
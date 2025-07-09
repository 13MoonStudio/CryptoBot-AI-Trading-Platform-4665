import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useN8nWorkflows } from '../../contexts/N8nWorkflowsContext';

const {
  FiZap,
  FiPlay,
  FiPause,
  FiSettings,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiAlertCircle
} = FiIcons;

const N8nWorkflows = () => {
  const {
    workflows,
    isConnected,
    connectionStatus,
    connectToN8n,
    disconnectFromN8n,
    createWorkflow,
    executeWorkflow,
    updateWorkflow,
    deleteWorkflow
  } = useN8nWorkflows();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newWorkflow, setNewWorkflow] = useState({
    name: '',
    description: '',
    trigger: 'manual',
    nodes: []
  });

  const predefinedWorkflows = [
    {
      id: 'price-alert',
      name: 'Price Alert System',
      description: 'Send notifications when price thresholds are met',
      nodes: [
        { type: 'trigger', name: 'Price Monitor' },
        { type: 'condition', name: 'Price Check' },
        { type: 'notification', name: 'Send Alert' }
      ]
    },
    {
      id: 'trading-signal',
      name: 'Trading Signal Automation',
      description: 'Execute trades based on technical indicators',
      nodes: [
        { type: 'trigger', name: 'Market Data' },
        { type: 'analysis', name: 'Technical Analysis' },
        { type: 'action', name: 'Execute Trade' }
      ]
    },
    {
      id: 'portfolio-rebalance',
      name: 'Portfolio Rebalancing',
      description: 'Automatically rebalance portfolio based on targets',
      nodes: [
        { type: 'schedule', name: 'Daily Trigger' },
        { type: 'analysis', name: 'Portfolio Analysis' },
        { type: 'action', name: 'Rebalance' }
      ]
    },
    {
      id: 'risk-management',
      name: 'Risk Management System',
      description: 'Monitor and manage trading risks automatically',
      nodes: [
        { type: 'trigger', name: 'Risk Monitor' },
        { type: 'condition', name: 'Risk Assessment' },
        { type: 'action', name: 'Risk Mitigation' }
      ]
    }
  ];

  const handleCreateWorkflow = (template) => {
    setNewWorkflow({
      name: template.name,
      description: template.description,
      trigger: 'manual',
      nodes: template.nodes
    });
    setShowCreateModal(true);
  };

  const handleSaveWorkflow = async () => {
    await createWorkflow(newWorkflow);
    setShowCreateModal(false);
    setNewWorkflow({
      name: '',
      description: '',
      trigger: 'manual',
      nodes: []
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'paused': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return FiCheckCircle;
      case 'paused': return FiPause;
      case 'error': return FiAlertCircle;
      default: return FiClock;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiZap} className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">n8n Workflow Automation</h2>
            <p className="text-sm text-gray-400">Automate your trading processes</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className={`text-sm ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
              {connectionStatus}
            </span>
          </div>
          <button
            onClick={isConnected ? disconnectFromN8n : connectToN8n}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isConnected
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isConnected ? 'Disconnect' : 'Connect to n8n'}
          </button>
        </div>
      </div>

      {!isConnected ? (
        <div className="text-center py-12">
          <SafeIcon icon={FiZap} className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Connect to n8n</h3>
          <p className="text-gray-400 mb-6">
            Connect to your n8n instance to manage workflow automations
          </p>
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="n8n Instance URL (e.g., https://your-n8n.com)"
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none mb-4"
            />
            <input
              type="password"
              placeholder="API Key"
              className="w-full px-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white placeholder-gray-400 focus:border-primary-500 focus:outline-none mb-4"
            />
            <button
              onClick={connectToN8n}
              className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Quick Start Templates */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Quick Start Templates</h3>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
                <span>Custom Workflow</span>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {predefinedWorkflows.map((template) => (
                <motion.div
                  key={template.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-dark-700 rounded-lg p-4 border border-dark-600 hover:border-primary-500 transition-colors cursor-pointer"
                  onClick={() => handleCreateWorkflow(template)}
                >
                  <h4 className="font-medium text-white mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{template.nodes.length} nodes</span>
                    </div>
                    <SafeIcon icon={FiPlus} className="w-4 h-4 text-primary-400" />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Active Workflows */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">Active Workflows</h3>
            {workflows.length === 0 ? (
              <div className="text-center py-8">
                <SafeIcon icon={FiActivity} className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No workflows created yet</p>
                <p className="text-sm text-gray-500 mt-2">
                  Create your first workflow using the templates above
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {workflows.map((workflow) => (
                  <motion.div
                    key={workflow.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-dark-700 rounded-lg p-4 border border-dark-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <SafeIcon
                          icon={getStatusIcon(workflow.status)}
                          className={`w-5 h-5 ${getStatusColor(workflow.status)}`}
                        />
                        <div>
                          <h4 className="font-medium text-white">{workflow.name}</h4>
                          <p className="text-sm text-gray-400">{workflow.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => executeWorkflow(workflow.id)}
                          className="p-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
                        >
                          <SafeIcon icon={FiPlay} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateWorkflow(workflow.id)}
                          className="p-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
                        >
                          <SafeIcon icon={FiEdit3} className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteWorkflow(workflow.id)}
                          className="p-2 bg-dark-600 text-red-400 rounded-lg hover:bg-dark-500 transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Status:</span>
                        <span className={`ml-2 capitalize ${getStatusColor(workflow.status)}`}>
                          {workflow.status}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Executions:</span>
                        <span className="ml-2 text-white">{workflow.executions || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Last Run:</span>
                        <span className="ml-2 text-white">
                          {workflow.lastRun ? new Date(workflow.lastRun).toLocaleString() : 'Never'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Success Rate:</span>
                        <span className="ml-2 text-green-400">{workflow.successRate || 0}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-800 rounded-xl p-6 border border-dark-700 max-w-md w-full mx-4"
          >
            <h3 className="text-lg font-bold text-white mb-4">Create New Workflow</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={newWorkflow.name}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  placeholder="Enter workflow name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={newWorkflow.description}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, description: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                  rows="3"
                  placeholder="Describe what this workflow does"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trigger Type
                </label>
                <select
                  value={newWorkflow.trigger}
                  onChange={(e) => setNewWorkflow({ ...newWorkflow, trigger: e.target.value })}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="manual">Manual</option>
                  <option value="schedule">Schedule</option>
                  <option value="webhook">Webhook</option>
                  <option value="event">Event</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkflow}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Create Workflow
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default N8nWorkflows;
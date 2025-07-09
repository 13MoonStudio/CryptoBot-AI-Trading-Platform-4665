import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useN8nWorkflows } from '../../contexts/N8nWorkflowsContext';

const {
  FiBot,
  FiActivity,
  FiShield,
  FiTrendingUp,
  FiTarget,
  FiBrain,
  FiZap,
  FiPlay,
  FiPause,
  FiSettings,
  FiEye,
  FiBarChart3,
  FiCode
} = FiIcons;

const N8nAgentWorkflows = () => {
  const { agentWorkflows, deployAgentWorkflow } = useN8nWorkflows();
  const [selectedAgent, setSelectedAgent] = useState('all');
  const [showPineScriptIntegration, setShowPineScriptIntegration] = useState(false);

  // Get icon component from string name
  const getIconComponent = (iconName) => {
    const iconMap = {
      FiBarChart3,
      FiTarget,
      FiShield,
      FiZap,
      FiEye,
      FiBrain
    };
    return iconMap[iconName] || FiBot;
  };

  // Define the agentic workflows (fallback if none in context)
  const predefinedAgentWorkflows = [
    {
      id: 'market-analysis-agent',
      name: 'Market Analysis Agent',
      description: 'Continuously analyzes market conditions, sentiment, and technical indicators',
      icon: 'FiBarChart3',
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/20',
      category: 'analysis',
      supportsPineScript: false,
      nodes: [
        { type: 'Schedule Trigger', name: 'Every 30 seconds' },
        { type: 'HTTP Request', name: 'Fetch Market Data' },
        { type: 'Function', name: 'Calculate Technical Indicators' },
        { type: 'Webhook', name: 'Send to Signal Agent' }
      ]
    },
    {
      id: 'signal-generation-agent',
      name: 'Signal Generation Agent',
      description: 'Generates trading signals based on your PineScript strategy',
      icon: 'FiTarget',
      color: 'text-green-400',
      bgColor: 'bg-green-500/20',
      category: 'signals',
      supportsPineScript: true,
      nodes: [
        { type: 'Webhook', name: 'Receive Market Analysis' },
        { type: 'Function', name: 'PineScript Strategy Logic' },
        { type: 'Function', name: 'Signal Validation' },
        { type: 'Webhook', name: 'Send to Risk Agent' }
      ]
    },
    {
      id: 'risk-management-agent',
      name: 'Risk Management Agent',
      description: 'Evaluates and manages trading risks before execution',
      icon: 'FiShield',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/20',
      category: 'risk',
      supportsPineScript: false,
      nodes: [
        { type: 'Webhook', name: 'Receive Trading Signals' },
        { type: 'Function', name: 'Risk Assessment' },
        { type: 'Webhook', name: 'Send to Execution Agent' }
      ]
    },
    {
      id: 'execution-agent',
      name: 'Trade Execution Agent',
      description: 'Executes approved trades and manages order lifecycle',
      icon: 'FiZap',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/20',
      category: 'execution',
      supportsPineScript: false,
      nodes: [
        { type: 'Webhook', name: 'Receive Approved Signals' },
        { type: 'Function', name: 'Order Preparation' },
        { type: 'HTTP Request', name: 'Execute Trade' }
      ]
    },
    {
      id: 'position-monitoring-agent',
      name: 'Position Monitoring Agent',
      description: 'Continuously monitors open positions and manages exits',
      icon: 'FiEye',
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/20',
      category: 'monitoring',
      supportsPineScript: false,
      nodes: [
        { type: 'Schedule Trigger', name: 'Every 10 seconds' },
        { type: 'Function', name: 'Position Analysis' },
        { type: 'HTTP Request', name: 'Close Positions' }
      ]
    },
    {
      id: 'ai-learning-agent',
      name: 'AI Learning & Optimization Agent',
      description: 'Continuously learns from market data and optimizes strategies',
      icon: 'FiBrain',
      color: 'text-pink-400',
      bgColor: 'bg-pink-500/20',
      category: 'ai',
      supportsPineScript: false,
      nodes: [
        { type: 'Schedule Trigger', name: 'Daily Analysis' },
        { type: 'Function', name: 'Pattern Recognition' },
        { type: 'HTTP Request', name: 'Update Strategy Parameters' }
      ]
    }
  ];

  // Use context workflows or fallback to predefined
  const allAgentWorkflows = agentWorkflows && agentWorkflows.length > 0 ? agentWorkflows : predefinedAgentWorkflows;

  const categories = [
    { key: 'all', label: 'All Agents', count: allAgentWorkflows.length },
    {
      key: 'analysis',
      label: 'Analysis',
      count: allAgentWorkflows.filter(w => w.category === 'analysis').length
    },
    {
      key: 'signals',
      label: 'Signals',
      count: allAgentWorkflows.filter(w => w.category === 'signals').length
    },
    {
      key: 'risk',
      label: 'Risk Management',
      count: allAgentWorkflows.filter(w => w.category === 'risk').length
    },
    {
      key: 'execution',
      label: 'Execution',
      count: allAgentWorkflows.filter(w => w.category === 'execution').length
    },
    {
      key: 'monitoring',
      label: 'Monitoring',
      count: allAgentWorkflows.filter(w => w.category === 'monitoring').length
    },
    {
      key: 'ai',
      label: 'AI Learning',
      count: allAgentWorkflows.filter(w => w.category === 'ai').length
    }
  ];

  const filteredWorkflows =
    selectedAgent === 'all'
      ? allAgentWorkflows
      : allAgentWorkflows.filter(w => w.category === selectedAgent);

  const handleCreateAgentWorkflow = async (workflow) => {
    try {
      await deployAgentWorkflow(workflow.id);
    } catch (error) {
      console.error('Error deploying workflow:', error);
    }
  };

  if (showPineScriptIntegration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowPineScriptIntegration(false)}
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            ← Back to Agents
          </button>
        </div>
        <div className="bg-dark-800 rounded-xl p-6 border border-dark-700">
          <h3 className="text-lg font-medium text-white mb-4">PineScript Integration</h3>
          <p className="text-gray-400 mb-4">
            Upload your PineScript strategy to be converted and used by the Signal Generation Agent.
          </p>
          <textarea
            className="w-full h-64 bg-dark-700 border border-dark-600 rounded-lg p-4 text-white font-mono text-sm"
            placeholder="// Paste your PineScript code here..."
          ></textarea>
          <div className="mt-4 flex justify-end space-x-3">
            <button 
              onClick={() => setShowPineScriptIntegration(false)}
              className="px-4 py-2 bg-dark-700 text-gray-300 rounded-lg hover:bg-dark-600 transition-colors"
            >
              Cancel
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
              Validate & Convert
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiBrain} className="w-6 h-6 text-pink-400" />
          <div>
            <h2 className="text-xl font-bold text-white">Agentic Workflow System</h2>
            <p className="text-sm text-gray-400">
              AI-powered autonomous trading agents with PineScript integration
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowPineScriptIntegration(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <SafeIcon icon={FiCode} className="w-4 h-4" />
            <span>Upload PineScript</span>
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400">Agents Ready</span>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {categories.map((category) => (
          <button
            key={category.key}
            onClick={() => setSelectedAgent(category.key)}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              selectedAgent === category.key
                ? 'bg-primary-500 text-white'
                : 'bg-dark-700 text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            {category.label} ({category.count})
          </button>
        ))}
      </div>

      {/* Agent Workflows Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredWorkflows.map((workflow) => {
          const IconComponent = getIconComponent(workflow.icon);
          
          return (
            <motion.div
              key={workflow.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-700 rounded-lg p-6 border border-dark-600 hover:border-primary-500 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-xl ${workflow.bgColor}`}>
                    <SafeIcon icon={IconComponent} className={`w-6 h-6 ${workflow.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-white text-lg">{workflow.name}</h3>
                      {workflow.supportsPineScript && (
                        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full border border-blue-500/30">
                          PineScript
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{workflow.description}</p>
                  </div>
                </div>
              </div>

              {/* Workflow Nodes Preview */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Workflow Steps:</h4>
                <div className="space-y-1">
                  {workflow.nodes && workflow.nodes.slice(0, 4).map((node, index) => (
                    <div key={index} className="flex items-center space-x-2 text-xs">
                      <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
                      <span className="text-gray-400">{node.name}</span>
                      {workflow.supportsPineScript && index === 1 && (
                        <span className="text-blue-400">(PineScript Logic)</span>
                      )}
                    </div>
                  ))}
                  {workflow.nodes && workflow.nodes.length > 4 && (
                    <div className="text-xs text-gray-500">
                      +{workflow.nodes.length - 4} more steps...
                    </div>
                  )}
                </div>
              </div>

              {/* PineScript Integration Info */}
              {workflow.supportsPineScript && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-1">
                    <SafeIcon icon={FiCode} className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-blue-400">PineScript Ready</span>
                  </div>
                  <p className="text-xs text-gray-400">
                    This agent automatically converts and executes your PineScript strategy logic
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {workflow.nodes ? workflow.nodes.length : 0} nodes
                  </span>
                  <span className="text-xs text-gray-500">•</span>
                  <span className={`text-xs ${workflow.color}`}>
                    {workflow.category}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {workflow.supportsPineScript && (
                    <button
                      onClick={() => setShowPineScriptIntegration(true)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Add Script
                    </button>
                  )}
                  <button
                    onClick={() => handleCreateAgentWorkflow(workflow)}
                    className="px-3 py-1 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm"
                  >
                    Deploy Agent
                  </button>
                  <button className="p-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors">
                    <SafeIcon icon={FiSettings} className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Agent Flow Diagram */}
      <div className="mt-8 bg-dark-700 rounded-lg p-6">
        <h3 className="text-lg font-bold text-white mb-4">Agent Communication Flow</h3>
        <div className="flex items-center justify-between space-x-4 overflow-x-auto">
          {[
            { name: 'Market Analysis', icon: FiBarChart3, color: 'text-blue-400' },
            { name: 'PineScript Signals', icon: FiCode, color: 'text-green-400' },
            { name: 'Risk Assessment', icon: FiShield, color: 'text-orange-400' },
            { name: 'Trade Execution', icon: FiZap, color: 'text-yellow-400' },
            { name: 'Position Monitoring', icon: FiEye, color: 'text-purple-400' },
            { name: 'Performance Analysis', icon: FiTrendingUp, color: 'text-cyan-400' },
            { name: 'AI Learning', icon: FiBrain, color: 'text-pink-400' }
          ].map((agent, index) => (
            <div key={agent.name} className="flex items-center space-x-2 min-w-max">
              <div className="flex flex-col items-center">
                <div className="p-2 bg-dark-600 rounded-lg">
                  <SafeIcon icon={agent.icon} className={`w-5 h-5 ${agent.color}`} />
                </div>
                <span className="text-xs text-gray-400 mt-1 text-center">{agent.name}</span>
              </div>
              {index < 6 && (
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-primary-400"></div>
                  <div className="w-0 h-0 border-l-4 border-l-primary-400 border-y-2 border-y-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default N8nAgentWorkflows;
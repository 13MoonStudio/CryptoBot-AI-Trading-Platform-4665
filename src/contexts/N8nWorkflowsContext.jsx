import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const N8nWorkflowsContext = createContext();

const initialState = {
  isConnected: false,
  connectionStatus: 'Disconnected',
  n8nUrl: '',
  apiKey: '',
  workflows: [],
  executions: [],
  agentWorkflows: []
};

function workflowsReducer(state, action) {
  switch (action.type) {
    case 'SET_CONNECTION':
      return {
        ...state,
        isConnected: action.payload.isConnected,
        connectionStatus: action.payload.status,
        n8nUrl: action.payload.url || state.n8nUrl,
        apiKey: action.payload.apiKey || state.apiKey
      };
    case 'SET_WORKFLOWS':
      return { ...state, workflows: action.payload };
    case 'ADD_WORKFLOW':
      return { ...state, workflows: [...state.workflows, action.payload] };
    case 'UPDATE_WORKFLOW':
      return {
        ...state,
        workflows: state.workflows.map(w => 
          w.id === action.payload.id ? { ...w, ...action.payload } : w
        )
      };
    case 'DELETE_WORKFLOW':
      return {
        ...state,
        workflows: state.workflows.filter(w => w.id !== action.payload)
      };
    case 'ADD_EXECUTION':
      return {
        ...state,
        executions: [action.payload, ...state.executions.slice(0, 99)]
      };
    case 'SET_AGENT_WORKFLOWS':
      return { ...state, agentWorkflows: action.payload };
    case 'ADD_AGENT_WORKFLOW':
      return {
        ...state,
        agentWorkflows: [...state.agentWorkflows, action.payload]
      };
    default:
      return state;
  }
}

export function N8nWorkflowsProvider({ children }) {
  const [state, dispatch] = useReducer(workflowsReducer, initialState);

  // Safe notification function that doesn't depend on AppContext
  const addNotification = (notification) => {
    console.log('N8n Notification:', notification);
    // Show toast instead of relying on app context
    if (notification.type === 'success') {
      toast.success(notification.message);
    } else if (notification.type === 'error') {
      toast.error(notification.message);
    } else {
      toast(notification.message);
    }
  };

  // Initialize with some default data
  useEffect(() => {
    const defaultAgentWorkflows = [
      {
        id: 'market-analysis-agent',
        name: 'Market Analysis Agent',
        description: 'Analyzes market conditions and technical indicators',
        category: 'analysis',
        status: 'inactive',
        deployed: false,
        lastExecution: null,
        icon: 'FiBarChart3',
        color: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
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
        description: 'Generates trading signals based on G-Channel strategy',
        category: 'signals',
        status: 'inactive',
        deployed: false,
        lastExecution: null,
        icon: 'FiTarget',
        color: 'text-green-400',
        bgColor: 'bg-green-500/20',
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
        category: 'risk',
        status: 'inactive',
        deployed: false,
        lastExecution: null,
        icon: 'FiShield',
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/20',
        supportsPineScript: false,
        nodes: [
          { type: 'Webhook', name: 'Receive Trading Signals' },
          { type: 'Function', name: 'Risk Assessment' },
          { type: 'Webhook', name: 'Send to Execution Agent' }
        ]
      }
    ];

    dispatch({ type: 'SET_AGENT_WORKFLOWS', payload: defaultAgentWorkflows });
  }, []);

  const connectToN8n = async (url = 'http://localhost:5678', apiKey = 'demo-key') => {
    try {
      dispatch({
        type: 'SET_CONNECTION',
        payload: { isConnected: false, status: 'Connecting...', url, apiKey }
      });

      // Simulate connection to n8n
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock successful connection
      dispatch({
        type: 'SET_CONNECTION',
        payload: { isConnected: true, status: 'Connected', url, apiKey }
      });

      // Load existing workflows
      const mockWorkflows = [
        {
          id: 'wf_1',
          name: 'Price Alert System',
          description: 'Monitor BTC price and send alerts',
          status: 'active',
          executions: 142,
          lastRun: Date.now() - 3600000,
          successRate: 98.5,
          nodes: [
            { type: 'trigger', name: 'Price Monitor' },
            { type: 'condition', name: 'Price Check' },
            { type: 'notification', name: 'Send Alert' }
          ]
        },
        {
          id: 'wf_2',
          name: 'Trading Signal Automation',
          description: 'Execute trades based on RSI signals',
          status: 'paused',
          executions: 67,
          lastRun: Date.now() - 7200000,
          successRate: 87.3,
          nodes: [
            { type: 'trigger', name: 'Market Data' },
            { type: 'analysis', name: 'RSI Analysis' },
            { type: 'action', name: 'Execute Trade' }
          ]
        }
      ];

      dispatch({ type: 'SET_WORKFLOWS', payload: mockWorkflows });

      addNotification({
        type: 'success',
        title: 'n8n Connected',
        message: 'Successfully connected to n8n workflow automation'
      });

    } catch (error) {
      dispatch({
        type: 'SET_CONNECTION',
        payload: { isConnected: false, status: 'Connection Failed' }
      });

      addNotification({
        type: 'error',
        title: 'Connection Failed',
        message: 'Failed to connect to n8n instance'
      });
    }
  };

  const disconnectFromN8n = () => {
    dispatch({
      type: 'SET_CONNECTION',
      payload: { isConnected: false, status: 'Disconnected' }
    });
    
    dispatch({ type: 'SET_WORKFLOWS', payload: [] });
    
    addNotification({
      type: 'info',
      title: 'n8n Disconnected',
      message: 'Disconnected from n8n workflow automation'
    });
  };

  const createWorkflow = async (workflowData) => {
    try {
      const newWorkflow = {
        id: `wf_${Date.now()}`,
        ...workflowData,
        status: 'inactive',
        executions: 0,
        lastRun: null,
        successRate: 0,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_WORKFLOW', payload: newWorkflow });

      addNotification({
        type: 'success',
        title: 'Workflow Created',
        message: `${workflowData.name} workflow has been created`
      });

      return newWorkflow;

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to create workflow'
      });
      throw error;
    }
  };

  const deployAgentWorkflow = async (agentId) => {
    try {
      const agentWorkflow = state.agentWorkflows.find(w => w.id === agentId);
      if (!agentWorkflow) return;

      // Simulate deployment to n8n
      const deployedWorkflow = {
        id: `agent_${Date.now()}`,
        name: agentWorkflow.name,
        description: agentWorkflow.description,
        status: 'active',
        executions: 0,
        lastRun: null,
        successRate: 0,
        agentType: agentId,
        n8nWorkflowId: `n8n_${agentId}_${Date.now()}`,
        createdAt: new Date().toISOString()
      };

      dispatch({ type: 'ADD_WORKFLOW', payload: deployedWorkflow });

      addNotification({
        type: 'success',
        title: 'Agent Deployed',
        message: `${agentWorkflow.name} has been deployed and activated`
      });

      // Start simulated executions
      setTimeout(() => {
        executeWorkflow(deployedWorkflow.id);
      }, 5000);

      return deployedWorkflow;

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to deploy agent workflow'
      });
      throw error;
    }
  };

  const executeWorkflow = async (workflowId) => {
    try {
      const workflow = state.workflows.find(w => w.id === workflowId);
      if (!workflow) return;

      const execution = {
        id: `exec_${Date.now()}`,
        workflowId,
        workflowName: workflow.name,
        status: 'running',
        startTime: new Date().toISOString(),
        endTime: null,
        duration: null,
        success: null
      };

      dispatch({ type: 'ADD_EXECUTION', payload: execution });

      addNotification({
        type: 'info',
        title: 'Workflow Executing',
        message: `${workflow.name} is now running`
      });

      // Simulate workflow execution
      setTimeout(() => {
        const success = Math.random() > 0.1; // 90% success rate
        
        const completedExecution = {
          ...execution,
          status: success ? 'completed' : 'error',
          endTime: new Date().toISOString(),
          duration: Math.floor(Math.random() * 5000) + 1000,
          success
        };

        dispatch({ type: 'ADD_EXECUTION', payload: completedExecution });

        // Update workflow stats
        const updatedWorkflow = {
          ...workflow,
          executions: workflow.executions + 1,
          lastRun: Date.now(),
          successRate: success
            ? ((workflow.successRate * workflow.executions + 100) / (workflow.executions + 1))
            : ((workflow.successRate * workflow.executions) / (workflow.executions + 1))
        };

        dispatch({ type: 'UPDATE_WORKFLOW', payload: updatedWorkflow });

        addNotification({
          type: success ? 'success' : 'error',
          title: success ? 'Workflow Completed' : 'Workflow Failed',
          message: `${workflow.name} ${success ? 'completed successfully' : 'failed to execute'}`
        });

        // For agent workflows, schedule next execution
        if (workflow.agentType && success) {
          const nextExecutionDelay = workflow.agentType.includes('analysis') ? 30000 : 60000;
          setTimeout(() => {
            executeWorkflow(workflowId);
          }, nextExecutionDelay);
        }
      }, 3000);

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to execute workflow'
      });
    }
  };

  const updateWorkflow = async (workflowId, updates) => {
    try {
      const updatedWorkflow = {
        id: workflowId,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      dispatch({ type: 'UPDATE_WORKFLOW', payload: updatedWorkflow });

      addNotification({
        type: 'success',
        title: 'Workflow Updated',
        message: 'Workflow has been updated successfully'
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to update workflow'
      });
    }
  };

  const deleteWorkflow = async (workflowId) => {
    try {
      const workflow = state.workflows.find(w => w.id === workflowId);
      
      dispatch({ type: 'DELETE_WORKFLOW', payload: workflowId });

      addNotification({
        type: 'info',
        title: 'Workflow Deleted',
        message: `${workflow?.name || 'Workflow'} has been deleted`
      });

    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete workflow'
      });
    }
  };

  const value = {
    ...state,
    connectToN8n,
    disconnectFromN8n,
    createWorkflow,
    executeWorkflow,
    updateWorkflow,
    deleteWorkflow,
    deployAgentWorkflow
  };

  return (
    <N8nWorkflowsContext.Provider value={value}>
      {children}
    </N8nWorkflowsContext.Provider>
  );
}

export const useN8nWorkflows = () => {
  const context = useContext(N8nWorkflowsContext);
  if (!context) {
    throw new Error('useN8nWorkflows must be used within a N8nWorkflowsProvider');
  }
  return context;
};
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useTrading } from './TradingContext';
import { useWallet } from './WalletContext';
import aiService from '../services/aiService';
import { dbOperations } from '../lib/supabase';

// Create context
const AIContext = createContext();

// Initial state
const initialState = {
  isProcessing: false,
  chatHistory: [],
  currentMode: 'chat',
  lastAnalysis: null,
  tradingSuggestions: [],
  tutorials: {},
  error: null,
};

// Action types
const AI_ACTIONS = {
  SET_PROCESSING: 'SET_PROCESSING',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_CHAT_HISTORY: 'SET_CHAT_HISTORY',
  SET_MODE: 'SET_MODE',
  SET_ANALYSIS: 'SET_ANALYSIS',
  ADD_TRADING_SUGGESTION: 'ADD_TRADING_SUGGESTION',
  ADD_TUTORIAL: 'ADD_TUTORIAL',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer function
function aiReducer(state, action) {
  switch (action.type) {
    case AI_ACTIONS.SET_PROCESSING:
      return { ...state, isProcessing: action.payload };
      
    case AI_ACTIONS.ADD_MESSAGE:
      return { 
        ...state, 
        chatHistory: [...state.chatHistory, action.payload],
      };
      
    case AI_ACTIONS.SET_CHAT_HISTORY:
      return { ...state, chatHistory: action.payload };
      
    case AI_ACTIONS.SET_MODE:
      return { ...state, currentMode: action.payload };
      
    case AI_ACTIONS.SET_ANALYSIS:
      return { ...state, lastAnalysis: action.payload };
      
    case AI_ACTIONS.ADD_TRADING_SUGGESTION:
      return { 
        ...state, 
        tradingSuggestions: [action.payload, ...state.tradingSuggestions.slice(0, 19)],
      };
      
    case AI_ACTIONS.ADD_TUTORIAL:
      return { 
        ...state, 
        tutorials: { ...state.tutorials, [action.payload.topic]: action.payload.content },
      };
      
    case AI_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
      
    case AI_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
      
    default:
      return state;
  }
}

// Provider component
export function AIProvider({ children }) {
  const [state, dispatch] = useReducer(aiReducer, initialState);
  const { marketData, signals, positions, strategy } = useTrading();
  const { address } = useWallet();
  
  // Load chat history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        if (address) {
          const history = await dbOperations.getChatHistory(address);
          if (history && history.length > 0) {
            const formattedHistory = history.map(msg => ({
              id: msg.id,
              role: 'user',
              content: msg.message,
              timestamp: new Date(msg.timestamp),
              response: {
                id: `${msg.id}-response`,
                role: 'assistant',
                content: msg.response,
                timestamp: new Date(msg.timestamp),
              }
            }));
            
            // Flatten user messages and responses into a single array
            const flatHistory = formattedHistory.flatMap(msg => [msg, msg.response]);
            dispatch({ type: AI_ACTIONS.SET_CHAT_HISTORY, payload: flatHistory });
          }
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    };
    
    loadChatHistory();
  }, [address]);
  
  // Process text message
  const processMessage = async (message, mode = 'chat') => {
    dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: true });
    
    try {
      // Add user message to chat history
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: userMessage });
      
      // Generate context for AI
      const context = {
        marketData: Object.keys(marketData).map(symbol => ({
          symbol,
          price: marketData[symbol].price,
          change: marketData[symbol].change,
          volume: marketData[symbol].volume,
        })),
        recentSignals: signals.slice(0, 5),
        openPositions: positions,
        currentStrategy: strategy,
      };
      
      // Process with AI service
      const response = await aiService.processTextRequest(message, mode, context);
      
      // Add AI response to chat history
      const assistantMessage = {
        id: Date.now().toString() + '-response',
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        charts: response.charts || [],
        suggestions: response.suggestions || [],
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: assistantMessage });
      
      // Save to database if user is logged in
      if (address) {
        await dbOperations.saveChatMessage(
          address,
          message,
          response.text,
          { mode, context: JSON.stringify(context) }
        );
      }
      
      // Update analysis if relevant
      if (mode === 'analysis' && response.analysis) {
        dispatch({ type: AI_ACTIONS.SET_ANALYSIS, payload: response.analysis });
      }
      
      // Add trading suggestion if provided
      if (response.tradingSuggestion) {
        dispatch({ 
          type: AI_ACTIONS.ADD_TRADING_SUGGESTION, 
          payload: response.tradingSuggestion 
        });
      }
      
      // Add tutorial if provided
      if (mode === 'learn' && response.tutorial && response.tutorial.topic) {
        dispatch({ 
          type: AI_ACTIONS.ADD_TUTORIAL, 
          payload: {
            topic: response.tutorial.topic,
            content: response.tutorial.content,
          } 
        });
      }
      
      return response;
      
    } catch (error) {
      console.error('Error processing message:', error);
      dispatch({ 
        type: AI_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to process your request' 
      });
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: errorMessage });
      return null;
      
    } finally {
      dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: false });
    }
  };
  
  // Process multimodal message (text + image)
  const processMultiModal = async (formData) => {
    dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: true });
    
    try {
      const message = formData.get('message') || '';
      const mode = formData.get('mode') || 'analysis';
      
      // Add user message to chat history
      const userMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date(),
        hasImage: true,
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: userMessage });
      
      // Process with AI service
      const response = await aiService.processMultiModalRequest(formData);
      
      // Add AI response to chat history
      const assistantMessage = {
        id: Date.now().toString() + '-response',
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        charts: response.charts || [],
        suggestions: response.suggestions || [],
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: assistantMessage });
      
      // Update analysis if in analysis mode
      if (mode === 'analysis' && response.analysis) {
        dispatch({ type: AI_ACTIONS.SET_ANALYSIS, payload: response.analysis });
      }
      
      return response;
      
    } catch (error) {
      console.error('Error processing multimodal request:', error);
      dispatch({ 
        type: AI_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to process your image analysis request' 
      });
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now().toString() + '-error',
        role: 'assistant',
        content: "I'm sorry, I encountered an error analyzing your image. Please try again later.",
        timestamp: new Date(),
        isError: true,
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: errorMessage });
      return null;
      
    } finally {
      dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: false });
    }
  };
  
  // Generate trading signals
  const generateTradingSignals = async () => {
    dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: true });
    
    try {
      const signals = await aiService.generateTradingSignals(marketData, strategy);
      
      // Add to chat as system message
      const systemMessage = {
        id: Date.now().toString() + '-signals',
        role: 'assistant',
        content: `I've generated ${signals.length} trading signals based on current market conditions.`,
        timestamp: new Date(),
        signals,
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: systemMessage });
      return signals;
      
    } catch (error) {
      console.error('Error generating trading signals:', error);
      dispatch({ 
        type: AI_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to generate trading signals' 
      });
      return [];
      
    } finally {
      dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: false });
    }
  };
  
  // Analyze chart patterns
  const analyzeChartPatterns = async (imageData, timeframe = '1h') => {
    dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: true });
    
    try {
      const analysis = await aiService.analyzeChartPatterns(imageData, timeframe);
      
      // Add to chat as system message
      const systemMessage = {
        id: Date.now().toString() + '-chart-analysis',
        role: 'assistant',
        content: analysis.summary,
        timestamp: new Date(),
        charts: analysis.patterns,
      };
      
      dispatch({ type: AI_ACTIONS.ADD_MESSAGE, payload: systemMessage });
      dispatch({ type: AI_ACTIONS.SET_ANALYSIS, payload: analysis });
      
      return analysis;
      
    } catch (error) {
      console.error('Error analyzing chart patterns:', error);
      dispatch({ 
        type: AI_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to analyze chart patterns' 
      });
      return null;
      
    } finally {
      dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: false });
    }
  };
  
  // Get tutorial content
  const getTutorial = async (topic) => {
    // Check if we already have the tutorial cached
    if (state.tutorials[topic]) {
      return state.tutorials[topic];
    }
    
    dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: true });
    
    try {
      const tutorial = await aiService.generateTutorial(topic);
      
      // Cache the tutorial
      dispatch({ 
        type: AI_ACTIONS.ADD_TUTORIAL, 
        payload: {
          topic,
          content: tutorial,
        } 
      });
      
      return tutorial;
      
    } catch (error) {
      console.error('Error getting tutorial:', error);
      dispatch({ 
        type: AI_ACTIONS.SET_ERROR, 
        payload: error.message || 'Failed to get tutorial content' 
      });
      return null;
      
    } finally {
      dispatch({ type: AI_ACTIONS.SET_PROCESSING, payload: false });
    }
  };
  
  // Set current mode
  const setMode = (mode) => {
    dispatch({ type: AI_ACTIONS.SET_MODE, payload: mode });
  };
  
  // Clear error
  const clearError = () => {
    dispatch({ type: AI_ACTIONS.CLEAR_ERROR });
  };
  
  // Context value
  const value = {
    ...state,
    processMessage,
    processMultiModal,
    generateTradingSignals,
    analyzeChartPatterns,
    getTutorial,
    setMode,
    clearError,
  };
  
  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
}

// Hook for using AI context
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};
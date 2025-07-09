import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useApp } from './AppContext';
import { useWallet } from './WalletContext';
import { supabase, dbOperations, subscribeToMarketData, subscribeToTradingSignals } from '../lib/supabase';
import { backendAPI } from '../services/backendApi';
import toast from 'react-hot-toast';

const TradingContext = createContext();

const initialState = {
  isTrading: false,
  positions: [],
  signals: [],
  orders: [],
  performance: {
    totalTrades: 0,
    winningTrades: 0,
    winRate: 0,
    totalPnL: 0,
    profitFactor: 0,
    maxDrawdown: 0,
  },
  marketData: {
    BTCUSDT: { price: 43500, change: 2.5, volume: 125000 },
    ETHUSDT: { price: 2650, change: -1.2, volume: 85000 },
    ADAUSDT: { price: 0.45, change: 3.8, volume: 45000 },
  },
  strategy: {
    name: 'G-Channel + EMA',
    enabled: false,
    parameters: {
      gChannelLength: 5,
      emaLength: 200,
      atrLength: 14,
      stopMultiplier: 2.0,
      takeMultiplier: 4.0,
    },
  },
  aiAnalysis: {
    confidence: 0,
    signal: 'HOLD',
    reasoning: '',
    marketSentiment: 'NEUTRAL',
  },
  realTimeData: {
    connected: false,
    lastUpdate: null,
  }
};

function tradingReducer(state, action) {
  switch (action.type) {
    case 'SET_TRADING':
      return { ...state, isTrading: action.payload };
    case 'ADD_POSITION':
      return { ...state, positions: [...state.positions, action.payload] };
    case 'UPDATE_POSITION':
      return {
        ...state,
        positions: state.positions.map(pos =>
          pos.id === action.payload.id ? { ...pos, ...action.payload } : pos
        ),
      };
    case 'REMOVE_POSITION':
      return {
        ...state,
        positions: state.positions.filter(pos => pos.id !== action.payload),
      };
    case 'ADD_SIGNAL':
      return { ...state, signals: [action.payload, ...state.signals.slice(0, 49)] };
    case 'SET_SIGNALS':
      return { ...state, signals: action.payload };
    case 'ADD_ORDER':
      return { ...state, orders: [action.payload, ...state.orders.slice(0, 99)] };
    case 'UPDATE_PERFORMANCE':
      return { ...state, performance: { ...state.performance, ...action.payload } };
    case 'UPDATE_MARKET_DATA':
      return { ...state, marketData: { ...state.marketData, ...action.payload } };
    case 'UPDATE_STRATEGY':
      return { ...state, strategy: { ...state.strategy, ...action.payload } };
    case 'UPDATE_AI_ANALYSIS':
      return { ...state, aiAnalysis: { ...state.aiAnalysis, ...action.payload } };
    case 'SET_REAL_TIME_STATUS':
      return { ...state, realTimeData: { ...state.realTimeData, ...action.payload } };
    default:
      return state;
  }
}

export function TradingProvider({ children }) {
  const [state, dispatch] = useReducer(tradingReducer, initialState);
  const { addNotification } = useApp();
  const { isConnected, address } = useWallet();

  // Initialize real-time connections
  useEffect(() => {
    let marketDataSubscription;
    let signalsSubscription;

    const initializeConnections = async () => {
      try {
        // Connect to backend WebSocket for real-time market data
        backendAPI.connectWebSocket(
          (data) => {
            if (data.type === 'market-update') {
              dispatch({
                type: 'UPDATE_MARKET_DATA',
                payload: {
                  [data.symbol]: {
                    price: data.price,
                    change: ((data.price - data.ema_200) / data.ema_200) * 100,
                    volume: Math.floor(Math.random() * 200000) + 50000,
                    ema_200: data.ema_200,
                    g_channel_upper: data.g_channel_upper,
                    g_channel_lower: data.g_channel_lower,
                    g_channel_mid: data.g_channel_mid,
                  }
                }
              });

              dispatch({
                type: 'SET_REAL_TIME_STATUS',
                payload: { connected: true, lastUpdate: new Date() }
              });
            }
          },
          (error) => {
            dispatch({
              type: 'SET_REAL_TIME_STATUS',
              payload: { connected: false, lastUpdate: new Date() }
            });
            console.error('WebSocket error:', error);
          }
        );

        // Subscribe to Supabase real-time updates
        marketDataSubscription = subscribeToMarketData((payload) => {
          const newData = payload.new;
          dispatch({
            type: 'UPDATE_MARKET_DATA',
            payload: {
              [newData.symbol]: {
                price: parseFloat(newData.price),
                change: parseFloat(newData.change_24h),
                volume: parseFloat(newData.volume),
                ema_200: parseFloat(newData.ema_200),
                g_channel_upper: parseFloat(newData.g_channel_upper),
                g_channel_lower: parseFloat(newData.g_channel_lower),
                g_channel_mid: parseFloat(newData.g_channel_mid),
                rsi: parseFloat(newData.rsi),
              }
            }
          });
        });

        signalsSubscription = subscribeToTradingSignals((payload) => {
          const newSignal = payload.new;
          dispatch({
            type: 'ADD_SIGNAL',
            payload: {
              id: newSignal.id,
              symbol: newSignal.symbol,
              type: newSignal.signal_type,
              price: parseFloat(newSignal.price),
              confidence: newSignal.confidence,
              reasoning: newSignal.reasoning,
              timestamp: new Date(newSignal.timestamp),
              strategy: newSignal.strategy,
              agentSource: newSignal.agent_source,
            }
          });

          // Auto-execute if strategy is enabled
          if (state.strategy.enabled) {
            executeTrade({
              ...newSignal,
              type: newSignal.signal_type,
              price: parseFloat(newSignal.price),
            });
          }
        });

        // Load initial data
        await loadInitialData();

      } catch (error) {
        console.error('Error initializing connections:', error);
        addNotification({
          type: 'error',
          title: 'Connection Error',
          message: 'Failed to establish real-time connections'
        });
      }
    };

    initializeConnections();

    return () => {
      backendAPI.disconnectWebSocket();
      if (marketDataSubscription) marketDataSubscription.unsubscribe();
      if (signalsSubscription) signalsSubscription.unsubscribe();
    };
  }, []);

  // Load initial data from Supabase
  const loadInitialData = async () => {
    try {
      // Load recent signals
      const signals = await dbOperations.getRecentSignals(20);
      dispatch({
        type: 'SET_SIGNALS',
        payload: signals.map(signal => ({
          id: signal.id,
          symbol: signal.symbol,
          type: signal.signal_type,
          price: parseFloat(signal.price),
          confidence: signal.confidence,
          reasoning: signal.reasoning,
          timestamp: new Date(signal.timestamp),
          strategy: signal.strategy,
          agentSource: signal.agent_source,
        }))
      });

      // Load market data
      const marketData = await dbOperations.getLatestMarketData();
      const marketDataMap = {};
      marketData.forEach(data => {
        marketDataMap[data.symbol] = {
          price: parseFloat(data.price),
          change: parseFloat(data.change_24h),
          volume: parseFloat(data.volume),
          ema_200: parseFloat(data.ema_200),
          g_channel_upper: parseFloat(data.g_channel_upper),
          g_channel_lower: parseFloat(data.g_channel_lower),
          g_channel_mid: parseFloat(data.g_channel_mid),
          rsi: parseFloat(data.rsi),
        };
      });

      dispatch({
        type: 'UPDATE_MARKET_DATA',
        payload: marketDataMap
      });

    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  // Execute trade
  const executeTrade = async (signal) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    dispatch({ type: 'SET_TRADING', payload: true });

    try {
      // Create position in Supabase
      const position = {
        user_id: address, // Using wallet address as user ID for now
        symbol: signal.symbol,
        position_type: signal.type,
        entry_price: signal.price,
        position_size: 0.1, // Default position size
        stop_loss: signal.type === 'LONG' ? signal.price * 0.98 : signal.price * 1.02,
        take_profit: signal.type === 'LONG' ? signal.price * 1.06 : signal.price * 0.94,
        current_price: signal.price,
        agent_executed: true,
      };

      const savedPosition = await dbOperations.createPosition(position);

      dispatch({
        type: 'ADD_POSITION',
        payload: {
          id: savedPosition.id,
          symbol: savedPosition.symbol,
          type: savedPosition.position_type,
          entryPrice: parseFloat(savedPosition.entry_price),
          size: parseFloat(savedPosition.position_size),
          stopLoss: parseFloat(savedPosition.stop_loss),
          takeProfit: parseFloat(savedPosition.take_profit),
          timestamp: new Date(savedPosition.opened_at),
          status: 'OPEN',
          pnl: 0,
        }
      });

      const order = {
        id: Date.now().toString(),
        symbol: signal.symbol,
        type: signal.type,
        price: signal.price,
        size: 0.1,
        status: 'FILLED',
        timestamp: new Date(),
      };

      dispatch({ type: 'ADD_ORDER', payload: order });

      addNotification({
        type: 'success',
        title: 'Trade Executed',
        message: `${signal.type} position opened for ${signal.symbol} at $${signal.price.toFixed(2)}`,
      });

      // Update performance
      const newPerformance = {
        totalTrades: state.performance.totalTrades + 1,
      };
      dispatch({ type: 'UPDATE_PERFORMANCE', payload: newPerformance });

    } catch (error) {
      console.error('Trade execution error:', error);
      toast.error('Failed to execute trade');
    } finally {
      dispatch({ type: 'SET_TRADING', payload: false });
    }
  };

  // Enable strategy
  const enableStrategy = () => {
    dispatch({ type: 'UPDATE_STRATEGY', payload: { enabled: true } });
    addNotification({
      type: 'success',
      title: 'Strategy Enabled',
      message: 'G-Channel + EMA strategy is now active',
    });
  };

  // Disable strategy
  const disableStrategy = () => {
    dispatch({ type: 'UPDATE_STRATEGY', payload: { enabled: false } });
    addNotification({
      type: 'info',
      title: 'Strategy Disabled',
      message: 'G-Channel + EMA strategy has been disabled',
    });
  };

  // Close position
  const closePosition = async (positionId) => {
    try {
      const position = state.positions.find(p => p.id === positionId);
      if (!position) return;

      const currentPrice = state.marketData[position.symbol]?.price || position.entryPrice;
      const pnl = position.type === 'LONG' 
        ? (currentPrice - position.entryPrice) * position.size 
        : (position.entryPrice - currentPrice) * position.size;

      // Update position in Supabase
      await dbOperations.updatePosition(positionId, {
        status: 'CLOSED',
        current_price: currentPrice,
        unrealized_pnl: pnl,
        closed_at: new Date().toISOString(),
      });

      dispatch({ type: 'REMOVE_POSITION', payload: positionId });

      // Update performance
      const isWinning = pnl > 0;
      const newPerformance = {
        winningTrades: state.performance.winningTrades + (isWinning ? 1 : 0),
        totalPnL: state.performance.totalPnL + pnl,
        winRate: ((state.performance.winningTrades + (isWinning ? 1 : 0)) / state.performance.totalTrades) * 100,
      };

      dispatch({ type: 'UPDATE_PERFORMANCE', payload: newPerformance });

      addNotification({
        type: isWinning ? 'success' : 'error',
        title: 'Position Closed',
        message: `${position.symbol} position closed with ${pnl > 0 ? 'profit' : 'loss'} of $${Math.abs(pnl).toFixed(2)}`,
      });

    } catch (error) {
      console.error('Error closing position:', error);
      toast.error('Failed to close position');
    }
  };

  // Generate signal (for manual signals)
  const generateSignal = async (symbol) => {
    const marketData = state.marketData[symbol];
    if (!marketData) return null;

    try {
      // Use AI analysis or manual signal generation
      const signal = {
        symbol,
        signal_type: Math.random() > 0.5 ? 'LONG' : 'SHORT',
        price: marketData.price,
        confidence: Math.floor(Math.random() * 20) + 75,
        reasoning: 'Manual signal generated based on current market conditions',
        strategy: 'Manual',
        agent_source: 'manual',
      };

      // Save to Supabase
      await dbOperations.insertTradingSignal(signal);

      return {
        id: Date.now().toString(),
        symbol: signal.symbol,
        type: signal.signal_type,
        price: signal.price,
        confidence: signal.confidence,
        reasoning: signal.reasoning,
        timestamp: new Date(),
      };

    } catch (error) {
      console.error('Error generating signal:', error);
      return null;
    }
  };

  const value = {
    ...state,
    generateSignal,
    executeTrade,
    enableStrategy,
    disableStrategy,
    closePosition,
    loadInitialData,
  };

  return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
}

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
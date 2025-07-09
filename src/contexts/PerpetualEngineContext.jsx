import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useApp } from './AppContext';
import toast from 'react-hot-toast';

const PerpetualEngineContext = createContext();

const initialState = {
  isActive: false,
  engine: null,
  status: {
    vault: {
      total: 0,
      available: 0,
      reserved: 0,
      invested: 0,
      profits: 0,
      reinvested: 0
    },
    positions: [],
    dailyStats: {
      date: new Date().toISOString().split('T')[0],
      trades: 0,
      buys: 0,
      sells: 0,
      profit: 0,
      loss: 0,
      netProfit: 0,
      winRate: 0
    },
    performance: {
      totalDays: 0,
      profitableDays: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalReinvested: 0,
      currentStreak: 0,
      bestStreak: 0,
      compoundGrowth: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    }
  },
  config: {
    initialVault: 1000,
    minVaultReserve: 0.5,
    profitReinvestmentRate: 0.7,
    baseTradingUnit: 0.01,
    maxDailyExposure: 0.1,
    buyThreshold: {
      rsi: { min: 0, max: 30 },
      priceDeviation: -0.02,
      volumeIncrease: 1.5,
      fearGreedIndex: { min: 0, max: 25 }
    },
    sellThreshold: {
      profitTarget: 0.02,
      rsi: { min: 70, max: 100 },
      trailingStop: 0.01,
      timeLimit: 86400000
    }
  }
};

function engineReducer(state, action) {
  switch (action.type) {
    case 'SET_ACTIVE':
      return { ...state, isActive: action.payload };
    case 'UPDATE_STATUS':
      return { ...state, status: { ...state.status, ...action.payload } };
    case 'UPDATE_CONFIG':
      return { ...state, config: { ...state.config, ...action.payload } };
    case 'SET_ENGINE':
      return { ...state, engine: action.payload };
    default:
      return state;
  }
}

// Perpetual Engine Implementation
class PerpetualAccumulationSystem {
  constructor(config, dispatch, addNotification) {
    this.config = config;
    this.dispatch = dispatch;
    this.addNotification = addNotification;
    this.isActive = false;
    
    this.vault = {
      total: config.initialVault,
      available: config.initialVault,
      reserved: 0,
      invested: 0,
      profits: 0,
      reinvested: 0
    };
    
    this.positions = new Map();
    this.dailyStats = this.initializeDailyStats();
    this.performance = this.initializePerformance();
  }
  
  initializeDailyStats() {
    return {
      date: new Date().toISOString().split('T')[0],
      trades: 0,
      buys: 0,
      sells: 0,
      profit: 0,
      loss: 0,
      netProfit: 0,
      winRate: 0
    };
  }
  
  initializePerformance() {
    return {
      totalDays: 0,
      profitableDays: 0,
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      totalProfit: 0,
      totalReinvested: 0,
      currentStreak: 0,
      bestStreak: 0,
      compoundGrowth: 0,
      sharpeRatio: 0,
      maxDrawdown: 0
    };
  }
  
  async start() {
    this.isActive = true;
    this.addNotification({
      type: 'success',
      title: 'Perpetual Engine Started',
      message: `Engine activated with $${this.vault.total} vault`
    });
    
    // Main trading loop
    while (this.isActive) {
      try {
        this.updateReserves();
        const opportunities = await this.scanMarkets();
        
        for (const opp of opportunities.buys) {
          await this.executeBuyStrategy(opp);
        }
        
        await this.checkSellConditions();
        this.updateStatus();
        
        if (this.shouldCompound()) {
          await this.compoundProfits();
        }
        
        await this.sleep(5000);
      } catch (error) {
        console.error('Engine error:', error);
        await this.handleSystemError(error);
      }
    }
  }
  
  stop() {
    this.isActive = false;
    this.addNotification({
      type: 'info',
      title: 'Perpetual Engine Stopped',
      message: 'Engine has been safely stopped'
    });
  }
  
  updateReserves() {
    this.vault.reserved = this.vault.total * this.config.minVaultReserve;
    this.vault.available = this.vault.total - this.vault.reserved - this.vault.invested;
  }
  
  async scanMarkets() {
    const opportunities = { buys: [] };
    
    // Simulated market data
    const markets = [
      {
        symbol: 'BTC/USDT',
        price: 45000 + (Math.random() - 0.5) * 2000,
        indicators: {
          rsi: Math.random() * 100,
          priceDeviation: (Math.random() - 0.5) * 0.1,
          volume: Math.random() * 1000000,
          fearGreed: Math.random() * 100
        }
      },
      {
        symbol: 'ETH/USDT',
        price: 3000 + (Math.random() - 0.5) * 200,
        indicators: {
          rsi: Math.random() * 100,
          priceDeviation: (Math.random() - 0.5) * 0.1,
          volume: Math.random() * 500000,
          fearGreed: Math.random() * 100
        }
      }
    ];
    
    for (const market of markets) {
      if (this.meetsBuyConditions(market)) {
        opportunities.buys.push({
          symbol: market.symbol,
          price: market.price,
          score: this.calculateBuyScore(market),
          size: this.calculatePositionSize(market)
        });
      }
    }
    
    return opportunities;
  }
  
  meetsBuyConditions(market) {
    const { rsi, priceDeviation, volume, fearGreed } = market.indicators;
    const threshold = this.config.buyThreshold;
    
    let conditions = 0;
    if (rsi <= threshold.rsi.max) conditions++;
    if (priceDeviation <= threshold.priceDeviation) conditions++;
    if (volume >= 500000 * threshold.volumeIncrease) conditions++;
    if (fearGreed <= threshold.fearGreedIndex.max) conditions++;
    
    return conditions >= 2; // At least 2 conditions
  }
  
  calculateBuyScore(market) {
    let score = 0;
    score += (100 - market.indicators.rsi) / 100 * 30;
    score += Math.abs(market.indicators.priceDeviation) * 100 * 25;
    score += (market.indicators.volume / 500000) * 20;
    score += (100 - market.indicators.fearGreed) / 100 * 25;
    return score;
  }
  
  calculatePositionSize(market) {
    const baseSize = this.vault.available * this.config.baseTradingUnit;
    const confidence = market.score / 100;
    let positionSize = baseSize * (1 + confidence * 0.25);
    
    const currentExposure = this.vault.invested / this.vault.total;
    if (currentExposure + (positionSize / this.vault.total) > this.config.maxDailyExposure) {
      positionSize = (this.config.maxDailyExposure - currentExposure) * this.vault.total;
    }
    
    return Math.max(0, positionSize);
  }
  
  async executeBuyStrategy(opportunity) {
    if (opportunity.size <= 0 || opportunity.size > this.vault.available) return;
    
    const position = this.positions.get(opportunity.symbol) || {
      symbol: opportunity.symbol,
      entries: [],
      totalAmount: 0,
      totalCost: 0,
      avgPrice: 0,
      unrealizedProfit: 0,
      stage: 1,
      entryTime: Date.now()
    };
    
    const buyAmount = opportunity.size;
    const fee = buyAmount * 0.001;
    
    position.entries.push({
      type: 'buy',
      amount: buyAmount,
      price: opportunity.price,
      fee,
      timestamp: Date.now()
    });
    
    position.totalAmount += buyAmount / opportunity.price;
    position.totalCost += buyAmount + fee;
    position.avgPrice = position.totalCost / position.totalAmount;
    position.stage++;
    
    this.vault.available -= (buyAmount + fee);
    this.vault.invested += buyAmount;
    
    this.positions.set(opportunity.symbol, position);
    
    this.dailyStats.trades++;
    this.dailyStats.buys++;
    
    this.addNotification({
      type: 'success',
      title: 'Buy Executed',
      message: `Bought ${opportunity.symbol} at $${opportunity.price.toFixed(2)}`
    });
  }
  
  async checkSellConditions() {
    for (const [symbol, position] of this.positions) {
      const currentPrice = await this.getCurrentPrice(symbol);
      position.unrealizedProfit = (currentPrice - position.avgPrice) / position.avgPrice;
      
      if (this.shouldSell(position, currentPrice)) {
        await this.executeSellStrategy(position, currentPrice);
      }
    }
  }
  
  shouldSell(position, currentPrice) {
    const { profitTarget, rsi, timeLimit } = this.config.sellThreshold;
    const holdTime = Date.now() - position.entryTime;
    
    if (position.unrealizedProfit >= profitTarget) return true;
    if (holdTime > timeLimit && position.unrealizedProfit > 0) return true;
    
    return false;
  }
  
  async executeSellStrategy(position, currentPrice) {
    const sellAmount = position.totalAmount;
    const sellValue = sellAmount * currentPrice;
    const sellFee = sellValue * 0.001;
    const profit = sellValue - position.totalCost - sellFee;
    
    this.vault.available += sellValue - sellFee;
    this.vault.invested -= position.totalCost;
    this.vault.profits += profit;
    
    this.dailyStats.sells++;
    this.dailyStats.profit += Math.max(0, profit);
    this.dailyStats.loss += Math.abs(Math.min(0, profit));
    this.dailyStats.netProfit += profit;
    
    this.performance.totalTrades++;
    if (profit > 0) {
      this.performance.winningTrades++;
      this.performance.currentStreak++;
    } else {
      this.performance.losingTrades++;
      this.performance.currentStreak = 0;
    }
    
    this.positions.delete(position.symbol);
    
    this.addNotification({
      type: profit > 0 ? 'success' : 'error',
      title: 'Position Closed',
      message: `${position.symbol} closed with ${profit > 0 ? 'profit' : 'loss'}: $${profit.toFixed(2)}`
    });
  }
  
  async getCurrentPrice(symbol) {
    // Simulated price fetch
    const basePrices = {
      'BTC/USDT': 45000,
      'ETH/USDT': 3000
    };
    return basePrices[symbol] + (Math.random() - 0.5) * 1000;
  }
  
  shouldCompound() {
    const now = new Date();
    const lastCompound = new Date(this.dailyStats.date);
    return now.getDate() !== lastCompound.getDate();
  }
  
  async compoundProfits() {
    if (this.dailyStats.netProfit <= 0) return;
    
    const profitToReinvest = this.dailyStats.netProfit * this.config.profitReinvestmentRate;
    
    this.vault.total += this.dailyStats.netProfit;
    this.vault.reinvested += profitToReinvest;
    
    this.performance.totalProfit += this.dailyStats.netProfit;
    this.performance.totalReinvested += profitToReinvest;
    this.performance.compoundGrowth = 
      ((this.vault.total - this.config.initialVault) / this.config.initialVault) * 100;
    
    this.addNotification({
      type: 'success',
      title: 'Daily Compound Complete',
      message: `Reinvested $${profitToReinvest.toFixed(2)} | Total Growth: ${this.performance.compoundGrowth.toFixed(2)}%`
    });
    
    this.dailyStats = this.initializeDailyStats();
  }
  
  updateStatus() {
    this.dispatch({
      type: 'UPDATE_STATUS',
      payload: {
        vault: this.vault,
        positions: Array.from(this.positions.values()),
        dailyStats: this.dailyStats,
        performance: this.performance
      }
    });
  }
  
  async handleSystemError(error) {
    console.error('System error:', error);
    this.addNotification({
      type: 'error',
      title: 'System Error',
      message: 'Engine encountered an error but continues running'
    });
  }
  
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export function PerpetualEngineProvider({ children }) {
  const [state, dispatch] = useReducer(engineReducer, initialState);
  const { addNotification } = useApp();

  const startEngine = async () => {
    if (state.isActive) return;
    
    const engine = new PerpetualAccumulationSystem(
      state.config,
      dispatch,
      addNotification
    );
    
    dispatch({ type: 'SET_ENGINE', payload: engine });
    dispatch({ type: 'SET_ACTIVE', payload: true });
    
    // Start the engine
    engine.start();
  };

  const stopEngine = () => {
    if (state.engine) {
      state.engine.stop();
    }
    dispatch({ type: 'SET_ACTIVE', payload: false });
  };

  const updateConfig = (newConfig) => {
    dispatch({ type: 'UPDATE_CONFIG', payload: newConfig });
  };

  const value = {
    ...state,
    startEngine,
    stopEngine,
    updateConfig
  };

  return (
    <PerpetualEngineContext.Provider value={value}>
      {children}
    </PerpetualEngineContext.Provider>
  );
}

export const usePerpetualEngine = () => {
  const context = useContext(PerpetualEngineContext);
  if (!context) {
    throw new Error('usePerpetualEngine must be used within a PerpetualEngineProvider');
  }
  return context;
};
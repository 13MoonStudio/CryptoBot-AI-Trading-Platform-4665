const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const axios = require('axios');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Import routes
const aiRoutes = require('./routes/aiRoutes');

// Middleware
app.use(express.json());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-domain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vseutsjmrofifogwgsrm.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZXV0c2ptcm9maWZvZ3dnc3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc1NjcsImV4cCI6MjA2NzYwMzU2N30.7DtMTo8bP4dXRSfiBsrmGnc2Vc0AYs4UtkHstNhGSOI'
);

// In-memory storage for active connections
const activeConnections = new Map();

// WebSocket for real-time market data
wss.on('connection', (ws, req) => {
  const connectionId = Date.now().toString();
  activeConnections.set(connectionId, ws);
  
  console.log(`WebSocket client connected: ${connectionId}`);

  ws.on('message', async (message) => {
    try {
      const { type, channel, symbol } = JSON.parse(message);
      
      if (type === 'subscribe' && channel === 'market-data') {
        console.log(`Client subscribed to market data for ${symbol}`);
        
        // Start sending real-time market data
        const interval = setInterval(async () => {
          if (ws.readyState === WebSocket.OPEN) {
            const marketUpdate = await generateMarketData(symbol);
            ws.send(JSON.stringify(marketUpdate));
            
            // Also save to Supabase for persistence
            await saveMarketDataToSupabase(marketUpdate);
          } else {
            clearInterval(interval);
          }
        }, 5000); // Every 5 seconds
        
        // Store interval for cleanup
        ws.marketDataInterval = interval;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  });

  ws.on('close', () => {
    console.log(`WebSocket client disconnected: ${connectionId}`);
    activeConnections.delete(connectionId);
    
    if (ws.marketDataInterval) {
      clearInterval(ws.marketDataInterval);
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Generate realistic market data
async function generateMarketData(symbol = 'BTCUSDT') {
  const basePrice = symbol === 'BTCUSDT' ? 43500 : symbol === 'ETHUSDT' ? 2650 : 0.45;
  const volatility = 0.002; // 0.2% volatility
  
  const priceChange = (Math.random() - 0.5) * volatility;
  const newPrice = basePrice * (1 + priceChange);
  
  // Calculate technical indicators
  const ema_200 = newPrice * (0.995 + Math.random() * 0.01);
  const atr = newPrice * 0.02; // 2% ATR
  const g_channel_mid = newPrice * (0.998 + Math.random() * 0.004);
  const g_channel_upper = g_channel_mid + (atr * 0.5);
  const g_channel_lower = g_channel_mid - (atr * 0.5);
  
  return {
    type: 'market-update',
    symbol,
    price: newPrice,
    timestamp: new Date().toISOString(),
    ema_200,
    g_channel_upper,
    g_channel_lower,
    g_channel_mid,
    volume: Math.floor(Math.random() * 50000) + 100000,
    rsi: 30 + Math.random() * 40, // RSI between 30-70
    change_24h: (Math.random() - 0.5) * 10 // ±5% daily change
  };
}

// Save market data to Supabase
async function saveMarketDataToSupabase(marketData) {
  try {
    const { error } = await supabase
      .from('market_data_realtime')
      .insert([{
        symbol: marketData.symbol,
        price: marketData.price,
        volume: marketData.volume,
        change_24h: marketData.change_24h,
        ema_200: marketData.ema_200,
        g_channel_upper: marketData.g_channel_upper,
        g_channel_lower: marketData.g_channel_lower,
        g_channel_mid: marketData.g_channel_mid,
        rsi: marketData.rsi
      }]);
    
    if (error) {
      console.error('Error saving market data to Supabase:', error);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Generate trading signals using G-Channel strategy
async function generateTradingSignal(marketData) {
  const { symbol, price, ema_200, g_channel_mid, rsi } = marketData;
  
  let signal = null;
  let confidence = 0;
  let reasoning = '';
  
  // G-Channel + EMA Strategy Logic
  const aboveGMid = price > g_channel_mid;
  const belowEMA = price < ema_200;
  const aboveEMA = price > ema_200;
  
  // Long signal: Price crosses above G-Mid while below EMA and RSI oversold
  if (aboveGMid && belowEMA && rsi < 35) {
    signal = 'LONG';
    confidence = 80 + Math.random() * 15;
    reasoning = 'G-Channel buy signal with price below EMA 200 and oversold RSI';
  }
  // Short signal: Price crosses below G-Mid while above EMA and RSI overbought
  else if (!aboveGMid && aboveEMA && rsi > 65) {
    signal = 'SHORT';
    confidence = 80 + Math.random() * 15;
    reasoning = 'G-Channel sell signal with price above EMA 200 and overbought RSI';
  }
  
  if (signal) {
    const tradingSignal = {
      symbol,
      signal_type: signal,
      price,
      confidence: Math.round(confidence),
      reasoning,
      strategy: 'G-Channel + EMA',
      agent_source: 'signal-generation-agent'
    };
    
    // Save signal to Supabase
    try {
      const { error } = await supabase
        .from('trading_signals_stream')
        .insert([tradingSignal]);
      
      if (error) {
        console.error('Error saving trading signal:', error);
      } else {
        console.log(`Generated ${signal} signal for ${symbol} at $${price.toFixed(2)}`);
        
        // Broadcast signal to all connected clients
        broadcastToClients({
          type: 'trading-signal',
          ...tradingSignal
        });
      }
    } catch (error) {
      console.error('Database error:', error);
    }
  }
}

// Broadcast message to all connected WebSocket clients
function broadcastToClients(message) {
  activeConnections.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  });
}

// Apply routes
app.use('/api/chat', aiRoutes);

// REST API Endpoints

// AI Chat endpoint
app.post('/api/chat/message', async (req, res) => {
  try {
    const { message, userId } = req.body;
    
    // Mock AI response (replace with OpenAI/Claude API)
    let reply = `AI analysis: ${message}`;
    
    // Add some trading-specific intelligence
    if (message.toLowerCase().includes('buy') || message.toLowerCase().includes('signal')) {
      reply = "Based on current market conditions and G-Channel analysis, I recommend waiting for a clearer signal. The RSI is currently in neutral territory.";
    } else if (message.toLowerCase().includes('market') || message.toLowerCase().includes('price')) {
      reply = "Current market sentiment appears bullish with strong support levels. The G-Channel indicator shows potential upward momentum.";
    }
    
    // Save chat to Supabase if userId provided
    if (userId) {
      await supabase
        .from('ai_chat_messages')
        .insert([{ user_id: userId, message, response: reply }]);
    }
    
    res.json({ reply });
  } catch (error) {
    console.error('Chat API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Market data endpoint
app.get('/api/market-data', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('market_data_realtime')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(100);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Market data API error:', error);
    res.status(500).json({ error: 'Failed to fetch market data' });
  }
});

// Trading signals endpoint
app.get('/api/trading/signals', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const { data, error } = await supabase
      .from('trading_signals_stream')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Trading signals API error:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

// Execute trade endpoint
app.post('/api/trading/execute', async (req, res) => {
  try {
    const { symbol, type, price, size, userId } = req.body;
    
    // Validate trade data
    if (!symbol || !type || !price || !size) {
      return res.status(400).json({ error: 'Missing required trade parameters' });
    }
    
    // Create position in Supabase
    const position = {
      user_id: userId,
      symbol,
      position_type: type,
      entry_price: price,
      position_size: size,
      stop_loss: type === 'LONG' ? price * 0.98 : price * 1.02,
      take_profit: type === 'LONG' ? price * 1.06 : price * 0.94,
      current_price: price,
      agent_executed: true
    };
    
    const { data, error } = await supabase
      .from('trading_positions_live')
      .insert([position])
      .select();
    
    if (error) throw error;
    
    // Broadcast trade execution to clients
    broadcastToClients({
      type: 'trade-executed',
      position: data[0]
    });
    
    res.json({ success: true, position: data[0] });
  } catch (error) {
    console.error('Trade execution error:', error);
    res.status(500).json({ error: 'Failed to execute trade' });
  }
});

// n8n webhook endpoints for agent integration
app.post('/api/n8n/webhook/:agentType', async (req, res) => {
  try {
    const { agentType } = req.params;
    const data = req.body;
    
    console.log(`Received webhook from ${agentType} agent:`, data);
    
    // Log workflow execution
    await supabase
      .from('n8n_workflow_executions')
      .insert([{
        workflow_id: `${agentType}-${Date.now()}`,
        workflow_name: `${agentType} Agent`,
        agent_type: agentType,
        status: 'success',
        input_data: data,
        execution_time: Math.floor(Math.random() * 1000) + 100
      }]);
    
    // Process based on agent type
    switch (agentType) {
      case 'signal-generation':
        // Process trading signals from the signal generation agent
        if (data.signals && Array.isArray(data.signals)) {
          for (const signal of data.signals) {
            await supabase
              .from('trading_signals_stream')
              .insert([{
                symbol: signal.symbol,
                signal_type: signal.signal,
                price: signal.price,
                confidence: signal.confidence,
                reasoning: signal.reasoning,
                strategy: 'PineScript Agent',
                agent_source: 'n8n-signal-agent'
              }]);
          }
        }
        break;
        
      case 'risk-management':
        // Process risk assessment results
        console.log('Risk assessment completed:', data);
        break;
        
      case 'trade-execution':
        // Process trade execution results
        console.log('Trade execution completed:', data);
        break;
    }
    
    res.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Trigger n8n workflow
app.post('/api/n8n/trigger/:workflowId', async (req, res) => {
  try {
    const { workflowId } = req.params;
    const data = req.body;
    
    // In a real implementation, you would trigger the actual n8n workflow
    // For now, we'll simulate it
    console.log(`Triggering n8n workflow ${workflowId} with data:`, data);
    
    // Log the trigger
    await supabase
      .from('n8n_workflow_executions')
      .insert([{
        workflow_id: workflowId,
        workflow_name: `Workflow ${workflowId}`,
        status: 'running',
        input_data: data
      }]);
    
    res.json({ success: true, message: 'Workflow triggered successfully' });
  } catch (error) {
    console.error('Workflow trigger error:', error);
    res.status(500).json({ error: 'Failed to trigger workflow' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connections: activeConnections.size,
    uptime: process.uptime()
  });
});

// Start the server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📊 WebSocket endpoint: ws://localhost:${PORT}`);
  console.log(`🔗 REST API: http://localhost:${PORT}/api`);
  console.log(`🤖 AI Assistant API: http://localhost:${PORT}/api/chat`);
  
  // Start generating signals periodically
  setInterval(async () => {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT'];
    for (const symbol of symbols) {
      const marketData = await generateMarketData(symbol);
      await generateTradingSignal(marketData);
    }
  }, 30000); // Every 30 seconds
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down server gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
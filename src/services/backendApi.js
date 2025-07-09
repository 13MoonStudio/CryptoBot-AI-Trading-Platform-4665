// Backend API service for Node.js server integration
class BackendAPI {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://your-backend-domain.com' 
      : 'http://localhost:8000';
    this.ws = null;
    this.reconnectInterval = 5000;
    this.maxReconnectAttempts = 10;
    this.reconnectAttempts = 0;
  }

  // WebSocket connection for real-time data
  connectWebSocket(onMessage, onError = null) {
    try {
      this.ws = new WebSocket(`ws://${this.baseURL.replace('http://', '')}`);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected to backend');
        this.reconnectAttempts = 0;
        
        // Subscribe to market data
        this.ws.send(JSON.stringify({
          type: 'subscribe',
          channel: 'market-data',
          symbol: 'BTCUSDT'
        }));
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect(onMessage, onError);
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        if (onError) onError(error);
      };

    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      this.attemptReconnect(onMessage, onError);
    }
  }

  attemptReconnect(onMessage, onError) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connectWebSocket(onMessage, onError);
      }, this.reconnectInterval);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // REST API methods
  async sendChatMessage(message) {
    try {
      const response = await fetch(`${this.baseURL}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.reply;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  }

  async getMarketData() {
    try {
      const response = await fetch(`${this.baseURL}/api/market-data`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching market data:', error);
      throw error;
    }
  }

  // Execute trade through backend
  async executeTrade(tradeData) {
    try {
      const response = await fetch(`${this.baseURL}/api/trading/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tradeData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error executing trade:', error);
      throw error;
    }
  }

  // Get trading signals from backend
  async getTradingSignals() {
    try {
      const response = await fetch(`${this.baseURL}/api/trading/signals`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching trading signals:', error);
      throw error;
    }
  }

  // Trigger n8n workflow
  async triggerN8nWorkflow(workflowId, data = {}) {
    try {
      const response = await fetch(`${this.baseURL}/api/n8n/trigger/${workflowId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error triggering n8n workflow:', error);
      throw error;
    }
  }
}

export const backendAPI = new BackendAPI();
export default backendAPI;
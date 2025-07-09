import axios from 'axios';

// Constants
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-api-domain.com/ai' 
  : 'http://localhost:8000/api/chat';

// Main AI service class
class AIService {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  // Process text-only requests
  async processTextRequest(message, mode, context) {
    try {
      const response = await this.client.post('/message', {
        message,
        mode,
        context,
      });
      
      return response.data;
    } catch (error) {
      console.error('AI service error:', error);
      throw new Error('Failed to process AI request');
    }
  }

  // Process multi-modal requests (with image)
  async processMultiModalRequest(formData) {
    try {
      const response = await this.client.post('/multimodal', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('AI multimodal service error:', error);
      throw new Error('Failed to process image analysis request');
    }
  }

  // Generate trading signals
  async generateTradingSignals(marketData, strategy) {
    try {
      const response = await this.client.post('/generate-signals', {
        marketData,
        strategy,
      });
      
      return response.data.signals;
    } catch (error) {
      console.error('AI signal generation error:', error);
      throw new Error('Failed to generate trading signals');
    }
  }

  // Analyze chart patterns
  async analyzeChartPatterns(imageData, timeframe) {
    try {
      const formData = new FormData();
      formData.append('image', imageData);
      formData.append('timeframe', timeframe);
      
      const response = await this.client.post('/analyze-chart', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.analysis;
    } catch (error) {
      console.error('Chart analysis error:', error);
      throw new Error('Failed to analyze chart patterns');
    }
  }

  // Generate educational content
  async generateTutorial(topic) {
    try {
      const response = await this.client.post('/tutorial', {
        topic,
      });
      
      return response.data.tutorial;
    } catch (error) {
      console.error('Tutorial generation error:', error);
      throw new Error('Failed to generate tutorial content');
    }
  }

  // Analyze portfolio
  async analyzePortfolio(holdings, marketData) {
    try {
      const response = await this.client.post('/portfolio-analysis', {
        holdings,
        marketData,
      });
      
      return response.data.analysis;
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      throw new Error('Failed to analyze portfolio');
    }
  }

  // Optimize trading strategy
  async optimizeStrategy(strategy, historicalData) {
    try {
      const response = await this.client.post('/optimize-strategy', {
        strategy,
        historicalData,
      });
      
      return response.data.optimizedStrategy;
    } catch (error) {
      console.error('Strategy optimization error:', error);
      throw new Error('Failed to optimize strategy');
    }
  }
}

export const aiService = new AIService();
export default aiService;
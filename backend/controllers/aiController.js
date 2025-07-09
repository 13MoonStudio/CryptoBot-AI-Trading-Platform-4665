const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vseutsjmrofifogwgsrm.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZXV0c2ptcm9maWZvZ3dnc3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc1NjcsImV4cCI6MjA2NzYwMzU2N30.7DtMTo8bP4dXRSfiBsrmGnc2Vc0AYs4UtkHstNhGSOI'
);

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1';
const GPT_MODEL = 'gpt-4-turbo';
const VISION_MODEL = 'gpt-4-vision-preview';

// Controller methods
const aiController = {
  // Process text-only messages
  async processMessage(req, res) {
    try {
      const { message, mode = 'chat', context = {}, userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // Build system prompt based on mode
      let systemPrompt = getSystemPrompt(mode);
      
      // Add context to system prompt
      if (context) {
        systemPrompt += `\n\nCurrent context:\n${JSON.stringify(context, null, 2)}`;
      }
      
      // Call OpenAI API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Extract AI response
      const aiResponse = response.data.choices[0].message.content;
      
      // Process and structure the response
      const processedResponse = processAIResponse(aiResponse, mode);
      
      // Save to database if userId provided
      if (userId) {
        await supabase
          .from('ai_chat_messages')
          .insert([{
            user_id: userId,
            message,
            response: aiResponse,
            mode,
            context: JSON.stringify(context),
          }]);
      }
      
      return res.json(processedResponse);
      
    } catch (error) {
      console.error('AI processing error:', error);
      return res.status(500).json({ 
        error: 'Failed to process message',
        details: error.message 
      });
    }
  },
  
  // Process multimodal messages (text + image)
  async processMultiModal(req, res) {
    try {
      const { message = '', mode = 'analysis' } = req.body;
      const image = req.file;
      
      if (!image) {
        return res.status(400).json({ error: 'Image is required' });
      }
      
      // Build system prompt based on mode
      let systemPrompt = getSystemPrompt(mode);
      systemPrompt += '\n\nYou are analyzing an uploaded chart image. Provide detailed technical analysis.';
      
      // Convert image to base64
      const imageBuffer = fs.readFileSync(image.path);
      const base64Image = imageBuffer.toString('base64');
      const dataURI = `data:${image.mimetype};base64,${base64Image}`;
      
      // Call OpenAI Vision API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: VISION_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: message || 'Analyze this chart image in detail.' },
                {
                  type: 'image_url',
                  image_url: {
                    url: dataURI
                  }
                }
              ]
            }
          ],
          max_tokens: 1000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Extract AI response
      const aiResponse = response.data.choices[0].message.content;
      
      // Process and structure the response
      const processedResponse = processAIResponse(aiResponse, mode);
      
      // Clean up temporary file
      fs.unlinkSync(image.path);
      
      return res.json(processedResponse);
      
    } catch (error) {
      console.error('AI multimodal processing error:', error);
      
      // Clean up temporary file if it exists
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
      
      return res.status(500).json({ 
        error: 'Failed to process image message',
        details: error.message 
      });
    }
  },
  
  // Generate trading signals
  async generateSignals(req, res) {
    try {
      const { marketData, strategy } = req.body;
      
      if (!marketData || !strategy) {
        return res.status(400).json({ error: 'Market data and strategy are required' });
      }
      
      // Build system prompt
      const systemPrompt = `You are an expert trading signal generator. 
      You are using the ${strategy.name} strategy with the following parameters:
      ${JSON.stringify(strategy.parameters, null, 2)}
      
      Analyze the provided market data and generate precise trading signals.
      For each signal, provide the symbol, direction (LONG/SHORT), confidence level (0-100),
      entry price, stop loss, take profit, and detailed reasoning.
      
      Return your response in JSON format.`;
      
      // Call OpenAI API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Generate trading signals based on this market data:\n${JSON.stringify(marketData, null, 2)}` 
            }
          ],
          temperature: 0.2,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Extract AI response and parse JSON
      const aiResponse = response.data.choices[0].message.content;
      const signals = JSON.parse(aiResponse).signals || [];
      
      // Save signals to database
      for (const signal of signals) {
        await supabase
          .from('trading_signals_stream')
          .insert([{
            symbol: signal.symbol,
            signal_type: signal.direction,
            price: signal.entryPrice,
            confidence: signal.confidence,
            reasoning: signal.reasoning,
            strategy: strategy.name,
            agent_source: 'ai-assistant',
            stop_loss: signal.stopLoss,
            take_profit: signal.takeProfit
          }]);
      }
      
      return res.json({ signals });
      
    } catch (error) {
      console.error('Signal generation error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate trading signals',
        details: error.message 
      });
    }
  },
  
  // Generate tutorial content
  async generateTutorial(req, res) {
    try {
      const { topic } = req.body;
      
      if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
      }
      
      // Check if tutorial already exists in the database
      const { data: existingTutorial } = await supabase
        .from('ai_generated_tutorials')
        .select('*')
        .eq('topic', topic)
        .single();
      
      if (existingTutorial) {
        return res.json({ tutorial: existingTutorial.content });
      }
      
      // Build system prompt
      const systemPrompt = `You are an expert trading educator. 
      Create a comprehensive, well-structured tutorial about "${topic}" for cryptocurrency traders.
      Include practical examples, key concepts, and actionable advice.
      Format your response with markdown headings, bullet points, and emphasis where appropriate.`;
      
      // Call OpenAI API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a tutorial about "${topic}" for cryptocurrency traders` }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Extract AI response
      const aiResponse = response.data.choices[0].message.content;
      
      // Save tutorial to database
      await supabase
        .from('ai_generated_tutorials')
        .insert([{
          topic,
          content: aiResponse,
          created_at: new Date().toISOString()
        }]);
      
      return res.json({ 
        tutorial: {
          topic,
          content: aiResponse
        } 
      });
      
    } catch (error) {
      console.error('Tutorial generation error:', error);
      return res.status(500).json({ 
        error: 'Failed to generate tutorial content',
        details: error.message 
      });
    }
  },
  
  // Portfolio analysis
  async analyzePortfolio(req, res) {
    try {
      const { holdings, marketData } = req.body;
      
      if (!holdings) {
        return res.status(400).json({ error: 'Holdings data is required' });
      }
      
      // Build system prompt
      const systemPrompt = `You are an expert portfolio analyst.
      Analyze the provided portfolio holdings and market data to provide insights and recommendations.
      Consider diversification, risk exposure, correlations, and potential optimizations.
      
      Return your analysis with clear sections for strengths, weaknesses, opportunities, and recommendations.
      Include specific actions the user can take to optimize their portfolio.`;
      
      // Call OpenAI API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: GPT_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            { 
              role: 'user', 
              content: `Analyze this portfolio:\n${JSON.stringify(holdings, null, 2)}\n\nCurrent market data:\n${JSON.stringify(marketData, null, 2)}` 
            }
          ],
          temperature: 0.3,
          max_tokens: 1500,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          }
        }
      );
      
      // Extract AI response
      const aiResponse = response.data.choices[0].message.content;
      
      // Process and structure the response
      const processedResponse = processAIResponse(aiResponse, 'portfolio');
      
      return res.json(processedResponse);
      
    } catch (error) {
      console.error('Portfolio analysis error:', error);
      return res.status(500).json({ 
        error: 'Failed to analyze portfolio',
        details: error.message 
      });
    }
  },
};

// Helper functions

// Get system prompt based on mode
function getSystemPrompt(mode) {
  const basePrompt = `You are an expert AI assistant for cryptocurrency trading, named CryptoBot AI Pro.
  You help traders with detailed analysis, insights, and actionable recommendations.
  Always be precise, data-driven, and focused on providing value.`;
  
  const modePrompts = {
    chat: `${basePrompt}
    You can discuss general trading topics, answer questions about the platform,
    and provide basic assistance with trading concepts and terminology.`,
    
    analysis: `${basePrompt}
    You specialize in technical analysis of cryptocurrency markets.
    Analyze price action, patterns, indicators, and market conditions to provide
    insights about potential market movements and trading opportunities.
    Focus on the G-Channel strategy which uses the G-Channel indicator and EMA 200.`,
    
    signals: `${basePrompt}
    You generate precise trading signals with entry points, stop losses, take profits,
    and detailed reasoning. Each signal should have a confidence level and be based on
    the G-Channel strategy parameters. Be specific about market conditions and the technical setup.`,
    
    portfolio: `${basePrompt}
    You analyze portfolio composition, performance, and risk metrics.
    Provide recommendations for optimization, rebalancing, and risk management.
    Consider diversification, correlation, and market conditions in your analysis.`,
    
    learn: `${basePrompt}
    You create educational content about trading concepts, strategies, and platform features.
    Explain complex topics in clear, structured ways with practical examples and actionable advice.
    Focus on helping users improve their trading knowledge and skills.`,
    
    strategy: `${basePrompt}
    You help develop, test, and optimize trading strategies.
    Analyze strategy parameters, backtest results, and performance metrics.
    Provide recommendations for improving strategy performance and robustness.
    Focus on the G-Channel strategy which uses the G-Channel indicator and EMA 200.`,
  };
  
  return modePrompts[mode] || modePrompts.chat;
}

// Process and structure AI response
function processAIResponse(text, mode) {
  // Base response object
  const response = {
    text,
    importance: 'low',
  };
  
  // Check for charts/visualization references
  if (text.includes('chart') || text.includes('pattern') || text.includes('indicator')) {
    response.charts = [];
    
    // Simple pattern matching for chart types
    if (text.toLowerCase().includes('price') || text.toLowerCase().includes('candlestick')) {
      response.charts.push({
        type: 'price',
        title: 'Price Chart Analysis',
        description: 'Price action and key levels'
      });
    }
    
    if (text.toLowerCase().includes('volume')) {
      response.charts.push({
        type: 'volume',
        title: 'Volume Analysis',
        description: 'Trading volume patterns'
      });
    }
    
    if (text.toLowerCase().includes('indicator') || text.toLowerCase().includes('g-channel') || text.toLowerCase().includes('ema')) {
      response.charts.push({
        type: 'indicator',
        title: 'Technical Indicators',
        description: 'G-Channel and EMA analysis'
      });
    }
  }
  
  // Extract suggestions
  const suggestions = [];
  
  // Look for action phrases
  const actionPhrases = [
    { action: 'Buy', regex: /buy|long|purchase|acquire/i },
    { action: 'Sell', regex: /sell|short|exit|close position/i },
    { action: 'Monitor', regex: /monitor|watch|observe/i },
    { action: 'Set Alert', regex: /set alert|create alert|notify/i },
    { action: 'Learn', regex: /learn about|study|research/i },
  ];
  
  for (const { action, regex } of actionPhrases) {
    const matches = text.match(new RegExp(`${regex.source}\\s+([\\w\\s]+)`, 'gi'));
    if (matches) {
      matches.forEach(match => {
        const target = match.replace(new RegExp(`^.*?${regex.source}\\s+`, 'i'), '').trim();
        if (target && target.length < 30) {
          suggestions.push({ action, target });
        }
      });
    }
  }
  
  if (suggestions.length > 0) {
    response.suggestions = suggestions.slice(0, 3); // Limit to top 3 suggestions
  }
  
  // Determine importance
  if (
    text.toLowerCase().includes('urgent') || 
    text.toLowerCase().includes('immediate') ||
    text.toLowerCase().includes('critical') ||
    text.toLowerCase().includes('strong signal')
  ) {
    response.importance = 'high';
    
    // Extract summary for high importance messages
    const summaryMatch = text.match(/^(.{30,100}?)[.!?]/);
    if (summaryMatch) {
      response.summary = summaryMatch[0];
    } else {
      response.summary = text.substring(0, 100) + '...';
    }
  } else if (
    text.toLowerCase().includes('recommend') ||
    text.toLowerCase().includes('suggest') ||
    text.toLowerCase().includes('opportunity')
  ) {
    response.importance = 'medium';
  }
  
  // Add mode-specific processing
  switch (mode) {
    case 'signals':
      // Try to extract signal details
      const signalMatch = text.match(/signal[:\s]+(\w+)/i);
      const confidenceMatch = text.match(/confidence[:\s]+(\d+)/i);
      
      if (signalMatch) {
        response.tradingSuggestion = {
          type: signalMatch[1].toUpperCase(),
          confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 75,
          timestamp: new Date().toISOString()
        };
        
        // Always mark signals as high importance
        response.importance = 'high';
      }
      break;
      
    case 'portfolio':
      // Try to extract portfolio recommendations
      const recommendationMatches = text.match(/recommend[:\s]+([\w\s,]+)/gi);
      if (recommendationMatches && recommendationMatches.length > 0) {
        response.recommendations = recommendationMatches.map(match => {
          return match.replace(/recommend[:\s]+/i, '').trim();
        });
      }
      break;
      
    case 'learn':
      // Identify the topic
      const topicMatch = text.match(/^#\s+([\w\s]+)/m) || text.match(/^#+\s+([\w\s]+)/m);
      if (topicMatch) {
        response.tutorial = {
          topic: topicMatch[1].trim(),
          content: text
        };
      }
      break;
      
    case 'analysis':
      // Try to extract market sentiment
      const bullishMatch = text.match(/bullish|positive|upward|uptrend/i);
      const bearishMatch = text.match(/bearish|negative|downward|downtrend/i);
      
      if (bullishMatch || bearishMatch) {
        response.analysis = {
          sentiment: bullishMatch ? 'BULLISH' : 'BEARISH',
          confidence: Math.floor(Math.random() * 20) + 70, // 70-90% confidence
          timestamp: new Date().toISOString()
        };
      }
      break;
  }
  
  return response;
}

module.exports = aiController;
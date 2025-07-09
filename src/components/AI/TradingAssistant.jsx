import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useTrading } from '../../contexts/TradingContext';
import { useApp } from '../../contexts/AppContext';
import toast from 'react-hot-toast';
import { dbOperations } from '../../lib/supabase';

const { 
  FiSend, FiMic, FiImage, FiX, FiMaximize2, FiMinimize2, 
  FiBrain, FiHelpCircle, FiBarChart2, FiPieChart, FiTrendingUp,
  FiBookOpen, FiSettings, FiClipboard, FiCheckCircle, FiLoader
} = FiIcons;

const TradingAssistant = () => {
  const { marketData, signals, positions, strategy } = useTrading();
  const { addNotification } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: "Hello! I'm your AI trading assistant. I can help with market analysis, provide trading suggestions, explain strategies, and more. What would you like to know today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMode, setSelectedMode] = useState('chat');
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const recognition = useRef(null);

  const assistantModes = [
    { id: 'chat', name: 'Chat', icon: FiHelpCircle, description: 'General assistance and Q&A' },
    { id: 'analysis', name: 'Analysis', icon: FiBarChart2, description: 'Market and chart analysis' },
    { id: 'signals', name: 'Signals', icon: FiTrendingUp, description: 'Trading signals and recommendations' },
    { id: 'portfolio', name: 'Portfolio', icon: FiPieChart, description: 'Portfolio optimization and management' },
    { id: 'learn', name: 'Learn', icon: FiBookOpen, description: 'Trading tutorials and education' },
    { id: 'strategy', name: 'Strategy', icon: FiSettings, description: 'Strategy development and testing' }
  ];

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognition.current = new SpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      
      recognition.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognition.current.onerror = () => {
        setIsListening(false);
        toast.error('Speech recognition error. Please try again.');
      };
      
      recognition.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognition.current) {
        recognition.current.abort();
      }
    };
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim() && !selectedImage) return;
    
    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
      hasImage: !!selectedImage,
      mode: selectedMode
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Create form data for image upload if present
    let formData = null;
    if (selectedImage) {
      formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('message', input);
      formData.append('mode', selectedMode);
      setImagePreview(null);
      setSelectedImage(null);
    }
    
    try {
      // Generate context for the AI based on the current trading state
      const context = await generateAIContext();
      
      // Call AI API with or without image
      const response = await fetchAIResponse(input, formData, selectedMode, context);
      
      // Simulate AI thinking time for demo
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const assistantMessage = {
        id: Date.now().toString() + '-response',
        role: 'assistant',
        content: response.text,
        timestamp: new Date(),
        charts: response.charts || [],
        suggestions: response.suggestions || [],
        mode: selectedMode
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Save to database
      try {
        await dbOperations.saveChatMessage(
          'current-user', // Replace with actual user ID
          input,
          response.text,
          { mode: selectedMode, context }
        );
      } catch (error) {
        console.error('Error saving chat message:', error);
      }
      
      // Add notification for important insights
      if (response.importance === 'high') {
        addNotification({
          type: 'info',
          title: 'AI Trading Insight',
          message: response.summary || 'New trading insight available'
        });
      }
      
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString() + '-error',
          role: 'assistant',
          content: "I'm sorry, I encountered an error processing your request. Please try again later.",
          timestamp: new Date(),
          isError: true
        }
      ]);
      
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIContext = async () => {
    // Gather relevant data for AI context
    return {
      marketData: Object.keys(marketData).map(symbol => ({
        symbol,
        price: marketData[symbol].price,
        change: marketData[symbol].change,
        volume: marketData[symbol].volume
      })),
      recentSignals: signals.slice(0, 5),
      openPositions: positions,
      currentStrategy: strategy,
      timestamp: new Date().toISOString()
    };
  };

  const fetchAIResponse = async (message, formData, mode, context) => {
    // This would be replaced with actual API call to GPT-4 or Claude
    // For demo, we'll simulate responses
    
    // Simulate different responses based on mode
    let response = {
      text: "I'm analyzing your request...",
      importance: 'low'
    };
    
    if (formData) {
      // Handling image-based request
      response = simulateImageAnalysisResponse(message, mode);
    } else {
      // Text-only request
      switch (mode) {
        case 'analysis':
          response = simulateMarketAnalysisResponse(message, context);
          break;
        case 'signals':
          response = simulateSignalResponse(message, context);
          break;
        case 'portfolio':
          response = simulatePortfolioResponse(message, context);
          break;
        case 'learn':
          response = simulateLearningResponse(message);
          break;
        case 'strategy':
          response = simulateStrategyResponse(message, context);
          break;
        default:
          response = simulateGeneralResponse(message, context);
      }
    }
    
    return response;
  };

  // Simulated response generators for demo
  const simulateGeneralResponse = (message, context) => {
    // Simple mapping of keywords to responses for demo
    if (message.toLowerCase().includes('hello') || message.toLowerCase().includes('hi')) {
      return {
        text: "Hello! I'm your AI trading assistant. How can I help you today?",
        importance: 'low'
      };
    }
    
    if (message.toLowerCase().includes('market')) {
      const btcPrice = context.marketData.find(m => m.symbol === 'BTCUSDT')?.price || 43500;
      return {
        text: `The current market is showing mixed signals. Bitcoin is trading at $${btcPrice.toFixed(2)} with moderate volatility. The G-Channel strategy signals are neutral at the moment. Would you like me to perform a deeper analysis on any specific asset?`,
        importance: 'medium',
        summary: 'Market shows mixed signals'
      };
    }
    
    if (message.toLowerCase().includes('recommend') || message.toLowerCase().includes('suggestion')) {
      return {
        text: "Based on current market conditions and your portfolio, I'd recommend monitoring BTC closely as it's approaching a key resistance level. The G-Channel strategy is showing potential for a signal in the next 24-48 hours. Would you like me to set up an alert for this?",
        importance: 'high',
        summary: 'Potential BTC trade opportunity',
        suggestions: [
          { action: 'Set Alert', target: 'BTC at $45,000' },
          { action: 'View Analysis', target: 'G-Channel on BTC' }
        ]
      };
    }
    
    // Default response
    return {
      text: "I understand you're asking about " + message.split(' ').slice(0, 3).join(' ') + "... To give you the most accurate information, I'd need to analyze the current market data and your trading history. Would you like me to conduct a specific analysis or provide general information on this topic?",
      importance: 'low'
    };
  };

  const simulateMarketAnalysisResponse = (message, context) => {
    const btcPrice = context.marketData.find(m => m.symbol === 'BTCUSDT')?.price || 43500;
    const ethPrice = context.marketData.find(m => m.symbol === 'ETHUSDT')?.price || 2650;
    
    return {
      text: `## Market Analysis\n\nBTC is currently trading at $${btcPrice.toFixed(2)} showing a ${context.marketData.find(m => m.symbol === 'BTCUSDT')?.change > 0 ? 'positive' : 'negative'} momentum. The G-Channel indicator shows price is ${Math.random() > 0.5 ? 'above' : 'below'} the mid-line, suggesting a potential ${Math.random() > 0.5 ? 'bullish' : 'bearish'} continuation.\n\nETH is at $${ethPrice.toFixed(2)} with ${Math.random() > 0.5 ? 'stronger' : 'weaker'} relative performance compared to BTC.\n\nVolume profiles indicate ${Math.random() > 0.5 ? 'increasing' : 'decreasing'} market participation, which ${Math.random() > 0.5 ? 'supports' : 'contradicts'} the current price action.\n\nWould you like me to analyze a specific technical pattern or indicator?`,
      importance: 'medium',
      charts: [
        {
          type: 'price',
          title: 'BTC/USDT Price Action',
          description: 'Recent price movements with G-Channel overlay'
        }
      ],
      summary: 'BTC showing key technical patterns'
    };
  };

  const simulateSignalResponse = (message, context) => {
    const signals = ['BUY', 'SELL', 'HOLD'];
    const randomSignal = signals[Math.floor(Math.random() * signals.length)];
    const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%
    
    return {
      text: `## Trading Signal Analysis\n\nBased on current market conditions and the G-Channel strategy parameters, I'm generating a **${randomSignal}** signal for BTC with ${confidence}% confidence.\n\nKey factors:\n- Price is ${Math.random() > 0.5 ? 'above' : 'below'} the EMA 200\n- G-Channel shows ${Math.random() > 0.5 ? 'support' : 'resistance'} at current levels\n- RSI is ${Math.floor(Math.random() * 100)}% indicating ${Math.random() > 0.5 ? 'overbought' : 'oversold'} conditions\n- Volume is ${Math.random() > 0.5 ? 'confirming' : 'not confirming'} the move\n\nWould you like me to execute this trade or set up an alert?`,
      importance: 'high',
      summary: `${randomSignal} signal for BTC (${confidence}% confidence)`,
      suggestions: [
        { action: 'Execute Trade', target: `${randomSignal} BTC` },
        { action: 'Set Alert', target: 'Price breakout' },
        { action: 'Analyze Further', target: 'Risk assessment' }
      ]
    };
  };

  const simulatePortfolioResponse = (message, context) => {
    return {
      text: `## Portfolio Analysis\n\nYour current portfolio allocation is:\n- BTC: 45%\n- ETH: 30%\n- ADA: 15%\n- Cash: 10%\n\nPerformance metrics:\n- Total return: +18.7% (30 days)\n- Sharpe ratio: 1.85\n- Maximum drawdown: 5.2%\n\nRecommendations:\n1. Your BTC allocation is slightly below target (50%). Consider rebalancing.\n2. ETH is overweight relative to your strategy parameters.\n3. Consider increasing ADA position given recent technical strength.\n\nWould you like me to suggest a specific rebalancing plan or analyze any particular holding?`,
      importance: 'medium',
      charts: [
        {
          type: 'pie',
          title: 'Current Allocation',
          description: 'Asset distribution in portfolio'
        },
        {
          type: 'bar',
          title: 'Performance by Asset',
          description: '30-day returns'
        }
      ],
      summary: 'Portfolio rebalancing needed'
    };
  };

  const simulateLearningResponse = (message) => {
    // Tutorial content based on keywords
    if (message.toLowerCase().includes('g-channel') || message.toLowerCase().includes('strategy')) {
      return {
        text: `# G-Channel Strategy Tutorial\n\n## What is G-Channel?\nThe G-Channel is a technical indicator that creates a channel around price action to identify potential trading opportunities. It consists of three main components:\n\n1. **G-Channel Upper**: Resistance level\n2. **G-Channel Mid**: Center line and key reference point\n3. **G-Channel Lower**: Support level\n\n## Trading Rules:\n\n### Long Entry Conditions:\n- Price crosses above G-Channel Mid\n- Price is below EMA 200\n- RSI is below 35 (oversold)\n\n### Short Entry Conditions:\n- Price crosses below G-Channel Mid\n- Price is above EMA 200\n- RSI is above 65 (overbought)\n\n## Exit Strategy:\n- Use ATR-based stop loss (2x ATR)\n- Take profit at 4x ATR or when price reaches the opposite channel line\n\nWould you like me to explain any specific aspect of this strategy in more detail?`,
        importance: 'medium',
        charts: [
          {
            type: 'tutorial',
            title: 'G-Channel Strategy',
            description: 'Visual explanation of entry and exit points'
          }
        ]
      };
    }
    
    if (message.toLowerCase().includes('risk') || message.toLowerCase().includes('management')) {
      return {
        text: `# Risk Management Tutorial\n\n## The Importance of Risk Management\nRisk management is arguably the most critical aspect of successful trading. Even the best strategy will fail without proper risk controls.\n\n## Key Risk Management Principles:\n\n1. **Position Sizing**: Never risk more than 1-2% of your portfolio on a single trade\n2. **Stop Losses**: Always use stop losses to define your maximum acceptable loss\n3. **Risk/Reward Ratio**: Aim for a minimum risk-reward ratio of 1:2\n4. **Correlation Analysis**: Avoid taking multiple positions with high correlation\n5. **Expected Value**: Calculate the expected value of your trading system\n\n## Practical Implementation:\n- Use the Position Size Calculator in the app to determine optimal trade size\n- Enable the Perpetual Engine's risk management features\n- Regularly review your trading journal to identify risk patterns\n\nWould you like a detailed walkthrough of how to implement these principles in your trading?`,
        importance: 'medium'
      };
    }
    
    // Default learning response
    return {
      text: `# Trading Fundamentals\n\nTrading successfully requires mastering several key components:\n\n1. **Technical Analysis**: Understanding chart patterns, indicators, and price action\n2. **Fundamental Analysis**: Evaluating underlying value and economic factors\n3. **Risk Management**: Protecting capital through position sizing and stop losses\n4. **Psychology**: Maintaining emotional discipline and following your strategy\n5. **Execution**: Efficiently entering and exiting positions\n\nThe CryptoBot AI Pro platform integrates all these elements, with particular emphasis on technical analysis through the G-Channel strategy and automated risk management via the Perpetual Engine.\n\nWhat specific trading topic would you like to learn more about?`,
      importance: 'low',
      suggestions: [
        { action: 'Learn', target: 'G-Channel Strategy' },
        { action: 'Learn', target: 'Risk Management' },
        { action: 'Learn', target: 'Psychology' }
      ]
    };
  };

  const simulateStrategyResponse = (message, context) => {
    return {
      text: `## Strategy Analysis: G-Channel + EMA\n\nCurrent parameters:\n- G-Channel Length: ${context.currentStrategy.parameters.gChannelLength}\n- EMA Length: ${context.currentStrategy.parameters.emaLength}\n- ATR Length: ${context.currentStrategy.parameters.atrLength}\n- Stop Multiplier: ${context.currentStrategy.parameters.stopMultiplier}\n- Take Profit Multiplier: ${context.currentStrategy.parameters.takeMultiplier}\n\nBacktest results (Jan 2023 - Present):\n- Win Rate: 82.3%\n- Profit Factor: 2.74\n- Max Drawdown: 6.8%\n- Total Return: 287.5%\n\nOptimization opportunities:\n1. Increasing the G-Channel Length to 7 could improve performance in the current market volatility\n2. Consider reducing Take Profit Multiplier to 3.5 to secure profits faster\n3. EMA Length is well-optimized for the current market cycle\n\nWould you like me to simulate these changes or explain the rationale behind any particular parameter?`,
      importance: 'medium',
      charts: [
        {
          type: 'backtest',
          title: 'Strategy Backtest Results',
          description: 'Performance metrics over time'
        }
      ],
      suggestions: [
        { action: 'Optimize', target: 'G-Channel Length' },
        { action: 'Optimize', target: 'Take Profit' },
        { action: 'Run Backtest', target: 'New parameters' }
      ]
    };
  };

  const simulateImageAnalysisResponse = (message, mode) => {
    // Simulate image analysis response based on mode
    if (mode === 'analysis') {
      return {
        text: `## Chart Pattern Analysis\n\nI've analyzed the chart image you uploaded. Here's what I found:\n\n1. There's a clear **bullish flag pattern** forming on the 4-hour timeframe\n2. The G-Channel indicator shows price approaching the upper band\n3. Volume is increasing on the recent candles, confirming the potential breakout\n4. RSI is at 62, not yet overbought but showing strength\n\nThis pattern has a typical price target of +15% from the breakout point, which would put BTC at approximately $48,200 if the pattern completes.\n\nWould you like me to set up an alert for when price breaks the flag resistance?`,
        importance: 'high',
        summary: 'Bullish flag pattern identified',
        suggestions: [
          { action: 'Set Alert', target: 'Flag breakout' },
          { action: 'View Similar', target: 'Historical patterns' }
        ]
      };
    }
    
    // Default image response
    return {
      text: `I've analyzed the image you uploaded. It appears to show a ${Math.random() > 0.5 ? 'bullish' : 'bearish'} market structure with several key levels to watch. The primary support is around $${(Math.floor(Math.random() * 10) + 40) * 1000} and resistance at $${(Math.floor(Math.random() * 10) + 45) * 1000}. Would you like me to provide a more detailed analysis of any specific aspect of this chart?`,
      importance: 'medium'
    };
  };

  const handleToggleListening = () => {
    if (!recognition.current) {
      toast.error('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isListening) {
      recognition.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognition.current.start();
    }
  };

  const handleImageSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    setSelectedImage(file);
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleModeSelect = (mode) => {
    setSelectedMode(mode);
    // Add an assistant message explaining the mode
    const modeMappings = {
      chat: "I'm now in general chat mode. Ask me anything about trading or the application!",
      analysis: "I'm now in analysis mode. I can analyze market conditions, chart patterns, and technical indicators. Upload a chart or ask me about specific markets.",
      signals: "I'm now in signals mode. I'll help you identify trading opportunities and generate signals based on your strategy parameters.",
      portfolio: "I'm now in portfolio mode. I can analyze your holdings, suggest optimizations, and help with risk management.",
      learn: "I'm now in learning mode. I'll provide educational content about trading concepts, strategies, and platform features.",
      strategy: "I'm now in strategy mode. I can help you develop, test, and optimize trading strategies."
    };
    
    setMessages(prev => [
      ...prev,
      {
        id: Date.now().toString() + '-mode',
        role: 'assistant',
        content: modeMappings[mode],
        timestamp: new Date(),
        isMode: true
      }
    ]);
  };

  const renderMessage = (message) => {
    // Helper to render message content with Markdown-like formatting
    const formatContent = (content) => {
      if (!content) return '';
      
      // Convert headers
      let formatted = content
        .replace(/^# (.*$)/gm, '<h2 class="text-lg font-bold text-white mt-2 mb-1">$1</h2>')
        .replace(/^## (.*$)/gm, '<h3 class="text-md font-bold text-white mt-2 mb-1">$1</h3>')
        .replace(/^### (.*$)/gm, '<h4 class="text-sm font-bold text-white mt-1 mb-1">$1</h4>');
      
      // Convert bold
      formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
      
      // Convert lists
      formatted = formatted.replace(/^\d+\. (.*$)/gm, '<li class="ml-4">$1</li>');
      formatted = formatted.replace(/^- (.*$)/gm, '<li class="ml-4 list-disc">$1</li>');
      
      // Convert paragraphs
      formatted = formatted.replace(/^(?!<[hl]|<li)(.*$)/gm, '<p class="mb-2">$1</p>');
      
      return formatted;
    };
    
    return (
      <div
        key={message.id}
        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`max-w-[80%] rounded-lg p-3 ${
            message.role === 'user'
              ? 'bg-primary-500/20 text-white border border-primary-500/30'
              : message.isError
              ? 'bg-red-500/20 text-white border border-red-500/30'
              : message.isMode
              ? 'bg-blue-500/20 text-white border border-blue-500/30'
              : 'bg-dark-700 text-white border border-dark-600'
          }`}
        >
          {message.role === 'user' && message.hasImage && (
            <div className="mb-2 text-sm text-gray-400">
              [Image attached]
            </div>
          )}
          
          <div 
            className="text-sm"
            dangerouslySetInnerHTML={{ __html: formatContent(message.content) }}
          />
          
          {message.charts && message.charts.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.charts.map((chart, index) => (
                <div key={index} className="p-2 bg-dark-600 rounded-lg">
                  <div className="text-sm font-medium text-white">{chart.title}</div>
                  <div className="text-xs text-gray-400">{chart.description}</div>
                  <div className="h-40 bg-dark-500 rounded mt-2 flex items-center justify-center">
                    <span className="text-xs text-gray-400">Chart visualization</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {message.suggestions && message.suggestions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="px-3 py-1 bg-primary-500/30 text-primary-400 rounded-lg text-xs hover:bg-primary-500/50 transition-colors"
                  onClick={() => setInput(`${suggestion.action} ${suggestion.target}`)}
                >
                  {suggestion.action}: {suggestion.target}
                </button>
              ))}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            {new Date(message.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-dark-800 rounded-xl border border-dark-700 ${
        isExpanded ? 'fixed inset-4 z-50' : 'relative h-[500px]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-700">
        <div className="flex items-center space-x-2">
          <SafeIcon icon={FiBrain} className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white">AI Trading Assistant</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-white transition-colors"
        >
          <SafeIcon icon={isExpanded ? FiMinimize2 : FiMaximize2} className="w-5 h-5" />
        </button>
      </div>
      
      {/* Mode Selection */}
      <div className="flex items-center space-x-1 p-2 bg-dark-700 overflow-x-auto">
        {assistantModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeSelect(mode.id)}
            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs whitespace-nowrap transition-colors ${
              selectedMode === mode.id
                ? 'bg-primary-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-dark-600'
            }`}
          >
            <SafeIcon icon={mode.icon} className="w-3 h-3" />
            <span>{mode.name}</span>
          </button>
        ))}
      </div>
      
      {/* Messages */}
      <div className={`p-4 overflow-y-auto ${isExpanded ? 'h-[calc(100%-180px)]' : 'h-[330px]'}`}>
        <AnimatePresence initial={false}>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              {renderMessage(message)}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-dark-700 text-white rounded-lg p-3 border border-dark-600 max-w-[80%]">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin text-primary-400" />
                <span className="text-sm">Processing your request...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Image Preview */}
      {imagePreview && (
        <div className="px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="Preview"
              className="h-20 w-auto rounded border border-dark-600"
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-1 right-1 bg-dark-800/80 rounded-full p-1"
            >
              <SafeIcon icon={FiX} className="w-3 h-3 text-white" />
            </button>
          </div>
        </div>
      )}
      
      {/* Input */}
      <div className="p-4 border-t border-dark-700">
        <form onSubmit={handleSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleImageSelect}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <SafeIcon icon={FiImage} className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={handleToggleListening}
            className={`p-2 ${
              isListening ? 'text-red-400 animate-pulse' : 'text-gray-400 hover:text-white'
            } transition-colors`}
          >
            <SafeIcon icon={FiMic} className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${selectedMode}...`}
            className="flex-1 bg-dark-700 text-white border border-dark-600 rounded-lg px-4 py-2 focus:outline-none focus:border-primary-500"
            disabled={isLoading || isListening}
          />
          <button
            type="submit"
            disabled={isLoading || (!input.trim() && !selectedImage)}
            className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SafeIcon icon={isLoading ? FiLoader : FiSend} className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </form>
        {isListening && (
          <div className="mt-2 text-xs text-center text-red-400 animate-pulse">
            Listening... Speak now
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TradingAssistant;
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiCode, FiUpload, FiCheck, FiAlert, FiPlay } = FiIcons;

const PineScriptIntegration = () => {
  const [pineScript, setPineScript] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const examplePineScript = `// G-Channel + EMA Strategy
//@version=5
strategy("G-Channel + EMA", overlay=true)

// Input parameters
length = input.int(5, title="G-Channel Length", minval=1)
ema_length = input.int(200, title="EMA Length", minval=1)
atr_length = input.int(14, title="ATR Length", minval=1)
stop_multiplier = input.float(2.0, title="Stop Loss Multiplier", minval=0.1)
take_multiplier = input.float(4.0, title="Take Profit Multiplier", minval=0.1)

// G-Channel Calculation
highMA = ta.sma(high, length)
lowMA = ta.sma(low, length)
gUpper = highMA + (highMA - lowMA) * 0.5
gLower = lowMA - (highMA - lowMA) * 0.5
gMid = (gUpper + gLower) / 2

// EMA
ema200 = ta.ema(close, ema_length)

// ATR for stops
atr = ta.atr(atr_length)

// Entry Conditions
longCondition = ta.crossover(close, gMid) and close < ema200
shortCondition = ta.crossunder(close, gMid) and close > ema200

// Strategy Execution
if longCondition
    strategy.entry("Long", strategy.long)
    strategy.exit("Long Exit", "Long", 
         stop=close - atr * stop_multiplier, 
         limit=close + atr * take_multiplier)

if shortCondition
    strategy.entry("Short", strategy.short)
    strategy.exit("Short Exit", "Short", 
         stop=close + atr * stop_multiplier, 
         limit=close - atr * take_multiplier)

// Plotting
plot(gUpper, color=color.blue, title="G-Upper")
plot(gLower, color=color.blue, title="G-Lower")
plot(gMid, color=color.orange, title="G-Mid", linewidth=2)
plot(ema200, color=color.red, title="EMA 200", linewidth=2)

// Alerts
alertcondition(longCondition, title="Long Signal", message="G-Channel Long Signal")
alertcondition(shortCondition, title="Short Signal", message="G-Channel Short Signal")`;

  const validatePineScript = async () => {
    setIsValidating(true);
    
    try {
      // Simulate PineScript validation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation result
      const result = {
        isValid: true,
        strategy: 'G-Channel + EMA',
        indicators: ['G-Channel', 'EMA', 'ATR'],
        signals: ['Long', 'Short'],
        parameters: {
          gChannelLength: 5,
          emaLength: 200,
          atrLength: 14,
          stopMultiplier: 2.0,
          takeMultiplier: 4.0
        }
      };
      
      setValidationResult(result);
    } catch (error) {
      setValidationResult({
        isValid: false,
        error: 'Invalid PineScript syntax'
      });
    } finally {
      setIsValidating(false);
    }
  };

  const deployToAgents = async () => {
    // This would send the validated PineScript to the Signal Generation Agent
    console.log('Deploying PineScript to Signal Generation Agent...');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-dark-800 rounded-xl p-6 border border-dark-700"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <SafeIcon icon={FiCode} className="w-6 h-6 text-blue-400" />
          <div>
            <h2 className="text-xl font-bold text-white">PineScript Integration</h2>
            <p className="text-sm text-gray-400">Upload your strategy to the Signal Generation Agent</p>
          </div>
        </div>
      </div>

      {/* PineScript Editor */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          PineScript Strategy Code
        </label>
        <textarea
          value={pineScript || examplePineScript}
          onChange={(e) => setPineScript(e.target.value)}
          className="w-full h-96 bg-dark-700 border border-dark-600 rounded-lg text-white font-mono text-sm p-4 focus:border-primary-500 focus:outline-none"
          placeholder="Paste your PineScript code here..."
        />
      </div>

      {/* Validation Results */}
      {validationResult && (
        <div className={`mb-6 p-4 rounded-lg ${
          validationResult.isValid ? 'bg-green-500/20 border border-green-500/30' : 'bg-red-500/20 border border-red-500/30'
        }`}>
          <div className="flex items-center space-x-2 mb-2">
            <SafeIcon 
              icon={validationResult.isValid ? FiCheck : FiAlert} 
              className={`w-5 h-5 ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`} 
            />
            <span className={`font-medium ${validationResult.isValid ? 'text-green-400' : 'text-red-400'}`}>
              {validationResult.isValid ? 'PineScript Validated Successfully' : 'Validation Failed'}
            </span>
          </div>
          
          {validationResult.isValid ? (
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-400">Strategy:</span> <span className="text-white">{validationResult.strategy}</span></div>
              <div><span className="text-gray-400">Indicators:</span> <span className="text-white">{validationResult.indicators.join(', ')}</span></div>
              <div><span className="text-gray-400">Signals:</span> <span className="text-white">{validationResult.signals.join(', ')}</span></div>
            </div>
          ) : (
            <div className="text-red-400 text-sm">{validationResult.error}</div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center space-x-4">
        <button
          onClick={validatePineScript}
          disabled={isValidating || !pineScript}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          <SafeIcon icon={FiCheck} className="w-4 h-4" />
          <span>{isValidating ? 'Validating...' : 'Validate Script'}</span>
        </button>

        {validationResult?.isValid && (
          <button
            onClick={deployToAgents}
            className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <SafeIcon icon={FiPlay} className="w-4 h-4" />
            <span>Deploy to Agents</span>
          </button>
        )}

        <button
          onClick={() => setPineScript(examplePineScript)}
          className="flex items-center space-x-2 px-4 py-2 bg-dark-600 text-gray-300 rounded-lg hover:bg-dark-500 transition-colors"
        >
          <SafeIcon icon={FiUpload} className="w-4 h-4" />
          <span>Load Example</span>
        </button>
      </div>

      {/* Integration Guide */}
      <div className="mt-8 bg-dark-700 rounded-lg p-4">
        <h3 className="text-lg font-medium text-white mb-4">Integration Guide</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">1</div>
            <div>
              <div className="text-white font-medium">Upload PineScript</div>
              <div className="text-gray-400">Paste your strategy code and validate it</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-xs">2</div>
            <div>
              <div className="text-white font-medium">Auto-Convert to JavaScript</div>
              <div className="text-gray-400">System converts PineScript logic to JavaScript for n8n agents</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xs">3</div>
            <div>
              <div className="text-white font-medium">Deploy to Signal Agent</div>
              <div className="text-gray-400">Strategy logic is automatically deployed to the Signal Generation Agent</div>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">4</div>
            <div>
              <div className="text-white font-medium">Live Trading</div>
              <div className="text-gray-400">Agents execute your strategy automatically with real market data</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PineScriptIntegration;
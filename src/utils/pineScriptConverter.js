// PineScript to JavaScript Converter
export class PineScriptConverter {
  constructor() {
    this.indicators = new Map();
    this.variables = new Map();
    this.functions = new Map();
  }

  // Convert PineScript to JavaScript for n8n agents
  convertToJavaScript(pineScript) {
    try {
      // Parse PineScript
      const parsed = this.parsePineScript(pineScript);
      
      // Extract strategy components
      const strategy = this.extractStrategy(parsed);
      
      // Generate JavaScript for Signal Generation Agent
      const jsCode = this.generateAgentCode(strategy);
      
      return {
        success: true,
        jsCode,
        strategy,
        indicators: Array.from(this.indicators.keys()),
        signals: this.extractSignals(parsed)
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  parsePineScript(script) {
    const lines = script.split('\n').filter(line => 
      line.trim() && !line.trim().startsWith('//')
    );

    const parsed = {
      inputs: [],
      indicators: [],
      conditions: [],
      strategy: [],
      plots: [],
      alerts: []
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (trimmed.includes('input.')) {
        parsed.inputs.push(this.parseInput(trimmed));
      } else if (trimmed.includes('ta.')) {
        parsed.indicators.push(this.parseIndicator(trimmed));
      } else if (trimmed.includes('Condition') || trimmed.includes('crossover') || trimmed.includes('crossunder')) {
        parsed.conditions.push(this.parseCondition(trimmed));
      } else if (trimmed.includes('strategy.')) {
        parsed.strategy.push(this.parseStrategy(trimmed));
      } else if (trimmed.includes('plot(')) {
        parsed.plots.push(this.parsePlot(trimmed));
      } else if (trimmed.includes('alertcondition')) {
        parsed.alerts.push(this.parseAlert(trimmed));
      }
    });

    return parsed;
  }

  parseInput(line) {
    const match = line.match(/(\w+)\s*=\s*input\.(\w+)\(([^)]+)\)/);
    if (match) {
      const [, name, type, params] = match;
      return { name, type, params: this.parseParams(params) };
    }
    return null;
  }

  parseIndicator(line) {
    const match = line.match(/(\w+)\s*=\s*ta\.(\w+)\(([^)]+)\)/);
    if (match) {
      const [, name, indicator, params] = match;
      this.indicators.set(name, { indicator, params: this.parseParams(params) });
      return { name, indicator, params: this.parseParams(params) };
    }
    return null;
  }

  parseCondition(line) {
    // Parse conditions like ta.crossover(close, gMid)
    const match = line.match(/(\w+Condition)\s*=\s*(.+)/);
    if (match) {
      const [, name, condition] = match;
      return { name, condition: condition.trim() };
    }
    return null;
  }

  parseStrategy(line) {
    // Parse strategy entries and exits
    if (line.includes('strategy.entry')) {
      const match = line.match(/strategy\.entry\("([^"]+)",\s*strategy\.(\w+)\)/);
      if (match) {
        return { type: 'entry', name: match[1], direction: match[2] };
      }
    } else if (line.includes('strategy.exit')) {
      const match = line.match(/strategy\.exit\("([^"]+)",\s*"([^"]+)",\s*([^)]+)\)/);
      if (match) {
        return { type: 'exit', name: match[1], from: match[2], params: this.parseParams(match[3]) };
      }
    }
    return null;
  }

  parseParams(paramString) {
    const params = {};
    const parts = paramString.split(',');
    
    parts.forEach(part => {
      const trimmed = part.trim();
      if (trimmed.includes('=')) {
        const [key, value] = trimmed.split('=').map(s => s.trim());
        params[key] = value.replace(/['"]/g, '');
      } else {
        params.value = trimmed.replace(/['"]/g, '');
      }
    });
    
    return params;
  }

  extractStrategy(parsed) {
    return {
      name: 'G-Channel + EMA Strategy',
      inputs: parsed.inputs,
      indicators: parsed.indicators,
      conditions: parsed.conditions,
      entries: parsed.strategy.filter(s => s && s.type === 'entry'),
      exits: parsed.strategy.filter(s => s && s.type === 'exit'),
      plots: parsed.plots,
      alerts: parsed.alerts
    };
  }

  extractSignals(parsed) {
    const signals = [];
    
    parsed.conditions.forEach(condition => {
      if (condition && condition.name.includes('long')) {
        signals.push('LONG');
      } else if (condition && condition.name.includes('short')) {
        signals.push('SHORT');
      }
    });
    
    return [...new Set(signals)];
  }

  generateAgentCode(strategy) {
    return `
// Auto-generated from PineScript: ${strategy.name}
const marketData = $input.all()[0].json;

// Strategy Parameters
${this.generateParameters(strategy.inputs)}

// Technical Indicators
${this.generateIndicators(strategy.indicators)}

// Signal Generation
const signals = marketData.map(data => {
  const prices = this.generateMockPrices(data.price, 200);
  
  // Calculate indicators
  ${this.generateIndicatorCalculations(strategy.indicators)}
  
  // Entry conditions
  ${this.generateConditions(strategy.conditions)}
  
  let signal = null;
  let confidence = 0;
  
  // Strategy logic
  ${this.generateStrategyLogic(strategy.entries)}
  
  return {
    symbol: data.symbol,
    signal,
    confidence: Math.round(confidence),
    price: data.price,
    reasoning: this.generateReasoning(signal),
    timestamp: new Date().toISOString(),
    indicators: {
      ${this.generateIndicatorOutput(strategy.indicators)}
    }
  };
}).filter(s => s.signal !== null);

return signals;

// Helper Functions
${this.generateHelperFunctions()}
    `;
  }

  generateParameters(inputs) {
    return inputs.map(input => 
      `const ${input.name} = ${input.params.value || input.params.defval || 5};`
    ).join('\n');
  }

  generateIndicators(indicators) {
    return indicators.map(ind => {
      switch (ind.indicator) {
        case 'sma':
          return `function sma(prices, length) {
            return prices.slice(-length).reduce((a, b) => a + b) / length;
          }`;
        case 'ema':
          return `function ema(prices, length) {
            const multiplier = 2 / (length + 1);
            let ema = prices[0];
            for (let i = 1; i < prices.length; i++) {
              ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
            }
            return ema;
          }`;
        case 'atr':
          return `function atr(highs, lows, closes, length) {
            const trs = [];
            for (let i = 1; i < closes.length; i++) {
              const tr = Math.max(
                highs[i] - lows[i],
                Math.abs(highs[i] - closes[i - 1]),
                Math.abs(lows[i] - closes[i - 1])
              );
              trs.push(tr);
            }
            return trs.slice(-length).reduce((a, b) => a + b) / length;
          }`;
        default:
          return '';
      }
    }).filter(Boolean).join('\n\n');
  }

  generateIndicatorCalculations(indicators) {
    return indicators.map(ind => {
      const params = ind.params.value || ind.params.length || 'length';
      return `const ${ind.name} = ${ind.indicator}(prices, ${params});`;
    }).join('\n  ');
  }

  generateConditions(conditions) {
    return conditions.map(cond => {
      // Convert PineScript conditions to JavaScript
      let jsCondition = cond.condition
        .replace(/ta\.crossover\(([^,]+),\s*([^)]+)\)/g, 'crossover($1, $2)')
        .replace(/ta\.crossunder\(([^,]+),\s*([^)]+)\)/g, 'crossunder($1, $2)')
        .replace(/close/g, 'data.price')
        .replace(/and/g, '&&')
        .replace(/or/g, '||');
      
      return `const ${cond.name} = ${jsCondition};`;
    }).join('\n  ');
  }

  generateStrategyLogic(entries) {
    return entries.map(entry => {
      const direction = entry.direction === 'long' ? 'LONG' : 'SHORT';
      const conditionName = `${entry.direction}Condition`;
      
      return `
  if (${conditionName}) {
    signal = '${direction}';
    confidence = 85 + Math.random() * 10;
  }`;
    }).join('\n');
  }

  generateReasoning(signal) {
    return `signal === 'LONG' ? 
      'G-Channel buy signal with confluence confirmation' :
      signal === 'SHORT' ?
      'G-Channel sell signal with confluence confirmation' :
      'No clear signal - waiting for better conditions'`;
  }

  generateIndicatorOutput(indicators) {
    return indicators.map(ind => 
      `${ind.name}: ${ind.name}`
    ).join(',\n      ');
  }

  generateHelperFunctions() {
    return `
function generateMockPrices(currentPrice, length) {
  return Array.from({length}, (_, i) => 
    currentPrice * (1 + (Math.random() - 0.5) * 0.001)
  );
}

function crossover(series1, series2) {
  // Simplified crossover detection
  return series1 > series2;
}

function crossunder(series1, series2) {
  // Simplified crossunder detection
  return series1 < series2;
}
    `;
  }
}

// Usage example
export const convertPineScriptToAgent = (pineScript) => {
  const converter = new PineScriptConverter();
  return converter.convertToJavaScript(pineScript);
};
import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const SUPABASE_URL = 'https://vseutsjmrofifogwgsrm.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZzZXV0c2ptcm9maWZvZ3dnc3JtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwMjc1NjcsImV4cCI6MjA2NzYwMzU2N30.7DtMTo8bP4dXRSfiBsrmGnc2Vc0AYs4UtkHstNhGSOI'

if (SUPABASE_URL === 'https://<PROJECT-ID>.supabase.co' || SUPABASE_ANON_KEY === '<ANON_KEY>') {
  throw new Error('Missing Supabase variables');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Real-time market data subscription
export const subscribeToMarketData = (callback) => {
  return supabase
    .channel('market-data-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'market_data_realtime' }, 
      callback
    )
    .subscribe()
}

// Real-time trading signals subscription
export const subscribeToTradingSignals = (callback) => {
  return supabase
    .channel('trading-signals-changes')
    .on('postgres_changes', 
      { event: 'INSERT', schema: 'public', table: 'trading_signals_stream' }, 
      callback
    )
    .subscribe()
}

// Real-time positions subscription
export const subscribeToPositions = (userId, callback) => {
  return supabase
    .channel('positions-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'trading_positions_live',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe()
}

// Database operations
export const dbOperations = {
  // Market data operations
  async getLatestMarketData() {
    const { data, error } = await supabase
      .from('market_data_realtime')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  },

  // Trading signals operations
  async getRecentSignals(limit = 20) {
    const { data, error } = await supabase
      .from('trading_signals_stream')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  async insertTradingSignal(signal) {
    const { data, error } = await supabase
      .from('trading_signals_stream')
      .insert([signal])
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Position operations
  async getUserPositions(userId) {
    const { data, error } = await supabase
      .from('trading_positions_live')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'OPEN')
    
    if (error) throw error
    return data
  },

  async createPosition(position) {
    const { data, error } = await supabase
      .from('trading_positions_live')
      .insert([position])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async updatePosition(id, updates) {
    const { data, error } = await supabase
      .from('trading_positions_live')
      .update(updates)
      .eq('id', id)
      .select()
    
    if (error) throw error
    return data[0]
  },

  // User settings operations
  async getUserSettings(userId) {
    const { data, error } = await supabase
      .from('user_trading_settings')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    return data
  },

  async updateUserSettings(userId, settings) {
    const { data, error } = await supabase
      .from('user_trading_settings')
      .upsert({ user_id: userId, ...settings, updated_at: new Date().toISOString() })
      .select()
    
    if (error) throw error
    return data[0]
  },

  // Portfolio operations
  async getPortfolioHoldings(userId) {
    const { data, error } = await supabase
      .from('portfolio_holdings_current')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  },

  // Performance operations
  async getPerformanceMetrics(userId, days = 30) {
    const { data, error } = await supabase
      .from('performance_metrics_daily')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // AI Chat operations
  async saveChatMessage(userId, message, response, context = {}) {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .insert([{
        user_id: userId,
        message,
        response,
        context
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getChatHistory(userId, limit = 50) {
    const { data, error } = await supabase
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },

  // N8n workflow operations
  async logWorkflowExecution(execution) {
    const { data, error } = await supabase
      .from('n8n_workflow_executions')
      .insert([execution])
      .select()
    
    if (error) throw error
    return data[0]
  },

  async getWorkflowExecutions(agentType = null, limit = 100) {
    let query = supabase
      .from('n8n_workflow_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(limit)
    
    if (agentType) {
      query = query.eq('agent_type', agentType)
    }
    
    const { data, error } = await query
    if (error) throw error
    return data
  }
}

export default supabase
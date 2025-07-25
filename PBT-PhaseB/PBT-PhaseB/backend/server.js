// server.js - Backend server for Claude API integration
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Environment variables validation
if (!process.env.CLAUDE_API_KEY) {
  console.error('CLAUDE_API_KEY environment variable is required');
  process.exit(1);
}

// Claude API endpoint
const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

// Helper function to format financial data for Claude
const formatFinancialData = (financialData) => {
  const { summary, transactions, budgets, recentActivity } = financialData;
  
  return `
Financial Summary:
- Total Income: $${summary.totalIncome.toFixed(2)}
- Total Expenses: $${summary.totalExpense.toFixed(2)}
- Current Balance: $${summary.balance.toFixed(2)}

Budget Information:
${budgets.length > 0 ? budgets.map(budget => {
  const spent = Object.entries(summary.categoryBreakdown)
    .find(([category]) => category === budget.category)?.[1] || 0;
  const remaining = budget.amount - spent;
  const percentUsed = ((spent / budget.amount) * 100).toFixed(1);
  
  return `- ${budget.category}: $${spent.toFixed(2)} spent of $${budget.amount.toFixed(2)} budget (${percentUsed}% used, $${remaining.toFixed(2)} remaining)`;
}).join('\n') : '- No budgets set'}

Category Spending Breakdown:
${Object.entries(summary.categoryBreakdown)
  .sort(([,a], [,b]) => b - a)
  .map(([category, amount]) => `- ${category}: $${amount.toFixed(2)}`)
  .join('\n')}

Monthly Spending:
${Object.entries(summary.monthlySpending)
  .map(([month, amount]) => `- ${month}: $${amount.toFixed(2)}`)
  .join('\n')}

Recent Transactions (Last 5):
${recentActivity.map(t => 
  `- ${t.date}: ${t.type === 'income' ? '+' : '-'}$${t.amount} - ${t.category} (${t.description})`
).join('\n')}
  `.trim();
};

// Route to handle Claude API chat
app.post('/api/claude-chat', async (req, res) => {
  try {
    const { message, financialData, userId } = req.body;

    if (!message || !financialData) {
      return res.status(400).json({ 
        error: 'Message and financial data are required' 
      });
    }

    // Format the financial data for Claude
    const formattedFinancialData = formatFinancialData(financialData);

    // Create the system prompt for Claude
    const systemPrompt = `You are a helpful AI financial assistant for a personal budget tracking application called PBTracker. You have access to the user's financial data and should provide personalized advice and insights.

Guidelines:
- Be conversational, helpful, and encouraging
- Provide specific, actionable advice based on their actual financial data
- Use exact numbers from their data when relevant
- Focus on practical budgeting and financial wellness tips
- If they ask about categories they haven't spent in, acknowledge this
- Be supportive and non-judgmental about their financial situation
- Keep responses concise but informative (aim for 2-4 sentences unless more detail is specifically requested)
- Use emojis sparingly and only when they add value

Current Financial Data:
${formattedFinancialData}`;

    // Prepare the request to Claude API
    const claudeRequest = {
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: message
        }
      ]
    };

    console.log('Sending request to Claude API for user:', userId);

    // Call Claude API
    const response = await axios.post(CLAUDE_API_URL, claudeRequest, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      timeout: 30000 // 30 second timeout
    });

    const aiResponse = response.data.content[0].text;
    
    console.log('Received response from Claude API');

    res.json({ 
      response: aiResponse,
      success: true 
    });

  } catch (error) {
    console.error('Error in Claude API call:', error.response?.data || error.message);
    
    // Handle different types of errors
    if (error.response?.status === 401) {
      res.status(500).json({ 
        error: 'API authentication failed',
        success: false 
      });
    } else if (error.response?.status === 429) {
      res.status(429).json({ 
        error: 'Too many requests. Please try again in a moment.',
        success: false 
      });
    } else if (error.code === 'ECONNABORTED') {
      res.status(408).json({ 
        error: 'Request timeout. Please try again.',
        success: false 
      });
    } else {
      res.status(500).json({ 
        error: 'An error occurred while processing your request.',
        success: false 
      });
    }
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'PBTracker Claude API Server'
  });
});

// Default route
app.get('/', (req, res) => {
  res.json({ 
    message: 'PBTracker Claude API Server is running',
    endpoints: {
      chat: 'POST /api/claude-chat',
      health: 'GET /api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    success: false 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 PBTracker Claude API Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/claude-chat`);
  
  if (!process.env.CLAUDE_API_KEY) {
    console.warn('⚠️  Warning: CLAUDE_API_KEY not set in environment variables');
  }
});
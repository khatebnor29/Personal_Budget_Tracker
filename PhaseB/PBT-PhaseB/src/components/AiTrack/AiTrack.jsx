import React, { useState, useEffect, useRef } from 'react';
import { 
  getDatabase, ref, get, onValue, off
} from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useFirebase } from '../../Firebase/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import './AiTrack.css';
import { 
  FiSend, FiUser, FiRefreshCw, FiAlertCircle, 
  FiMessageSquare, FiTrendingUp, FiDollarSign, FiPieChart,
  FiArrowLeft, FiLoader, FiCpu
} from 'react-icons/fi';

const AITrack = () => {
  const auth = getAuth();
  const database = getDatabase();
  const { currentUser } = useFirebase();
  const user = currentUser;
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // State for user financial data
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [financialSummary, setFinancialSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0,
    monthlySpending: {},
    categoryBreakdown: {}
  });

  // State for AI chat
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Predefined question suggestions
  const suggestionQuestions = [
    "What's my biggest spending category this month?",
    "How can I improve my budget allocation?",
    "Am I overspending in any category?",
    "What are some tips to increase my savings?",
    "Analyze my income vs expenses trend",
    "How much should I budget for entertainment?"
  ];

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch user financial data from Firebase
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    console.log("Setting up data listeners for AI Track");
    setIsLoadingData(true);

    try {
      // Set up real-time listener for transactions
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
        const transactionList = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const transaction = childSnapshot.val();
            transaction.id = childSnapshot.key;
            transaction.date = transaction.date ? new Date(transaction.date) : new Date();
            transactionList.push(transaction);
          });
        }
        
        setTransactions(transactionList);
        calculateFinancialSummary(transactionList);
      }, (error) => {
        console.error("Error loading transactions:", error);
        setErrorMessage("Failed to load transaction data.");
      });

      // Set up real-time listener for budgets
      const budgetsRef = ref(database, `users/${user.uid}/budgets`);
      const unsubscribeBudgets = onValue(budgetsRef, (snapshot) => {
        const budgetList = [];
        
        if (snapshot.exists()) {
          snapshot.forEach((childSnapshot) => {
            const budget = childSnapshot.val();
            budget.id = childSnapshot.key;
            budgetList.push(budget);
          });
        }
        
        setBudgets(budgetList);
        setIsLoadingData(false);
      }, (error) => {
        console.error("Error loading budgets:", error);
        setErrorMessage("Failed to load budget data.");
        setIsLoadingData(false);
      });

      // Cleanup function
      return () => {
        off(transactionsRef);
        off(budgetsRef);
      };
    } catch (error) {
      console.error("Error setting up listeners:", error);
      setErrorMessage("Failed to connect to database.");
      setIsLoadingData(false);
    }
  }, [user, database, navigate]);

  // Calculate financial summary for AI context
  const calculateFinancialSummary = (transactionList) => {
    let totalIncome = 0;
    let totalExpense = 0;
    const monthlySpending = {};
    const categoryBreakdown = {};

    transactionList.forEach(transaction => {
      const amount = parseFloat(transaction.amount);
      const month = transaction.date.toLocaleString('default', { month: 'long', year: 'numeric' });
      
      if (transaction.type === 'income') {
        totalIncome += amount;
      } else {
        totalExpense += amount;
        
        // Monthly spending
        monthlySpending[month] = (monthlySpending[month] || 0) + amount;
        
        // Category breakdown
        categoryBreakdown[transaction.category] = (categoryBreakdown[transaction.category] || 0) + amount;
      }
    });

    setFinancialSummary({
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
      monthlySpending,
      categoryBreakdown
    });
  };

  // Prepare financial context for AI
  const prepareFinancialContext = () => {
    return {
      summary: financialSummary,
      transactions: transactions.slice(-20), // Last 20 transactions
      budgets: budgets,
      recentActivity: transactions
        .sort((a, b) => b.date - a.date)
        .slice(0, 5)
        .map(t => ({
          type: t.type,
          amount: t.amount,
          category: t.category,
          description: t.description,
          date: t.date.toLocaleDateString()
        }))
    };
  };

  // Send message to Claude API via backend
  const sendMessageToAI = async (userMessage, financialContext) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/claude-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          financialData: financialContext,
          userId: user.uid
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  };

  // Handle sending a message
  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: messageText.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage('');

    try {
      const financialContext = prepareFinancialContext();
      const aiResponse = await sendMessageToAI(messageText.trim(), financialContext);

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  // Initial welcome message
  useEffect(() => {
    if (!isLoadingData && messages.length === 0) {
      const welcomeMessage = {
        id: 0,
        text: "Hello! I'm your AI financial assistant. I can help analyze your spending patterns, suggest budget improvements, and answer questions about your finances. What would you like to know?",
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isLoadingData, messages.length]);

  if (isLoadingData) {
    return (
      <div className="aitrack-container">
        <div className="loading-screen">
          <FiLoader className="loading-icon" />
          <h2>Loading your financial data...</h2>
          <p>Preparing AI assistant</p>
        </div>
      </div>
    );
  }

  return (
    <div className="aitrack-container">
      {/* Header */}
      <div className="aitrack-header">
        <button 
          className="back-button"
          onClick={() => navigate('/BudgetDashboard')}
        >
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className="header-content">
          <h1>PBT Financial Assistant</h1>
          <p>Get personalized insights about your finances</p>
        </div>
        <div className="financial-summary-mini">
          <div className="summary-item">
            <FiDollarSign />
            <span>Balance: ${financialSummary.balance.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <FiTrendingUp />
            <span>Income: ${financialSummary.totalIncome.toFixed(2)}</span>
          </div>
          <div className="summary-item">
            <FiPieChart />
            <span>Expenses: ${financialSummary.totalExpense.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Chat Interface */}
      <div className="chat-container">
        {/* Messages */}
        <div className="messages-container">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-avatar">
                 {message.sender === 'user' ? <FiUser /> : <FiCpu />}
              </div>
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-timestamp">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai loading">
              <div className="message-avatar">
                <FiCpu />
              </div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Pills (only show when no messages or just welcome) */}
        {messages.length <= 1 && (
          <div className="suggestions-container">
            <h3>Try asking:</h3>
            <div className="suggestions-grid">
              {suggestionQuestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-pill"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                >
                  <FiMessageSquare />
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-banner">
            <FiAlertCircle />
            {errorMessage}
          </div>
        )}

        {/* Input Form */}
        <form className="message-input-form" onSubmit={handleSubmit}>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask me about your finances..."
              disabled={isLoading}
              className="message-input"
            />
            <button 
              type="submit" 
              className="send-button"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? <FiRefreshCw className="spinning" /> : <FiSend />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AITrack;
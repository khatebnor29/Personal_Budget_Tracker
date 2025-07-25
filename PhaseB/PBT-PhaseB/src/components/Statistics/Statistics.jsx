import React, { useState, useEffect } from 'react';
import { 
  getDatabase, ref, get, onValue, off
} from 'firebase/database';
import { getAuth } from 'firebase/auth';
import { useFirebase } from '../../Firebase/FirebaseContext';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area, ComposedChart
} from 'recharts';
import { 
  FiArrowLeft, FiTrendingUp, FiTrendingDown, FiDollarSign, 
  FiCalendar, FiFilter, FiDownload, FiRefreshCw
} from 'react-icons/fi';
import './Statistics.css';

const Statistics = () => {
  const { currentUser } = useFirebase();
  const navigate = useNavigate();
  const database = getDatabase();
  const auth = getAuth();
  
  // Data states
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [chartType, setChartType] = useState('line'); // line, area, bar
  
  // Chart colors
  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C',
    '#8DD1E1', '#D084D0', '#87CB87', '#FFB347'
  ];

  // Load data from Firebase
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    setIsLoading(true);
    
    // Real-time listeners for transactions and budgets
    const transactionsRef = ref(database, `users/${currentUser.uid}/transactions`);
    const budgetsRef = ref(database, `users/${currentUser.uid}/budgets`);
    
    const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
      const transactionList = [];
      if (snapshot.exists()) {
        snapshot.forEach((childSnapshot) => {
          const transaction = childSnapshot.val();
          transaction.id = childSnapshot.key;
          transaction.date = new Date(transaction.date);
          transactionList.push(transaction);
        });
      }
      setTransactions(transactionList);
    }, (error) => {
      console.error("Error loading transactions:", error);
      setError("Failed to load transaction data");
    });
    
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
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading budgets:", error);
      setError("Failed to load budget data");
      setIsLoading(false);
    });
    
    return () => {
      off(transactionsRef);
      off(budgetsRef);
    };
  }, [currentUser, database, navigate]);

  // Calculate financial metrics
  const calculateMetrics = () => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    
    const balance = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((balance / totalIncome) * 100) : 0;
    
    // Average daily spending
    const expenseTransactions = transactions.filter(t => t.type === 'expense');
    const uniqueDays = [...new Set(expenseTransactions.map(t => t.date.toDateString()))].length;
    const avgDailySpending = uniqueDays > 0 ? totalExpenses / uniqueDays : 0;
    
    // Largest single expense
    const largestExpense = Math.max(...expenseTransactions.map(t => parseFloat(t.amount)), 0);
    
    return {
      totalIncome,
      totalExpenses,
      balance,
      savingsRate,
      avgDailySpending,
      largestExpense,
      transactionCount: transactions.length
    };
  };

  // Generate spending trends data
  const getSpendingTrends = () => {
    const days = parseInt(dateRange);
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    // Create daily buckets
    const dailyData = {};
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      dailyData[dateStr] = { 
        date: dateStr, 
        income: 0, 
        expense: 0, 
        net: 0,
        displayDate: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    }
    
    // Fill with transaction data
    transactions
      .filter(t => t.date >= startDate && t.date <= endDate)
      .forEach(t => {
        const dateStr = t.date.toISOString().split('T')[0];
        if (dailyData[dateStr]) {
          const amount = parseFloat(t.amount);
          if (t.type === 'income') {
            dailyData[dateStr].income += amount;
          } else {
            dailyData[dateStr].expense += amount;
          }
        }
      });
    
    // Calculate net and return sorted data
    return Object.values(dailyData)
      .map(day => ({
        ...day,
        net: day.income - day.expense
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  // Generate category breakdown
  const getCategoryBreakdown = () => {
    const categoryTotals = {};
    const filteredTransactions = selectedCategory === 'all' 
      ? transactions.filter(t => t.type === 'expense')
      : transactions.filter(t => t.type === 'expense' && t.category === selectedCategory);
    
    filteredTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + parseFloat(t.amount);
    });
    
    const totalExpenses = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);
    
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({
        name: category,
        value: amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0,
        count: filteredTransactions.filter(t => t.category === category).length
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Generate monthly comparison
  const getMonthlyComparison = () => {
    const monthlyData = {};
    
    transactions.forEach(t => {
      const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { 
          month: monthKey, 
          income: 0, 
          expense: 0,
          transactionCount: 0
        };
      }
      
      const amount = parseFloat(t.amount);
      if (t.type === 'income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expense += amount;
      }
      monthlyData[monthKey].transactionCount++;
    });
    
    return Object.values(monthlyData)
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6)
      .map(data => ({
        ...data,
        displayMonth: new Date(data.month + '-01').toLocaleDateString('en-US', { 
          month: 'short', 
          year: 'numeric' 
        }),
        net: data.income - data.expense,
        savingsRate: data.income > 0 ? ((data.income - data.expense) / data.income * 100).toFixed(1) : 0
      }));
  };

  // Generate budget performance data
  const getBudgetPerformance = () => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    
    return budgets.map(budget => {
      const actualSpent = transactions
        .filter(t => {
          const transactionMonth = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;
          return t.type === 'expense' && 
                 t.category === budget.category && 
                 transactionMonth === currentMonth;
        })
        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
      
      const percentage = (actualSpent / budget.amount) * 100;
      const remaining = budget.amount - actualSpent;
      
      return {
        category: budget.category,
        budget: budget.amount,
        actual: actualSpent,
        remaining: remaining,
        percentage: percentage.toFixed(1),
        status: percentage > 100 ? 'over' : percentage > 80 ? 'warning' : 'good'
      };
    });
  };

  // Generate expense patterns (by day of week)
  const getExpensePatterns = () => {
    const dayTotals = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, 
      Thursday: 0, Friday: 0, Saturday: 0
    };
    
    const dayCounts = {
      Sunday: 0, Monday: 0, Tuesday: 0, Wednesday: 0, 
      Thursday: 0, Friday: 0, Saturday: 0
    };
    
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const dayName = t.date.toLocaleDateString('en-US', { weekday: 'long' });
        dayTotals[dayName] += parseFloat(t.amount);
        dayCounts[dayName]++;
      });
    
    return Object.keys(dayTotals).map(day => ({
      day: day.substring(0, 3),
      total: dayTotals[day],
      average: dayCounts[day] > 0 ? dayTotals[day] / dayCounts[day] : 0,
      count: dayCounts[day]
    }));
  };

  const metrics = calculateMetrics();
  const categories = [...new Set(transactions.map(t => t.category))];

  if (isLoading) {
    return (
      <div className="statistics-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your financial statistics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            <FiRefreshCw /> Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      {/* Header */}
      <div className="stats-header">
        <div className="header-left">
          <button className="back-btn" onClick={() => navigate('/BudgetDashboard')}>
            <FiArrowLeft /> Back to Dashboard
          </button>
          <h1>Financial Statistics</h1>
        </div>
        <div className="header-controls">
          <select 
            value={dateRange} 
            onChange={(e) => setDateRange(e.target.value)}
            className="control-select"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="control-select"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="metrics-overview">
        <div className="metric-card income">
          <div className="metric-icon"><FiTrendingUp /></div>
          <div className="metric-content">
            <h3>Total Income</h3>
            <div className="metric-value">${metrics.totalIncome.toFixed(2)}</div>
          </div>
        </div>
        <div className="metric-card expense">
          <div className="metric-icon"><FiTrendingDown /></div>
          <div className="metric-content">
            <h3>Total Expenses</h3>
            <div className="metric-value">${metrics.totalExpenses.toFixed(2)}</div>
          </div>
        </div>
        <div className="metric-card balance">
          <div className="metric-icon"><FiDollarSign /></div>
          <div className="metric-content">
            <h3>Net Balance</h3>
            <div className={`metric-value ${metrics.balance >= 0 ? 'positive' : 'negative'}`}>
              ${metrics.balance.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="metric-card savings">
          <div className="metric-icon"><FiCalendar /></div>
          <div className="metric-content">
            <h3>Savings Rate</h3>
            <div className={`metric-value ${metrics.savingsRate >= 0 ? 'positive' : 'negative'}`}>
              {metrics.savingsRate.toFixed(1)}%
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        
        {/* Spending Trends */}
        <div className="chart-container large">
          <div className="chart-header">
            <h3>Spending Trends</h3>
            <div className="chart-type-selector">
              <button 
                className={chartType === 'line' ? 'active' : ''}
                onClick={() => setChartType('line')}
              >
                Line
              </button>
              <button 
                className={chartType === 'area' ? 'active' : ''}
                onClick={() => setChartType('area')}
              >
                Area
              </button>
              <button 
                className={chartType === 'bar' ? 'active' : ''}
                onClick={() => setChartType('bar')}
              >
                Bar
              </button>
            </div>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              {chartType === 'line' && (
                <LineChart data={getSpendingTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#00C49F" strokeWidth={3} name="Income" />
                  <Line type="monotone" dataKey="expense" stroke="#FF8042" strokeWidth={3} name="Expenses" />
                  <Line type="monotone" dataKey="net" stroke="#8884D8" strokeWidth={3} name="Net" />
                </LineChart>
              )}
              {chartType === 'area' && (
                <AreaChart data={getSpendingTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                  <Legend />
                  <Area type="monotone" dataKey="income" stackId="1" stroke="#00C49F" fill="#00C49F" />
                  <Area type="monotone" dataKey="expense" stackId="2" stroke="#FF8042" fill="#FF8042" />
                </AreaChart>
              )}
              {chartType === 'bar' && (
                <BarChart data={getSpendingTrends()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="displayDate" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                  <Legend />
                  <Bar dataKey="income" fill="#00C49F" name="Income" />
                  <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Expense Categories</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={getCategoryBreakdown()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({name, percentage}) => `${name}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {getCategoryBreakdown().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Monthly Comparison */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Monthly Overview</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={getMonthlyComparison()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="displayMonth" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                <Legend />
                <Bar dataKey="income" fill="#00C49F" name="Income" />
                <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
                <Line type="monotone" dataKey="net" stroke="#8884D8" strokeWidth={3} name="Net" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Budget Performance */}
        {budgets.length > 0 && (
          <div className="chart-container medium">
            <div className="chart-header">
              <h3>Budget vs Actual (This Month)</h3>
            </div>
            <div className="chart-content">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getBudgetPerformance()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, '']} />
                  <Legend />
                  <Bar dataKey="budget" fill="#82CA9D" name="Budget" />
                  <Bar dataKey="actual" fill="#FF8042" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Weekly Spending Pattern */}
        <div className="chart-container medium">
          <div className="chart-header">
            <h3>Spending by Day of Week</h3>
          </div>
          <div className="chart-content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getExpensePatterns()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'total' ? `$${value.toFixed(2)}` : `$${value.toFixed(2)}`,
                    name === 'total' ? 'Total Spent' : 'Average per Day'
                  ]} 
                />
                <Legend />
                <Bar dataKey="total" fill="#8884D8" name="Total Spent" />
                <Bar dataKey="average" fill="#FFBB28" name="Average" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="insights-container">
          <h3>Key Insights</h3>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Average Daily Spending</h4>
              <div className="insight-value">${metrics.avgDailySpending.toFixed(2)}</div>
            </div>
            <div className="insight-card">
              <h4>Largest Single Expense</h4>
              <div className="insight-value">${metrics.largestExpense.toFixed(2)}</div>
            </div>
            <div className="insight-card">
              <h4>Total Transactions</h4>
              <div className="insight-value">{metrics.transactionCount}</div>
            </div>
            <div className="insight-card">
              <h4>Most Expensive Category</h4>
              <div className="insight-value">
                {getCategoryBreakdown().length > 0 ? getCategoryBreakdown()[0].name : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;
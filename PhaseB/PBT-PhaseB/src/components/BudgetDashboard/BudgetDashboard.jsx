import React, { useState, useEffect } from 'react';
import { 
  getDatabase, ref, push, set, get, child, remove, 
  update, query, orderByChild, equalTo, onValue, off
} from 'firebase/database';
import { getAuth, signOut } from 'firebase/auth';
import { useFirebase } from '../../Firebase/FirebaseContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import './BudgetDashboard.css';
import { 
  FiPlus, FiLogOut, FiPieChart, FiDollarSign, 
  FiCreditCard, FiSettings, FiAlertCircle, 
  FiFilter, FiRefreshCw, FiChevronDown, FiCheck
} from 'react-icons/fi';

const BudgetDashboard = () => {
  const auth = getAuth();
  const database = getDatabase();
  const { currentUser } = useFirebase();
  const user = currentUser;
  const navigate = useNavigate(); // Initialize useNavigate hook

  // Core data states
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);
  
  // UI states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Form states
  const [transactionType, setTransactionType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('');
  const [budgetAmount, setBudgetAmount] = useState('');

  // Categories
  const expenseCategories = ['Food', 'Transport', 'Utilities', 'Entertainment', 'Shopping', 'Health', 'Other'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gifts', 'Other'];

  // Reset form states when modals are closed
  const resetTransactionForm = () => {
    setTransactionType('expense');
    setAmount('');
    setCategory('');
    setDescription('');
    setErrorMessage('');
  };

  const resetBudgetForm = () => {
    setBudgetCategory('');
    setBudgetAmount('');
    setErrorMessage('');
  };

  // Success message timer
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Real-time data subscription
  useEffect(() => {
    if (!user) return;

    console.log("Setting up real-time listeners for user:", user.uid);
    setIsLoading(true);
    
    try {
      // Set up real-time listener for transactions
      // Note the path change to match your security rules: /users/{uid}/transactions
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      console.log("Creating transactions listener at path:", transactionsRef.toString());
      
      const unsubscribeTransactions = onValue(transactionsRef, (snapshot) => {
        console.log("Transaction data updated");
        const transactionList = [];
        
        if (snapshot.exists()) {
          console.log("Transaction snapshot exists");
          snapshot.forEach((childSnapshot) => {
            const transaction = childSnapshot.val();
            transaction.id = childSnapshot.key;
            transaction.date = transaction.date ? new Date(transaction.date) : new Date();
            transactionList.push(transaction);
          });
          console.log("Processed transactions:", transactionList.length);
        } else {
          console.log("No transactions found for user");
        }
        
        setTransactions(transactionList);
        calculateTotals(transactionList);
        setIsLoading(false);
      }, (error) => {
        console.error("Error in transactions listener:", error);
        console.error("Error details:", error.code, error.message);
        setErrorMessage("Failed to load transactions. Please check your connection.");
        setIsLoading(false);
      });
      
      // Set up real-time listener for budgets
      // Note the path change to match your security rules: /users/{uid}/budgets
      const budgetsRef = ref(database, `users/${user.uid}/budgets`);
      console.log("Creating budgets listener at path:", budgetsRef.toString());
      
      const unsubscribeBudgets = onValue(budgetsRef, (snapshot) => {
        console.log("Budget data updated");
        const budgetList = [];
        
        if (snapshot.exists()) {
          console.log("Budget snapshot exists");
          snapshot.forEach((childSnapshot) => {
            const budget = childSnapshot.val();
            budget.id = childSnapshot.key;
            budgetList.push(budget);
          });
          console.log("Processed budgets:", budgetList.length);
        } else {
          console.log("No budgets found for user");
        }
        
        setBudgets(budgetList);
      }, (error) => {
        console.error("Error in budgets listener:", error);
        console.error("Error details:", error.code, error.message);
        setErrorMessage("Failed to load budgets. Please check your connection.");
      });
      
      // Cleanup function to unsubscribe from all listeners when component unmounts
      return () => {
        console.log("Cleaning up database listeners");
        off(transactionsRef);
        off(budgetsRef);
      };
    } catch (setupError) {
      console.error("Error setting up database listeners:", setupError);
      setErrorMessage("Failed to connect to the database. Please refresh the page.");
      setIsLoading(false);
    }
  }, [user, database]);

  // Calculate totals based on transaction data
  const calculateTotals = (transactionList) => {
    let incomeSum = 0;
    let expenseSum = 0;
    
    transactionList.forEach(transaction => {
      if (transaction.type === 'income') {
        incomeSum += parseFloat(transaction.amount);
      } else {
        expenseSum += parseFloat(transaction.amount);
      }
    });
    
    setTotalIncome(incomeSum);
    setTotalExpense(expenseSum);
    setBalance(incomeSum - expenseSum);
  };

  // Manual data fetch (used as backup and for force refresh)
  const fetchData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Fetch transactions
      // Note the path change to match your security rules: /users/{uid}/transactions
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      
      console.log("Manual fetch from path:", transactionsRef.toString());
      const transactionsSnapshot = await get(transactionsRef);
      const transactionList = [];
      
      if (transactionsSnapshot.exists()) {
        transactionsSnapshot.forEach((childSnapshot) => {
          const transaction = childSnapshot.val();
          transaction.id = childSnapshot.key;
          transaction.date = transaction.date ? new Date(transaction.date) : new Date();
          transactionList.push(transaction);
        });
      }
      
      setTransactions(transactionList);
      calculateTotals(transactionList);
      
      // Fetch budgets
      // Note the path change to match your security rules: /users/{uid}/budgets
      const budgetsRef = ref(database, `users/${user.uid}/budgets`);
      
      console.log("Manual fetch from path:", budgetsRef.toString());
      const budgetsSnapshot = await get(budgetsRef);
      const budgetList = [];
      
      if (budgetsSnapshot.exists()) {
        budgetsSnapshot.forEach((childSnapshot) => {
          const budget = childSnapshot.val();
          budget.id = childSnapshot.key;
          budgetList.push(budget);
        });
      }
      
      setBudgets(budgetList);
      setSuccessMessage('Data refreshed successfully!');
    } catch (error) {
      console.error("Error fetching data:", error);
      console.error("Error details:", error.code, error.message);
      setErrorMessage(`Failed to refresh data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTransaction = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log("Adding transaction for user:", user.uid);
      
      if (!user || !user.uid) {
        throw new Error("User is not authenticated. Please sign in again.");
      }
      
      // Note the path change to match your security rules: /users/{uid}/transactions
      const transactionsRef = ref(database, `users/${user.uid}/transactions`);
      const newTransactionRef = push(transactionsRef);
      
      const newTransaction = {
        type: transactionType,
        amount: parseFloat(amount),
        category,
        description,
        date: new Date().toISOString()
      };
      
      console.log("Attempting to write transaction:", newTransaction);
      console.log("To path:", newTransactionRef.toString());
      
      await set(newTransactionRef, newTransaction);
      console.log("Transaction added successfully!");
      
      // Reset form
      resetTransactionForm();
      setShowAddModal(false);
      setSuccessMessage(`${transactionType === 'income' ? 'Income' : 'Expense'} added successfully!`);
    } catch (error) {
      console.error("Error adding transaction:", error);
      console.error("Error details:", error.code, error.message);
      setErrorMessage(`Failed to add transaction: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBudget = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      console.log("Adding/updating budget for user:", user.uid);
      
      if (!user || !user.uid) {
        throw new Error("User is not authenticated. Please sign in again.");
      }
      
      // Note the path change to match your security rules: /users/{uid}/budgets
      const budgetsRef = ref(database, `users/${user.uid}/budgets`);
      
      // Check if budget for this category already exists
      const budgetQuery = query(
        budgetsRef,
        orderByChild('category'),
        equalTo(budgetCategory)
      );
      
      console.log("Querying existing budgets");
      const budgetSnapshot = await get(budgetQuery);
      let existingBudgetKey = null;
      
      if (budgetSnapshot.exists()) {
        console.log("Found existing budgets");
        budgetSnapshot.forEach((childSnapshot) => {
          const budget = childSnapshot.val();
          console.log("Checking budget:", budget);
          if (budget.category === budgetCategory) {
            existingBudgetKey = childSnapshot.key;
            console.log("Found matching budget with key:", existingBudgetKey);
          }
        });
      } else {
        console.log("No existing budgets found");
      }
      
      if (existingBudgetKey) {
        // Update existing budget
        const budgetRef = ref(database, `users/${user.uid}/budgets/${existingBudgetKey}`);
        console.log("Updating existing budget at path:", budgetRef.toString());
        
        const updateData = {
          amount: parseFloat(budgetAmount)
        };
        console.log("Update data:", updateData);
        
        await update(budgetRef, updateData);
        console.log("Budget updated successfully!");
        setSuccessMessage(`Budget for ${budgetCategory} updated successfully!`);
      } else {
        // Create new budget
        const newBudgetRef = push(budgetsRef);
        console.log("Creating new budget at path:", newBudgetRef.toString());
        
        const newBudget = {
          category: budgetCategory,
          amount: parseFloat(budgetAmount)
        };
        console.log("New budget data:", newBudget);
        
        await set(newBudgetRef, newBudget);
        console.log("Budget created successfully!");
        setSuccessMessage(`New budget for ${budgetCategory} created successfully!`);
      }
      
      // Reset form
      resetBudgetForm();
      setShowBudgetModal(false);
    } catch (error) {
      console.error("Error adding/updating budget:", error);
      console.error("Error details:", error.code, error.message);
      setErrorMessage(`Failed to set budget: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTransaction = async (id, description) => {
    if (window.confirm(`Are you sure you want to delete the transaction: "${description}"?`)) {
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        // Note the path change to match your security rules: /users/{uid}/transactions/{id}
        const transactionRef = ref(database, `users/${user.uid}/transactions/${id}`);
        await remove(transactionRef);
        setSuccessMessage('Transaction deleted successfully!');
      } catch (error) {
        console.error("Error deleting transaction:", error);
        console.error("Error details:", error.code, error.message);
        setErrorMessage(`Failed to delete transaction: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDeleteBudget = async (id, category) => {
    if (window.confirm(`Are you sure you want to delete the budget for ${category}?`)) {
      setIsLoading(true);
      setErrorMessage('');
      
      try {
        // Note the path change to match your security rules: /users/{uid}/budgets/{id}
        const budgetRef = ref(database, `users/${user.uid}/budgets/${id}`);
        await remove(budgetRef);
        setSuccessMessage(`Budget for ${category} deleted successfully!`);
      } catch (error) {
        console.error("Error deleting budget:", error);
        console.error("Error details:", error.code, error.message);
        setErrorMessage(`Failed to delete budget: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Updated logout handler function
  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setIsLoading(true);
      signOut(auth)
        .then(() => {
          console.log("User signed out successfully");
          // Navigate to the Home page after successful logout
          navigate('/');
        })
        .catch((error) => {
          console.error("Error signing out: ", error);
          setErrorMessage('Failed to log out. Please try again.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  // Calculate budget usage
  const calculateBudgetUsage = (category) => {
    const categoryExpenses = transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, transaction) => sum + parseFloat(transaction.amount), 0);
      
    const budget = budgets.find(b => b.category === category);
    if (!budget) return 0;
    
    return Math.min((categoryExpenses / budget.amount) * 100, 100);
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  // Sort transactions based on current sort settings
  const sortTransactions = (a, b) => {
    let comparison = 0;
    
    if (sortBy === 'date') {
      comparison = new Date(b.date) - new Date(a.date);
    } else if (sortBy === 'amount') {
      comparison = parseFloat(b.amount) - parseFloat(a.amount);
    } else if (sortBy === 'category') {
      comparison = a.category.localeCompare(b.category);
    } else if (sortBy === 'description') {
      comparison = a.description.localeCompare(b.description);
    }
    
    return sortDirection === 'asc' ? -comparison : comparison;
  };

  // Reset all filters
  const resetFilters = () => {
    setFilterCategory('');
    setSortBy('date');
    setSortDirection('desc');
    setShowFilters(false);
  };

  // Get recent transactions (last 5)
  const recentTransactions = [...transactions]
    .sort((a, b) => b.date - a.date)
    .slice(0, 5);

  // Get filtered and sorted transactions
  const filteredTransactions = [...transactions]
    .filter(t => filterCategory ? t.category === filterCategory : true)
    .sort(sortTransactions);

  return (
    <div className="dashboard-container">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
      
      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <FiCheck /> {successMessage}
        </div>
      )}
      
      {/* Error Message */}
      {errorMessage && (
        <div className="error-message">
          <FiAlertCircle /> {errorMessage}
        </div>
      )}
      
      {/* Sidebar */}
      <div className="sidebar">
        <div className="brand">
          <h2>PBTracker</h2>
        </div>
        <div className="menu">
          <div 
            className={`menu-item ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <FiPieChart /> Overview
          </div>
          <div 
            className={`menu-item ${activeTab === 'transactions' ? 'active' : ''}`}
            onClick={() => setActiveTab('transactions')}
          >
            <FiCreditCard /> Transactions
          </div>
          <div 
            className={`menu-item ${activeTab === 'budgets' ? 'active' : ''}`}
            onClick={() => setActiveTab('budgets')}
          >
            <FiDollarSign /> Budgets
          </div>
          <div 
            className={`menu-item ${activeTab === 'aitrack' ? 'active' : ''}`}
            onClick={() => navigate('/aitrack')}
          >
            <FiAlertCircle /> AI Tracker
        </div>
          <div 
             className={`menu-item ${activeTab === 'statistics' ? 'active' : ''}`}
             onClick={() => navigate('/statistics')}
            >
              <FiPieChart /> Statistics
            </div>

          <div 
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <FiSettings /> Settings
          </div>
        </div>
        <div className="logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </div>
      </div>

      {/* Main content */}
      <div className="main-content">
        <div className="header">
          <h1>Hello, {user?.displayName || user?.email || 'User'}</h1>
          <div className="action-buttons">
            <button 
              className="btn btn-refresh"
              onClick={fetchData}
              title="Refresh data"
            >
              <FiRefreshCw />
            </button>
            <button 
              className="btn btn-primary"
              onClick={() => setShowBudgetModal(true)}
            >
              Set Budget
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus /> Add Transaction
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="summary-cards">
              <div className="card balance-card">
                <h3>Balance</h3>
                <h2>${balance.toFixed(2)}</h2>
              </div>
              <div className="card income-card">
                <h3>Income</h3>
                <h2>${totalIncome.toFixed(2)}</h2>
              </div>
              <div className="card expense-card">
                <h3>Expenses</h3>
                <h2>${totalExpense.toFixed(2)}</h2>
              </div>
            </div>

            <div className="dashboard-sections">
              <div className="section">
                <h2>Budget Status</h2>
                {budgets.length > 0 ? (
                  <div className="budget-bars">
                    {budgets.map(budget => {
                      const spentAmount = transactions
                        .filter(t => t.type === 'expense' && t.category === budget.category)
                        .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                      const percentUsed = (spentAmount / budget.amount) * 100;
                      const progressClass = 
                        percentUsed > 90 ? 'danger' : 
                        percentUsed > 70 ? 'warning' : 'safe';
                        
                      return (
                        <div className="budget-item" key={budget.id}>
                          <div className="budget-info">
                            <span>{budget.category}</span>
                            <span>
                              ${spentAmount.toFixed(2)} 
                              / ${budget.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className={`progress-fill ${progressClass}`} 
                              style={{width: `${Math.min(percentUsed, 100)}%`}}
                            ></div>
                          </div>
                          <div className="budget-percentage">
                            {percentUsed.toFixed(0)}% used
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="empty-state">No budgets set yet. Create one to start tracking!</p>
                )}
              </div>

              <div className="section">
                <h2>Recent Transactions</h2>
                {recentTransactions.length > 0 ? (
                  <div className="transaction-list">
                    {recentTransactions.map(transaction => (
                      <div 
                        className={`transaction-item ${transaction.type}`} 
                        key={transaction.id}
                      >
                        <div className="transaction-details">
                          <h4>{transaction.description}</h4>
                          <p>{transaction.category} • {transaction.date.toLocaleDateString()}</p>
                        </div>
                        <div className="transaction-amount">
                          {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                    {transactions.length > 5 && (
                      <div className="view-all-link" onClick={() => setActiveTab('transactions')}>
                        View all {transactions.length} transactions
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="empty-state">No transactions yet. Add one to get started!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="transactions-tab">
            <div className="tab-header">
              <h2>All Transactions</h2>
              <div className="tab-actions">
                <button 
                  className="btn btn-filter"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FiFilter /> Filter & Sort
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="filter-section">
                <div className="filter-group">
                  <label>Category</label>
                  <select 
                    value={filterCategory} 
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {[...new Set([...expenseCategories, ...incomeCategories])].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>Sort By</label>
                  <div className="sort-options">
                    <button 
                      className={`sort-btn ${sortBy === 'date' ? 'active' : ''}`} 
                      onClick={() => handleSort('date')}
                    >
                      Date {sortBy === 'date' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                    <button 
                      className={`sort-btn ${sortBy === 'amount' ? 'active' : ''}`} 
                      onClick={() => handleSort('amount')}
                    >
                      Amount {sortBy === 'amount' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                    <button 
                      className={`sort-btn ${sortBy === 'category' ? 'active' : ''}`} 
                      onClick={() => handleSort('category')}
                    >
                      Category {sortBy === 'category' && <span>{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                    </button>
                  </div>
                </div>
                <button className="btn btn-reset" onClick={resetFilters}>
                  Reset Filters
                </button>
              </div>
            )}
            
            {filteredTransactions.length > 0 ? (
              <div className="transaction-table">
                <div className="transaction-header">
                  <div className="header-item" onClick={() => handleSort('description')}>
                    Description {sortBy === 'description' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="header-item" onClick={() => handleSort('category')}>
                    Category {sortBy === 'category' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="header-item" onClick={() => handleSort('date')}>
                    Date {sortBy === 'date' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="header-item" onClick={() => handleSort('amount')}>
                    Amount {sortBy === 'amount' && <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>}
                  </div>
                  <div className="header-item">
                    Actions
                  </div>
                </div>
                {filteredTransactions.map(transaction => (
                  <div className="transaction-row" key={transaction.id}>
                    <div className="row-item">{transaction.description}</div>
                    <div className="row-item">
                      <span className={`category-tag ${transaction.type}`}>{transaction.category}</span>
                    </div>
                    <div className="row-item">{transaction.date.toLocaleDateString()}</div>
                    <div className={`row-item amount ${transaction.type}`}>
                      {transaction.type === 'income' ? '+' : '-'} ${transaction.amount.toFixed(2)}
                    </div>
                    <div className="row-item actions">
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteTransaction(transaction.id, transaction.description)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">
                {filterCategory 
                  ? `No transactions found for category "${filterCategory}". Try a different filter.` 
                  : "No transactions yet. Add one to get started!"}
              </p>
            )}
          </div>
        )}

        {/* Budgets Tab */}
        {activeTab === 'budgets' && (
          <div className="budgets-tab">
            <h2>Budget Management</h2>
            {budgets.length > 0 ? (
              <div className="budget-table">
                <div className="budget-header">
                  <div className="header-item">Category</div>
                  <div className="header-item">Budget Amount</div>
                  <div className="header-item">Spent Amount</div>
                  <div className="header-item">Remaining</div>
                  <div className="header-item">Status</div>
                  <div className="header-item">Actions</div>
                </div>
                {budgets.map(budget => {
                  const spentAmount = transactions
                    .filter(t => t.type === 'expense' && t.category === budget.category)
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                  const remaining = budget.amount - spentAmount;
                  const percentUsed = (spentAmount / budget.amount) * 100;
                  
                  return (
                    <div className="budget-row" key={budget.id}>
                      <div className="row-item">{budget.category}</div>
                      <div className="row-item">${budget.amount.toFixed(2)}</div>
                      <div className="row-item">${spentAmount.toFixed(2)}</div>
                      <div className="row-item">${remaining.toFixed(2)}</div>
                      <div className="row-item">
                        <div className="progress-mini">
                          <div 
                            className={`progress-fill ${percentUsed > 90 ? 'danger' : percentUsed > 70 ? 'warning' : 'safe'}`}
                            style={{width: `${Math.min(percentUsed, 100)}%`}}
                          ></div>
                        </div>
                        <div className="progress-percentage">
                          {percentUsed.toFixed(0)}%
                        </div>
                      </div>
                      <div className="row-item actions">
                        <button 
                          className="btn-edit" 
                          onClick={() => {
                            setBudgetCategory(budget.category);
                            setBudgetAmount(budget.amount.toString());
                            setShowBudgetModal(true);
                          }}
                        >
                          Edit
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteBudget(budget.id, budget.category)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="empty-state">No budgets set yet. Create one to start tracking!</p>
            )}
            
            <div className="budget-tips">
              <h3>Budget Management Tips</h3>
              <div className="tips-container">
                <div className="tip-card">
                  <h4>50/30/20 Rule</h4>
                  <p>Try allocating 50% of your income to needs, 30% to wants, and 20% to savings or debt repayment.</p>
                </div>
                <div className="tip-card">
                  <h4>Track Every Expense</h4>
                  <p>For accurate budgeting, make sure to record even small expenses as they can add up quickly.</p>
                </div>
                <div className="tip-card">
                  <h4>Review Regularly</h4>
                  <p>Take time each week to review your spending and adjust your budget as needed.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="settings-tab">
            <h2>Account Settings</h2>
            <div className="settings-card">
              <div className="settings-row">
                <h3>Profile Information</h3>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>User ID:</strong> {user?.uid}</p>
                <p><strong>Account Created:</strong> {user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div className="settings-row">
                <h3>Data Management</h3>
                <div className="settings-actions">
                  <button className="btn btn-secondary" onClick={fetchData}>
                    <FiRefreshCw /> Refresh Data
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all your transaction data? This action cannot be undone.')) {
                        // Implement data clearing functionality if needed
                        alert('This feature is not implemented in the demo.');
                      }
                    }}
                  >
                    Clear All Data
                  </button>
                </div>
              </div>
              <div className="settings-row">
                <h3>Preferences</h3>
                <p>Coming soon: Currency preferences, notification settings, and more!</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Add Transaction</h2>
            <form onSubmit={handleAddTransaction}>
              <div className="form-group">
                <label>Type</label>
                <div className="transaction-type-toggle">
                  <button 
                    type="button"
                    className={`toggle-btn ${transactionType === 'expense' ? 'active' : ''}`}
                    onClick={() => setTransactionType('expense')}
                  >
                    Expense
                  </button>
                  <button 
                    type="button"
                    className={`toggle-btn ${transactionType === 'income' ? 'active' : ''}`}
                    onClick={() => setTransactionType('income')}
                  >
                    Income
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Amount</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="">Select Category</option>
                  {transactionType === 'expense' ? (
                    expenseCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  ) : (
                    incomeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))
                  )}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input 
                  type="text" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  required
                />
              </div>
              {errorMessage && (
                <div className="form-error-message">
                  <FiAlertCircle /> {errorMessage}
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    resetTransactionForm();
                    setShowAddModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Budget Modal */}
      {showBudgetModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{budgetCategory ? 'Update Budget' : 'Set New Budget'}</h2>
            <form onSubmit={handleAddBudget}>
              <div className="form-group">
                <label>Category</label>
                <select 
                  value={budgetCategory} 
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  required
                  disabled={budgetCategory !== ''}
                >
                  <option value="">Select Category</option>
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Budget Amount</label>
                <input 
                  type="number" 
                  min="0.01" 
                  step="0.01" 
                  value={budgetAmount} 
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="Enter budget amount"
                  required
                />
              </div>
              {errorMessage && (
                <div className="form-error-message">
                  <FiAlertCircle /> {errorMessage}
                </div>
              )}
              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => {
                    resetBudgetForm();
                    setShowBudgetModal(false);
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : budgetCategory ? 'Update Budget' : 'Save Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetDashboard;
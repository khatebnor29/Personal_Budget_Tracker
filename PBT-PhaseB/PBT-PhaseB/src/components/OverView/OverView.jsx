import React from 'react';
import { Link } from 'react-router-dom';
import './OverView.css';

const OverView = () => {
  return (
    <div className="overview-container">
      <header className="overview-header">
        <div className="logo">
          <h1>Personal<span>BudgetTracker</span></h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/overview" className="active">Overview</Link></li>
            <li><Link to="/login" className="login-btn">Login</Link></li>
          </ul>
        </nav>
      </header>

      <div className="page-title">
        <h1>About Personal Budget Tracker</h1>
        <p>Your simple solution for financial management</p>
      </div>

      <div className="about-section">
        <div className="about-content">
          <h2>Take Control of Your Financial Future</h2>
          <p>
            Personal Budget Tracker is a comprehensive financial management tool designed to help you track expenses, 
            plan budgets, and achieve your savings goals. Our intuitive platform makes it easy to visualize your 
            spending patterns and make informed financial decisions.
          </p>
        </div>
      </div>

      <div className="features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Expense Tracking</h3>
            <p>Record and categorize all your expenses. Import transactions from your bank or add them manually.</p>
          </div>

          <div className="feature-card">
            <h3>Visual Reports</h3>
            <p>View detailed charts and graphs to understand your spending patterns and financial trends.</p>
          </div>

          <div className="feature-card">
            <h3>Budget Creation</h3>
            <p>Set up monthly budgets for different categories and track your progress throughout the month.</p>
          </div>

          <div className="feature-card">
            <h3>Savings Goals</h3>
            <p>Define financial targets like saving for a trip, a car, or an emergency fund and monitor your progress.</p>
          </div>

          <div className="feature-card">
            <h3>Bill Management</h3>
            <p>Never miss a payment again with bill tracking, reminders, and scheduled payments.</p>
          </div>

          <div className="feature-card">
            <h3>Smart Insights</h3>
            <p>Receive personalized suggestions to optimize your spending and increase your savings based on your habits.</p>
          </div>
        </div>
      </div>

      <div className="cta-banner">
        <h2>Ready to take control of your finances?</h2>
        <p>Join thousands of users who have transformed their financial habits with Personal Budget Tracker.</p>
        <div className="cta-buttons">
          <Link to="/signup" className="primary-button">Create Free Account</Link>
          <Link to="/login" className="secondary-button">Sign In</Link>
        </div>
      </div>

      <footer className="overview-footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Personal<span>BudgetTracker</span></h2>
            <p>The simplest way to manage your money.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Personal Budget Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default OverView;
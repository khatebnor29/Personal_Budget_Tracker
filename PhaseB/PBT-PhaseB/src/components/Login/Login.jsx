import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from "../../Firebase/firebase";
import { signInWithEmailAndPassword } from 'firebase/auth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/BudgetDashboard');
    } catch (error) {
      setError('Invalid email or password. Please try again.');
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your Budget Tracker account</p>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required 
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              required 
            />
          </div>
          
          <div className="forgot-password">
            <a href="/forgot-password">Forgot Password?</a>
          </div>
          
          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <div className="signup-prompt">
          <p>Don't have an account? <a href="/signup">Sign Up</a></p>
        </div>
      </div>
      
      <div className="login-image">
        <div className="quote-container">
          <div className="quote">
            <p>"Take control of your finances and achieve your goals with Personal Budget Tracker."</p>
          </div>
          <div className="features">
            <div className="feature">
              <div className="feature-icon">📊</div>
              <p>Track expenses in real-time</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💰</div>
              <p>Set and achieve savings goals</p>
            </div>
            <div className="feature">
              <div className="feature-icon">📱</div>
              <p>Access from any device</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
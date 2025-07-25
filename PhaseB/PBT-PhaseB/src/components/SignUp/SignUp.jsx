import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { auth, database } from '../../Firebase/firebase';
import './SignUp.css';

const SignUp = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setLoading(false);
      return setError('Passwords do not match');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // ✅ Set user's display name in Firebase Auth
      await updateProfile(user, { displayName });

      // ✅ Save user profile in Realtime Database
      await set(ref(database, `users/${user.uid}/profile`), {
        name: displayName,
        email: user.email
      });

      navigate('/'); // Redirect after successful signup
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <h1>Create Account</h1>
          <p>Join Personal Budget Tracker today</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Create a password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="login-prompt">
          <p>Already have an account? <a href="/login">Sign In</a></p>
        </div>

        <div className="terms-privacy">
          <p>
            By creating an account, you agree to our <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>
          </p>
        </div>
      </div>

      <div className="signup-benefits">
        <div className="benefits-content">
          <h2>Benefits of Joining</h2>
          <ul className="benefits-list">
            <li>
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h3>Track All Your Expenses</h3>
                <p>Keep a detailed record of where your money goes</p>
              </div>
            </li>
            <li>
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h3>Set Financial Goals</h3>
                <p>Create savings targets and track your progress</p>
              </div>
            </li>
            <li>
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h3>Visualize Your Finances</h3>
                <p>See clear charts and reports of your spending habits</p>
              </div>
            </li>
            <li>
              <div className="benefit-icon">✓</div>
              <div className="benefit-text">
                <h3>Plan for the Future</h3>
                <p>Make informed decisions about your financial future</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SignUp;

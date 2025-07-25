import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    setIsVisible(true);
    
    const handleScroll = () => {
      const scrollElements = document.querySelectorAll('.scroll-animation');
      
      scrollElements.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
          el.classList.add('active');
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll);
    // Trigger once for elements already in view
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGetStarted = () => {
    navigate('/signup');
  };

  const handleLearnMore = () => {
    // Smooth scroll to features section
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className={`home-container ${isVisible ? 'visible' : ''}`}>
      <header className="header">
        <div className="logo">
          <h1>Personal<span>BudgetTracker</span></h1>
        </div>
        <nav className="main-nav">
          <ul>
            <li><Link to="/" className="active">Home</Link></li>
            <li><Link to="/overview">OverView</Link></li>
            <li><Link to="/login" className="login-btn">Login</Link></li>
          </ul>
        </nav>
        <div className="mobile-menu-toggle">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <h1 className="scroll-animation">Take Control of Your Finances</h1>
          <p className="scroll-animation">The simplest way to manage your money, track spending, and achieve your financial goals.</p>
          <div className="cta-buttons scroll-animation">
            <button className="primary-btn" onClick={handleGetStarted}>Get Started - It's Free</button>
            <button className="secondary-btn" onClick={handleLearnMore}>Learn More</button>
          </div>
        </div>
        <div className="hero-image scroll-animation">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
              <div className="preview-dot"></div>
            </div>
            <div className="preview-content">
              <div className="preview-chart">
                <div className="chart-bar tall"></div>
                <div className="chart-bar medium"></div>
                <div className="chart-bar short"></div>
                <div className="chart-bar tall"></div>
                <div className="chart-bar medium"></div>
              </div>
              <div className="preview-data">
                <div className="data-row"></div>
                <div className="data-row"></div>
                <div className="data-row"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features-section">
        <div className="section-header">
          <h2 className="scroll-animation">Simple Tools for Financial Success</h2>
          <p className="scroll-animation">Our intuitive features help you manage every aspect of your personal finances.</p>
        </div>
        <div className="features-grid">
          <div className="feature-card scroll-animation">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14.5 9C14.5 7.61929 13.3807 6.5 12 6.5C10.6193 6.5 9.5 7.61929 9.5 9C9.5 10.3807 10.6193 11.5 12 11.5V11.5C13.3807 11.5 14.5 12.6193 14.5 14C14.5 15.3807 13.3807 16.5 12 16.5C10.6193 16.5 9.5 15.3807 9.5 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 5V6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16.5V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Track Expenses</h3>
            <p>Easily log and categorize your daily spending to understand exactly where your money is going.</p>
          </div>
          <div className="feature-card scroll-animation">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 22V12M5 12V2M5 12H10M19 22V16M19 8V2M19 16V8H14M19 16H14M19 8H14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Set Savings Goals</h3>
            <p>Define financial targets like saving for a trip, a car, or an emergency fund and monitor your progress.</p>
          </div>
          <div className="feature-card scroll-animation">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M18.36 4.63989L15.536 7.46389" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 12.0005H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M19.36 18.3604L16.536 15.5364" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 16V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.46443 15.5361L5.64043 18.3601" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 12.0005H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.64 5.64014L8.464 8.46414" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Visualize Spending</h3>
            <p>Use dynamic charts and graphs to gain insights into your income, expenses, and saving patterns over time.</p>
          </div>
          <div className="feature-card scroll-animation">
            <div className="feature-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11L12 14L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3>Stay Accountable</h3>
            <p>Get a clear view of monthly budgets, avoid overspending, and plan better for future financial decisions.</p>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="section-header">
          <h2 className="scroll-animation">How It Works</h2>
          <p className="scroll-animation">Getting started with Budget Tracker is easy and takes just minutes.</p>
        </div>
        <div className="steps-container">
          <div className="step scroll-animation">
            <div className="step-number">1</div>
            <h3>Create Your Account</h3>
            <p>Sign up for free and set up your profile with basic financial information.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step scroll-animation">
            <div className="step-number">2</div>
            <h3>Track Your Expenses</h3>
            <p>Enter your income and expenses to start building your financial picture.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step scroll-animation">
            <div className="step-number">3</div>
            <h3>Set Your Goals</h3>
            <p>Define what you're saving for and create realistic budget categories.</p>
          </div>
          <div className="step-connector"></div>
          <div className="step scroll-animation">
            <div className="step-number">4</div>
            <h3>Gain Insights</h3>
            <p>Review visual reports and analytics to optimize your spending habits.</p>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="scroll-animation">What Our Users Say</h2>
          <p className="scroll-animation">Join thousands who have transformed their financial habits.</p>
        </div>
        <div className="testimonials-container">
          <div className="testimonial-card scroll-animation">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">Budget Tracker helped me save $5,000 for my dream vacation in just 6 months. The visual charts made it easy to see where I could cut back.</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Sarah J.</h4>
                <p>Using since 2023</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card scroll-animation">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">As a freelancer with irregular income, this app has been a game-changer. I finally have my emergency fund fully funded and feel financially secure.</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Michael T.</h4>
                <p>Using since 2022</p>
              </div>
            </div>
          </div>
          <div className="testimonial-card scroll-animation">
            <div className="quote-icon">"</div>
            <p className="testimonial-text">The simplicity is what makes it work. After trying complex budgeting apps, this one actually helped me stick with it and improve my habits.</p>
            <div className="testimonial-author">
              <div className="author-avatar"></div>
              <div className="author-info">
                <h4>Emily R.</h4>
                <p>Using since 2023</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content scroll-animation">
          <h2>Ready to Take Control of Your Finances?</h2>
          <p>Join thousands of users who have transformed their financial habits with Budget Tracker.</p>
          <Link to="/signup">
            <button className="primary-btn">Start Your Free Account</button>
          </Link>
          <p className="no-credit-card">No credit card required. Free forever.</p>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <h2>Personal<span>BudgetTracker</span></h2>
            <p>The simplest way to manage your money.</p>
          </div>
          <div className="footer-links">
            <div className="link-column">
              <h3>Site Map</h3>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/overview">OverView</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
            <div className="link-column">
              <h3>Resources</h3>
              <ul>
                <li><Link to="/blog">Financial Tips</Link></li>
                <li><Link to="/help">Help Center</Link></li>
                <li><Link to="/faq">FAQs</Link></li>
              </ul>
            </div>
            <div className="link-column">
              <h3>Legal</h3>
              <ul>
                <li><Link to="/terms">Terms of Service</Link></li>
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/security">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Personal Budget Tracker. All rights reserved.</p>
          <div className="social-icons">
            <a href="#" className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 8H15.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 12.5C16 14.433 14.433 16 12.5 16H9.5C7.567 16 6 14.433 6 12.5C6 10.567 7.567 9 9.5 9H12.5C14.433 9 16 10.567 16 12.5Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9.19795 21.5H13.198V13.4901H16.8021L17.198 9.50977H13.198V7.5C13.198 6.94772 13.6457 6.5 14.198 6.5H17.198V2.5H14.198C11.4365 2.5 9.19795 4.73858 9.19795 7.5V9.50977H7.19795L6.80206 13.4901H9.19795V21.5Z" fill="currentColor" />
              </svg>
            </a>
            <a href="#" className="social-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.162 5.65593C21.3985 5.99362 20.589 6.2154 19.76 6.31393C20.6337 5.79136 21.2877 4.96894 21.6 3.99993C20.78 4.48793 19.881 4.82993 18.944 5.01493C18.3146 4.34151 17.4803 3.89489 16.5709 3.74451C15.6615 3.59413 14.7279 3.74842 13.9153 4.18338C13.1026 4.61834 12.4564 5.30961 12.0771 6.14972C11.6978 6.98983 11.6067 7.93171 11.818 8.82893C10.1551 8.74558 8.52832 8.31345 7.04328 7.56059C5.55823 6.80773 4.24812 5.75097 3.19799 4.45893C2.82628 5.09738 2.63095 5.82315 2.63199 6.56193C2.63199 8.01193 3.36999 9.29293 4.49199 10.0429C3.828 10.022 3.17862 9.84271 2.59799 9.51993V9.57193C2.59819 10.5376 2.93236 11.4735 3.54384 12.221C4.15532 12.9684 5.00647 13.4814 5.95299 13.6729C5.33661 13.84 4.6903 13.8646 4.06299 13.7449C4.32986 14.5762 4.85 15.3031 5.55058 15.824C6.25117 16.345 7.09712 16.6337 7.96999 16.6499C7.10247 17.3313 6.10917 17.8349 5.04687 18.1321C3.98458 18.4293 2.87412 18.5142 1.77899 18.3819C3.69069 19.6114 5.91609 20.2641 8.18899 20.2619C15.882 20.2619 20.089 13.8889 20.089 8.36193C20.089 8.18193 20.084 7.99993 20.076 7.82193C20.8949 7.2301 21.6016 6.49695 22.163 5.65693L22.162 5.65593Z" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
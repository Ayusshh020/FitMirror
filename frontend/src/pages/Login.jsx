import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginApi, firebaseAuthApi } from '../api';
import { loginWithFirebaseEmail, isConfigured as isFirebaseConfigured } from '../config/firebase';
import { Sparkles, Mail, Lock, LogIn, Shield } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await loginApi({ email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.role === 'retailer') {
        navigate('/retailer');
      } else {
        navigate('/garments');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFirebaseLogin = async () => {
    if (!email || !password) {
      setError('Please fill in Email Address and Password to authenticate with Firebase.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const idToken = await loginWithFirebaseEmail(email, password);
      const res = await firebaseAuthApi(idToken);
      login(res.data.user, res.data.token);
      navigate('/garments');
    } catch (err) {
      setError(err.message || 'Firebase authentication failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickLogin = (userEmail) => {
    setEmail(userEmail);
    setPassword('password123');
  };

  return (
    <div className="auth-page flex-center">
      <div className="auth-card glass-panel">
        <div className="auth-header text-center">
          <div className="logo-badge inline-flex flex-center">
            <Sparkles size={28} className="text-accent" />
          </div>
          <h2>Welcome Back</h2>
          <p className="subtitle">Sign in to access your Virtual Fitting Room</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input
                type="email"
                className="form-control"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
            {submitting ? <div className="spinner-sm"></div> : <LogIn size={18} />}
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={handleFirebaseLogin}
            className="btn btn-outline-purple btn-block mt-3"
            disabled={submitting}
          >
            <Shield size={18} />
            <span>Sign In via Firebase (Email/Pass)</span>
          </button>
        </form>

        <div className="quick-seed-buttons">
          <p className="quick-label">⚡ Demo Accounts (Click to Autofill):</p>
          <div className="btn-group-sm">
            <button
              className="btn btn-xs btn-outline-info"
              onClick={() => handleQuickLogin('user@fitmirror.com')}
            >
              Demo User (User)
            </button>
            <button
              className="btn btn-xs btn-outline-purple"
              onClick={() => handleQuickLogin('retailer@fitmirror.com')}
            >
              Demo Retailer (Retailer)
            </button>
          </div>
        </div>

        <div className="auth-footer text-center">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;

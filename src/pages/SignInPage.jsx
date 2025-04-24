import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './SignInPage.css';

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();


  const from = location.state?.from?.pathname || "/";

  const handleSignIn = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) throw signInError;
      navigate(from, { replace: true });

    } catch (error) {
      console.error('Error signing in:', error.message);
      if (error.message.includes("Invalid login credentials")) {
        setError("Invalid email or password.");
      } else {
        setError(`Sign in failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <h2>Sign In</h2>
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSignIn} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

export default SignInPage;
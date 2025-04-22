// src/pages/SignInPage.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path is correct! (Should be ../supabaseClient)
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './SignInPage.css'; // Make sure you have this CSS file or remove/comment out this import

function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get location state

  // Determine where to redirect after login (handles redirect from ProtectedRoute)
  const from = location.state?.from?.pathname || "/";

  // Async function to handle the form submission
  const handleSignIn = async (event) => {
    event.preventDefault(); // Prevent default page reload
    setError(null); // Clear previous errors
    setLoading(true); // Set loading state

    try {
      // Attempt to sign in with Supabase Auth
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      // If Supabase returns an error, throw it to the catch block
      if (signInError) throw signInError;

      // Sign-in successful! Navigate to the 'from' location (previous page or home)
      // The AuthProvider will detect the session change automatically
      navigate(from, { replace: true }); // Use replace to clean up history

    } catch (error) {
      // Handle errors during sign-in
      console.error('Error signing in:', error.message);
      // Provide user-friendly error messages
      if (error.message.includes("Invalid login credentials")) {
          setError("Invalid email or password.");
      } else {
          setError(`Sign in failed: ${error.message}`);
      }
    } finally {
      // Always set loading back to false, whether success or error
      setLoading(false);
    }
  };

  // JSX for the component's UI
  return (
    <div className="container auth-page"> {/* Ensure CSS classes match your CSS file */}
      <h2>Sign In</h2>

      {/* Display error message if one exists */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSignIn} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required // HTML5 validation
            disabled={loading} // Disable input while loading
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required // HTML5 validation
            disabled={loading} // Disable input while loading
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {/* Show different text based on loading state */}
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Link to switch to the Sign Up page */}
      <p className="auth-switch">
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
}

// Export the component for use in App.jsx
export default SignInPage;
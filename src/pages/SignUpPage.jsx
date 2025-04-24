import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; 
import { useNavigate, Link } from 'react-router-dom';
import './SignUpPage.css'; 

function SignUpPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSignUp = async (event) => {
    event.preventDefault();
    setError(null);

    if (!username.trim()) {
        setError('Username is required.');
        return;
    }
    if (!email || !password) {
      setError('Email and Password are required.');
      return;
    }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username.trim(),
          }
        }
      });

      if (signUpError) throw signUpError;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
         setError("Signup successful, but please check your email to confirm (though confirmation is likely disabled for dev).");
         alert("Signup successful!"); 
         navigate('/'); 
      } else if (data.user) {
          alert('Sign up successful!');
          navigate('/');
      } else {
           setError("An unknown error occurred during sign up."); 
      }

    } catch (error) {
      console.error('Error signing up:', error.message);
      setError(`Sign up failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container auth-page">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSignUp} className="auth-form">
         <div className="form-group">
           <label htmlFor="username">Username</label>
           <input
             type="text"
             id="username"
             value={username}
             onChange={(e) => setUsername(e.target.value)}
             required
             disabled={loading}
           />
         </div>
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
            minLength="6" 
            disabled={loading}
          />
        </div>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
      <p className="auth-switch">
        Already have an account? <Link to="/signin">Sign In</Link>
      </p>
    </div>
  );
}

export default SignUpPage;
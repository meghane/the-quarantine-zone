// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth(); // Get user session and loading state
  const location = useLocation(); // Get the current location

  // 1. Wait for authentication check to complete
  if (loading) {
    // You can return a loading spinner or null while checking auth state
    return <div>Loading authentication...</div>;
    // Or return null;
  }

  // 2. If loading is done and there's no user, redirect to sign-in
  if (!user) {
    // Redirect them to the /signin page, but save the current location they were
    // trying to go to in `state.from` so we can send them back there after login.
    return <Navigate to="/signin" replace state={{ from: location }} />;
  }

  // 3. If loading is done and user exists, render the child component
  return children;
}

export default ProtectedRoute;
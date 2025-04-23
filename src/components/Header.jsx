// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; // We will update this CSS file

function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (event) => {
    event.preventDefault();
    const searchTerm = searchInput.trim();
    if (searchTerm) {
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      alert('Sign out successful!'); // Using alert as requested previously
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      alert(`Sign out failed: ${error.message}`);
    }
  };

  return (
    <header className="app-header">
      {/* Container for the centered title */}
      <div className="title-container container">
        <h1 className="site-title">
          <Link to="/">The Quarantine Zone</Link>
        </h1>
      </div>

      {/* Container for search and navigation actions */}
      <div className="actions-container container">
        {/* Search Form */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            name="search"
            placeholder="Search Posts by Title..."
            aria-label="Search Posts"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button type="submit">Search</button>
        </form>

        {/* Navigation */}
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            {/* Conditionally render Create Post OR Sign Up/Sign In */}
            {user ? (
              <li><Link to="/create">Create New Post</Link></li>
            ) : (
              <>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/signin">Sign In</Link></li>
              </>
            )}
            {/* Conditionally render User Info/Sign Out */}
            {user && profile?.username && <li className="nav-username">Hi, {profile.username}!</li>}
            {user && <li><button onClick={handleSignOut} className="nav-button">Sign Out</button></li>}
            {/* Added Info Link - visible always */}
            <li><Link to="/info">Info</Link></li> {/* Assuming /info is your desired path */}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
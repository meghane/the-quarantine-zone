
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Header.css'; 

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
      alert('Sign out successful!'); 
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      alert(`Sign out failed: ${error.message}`);
    }
  };

  return (
    <header className="app-header">
      <div className="title-container container">
        <h1 className="site-title">
          <Link to="/">The Quarantine Zone</Link>
        </h1>
      </div>

      <div className="actions-container container">
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

        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            {user ? (
              <li><Link to="/create">Create New Post</Link></li>
            ) : (
              <>
                <li><Link to="/signup">Sign Up</Link></li>
                <li><Link to="/signin">Sign In</Link></li>
              </>
            )}
            {user && profile?.username && <li className="nav-username">Hi, {profile.username}!</li>}
            {user && <li><button onClick={handleSignOut} className="nav-button">Sign Out</button></li>}
            <li><Link to="/info">Info</Link></li> 
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
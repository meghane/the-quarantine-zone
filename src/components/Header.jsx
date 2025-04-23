
import React, { useState } from 'react'; // 👈 Import useState
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // 👈 Import useAuth
import './Header.css';

function Header() {
  const { user, profile, signOut } = useAuth(); // 👈 Get user, profile and signOut from context
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (event) => {
    event.preventDefault(); // Prevent default form submission (page reload)
    const searchTerm = searchInput.trim(); // Get trimmed search term from state

    if (searchTerm) {
      // Navigate to home page with search query parameter
      navigate(`/?search=${encodeURIComponent(searchTerm)}`);
    } else {
      // If search term is empty, navigate to home page without search parameter
      navigate('/');
    }
    // Optionally clear search input after submission?
    // setSearchInput('');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      alert('Sign out successful!');
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
      // Handle error appropriately
    }
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="site-title">
          <Link to="/">The Quarantine Zone</Link>
        </h1>
        {/* Keep Search Form */}
        <form className="search-form" onSubmit={handleSearch}>
          <input
            type="search"
            name="search"
            placeholder="Search Posts by Title..."
            aria-label="Search Posts"
            value={searchInput} // 👈 Control input value
            onChange={(e) => setSearchInput(e.target.value)} // 👈 Update state on change
          />
          <button type="submit">Search</button>
        </form>

        {/* 👇 Update Navigation based on auth state */}
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            {user ? (
              // Logged In Links
              <>
                <li><Link to="/create">Create New Post</Link></li>
                {/* Display Username - using profile state which gets username from metadata */}
                {profile?.username && <li className="nav-username">Hi, {profile.username}!</li>}
                <li><button onClick={handleSignOut} className="nav-button">Sign Out</button></li>
              </>
            ) : (
              // Logged Out Links
              <>
                <li><Link to="/signin">Sign In</Link></li>
                <li><Link to="/signup">Sign Up</Link></li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Create this CSS file for Header-specific styles

function Header() {
  const handleSearch = (event) => {
    event.preventDefault();
    // Add search logic here later
    console.log("Searching for:", event.target.elements.search.value);
  };

  return (
    <header className="app-header">
      <div className="container header-container">
        <h1 className="site-title">
          <Link to="/">The Quarantine Zone</Link>
        </h1>
        <form className="search-form" onSubmit={handleSearch}>
          <input type="search" name="search" placeholder="Search Posts..." aria-label="Search Posts"/>
          <button type="submit">Search</button>
        </form>
        <nav className="main-nav">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/create">Create New Post</Link></li> {/* Link to future page */}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
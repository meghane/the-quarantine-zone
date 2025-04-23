// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import SortControls from '../components/SortControls'; // Adjust path if needed
import PostPreview from '../components/PostPreview'; // Adjust path if needed
import { supabase } from '../supabaseClient'; // Adjust path if needed
import './HomePage.css';
import { useSearchParams } from 'react-router-dom';

// Helper function for relative time formatting
function timeAgo(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    // Check if date is valid before calculating
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000; // years
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000; // months
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400; // days
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600; // hours
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60; // minutes
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    // Handle future posts or posts created exactly now
    if (seconds < 0) return `in ${Math.floor(Math.abs(seconds))} seconds`;
    return Math.max(0, Math.floor(seconds)) + " seconds ago"; // Ensure non-negative seconds
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid date';
  }
}


function HomePage() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // Default sort
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams(); // 👈 Get search params hook
  const searchTerm = searchParams.get('search') || '';

  // useEffect hook to fetch posts when component mounts or sortBy changes
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Query the VIEW posts_with_author_username instead of the 'posts' table
        let query = supabase
          .from('posts_with_author_username') // Query the view
          .select('*'); // Select all columns from the view (includes author_username)


        if (searchTerm) {
          // Use ilike for case-insensitive search
          // % is wildcard: searches for term anywhere in title
          query = query.ilike('title', `%${searchTerm}%`);
        }

        // Apply sorting (using columns available in the view)
        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'popular') {
          query = query.order('upvotes', { ascending: false })
            .order('created_at', { ascending: false });
        }

        // Execute the query
        const { data, error: fetchError } = await query;

        // Handle fetch error
        if (fetchError) {
          throw fetchError;
        }

        // Set the fetched posts data to state
        setPosts(data || []);

      } catch (error) {
        // Handle any errors during the process
        console.error("Error fetching posts:", error);
        setError(`Failed to fetch posts: ${error.message}`);
        setPosts([]); // Clear posts on error
      } finally {
        // Stop loading indicator
        setIsLoading(false);
      }
    };

    fetchPosts(); // Run the fetch function

  }, [sortBy, searchTerm]); // Re-run effect if 'sortBy' changes

  // --- Conditional Rendering Logic ---
  let content;
  if (isLoading) {
    content = <p className="loading-message" style={{ textAlign: 'center', margin: '2rem' }}>Loading posts...</p>;
  } else if (error) {
    content = <p className="error-message" style={{ color: 'red', textAlign: 'center', margin: '2rem' }}>{error}</p>;
  } else if (posts.length === 0) {
    content = <p className="no-posts-message" style={{ textAlign: 'center', margin: '2rem' }}>No posts yet! Be the first to create one.</p>;
  } else {
    // Map over the posts data and render a PostPreview for each one
    content = (
      <section className="post-feed">
        {posts.map(post => (
          <PostPreview
            key={post.id}
            id={post.id}
            title={post.title}
            upvotes={post.upvotes}
            time={timeAgo(post.created_at)}
            // 👇 Pass the author_username field directly from the view data
            //    to the prop named author_username in PostPreview
            author_username={post.author_username ?? 'Unknown User'}
          />
        ))}
      </section>
    );
  }

  // Render the page
  return (
    <div className="container home-page">
      {/* Render SortControls only if data loaded without errors */}
      {!isLoading && !error && <SortControls currentSort={sortBy} onSortChange={setSortBy} />}
      {/* Render the main content (loading/error/no posts/post list) */}
      {content}
    </div>
  );
}

export default HomePage;
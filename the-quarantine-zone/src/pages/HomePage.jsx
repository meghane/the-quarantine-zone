// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import SortControls from '../components/SortControls';
import PostPreview from '../components/PostPreview';
import { supabase } from '../supabaseClient'; // 👈 Import Supabase client
import './HomePage.css';

// --- REMOVE Placeholder Data ---
// const dummyPosts = [ ... ]; // Delete this whole array
// --- End REMOVE ---

// Helper function for relative time (keep this or adapt as needed)
function timeAgo(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + " years ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + " months ago";
  interval = seconds / 86400;
  // Handle potential future dates slightly more gracefully
  if (interval > 1 || interval < -1) return Math.floor(Math.abs(interval)) + " days ago";
  interval = seconds / 3600;
   if (interval > 1 || interval < -1) return Math.floor(Math.abs(interval)) + " hours ago";
  interval = seconds / 60;
   if (interval > 1 || interval < -1) return Math.floor(Math.abs(interval)) + " minutes ago";
  return Math.floor(Math.abs(seconds)) + " seconds ago";
}


function HomePage() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'popular'
  const [isLoading, setIsLoading] = useState(true); // 👈 Add loading state, start as true
  const [error, setError] = useState(null); // 👈 Add error state

  // 👇 useEffect to fetch posts from Supabase
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true); // Start loading
      setError(null); // Clear previous errors

      try {
        // Base query
        let query = supabase
          .from('posts')
          .select('*'); // Select all columns

        // Apply sorting based on sortBy state
        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'popular') {
          query = query.order('upvotes', { ascending: false });
          // Optional: Add secondary sort by date for posts with same upvotes
          query = query.order('created_at', { ascending: false });
        }

        // Execute query
        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError; // Throw error to be caught below
        }

        // Set fetched data to state
        setPosts(data || []); // Use empty array if data is null

      } catch (error) {
        console.error("Error fetching posts:", error.message);
        setError(`Failed to fetch posts: ${error.message}`);
        setPosts([]); // Clear posts on error
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchPosts(); // Call the async function

  }, [sortBy]); // 👈 Re-run effect when sortBy changes

  // --- Render Logic ---
  let content;
  if (isLoading) {
    content = <p className="loading-message">Loading posts...</p>;
  } else if (error) {
    content = <p className="error-message">{error}</p>;
  } else if (posts.length === 0) {
    content = <p className="no-posts-message">No posts yet! Be the first to create one.</p>;
  } else {
    content = (
      <section className="post-feed">
        {posts.map(post => (
          <PostPreview
            key={post.id}
            id={post.id}
            title={post.title}
            upvotes={post.upvotes}
            // Use the timeAgo function with the 'created_at' field from Supabase
            time={timeAgo(post.created_at)}
            // author={post.author_id} // If you add author later
          />
        ))}
      </section>
    );
  }


  return (
    <div className="container home-page">
      {/* Render SortControls only if not loading and no error */}
      {!isLoading && !error && <SortControls currentSort={sortBy} onSortChange={setSortBy} />}
      {/* Render the determined content */}
      {content}
    </div>
  );
}

export default HomePage;
// src/pages/PostDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; // useParams to get ID from URL
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // To check logged-in user later
import './PostDetailPage.css'; // We'll create this CSS file

// Reuse or import the timeAgo function
function timeAgo(dateString) {
  if (!dateString) return '';
  try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      const seconds = Math.floor((new Date() - date) / 1000);
      let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
      interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
      interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
      interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
      interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
      if (seconds < 0) return `in ${Math.floor(Math.abs(seconds))} seconds`;
      return Math.max(0, Math.floor(seconds)) + " seconds ago";
  } catch (e) { return 'Invalid date'; }
}

function PostDetailPage() {
  const { postId } = useParams(); // Get the 'postId' parameter from the URL
  const { user } = useAuth(); // Get current user later for interactions/edit/delete
  const navigate = useNavigate(); // For navigation actions later

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect to fetch the specific post data when the component mounts or postId changes
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      setPost(null); // Clear previous post data

      try {
        // Fetch from the view to get author username easily
        const { data, error: fetchError } = await supabase
          .from('posts_with_author_username') // Query the view
          .select('*')
          .eq('id', postId) // Filter by the postId from the URL
          .single(); // Expect only one row (or null)

        if (fetchError) {
           // Handle potential errors, e.g., RLS issues or network problems
            if (fetchError.code === 'PGRST116') { // code PGRST116: Row not found
                 throw new Error("Post not found.");
            } else {
                throw fetchError;
            }
        }

        if (data) {
          setPost(data);
        } else {
             // Handle case where data is null even without error (should be caught by .single() error though)
             throw new Error("Post not found.");
        }

      } catch (err) {
        console.error("Error fetching post:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
        fetchPost();
    } else {
        setError("No post ID provided.");
        setLoading(false);
    }

    // Optional: Add cleanup function if needed, though not critical for fetch
    // return () => { /* cleanup logic */ };

  }, [postId]); // Re-run effect if postId changes

  // --- Render Logic ---
  if (loading) {
    return <div className="container post-detail-page"><p>Loading post...</p></div>;
  }

  if (error) {
    return <div className="container post-detail-page"><p className="error-message">Error: {error}</p></div>;
  }

  if (!post) {
    // Should ideally be caught by error handling, but good fallback
    return <div className="container post-detail-page"><p>Post not found.</p></div>;
  }

  // --- Display Post Details ---
  return (
    <div className="container post-detail-page">
      <article className="post-full">
        <header className="post-header">
          <h1>{post.title}</h1>
          <div className="post-meta">
            <span>Posted {timeAgo(post.created_at)}</span>
            <span> by {post.author_username ?? 'Unknown User'}</span>
            <span className="separator">|</span>
            <span>{post.upvotes ?? 0} upvotes</span>
             {/* Placeholder for Edit/Delete/Upvote Buttons */}
             <div className="post-actions">
                 {/* Buttons will go here */}
             </div>
          </div>
        </header>

        {/* Display image if URL exists */}
        {post.image_url && (
          <div className="post-image-container">
            <img src={post.image_url} alt={post.title || 'Post image'} className="post-image"/>
          </div>
        )}

        {/* Display content if it exists */}
        {post.content && (
          <section className="post-content">
            <p>{post.content}</p>
          </section>
        )}

        <hr className="post-divider" />

        {/* Placeholder for Comments Section */}
        <section className="comments-section">
          <h2>Comments</h2>
          {/* Comments list and form will go here */}
          <p>(Comments will appear here)</p>
        </section>

      </article>
    </div>
  );
}

export default PostDetailPage;
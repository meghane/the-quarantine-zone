// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // Added useLocation
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import './PostDetailPage.css'; // Make sure this CSS file exists

// Helper function for relative time formatting
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
  } catch (e) {
      console.error("Error formatting date:", dateString, e);
      return 'Invalid date';
  }
}

function PostDetailPage() {
  const { postId } = useParams(); // Get post ID from URL parameter
  const { user } = useAuth(); // Get current logged-in user state
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to get current location (for sign-in redirect)

  const [post, setPost] = useState(null); // State for the post data
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for storing errors

  const [hasUpvoted, setHasUpvoted] = useState(false); // State tracking if current user has upvoted
  const [isVoteLoading, setIsVoteLoading] = useState(false); // State for loading during vote action

  // Function to fetch post details and user's vote status
  // Wrapped in useCallback to prevent re-creating function on every render unless dependencies change
  const fetchPost = useCallback(async () => {
      // Reset states before fetching
      setLoading(true);
      setError(null);
      setPost(null);
      setHasUpvoted(false); // Reset vote status

      try {
          // Fetch post data from the view (includes author username)
          const { data: postData, error: postError } = await supabase
              .from('posts_with_author_username') // Use the view
              .select('*')
              .eq('id', postId) // Filter by the post ID
              .single(); // Expect only one result

          // Handle errors during post fetch
          if (postError) {
              if (postError.code === 'PGRST116') throw new Error("Post not found."); // Specific error for not found
              else throw postError; // Other Supabase/DB errors
          }

          // If no data found (should be caught by .single() error, but good practice)
          if (!postData) throw new Error("Post not found.");

          // Set the fetched post data to state
          setPost(postData);

          // Check if the current logged-in user has upvoted this post
          if (user) { // Only check if a user is logged in
              const { data: voteData, error: voteError, count } = await supabase
                  .from('post_upvotes') // Check the upvotes table
                  .select('*', { count: 'exact', head: true }) // We only need the count
                  .match({ post_id: postId, user_id: user.id }); // Match post and user ID

              if (voteError) {
                  // Log non-critical error if vote check fails, but don't block page load
                  console.warn("Could not check vote status:", voteError.message);
              } else if (count > 0) {
                  // If count > 0, the user has an upvote record for this post
                  setHasUpvoted(true);
              }
          }
      } catch (err) {
          // Handle any errors during the fetch process
          console.error("Error fetching post details:", err);
          setError(err.message);
      } finally {
          // Always set loading to false when fetch attempt finishes
          setLoading(false);
      }
  }, [postId, user]); // Dependencies: Re-run if postId or user object changes

  // useEffect hook to call fetchPost when component mounts or dependencies change
  useEffect(() => {
      if (postId) {
          fetchPost();
      } else {
          // Handle case where postId is missing in URL (shouldn't happen with correct routing)
          setError("No post ID provided.");
          setLoading(false);
      }
  }, [postId, fetchPost]); // Use the memoized fetchPost function here

  // Async function to handle the upvote button click
  const handleUpvote = async () => {
      // 1. Check if user is logged in
      if (!user) {
          alert("Please sign in to upvote posts!");
          // Redirect to signin page, passing the current page as 'from' state
          // so user can be redirected back after signing in
          navigate('/signin', { state: { from: location } });
          return;
      }

      // 2. Prevent multiple clicks while an operation is in progress
      if (isVoteLoading) return;
      setIsVoteLoading(true);
      setError(null); // Clear previous voting errors

      try {
          if (hasUpvoted) {
              // --- User is REMOVING their upvote ---
              // Delete the row from post_upvotes table
              const { error: deleteError } = await supabase
                  .from('post_upvotes')
                  .delete()
                  .match({ post_id: postId, user_id: user.id });

              if (deleteError) throw deleteError; // Handle delete error

              // Update UI optimistically (database trigger handles actual count)
              setHasUpvoted(false);
              setPost(currentPost => ({ ...currentPost, upvotes: Math.max(0, currentPost.upvotes - 1) }));

          } else {
              // --- User is ADDING their upvote ---
              // Insert a new row into post_upvotes table
              const { error: insertError } = await supabase
                  .from('post_upvotes')
                  .insert({ post_id: postId, user_id: user.id });

              // Handle potential race condition if vote already exists (e.g., double click)
              // Supabase error code 23505 = unique_violation
              if (insertError && insertError.code === '23505') {
                  console.warn("Upvote already exists, likely due to race condition. Syncing UI.");
                  setHasUpvoted(true); // Correct UI state if it was out of sync
              } else if (insertError) {
                  throw insertError; // Throw other insert errors
              } else {
                  // Update UI optimistically after successful insert
                  setHasUpvoted(true);
                  setPost(currentPost => ({ ...currentPost, upvotes: currentPost.upvotes + 1 }));
              }
          }
      } catch (error) {
          // Handle errors during the upvote/downvote operation
          console.error("Error handling upvote:", error.message);
          setError(`Vote failed: ${error.message}`);
          // Consider re-fetching post data here to ensure UI consistency if needed
          // fetchPost();
      } finally {
          // Always set vote loading state to false
          setIsVoteLoading(false);
      }
  };

  // --- Render Logic ---
  // Show loading state
  if (loading) {
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Loading post...</p></div>;
  }

  // Show error if post failed to load
  if (error && !post) {
      return <div className="container post-detail-page"><p className="error-message" style={{color: 'red', textAlign: 'center', margin: '2rem'}}>Error: {error}</p></div>;
  }

  // Show "Not Found" if no post data exists (should usually be caught by error handling)
  if (!post) {
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Post not found.</p></div>;
  }

  // --- Render the Post Details ---
  return (
      <div className="container post-detail-page">
          {/* Display vote-specific errors if they occur */}
          {error && <p className="error-message" style={{textAlign:'center', color:'red', marginBottom: '1rem'}}>{error}</p>}

          <article className="post-full">
              <header className="post-header">
                  <h1>{post.title}</h1>
                  <div className="post-meta">
                      <span>Posted {timeAgo(post.created_at)}</span>
                      <span> by {post.author_username ?? 'Unknown User'}</span>
                      <span className="separator">|</span>
                      <span className="upvote-count">{post.upvotes ?? 0} upvotes</span>
                      {/* Actions container */}
                      <div className="post-actions">
                          {/* Upvote Button */}
                          <button
                              onClick={handleUpvote}
                              disabled={isVoteLoading || !user} // Disable if processing or not logged in
                              className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`} // Conditional class for styling
                              title={!user ? "Sign in to upvote" : (hasUpvoted ? "Remove upvote" : "Upvote")}
                              aria-pressed={hasUpvoted} // Accessibility state
                          >
                              {/* You can replace text/arrows with SVG icons */}
                              <span className="arrow">{hasUpvoted ? '▲' : '△'}</span> Upvote
                          </button>
                          {/* Placeholder for Edit/Delete Buttons */}
                          {/* {user && user.id === post.author_id && (
                              <>
                                  <button className="edit-button">Edit</button>
                                  <button className="delete-button">Delete</button>
                              </>
                          )} */}
                      </div>
                  </div>
              </header>

              {/* Display post image if URL exists */}
              {post.image_url && (
                  <div className="post-image-container">
                      <img src={post.image_url} alt={post.title || 'Post image'} className="post-image"/>
                  </div>
              )}

              {/* Display post content if it exists */}
              {post.content && (
                  <section className="post-content">
                      {/* Simple paragraph display - consider markdown rendering later if needed */}
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
// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'; // useParams to get ID from URL, Link for Edit, useNavigate for redirects, useLocation for signin redirect state
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // To check logged-in user
import './PostDetailPage.css'; // Make sure this CSS file exists and is linked

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

function PostDetailPage() {
  const { postId } = useParams(); // Get the 'postId' parameter from the URL
  const { user } = useAuth(); // Get current logged-in user state
  const navigate = useNavigate(); // Hook for navigation actions
  const location = useLocation(); // Hook to get current location (used for sign-in redirect)

  // State for the post data itself
  const [post, setPost] = useState(null);
  // State for loading the initial post data
  const [loading, setLoading] = useState(true);
  // State for storing general or fetch errors
  const [error, setError] = useState(null);

  // State specifically for tracking the current user's upvote status on this post
  const [hasUpvoted, setHasUpvoted] = useState(false);
  // State for loading indicator during the upvote/downvote action
  const [isVoteLoading, setIsVoteLoading] = useState(false);
  // State for loading indicator during the delete action
  const [isDeleting, setIsDeleting] = useState(false);


  // Function to fetch post details and user's vote status
  // Wrapped in useCallback to stabilize the function reference based on dependencies
  const fetchPost = useCallback(async () => {
      // Reset states before fetching
      setLoading(true);
      setError(null);
      setPost(null);
      setHasUpvoted(false);

      try {
          // Fetch post data using the view to include author username
          const { data: postData, error: postError } = await supabase
              .from('posts_with_author_username') // Use the view
              .select('*')
              .eq('id', postId) // Filter by the post ID from the URL
              .single(); // Expect only one result (or null/error)

          // Handle errors during post fetch
          if (postError) {
              if (postError.code === 'PGRST116') throw new Error("Post not found."); // Specific error for not found
              else throw postError; // Other Supabase/DB errors
          }
          if (!postData) throw new Error("Post not found."); // Handle null data case

          // Set the fetched post data to state
          setPost(postData);

          // If a user is logged in, check their upvote status for this post
          if (user) {
              const { data: voteData, error: voteError, count } = await supabase
                  .from('post_upvotes')
                  .select('*', { count: 'exact', head: true }) // Only need to know if > 0 exists
                  .match({ post_id: postId, user_id: user.id }); // Check for row matching post and user

              if (voteError) {
                  // Log non-critical error but allow page to load
                  console.warn("Could not check vote status:", voteError.message);
              } else if (count > 0) {
                  // User has upvoted this post
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
          fetchPost(); // Fetch the post data
      } else {
          // Handle case where postId is missing in URL
          setError("No post ID provided.");
          setLoading(false);
      }
  }, [postId, fetchPost]); // Use the memoized fetchPost function

  // --- Action Handlers ---

  // Handle Upvote/Downvote Click
  const handleUpvote = async () => {
      if (!user) {
          alert("Please sign in to upvote posts!");
          navigate('/signin', { state: { from: location } });
          return;
      }
      if (isVoteLoading) return; // Prevent double clicks
      setIsVoteLoading(true);
      setError(null);

      try {
          if (hasUpvoted) { // --- REMOVING VOTE ---
              const { error: deleteError } = await supabase
                  .from('post_upvotes')
                  .delete()
                  .match({ post_id: postId, user_id: user.id });
              if (deleteError) throw deleteError;
              setHasUpvoted(false);
              setPost(p => ({ ...p, upvotes: Math.max(0, p.upvotes - 1) })); // Optimistic UI update
          } else { // --- ADDING VOTE ---
              const { error: insertError } = await supabase
                  .from('post_upvotes')
                  .insert({ post_id: postId, user_id: user.id });
              if (insertError && insertError.code === '23505') { // Handle potential unique violation on rapid clicks
                  console.warn("Upvote already exists error (23505). Syncing UI.");
                  setHasUpvoted(true);
              } else if (insertError) {
                  throw insertError;
              } else {
                  setHasUpvoted(true);
                  setPost(p => ({ ...p, upvotes: p.upvotes + 1 })); // Optimistic UI update
              }
          }
      } catch (error) {
          console.error("Error handling upvote:", error.message);
          setError(`Vote failed: ${error.message}`);
          // Consider re-fetching post to correct optimistic update if needed: fetchPost();
      } finally {
          setIsVoteLoading(false);
      }
  };

  // Handle Post Deletion Click
  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
      if (!user || user.id !== post?.author_id) { // Check ownership again just in case
          alert("You are not authorized to delete this post.");
          return;
      }
      if (isDeleting) return; // Prevent double clicks

      setIsDeleting(true);
      setError(null);

      try {
          // Delete from posts table matching ID (RLS policy enforces ownership)
          const { error: deleteError } = await supabase
              .from('posts')
              .delete()
              .match({ id: postId });

          if (deleteError) throw deleteError;

          alert("Post deleted successfully.");
          navigate('/'); // Navigate back to home page after deletion

      } catch (error) {
          console.error("Error deleting post:", error);
          setError(`Failed to delete post: ${error.message}`);
          alert(`Error: ${error.message}`); // Show alert for deletion error
      } finally {
          setIsDeleting(false);
      }
  };


  // --- Render Logic ---
  if (loading) {
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Loading post...</p></div>;
  }

  // Show error only if the post failed to load initially
  if (error && !post) {
      return <div className="container post-detail-page"><p className="error-message" style={{color: 'red', textAlign: 'center', margin: '2rem'}}>Error: {error}</p></div>;
  }

  // Handle case where post is simply not found after loading
  if (!post) {
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Post not found.</p></div>;
  }

  // --- Render the Full Post Details ---
  return (
      <div className="container post-detail-page">
          {/* Display non-critical errors (like vote errors) above the post */}
          {error && <p className="error-message" style={{textAlign:'center', color:'red', marginBottom: '1rem'}}>{error}</p>}

          <article className="post-full">
              <header className="post-header">
                  <h1>{post.title}</h1>
                  <div className="post-meta">
                      <span>Posted {timeAgo(post.created_at)}</span>
                      <span> by {post.author_username ?? 'Unknown User'}</span>
                      <span className="separator">|</span>
                      <span className="upvote-count">{post.upvotes ?? 0} upvotes</span>

                      {/* Action Buttons Container */}
                      <div className="post-actions">
                          {/* Upvote Button */}
                          <button
                              onClick={handleUpvote}
                              disabled={isVoteLoading || !user}
                              className={`upvote-button ${hasUpvoted ? 'upvoted' : ''}`}
                              title={!user ? "Sign in to upvote" : (hasUpvoted ? "Remove upvote" : "Upvote")}
                              aria-pressed={hasUpvoted}
                          >
                              <span className="arrow">{hasUpvoted ? '▲' : '△'}</span> Upvote
                          </button>

                          {/* Conditional Edit/Delete Buttons for Author */}
                          {user && user.id === post.author_id && (
                              <>
                                  {/* Link to the Edit Page */}
                                  <Link to={`/post/${postId}/edit`} className="edit-button">
                                      Edit
                                  </Link>

                                  {/* Delete Button */}
                                  <button
                                      onClick={handleDelete}
                                      className="delete-button"
                                      disabled={isDeleting}
                                      title="Delete this post"
                                  >
                                      {isDeleting ? 'Deleting...' : 'Delete'}
                                  </button>
                              </>
                          )}
                      </div> {/* End post-actions */}
                  </div> {/* End post-meta */}
              </header>

              {/* Post Image */}
              {post.image_url && (
                  <div className="post-image-container">
                      <img src={post.image_url} alt={post.title || 'Post image'} className="post-image"/>
                  </div>
              )}

              {/* Post Content */}
              {post.content && (
                  <section className="post-content">
                      {/* Render content as plain text - consider Markdown later */}
                      {/* Using split/map for basic paragraph breaks if content has newlines */}
                      {post.content.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph || <>&nbsp;</>}</p> // Render empty paragraphs or use &nbsp;
                      ))}
                  </section>
              )}

              <hr className="post-divider" />

              {/* Placeholder for Comments Section */}
              <section className="comments-section">
                  <h2>Comments</h2>
                  {/* TODO: Comments list and form will go here */}
                  <p>(Comments will appear here)</p>
              </section>

          </article>
      </div>
  );
}

export default PostDetailPage;
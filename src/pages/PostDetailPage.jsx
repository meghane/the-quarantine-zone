// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
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
  const { postId } = useParams(); // Get post ID from URL parameter
  const { user } = useAuth(); // Get current logged-in user state
  const navigate = useNavigate(); // Hook for navigation actions
  const location = useLocation(); // Hook to get current location (for sign-in redirect)

  // State for the post data itself
  const [post, setPost] = useState(null);
  // State for loading the initial post data
  const [loading, setLoading] = useState(true);
  // State for storing general or fetch errors
  const [error, setError] = useState(null);

  // State for loading indicator during the upvote action
  const [isUpdatingVote, setIsUpdatingVote] = useState(false);
  // State for loading indicator during the delete action
  const [isDeleting, setIsDeleting] = useState(false);


  // Function to fetch post details
  // Wrapped in useCallback to stabilize the function reference
  const fetchPost = useCallback(async () => {
      // Reset states before fetching
      setLoading(true);
      setError(null);
      setPost(null);

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

          // NOTE: No longer need to fetch user's vote status for the unlimited vote logic

      } catch (err) {
          // Handle any errors during the fetch process
          console.error("Error fetching post details:", err);
          setError(err.message);
      } finally {
          // Always set loading to false when fetch attempt finishes
          setLoading(false);
      }
  }, [postId]); // Dependency: Only re-run if postId changes

  // useEffect hook to call fetchPost when component mounts or postId changes
  useEffect(() => {
      if (postId) {
          fetchPost(); // Fetch the post data
      } else {
          // Handle case where postId is missing in URL
          setError("No post ID provided.");
          setLoading(false);
      }
  }, [postId, fetchPost]); // Use the memoized fetchPost function here


  // --- Action Handlers ---

  // Handle Upvote Click (Unlimited Votes Logic)
  const handleUpvote = async () => {
      // 1. Check if user is logged in
      if (!user) {
          alert("Please sign in to upvote posts!");
          navigate('/signin', { state: { from: location } });
          return;
      }
      // 2. Prevent multiple clicks while processing
      if (isUpdatingVote) return;
      setIsUpdatingVote(true);
      setError(null);

      // 3. Get current upvotes and calculate new count
      const currentUpvotes = post.upvotes;
      const newUpvotes = currentUpvotes + 1;

      // 4. Optimistically update UI first for responsiveness
      setPost(currentPost => ({ ...currentPost, upvotes: newUpvotes }));

      try {
          // 5. Update the database posts table directly
          const { error: updateError } = await supabase
              .from('posts')
              .update({ upvotes: newUpvotes }) // Set the new incremented count
              .eq('id', postId); // For the specific post

          // 6. If the update failed, revert the optimistic UI update
          if (updateError) {
               setPost(currentPost => ({ ...currentPost, upvotes: currentUpvotes })); // Revert
               throw updateError; // Throw error to be caught
          }
          // If successful, UI is already updated.

      } catch (error) {
          // Handle errors during the update operation
          console.error("Error handling upvote:", error.message);
          setError(`Vote failed: ${error.message}`);
          // Ensure UI is reverted if it hasn't been already
          setPost(currentPost => ({ ...currentPost, upvotes: currentUpvotes }));
      } finally {
          // Always set loading back to false
          setIsUpdatingVote(false);
      }
  };

  // Handle Post Deletion Click
  const handleDelete = async () => {
      if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
      if (!user || user.id !== post?.author_id) {
          alert("You are not authorized to delete this post.");
          return;
      }
      if (isDeleting) return;

      setIsDeleting(true);
      setError(null);

      try {
          // RLS Policy should enforce ownership, matching ID is enough here
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
          alert(`Error: ${error.message}`);
      } finally {
          setIsDeleting(false);
      }
  };


  // --- Render Logic ---
  if (loading) {
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Loading post...</p></div>;
  }

  if (error && !post) { // Show error only if initial post load failed
      return <div className="container post-detail-page"><p className="error-message" style={{color: 'red', textAlign: 'center', margin: '2rem'}}>Error: {error}</p></div>;
  }

  if (!post) { // Post not found after loading
      return <div className="container post-detail-page"><p style={{textAlign: 'center', margin: '2rem'}}>Post not found.</p></div>;
  }

  // --- Render the Full Post Details ---
  return (
      <div className="container post-detail-page">
          {/* Display non-critical errors (like vote/delete errors) above the post */}
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
                              disabled={isUpdatingVote || !user} // Disable if processing or not logged in
                              className="upvote-button" // No 'upvoted' class needed now
                              title={!user ? "Sign in to upvote" : "Upvote"}
                          >
                              {/* Consistent icon/text */}
                              <span className="arrow">▲</span> Upvote
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
                      {/* Render content paragraphs */}
                      {post.content.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph || <>&nbsp;</>}</p>
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
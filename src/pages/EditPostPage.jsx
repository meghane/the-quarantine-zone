// src/pages/EditPostPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Need useParams here
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './CreatePostPage.css'; // Reuse the same CSS for simplicity

function EditPostPage() {
  const { postId } = useParams(); // Get postId from URL
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for form fields - initialize empty
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  // State for loading/error during fetch and update
  const [loading, setLoading] = useState(true); // Start true for initial fetch
  const [updating, setUpdating] = useState(false); // Separate state for update operation
  const [error, setError] = useState(null);

  // Fetch existing post data
  const fetchPostData = useCallback(async () => {
      if (!postId) {
          setError("No post ID provided.");
          setLoading(false);
          return;
      }
      setLoading(true);
      setError(null);
      try {
          const { data, error: fetchError } = await supabase
              .from('posts') // Fetch directly from posts table
              .select('title, content, image_url, author_id') // Select only needed fields
              .eq('id', postId)
              .single();

          if (fetchError) throw fetchError;
          if (!data) throw new Error("Post not found.");

          // Security Check: Verify the logged-in user is the author
          if (!user || user.id !== data.author_id) {
              throw new Error("You are not authorized to edit this post.");
              // Or navigate away: navigate('/', { replace: true }); return;
          }

          // Populate form fields with fetched data
          setTitle(data.title);
          setContent(data.content || '');
          setImageUrl(data.image_url || '');

      } catch (err) {
          console.error("Error fetching post to edit:", err);
          setError(err.message);
           // Optional: Redirect if post not found or not authorized
          // if (err.message.includes("not found") || err.message.includes("authorized")) {
          //     setTimeout(() => navigate('/'), 2000);
          // }
      } finally {
          setLoading(false);
      }
  }, [postId, user, navigate]); // Add navigate to dependencies if used inside catch

  useEffect(() => {
      fetchPostData();
  }, [fetchPostData]); // Run fetch function

  // Handle form submission for UPDATE
  const handleUpdate = async (event) => {
      event.preventDefault();
      setError(null);

      if (!title.trim()) {
          setError('Post title is required!');
          return;
      }
      // Ensure user owns post (redundant check if fetch worked, but good practice)
       if (!user || !postId ) {
           setError("Cannot update post. Missing user or post ID.");
           return;
       }

      setUpdating(true);

      // Prepare data object with updated fields
      const updatedData = {
          title: title.trim(),
          content: content.trim() || null,
          image_url: imageUrl.trim() || null,
          // DO NOT update author_id or created_at
      };

      try {
          const { error: updateError } = await supabase
              .from('posts')
              .update(updatedData)
              // IMPORTANT: Match both id and author_id for security
              // Ensures user can only update *their own* post specified by postId
              .match({ id: postId, author_id: user.id });

          if (updateError) throw updateError;

          alert("Post updated successfully!");
          navigate(`/post/${postId}`); // Navigate back to the post detail page

      } catch (error) {
          console.error("Error updating post:", error);
          setError(`Failed to update post: ${error.message}`);
          alert(`Error: ${error.message}`);
      } finally {
          setUpdating(false);
      }
  };

  // --- Render Logic ---
  if (loading) {
      return <div className="container auth-page"><p>Loading post data...</p></div>;
  }
  if (error) { // If initial fetch failed (e.g., not found, not authorized)
      return <div className="container auth-page"><p className="error-message">Error: {error}</p></div>;
  }


  // Reusing CreatePostPage structure and CSS classes
  return (
      <div className="container auth-page">
          <h2>Edit Post</h2>
          {/* Display update-specific errors */}
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleUpdate} className="auth-form"> {/* Use handleUpdate */}
              {/* Form fields are same as CreatePostPage */}
              <div className="form-group">
                  <label htmlFor="post-title">Title <span className="required">*</span></label>
                  <input type="text" id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={updating}/>
              </div>
              <div className="form-group">
                  <label htmlFor="post-content">Content</label>
                  <textarea id="post-content" value={content} onChange={(e) => setContent(e.target.value)} rows="6" disabled={updating}/>
              </div>
              <div className="form-group">
                  <label htmlFor="post-image-url">Image URL (Optional)</label>
                  <input type="url" id="post-image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" disabled={updating}/>
              </div>
              {/* Submit button text changed */}
              <button type="submit" className="submit-button" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Post'}
              </button>
          </form>
      </div>
  );
}

export default EditPostPage;
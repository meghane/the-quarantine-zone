// src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import './CreatePostPage.css'; // Make sure this CSS file exists and is linked

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Get the logged-in user object from context
  const navigate = useNavigate();

  // Log user object on component render/re-render (for debugging)
  console.log('CreatePostPage User object:', user);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    // Log the user ID right before attempting submission (for debugging)
    console.log('Submitting post with User ID:', user?.id);

    // Ensure user is logged in before attempting to create post
    // ProtectedRoute should handle this, but an extra check doesn't hurt
    if (!user) {
        setError('You must be logged in to create a post.');
        // Optionally redirect to login
        // navigate('/signin');
        return;
    }

    // Basic validation
    if (!title.trim()) {
      setError('Post title is required!');
      return;
    }

    setIsLoading(true);

    // Prepare data object for Supabase, including the author_id
    const postData = {
      title: title.trim(),
      content: content.trim() || null, // Use null if empty
      image_url: imageUrl.trim() || null, // Use null if empty
      author_id: user.id // Assign the logged-in user's ID
      // upvotes defaults to 0 in the DB
      // created_at defaults to now() in the DB
    };

    try {
      // Attempt to insert the post data into the 'posts' table
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select(); // .select() is optional here, returns the inserted row

      // If Supabase returns an error, throw it to the catch block
      if (insertError) {
        throw insertError;
      }

      // Success!
      alert('Post created successfully!');

      // Clear the form fields
      setTitle('');
      setContent('');
      setImageUrl('');

      // Navigate back to the home page (or maybe to the new post's page later)
      navigate('/');

    } catch (error) {
      // Handle errors during the insert operation
      console.error('Error creating post:', error);
      let friendlyErrorMessage = `Failed to create post: ${error.message}`;
      // Check for specific errors like Foreign Key violation
      if (error.message.includes('violates foreign key constraint')) {
           friendlyErrorMessage = 'Failed to create post. Could not verify author information.';
           // Log the problematic ID for debugging
           console.error('FK Violation likely due to user ID:', user?.id);
      }
      setError(friendlyErrorMessage);
      alert(`Error: ${friendlyErrorMessage}`); // Show alert for immediate feedback

    } finally {
      // Always set loading back to false after the operation completes
      setIsLoading(false);
    }
  };

  // JSX for the form
  return (
    <div className="container create-post-page">
      <h2>Create New Post</h2>

      {/* Display error message if one exists */}
      {error && <p className="error-message">{error}</p>}

      <form onSubmit={handleSubmit} className="create-post-form">
        <div className="form-group">
          <label htmlFor="post-title">Title <span className="required">*</span></label>
          <input
            type="text"
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-required="true"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="post-image-url">Image URL (Optional)</label>
          <input
            type="url"
            id="post-image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            disabled={isLoading}
          />
        </div>

        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostPage;
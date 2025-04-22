// src/pages/CreatePostPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // 👈 Import Supabase client (adjust path if needed)
import './CreatePostPage.css';

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false); // 👈 Add loading state
  const [error, setError] = useState(null); // Optional: state for displaying errors
  const navigate = useNavigate();

  // 👇 Make handleSubmit async
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    if (!title.trim()) {
      setError('Post title is required!'); // Use state for error messages
      return;
    }

    setIsLoading(true); // Set loading true before Supabase call

    // Prepare data for Supabase - keys should match your table column names
    const postData = {
      title: title.trim(),
      content: content.trim() || null, // Send null if content is empty
      image_url: imageUrl.trim() || null, // Send null if image URL is empty
      // 'upvotes' defaults to 0 in the DB
      // 'id' and 'created_at' are handled by the DB
    };

    try {
      // 👇 Call Supabase insert
      const { data, error: insertError } = await supabase
        .from('posts') // Your table name
        .insert([postData])
        .select(); // .select() is optional, returns the inserted data

      if (insertError) {
        // Throwing the error will trigger the catch block
        throw insertError;
      }

      // Success!
      console.log("Post inserted:", data); // Log the inserted data (optional)
      alert('Post created successfully!');

      // Clear the form
      setTitle('');
      setContent('');
      setImageUrl('');

      // Redirect to home page
      navigate('/');

    } catch (error) {
      console.error('Error creating post:', error.message);
      setError(`Failed to create post: ${error.message}`); // Set error state
      alert(`Error: ${error.message}`); // Simple alert for now

    } finally {
      // 👇 Set loading false whether it succeeded or failed
      setIsLoading(false);
    }
  };

  return (
    <div className="container create-post-page">
      <h2>Create New Post</h2>

      {/* Optional: Display error messages */}
      {error && <p className="error-message" style={{color: 'red', marginBottom: '1rem'}}>{error}</p>}

      <form onSubmit={handleSubmit} className="create-post-form">
        {/* --- Title Input (no changes needed) --- */}
        <div className="form-group">
          <label htmlFor="post-title">Title <span className="required">*</span></label>
          <input
            type="text"
            id="post-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-required="true"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        {/* --- Content Input (no changes needed) --- */}
        <div className="form-group">
          <label htmlFor="post-content">Content</label>
          <textarea
            id="post-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows="6"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        {/* --- Image URL Input (no changes needed) --- */}
        <div className="form-group">
          <label htmlFor="post-image-url">Image URL (Optional)</label>
          <input
            type="url"
            id="post-image-url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            disabled={isLoading} // Disable input while loading
          />
        </div>

        {/* 👇 Update Button to show loading state and disable */}
        <button type="submit" className="submit-button" disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
}

export default CreatePostPage;
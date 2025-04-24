import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './CreatePostPage.css';

function CreatePostPage() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  console.log('CreatePostPage User object:', user);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    console.log('Submitting post with User ID:', user?.id);

    if (!user) {
      setError('You must be logged in to create a post.');
      return;
    }

    if (!title.trim()) {
      setError('Post title is required!');
      return;
    }

    setIsLoading(true);

    const postData = {
      title: title.trim(),
      content: content.trim() || null,
      image_url: imageUrl.trim() || null,
      author_id: user.id
    };

    try {
      const { data, error: insertError } = await supabase
        .from('posts')
        .insert([postData])
        .select();

      if (insertError) {
        throw insertError;
      }

      alert('Post created successfully!');

      setTitle('');
      setContent('');
      setImageUrl('');

      navigate('/');

    } catch (error) {
      console.error('Error creating post:', error);
      let friendlyErrorMessage = `Failed to create post: ${error.message}`;
      if (error.message.includes('violates foreign key constraint')) {
        friendlyErrorMessage = 'Failed to create post. Could not verify author information.';
        console.error('FK Violation likely due to user ID:', user?.id);
      }
      setError(friendlyErrorMessage);
      alert(`Error: ${friendlyErrorMessage}`);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container create-post-page">
      <h2>Create New Post</h2>

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
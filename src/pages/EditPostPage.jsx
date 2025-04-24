import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './CreatePostPage.css';

function EditPostPage() {
    const { postId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

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
                .from('posts')
                .select('title, content, image_url, author_id')
                .eq('id', postId)
                .single();

            if (fetchError) throw fetchError;
            if (!data) throw new Error("Post not found.");

            if (!user || user.id !== data.author_id) {
                throw new Error("You are not authorized to edit this post.");
            }

            setTitle(data.title);
            setContent(data.content || '');
            setImageUrl(data.image_url || '');

        } catch (err) {
            console.error("Error fetching post to edit:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [postId, user, navigate]);

    useEffect(() => {
        fetchPostData();
    }, [fetchPostData]);

    const handleUpdate = async (event) => {
        event.preventDefault();
        setError(null);

        if (!title.trim()) {
            setError('Post title is required!');
            return;
        }
        if (!user || !postId) {
            setError("Cannot update post. Missing user or post ID.");
            return;
        }

        setUpdating(true);

        const updatedData = {
            title: title.trim(),
            content: content.trim() || null,
            image_url: imageUrl.trim() || null,
        };

        try {
            const { error: updateError } = await supabase
                .from('posts')
                .update(updatedData)
                .match({ id: postId, author_id: user.id });

            if (updateError) throw updateError;

            alert("Post updated successfully!");
            navigate(`/post/${postId}`);

        } catch (error) {
            console.error("Error updating post:", error);
            setError(`Failed to update post: ${error.message}`);
            alert(`Error: ${error.message}`);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="container auth-page"><p>Loading post data...</p></div>;
    }
    if (error) {
        return <div className="container auth-page"><p className="error-message">Error: {error}</p></div>;
    }

    return (
        <div className="container auth-page">
            <h2>Edit Post</h2>
            {error && <p className="error-message">{error}</p>}
            <form onSubmit={handleUpdate} className="auth-form">
                <div className="form-group">
                    <label htmlFor="post-title">Title <span className="required">*</span></label>
                    <input type="text" id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} required disabled={updating} />
                </div>
                <div className="form-group">
                    <label htmlFor="post-content">Content</label>
                    <textarea id="post-content" value={content} onChange={(e) => setContent(e.target.value)} rows="6" disabled={updating} />
                </div>
                <div className="form-group">
                    <label htmlFor="post-image-url">Image URL (Optional)</label>
                    <input type="url" id="post-image-url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://example.com/image.png" disabled={updating} />
                </div>
                <button type="submit" className="submit-button" disabled={updating}>
                    {updating ? 'Updating...' : 'Update Post'}
                </button>
            </form>
        </div>
    );
}

export default EditPostPage;
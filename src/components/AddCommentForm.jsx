import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AddCommentForm.css';

function AddCommentForm({ postId, onCommentAdded }) {
    const { user } = useAuth();
    const [commentText, setCommentText] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState(null);


    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!user) {
            alert("You must be logged in to comment.");
            return;
        }
        const content = commentText.trim();
        if (!content) {
            setFormError("Comment cannot be empty.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);

        try {
            const newComment = {
                post_id: postId,
                user_id: user.id,
                content: content
            };

            const { data, error } = await supabase
                .from('comments')
                .insert(newComment)
                .select()
                .single();

            if (error) throw error;

            setCommentText('');
            if (onCommentAdded) {
                onCommentAdded(data);
            }

        } catch (err) {
            console.error("Error submitting comment:", err);
            setFormError(`Failed to submit comment: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!user) {
        return <p>Please <Link to="/signin">sign in</Link> to leave a comment.</p>;
    }

    return (
        <div className="add-comment-form-container">
            <h3>Leave a Comment</h3>
            {formError && <p className="error-message">{formError}</p>}
            <form onSubmit={handleSubmit} className="add-comment-form">
                <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write your comment here..."
                    rows="4"
                    required
                    disabled={isSubmitting}
                    aria-label="Comment text"
                />
                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'Submit Comment'}
                </button>
            </form>
        </div>
    );
}

export default AddCommentForm;
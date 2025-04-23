// src/components/AddCommentForm.jsx
import React, { useState } from 'react';
import { supabase } from '../supabaseClient'; // Adjust path
import { useAuth } from '../context/AuthContext'; // Adjust path
import './AddCommentForm.css'; // Create this file

// Props: postId (ID of the post being commented on)
//        onCommentAdded (callback function to notify parent that a comment was added)
function AddCommentForm({ postId, onCommentAdded }) {
  const { user } = useAuth(); // Get current user
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user) {
      alert("You must be logged in to comment.");
      return; // Should ideally not show form if not logged in, but extra check
    }
    const content = commentText.trim();
    if (!content) {
      setFormError("Comment cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    try {
      // Prepare new comment object
      const newComment = {
        post_id: postId,
        user_id: user.id,
        content: content
      };

      // Insert into Supabase 'comments' table
      const { data, error } = await supabase
        .from('comments')
        .insert(newComment)
        .select() // Optionally select the inserted comment back
        .single(); // Assuming insert returns the single new row

      if (error) throw error;

      // Clear the form
      setCommentText('');
      // Notify parent component that comment was added (e.g., to trigger refresh)
      if (onCommentAdded) {
        onCommentAdded(data); // Pass new comment data back if needed
      }

    } catch (err) {
      console.error("Error submitting comment:", err);
      setFormError(`Failed to submit comment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render nothing if user isn't logged in
  if (!user) {
      return <p>Please <Link to="/signin">sign in</Link> to leave a comment.</p>; // Or null
  }

  // Render the form
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
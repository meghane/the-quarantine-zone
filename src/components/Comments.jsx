// src/components/Comment.jsx
import React from 'react';
import './Comments.css'; // Make sure this path is correct

// Helper function for relative time formatting
// (You can place this here or import it from a shared utils/helpers file)
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

// The Comment component receives the comment object as a prop
function Comment({ comment }) {

    // Basic check in case comment data is missing unexpectedly
    if (!comment) {
        return <div className="comment error">Could not display comment data.</div>;
    }

    // Extract data, providing fallbacks
    // Uses 'author_username' directly from the view data
    const username = comment.author_username ?? 'Unknown User';
    const time = timeAgo(comment.created_at);
    const content = comment.content || ''; // Default to empty string if content is null/undefined

    return (
        <div className="comment">
            {/* Comment Metadata: Author and Time */}
            <div className="comment-meta">
                <span className="comment-author">{username}</span>
                <span className="comment-time">{time}</span>
            </div>
            {/* Comment Content */}
            <div className="comment-content">
                {/* Render content, splitting by newline for basic paragraph breaks */}
                {content.split('\n').map((paragraph, index) => (
                    // Use index as key for paragraphs within a single comment's content
                    <p key={index}>
                        {/* Render non-breaking space if paragraph is empty to maintain height */}
                        {paragraph || <>&nbsp;</>}
                    </p>
                ))}
            </div>
            {/* Placeholder for future actions like delete/reply */}
            {/* <div className="comment-actions"></div> */}
        </div>
    );
}

export default Comment;
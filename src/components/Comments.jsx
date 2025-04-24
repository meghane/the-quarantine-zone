import React from 'react';
import './Comments.css';

function timeAgo(dateString) {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    if (seconds < 0) return `in ${Math.floor(Math.abs(seconds))} seconds`;
    return Math.max(0, Math.floor(seconds)) + " seconds ago";
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return 'Invalid date';
  }
}

function Comment({ comment }) {

  if (!comment) {
    return <div className="comment error">Could not display comment data.</div>;
  }

  const username = comment.author_username ?? 'Unknown User';
  const time = timeAgo(comment.created_at);
  const content = comment.content || '';

  return (
    <div className="comment">
      <div className="comment-meta">
        <span className="comment-author">{username}</span>
        <span className="comment-time">{time}</span>
      </div>
      <div className="comment-content">
        {content.split('\n').map((paragraph, index) => (
          <p key={index}>
            {paragraph || <>&nbsp;</>}
          </p>
        ))}
      </div>
    </div>
  );
}

export default Comment;
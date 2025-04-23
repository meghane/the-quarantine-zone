// src/components/PostPreview.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './PostPreview.css'; // Make sure this CSS file exists and is linked

// 👇 Accept 'author_username' as a prop (matches the field from the view)
function PostPreview({ id, title, upvotes, time, author_username }) {

  // Basic check for missing essential props
  if (!id || !title) {
    console.warn("PostPreview missing required prop: id or title");
    return null;
  }

  return (
    <article className="post-preview">
      {/* Metadata section */}
      <div className="post-meta">
        {/* Display time */}
        {time && <span className="post-time">{time}</span>}
        {/* 👇 Display author username using the updated prop name */}
        {author_username && <span className="post-author"> by {author_username}</span>}
      </div>

      {/* Post Title (Link) */}
      <h2 className="post-title">
        <Link to={`/post/${id}`}>{title}</Link>
      </h2>

      {/* Footer section */}
      <div className="post-footer">
         {/* Display upvotes */}
         <span className="post-upvotes">{upvotes ?? 0} upvotes</span>
      </div>
    </article>
  );
}

export default PostPreview;
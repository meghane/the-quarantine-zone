import React from 'react';
import { Link } from 'react-router-dom';
import './PostPreview.css'; // Create this CSS file

// Note: The link `to={'/post/${id}'}` assumes your route for single posts will be like this.
function PostPreview({ id, title, upvotes, time, author }) {
  return (
    <article className="post-preview">
      <div className="post-meta">
        {/* Display time */}
        <span className="post-time">{time}</span>
         {/* Optionally display author later: <span className="post-author">by {author}</span> */}
      </div>
      <h2 className="post-title">
        {/* Make the title a link to the future post detail page */}
        <Link to={`/post/${id}`}>{title}</Link>
      </h2>
      <div className="post-footer">
          {/* Display upvotes */}
         <span className="post-upvotes">{upvotes} upvotes</span>
         {/* Maybe add comment count later? */}
      </div>
    </article>
  );
}

export default PostPreview;
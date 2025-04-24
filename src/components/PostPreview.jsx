import React from 'react';
import { Link } from 'react-router-dom';
import './PostPreview.css';

function PostPreview({ id, title, upvotes, time, author_username }) {

  if (!id || !title) {
    console.warn("PostPreview missing required prop: id or title");
    return null;
  }

  return (
    <article className="post-preview">
      <div className="post-meta">
        {time && <span className="post-time">{time}</span>}
        {author_username && <span className="post-author"> by {author_username}</span>}
      </div>

      <h2 className="post-title">
        <Link to={`/post/${id}`}>{title}</Link>
      </h2>

      <div className="post-footer">
        <span className="post-upvotes">{upvotes ?? 0} upvotes</span>
      </div>
    </article>
  );
}

export default PostPreview;
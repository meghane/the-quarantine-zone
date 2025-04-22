import React, { useState, useEffect } from 'react';
import SortControls from '../components/SortControls';
import PostPreview from '../components/PostPreview';
import './HomePage.css'; // Create this CSS file

// --- Placeholder Data ---
// In a real app, you'd fetch this from an API
const dummyPosts = [
  { id: 1, title: "Who is your favorite Founding Father?", upvotes: 3, createdAt: new Date(Date.now() - 21 * 60 * 60 * 1000), author: "User1" },
  { id: 2, title: "I'm in love with the Holy Roman Empire", upvotes: 23, createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), author: "User2" },
  { id: 3, title: "Was Caesar overrated?", upvotes: 11, createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), author: "User3" },
  { id: 4, title: "Just finished TLOU Part II again...", upvotes: 55, createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), author: "User4" },
  { id: 5, title: "Season 2 predictions?", upvotes: 42, createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), author: "User5" },
];
// --- End Placeholder Data ---


// Helper function for relative time (simple version)
function timeAgo(date) {
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
    return Math.floor(seconds) + " seconds ago";
}


function HomePage() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' or 'popular'

  // Simulate fetching posts and sort initially
  useEffect(() => {
    let sortedPosts = [...dummyPosts]; // Create a copy
    if (sortBy === 'newest') {
      sortedPosts.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortBy === 'popular') {
      sortedPosts.sort((a, b) => b.upvotes - a.upvotes);
    }
    setPosts(sortedPosts);
  }, [sortBy]); // Re-run useEffect when sortBy changes

  return (
    <div className="container home-page">
      <SortControls currentSort={sortBy} onSortChange={setSortBy} />
      <section className="post-feed">
        {posts.length > 0 ? (
          posts.map(post => (
            <PostPreview
              key={post.id}
              id={post.id}
              title={post.title}
              upvotes={post.upvotes}
              // Format the date using the helper
              time={timeAgo(post.createdAt)}
              author={post.author} // Assuming you might want author later
            />
          ))
        ) : (
          <p>No posts yet!</p> // Message if no posts
        )}
      </section>
    </div>
  );
}

export default HomePage;
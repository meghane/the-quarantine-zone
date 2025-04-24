import React, { useState, useEffect } from 'react';
import SortControls from '../components/SortControls';
import PostPreview from '../components/PostPreview';
import { supabase } from '../supabaseClient';
import './HomePage.css';
import { useSearchParams } from 'react-router-dom';

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


function HomePage() {
  const [posts, setPosts] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search') || '';

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let query = supabase
          .from('posts_with_author_username')
          .select('*');


        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (sortBy === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortBy === 'popular') {
          query = query.order('upvotes', { ascending: false })
            .order('created_at', { ascending: false });
        }

        const { data, error: fetchError } = await query;

        if (fetchError) {
          throw fetchError;
        }

        setPosts(data || []);

      } catch (error) {
        console.error("Error fetching posts:", error);
        setError(`Failed to fetch posts: ${error.message}`);
        setPosts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();

  }, [sortBy, searchTerm]);

  let content;
  if (isLoading) {
    content = <p className="loading-message" style={{ textAlign: 'center', margin: '2rem' }}>Loading posts...</p>;
  } else if (error) {
    content = <p className="error-message" style={{ color: 'red', textAlign: 'center', margin: '2rem' }}>{error}</p>;
  } else if (posts.length === 0) {
    content = <p className="no-posts-message" style={{ textAlign: 'center', margin: '2rem' }}>No posts yet! Be the first to create one.</p>;
  } else {
    content = (
      <section className="post-feed">
        {posts.map(post => (
          <PostPreview
            key={post.id}
            id={post.id}
            title={post.title}
            upvotes={post.upvotes}
            time={timeAgo(post.created_at)}
            author_username={post.author_username ?? 'Unknown User'}
          />
        ))}
      </section>
    );
  }

  return (
    <div className="container home-page">
      {!isLoading && !error && <SortControls currentSort={sortBy} onSortChange={setSortBy} />}
      {content}
    </div>
  );
}

export default HomePage;
// src/pages/PostDetailPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient'; // Adjust path if needed
import { useAuth } from '../context/AuthContext'; // Adjust path if needed
import Comment from '../components/Comments'; // Import Comment component
import AddCommentForm from '../components/AddCommentForm'; // Import AddCommentForm component
import './PostDetailPage.css'; // Make sure this CSS file exists and is linked

// Helper function for relative time formatting
function timeAgo(dateString) {
    if (!dateString) return '';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid date';
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = seconds / 31536000; if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000; if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400; if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600; if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60; if (interval > 1) return Math.floor(interval) + " minutes ago";
        if (seconds < 0) return `in ${Math.floor(Math.abs(seconds))} seconds`;
        return Math.max(0, Math.floor(seconds)) + " seconds ago";
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return 'Invalid date';
    }
}

function PostDetailPage() {
    const { postId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // State for post data
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true); // Loading for post itself
    const [error, setError] = useState(null); // General errors for page/actions

    // State for comments
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState(null);

    // State for upvote action
    const [isUpdatingVote, setIsUpdatingVote] = useState(false);

    // State for delete action
    const [isDeleting, setIsDeleting] = useState(false);

    // Combined function to fetch post and its comments
    const fetchPostAndComments = useCallback(async () => {
        setLoading(true);
        setCommentsLoading(true);
        setError(null);
        setCommentsError(null);
        setPost(null);
        setComments([]); // Clear old comments

        try {
            // --- Fetch Post Data ---
            const { data: postData, error: postError } = await supabase
                .from('posts_with_author_username') // Use the view
                .select('*')
                .eq('id', postId)
                .single();

            if (postError) {
                if (postError.code === 'PGRST116') throw new Error("Post not found.");
                else throw postError;
            }
            if (!postData) throw new Error("Post not found.");

            setPost(postData); // Set post data first

            // --- Fetch Comments ---
            const { data: commentsData, error: commentsFetchError } = await supabase
                .from('comments_with_author_username') // 👈 Query the VIEW
                .select('*') // 👈 Select all columns FROM THE VIEW
                .eq('post_id', postId) // Filter by post_id (still available in the view)
                .order('created_at', { ascending: true }); // Order by created_at (still available)

            if (commentsFetchError) {
                console.error("Error fetching comments:", commentsFetchError);
                setCommentsError("Could not load comments.");
            } else {
                setComments(commentsData || []);
            }

            // NOTE: Removed the check for user's upvote status here as we reverted to unlimited votes

        } catch (err) {
            console.error("Error fetching post details:", err);
            setError(err.message); // Set general page error
        } finally {
            setLoading(false); // Post loading finished
            setCommentsLoading(false); // Comments loading finished
        }
    }, [postId]); // Dependency only on postId (user object check happens inside actions)

    // useEffect to call fetch function
    useEffect(() => {
        if (postId) {
            fetchPostAndComments();
        } else {
            setError("No post ID provided.");
            setLoading(false);
            setCommentsLoading(false);
        }
    }, [postId, fetchPostAndComments]); // Use the memoized fetch function

    // --- Action Handlers ---

    // Handle Upvote Click (Unlimited Votes Logic)
    const handleUpvote = async () => {
        if (!user) { alert("Please sign in to upvote posts!"); navigate('/signin', { state: { from: location } }); return; }
        if (isUpdatingVote) return;
        setIsUpdatingVote(true); setError(null);
        const currentUpvotes = post.upvotes; const newUpvotes = currentUpvotes + 1;
        setPost(p => ({ ...p, upvotes: newUpvotes })); // Optimistic UI update
        try {
            const { error: updateError } = await supabase.from('posts').update({ upvotes: newUpvotes }).eq('id', postId);
            if (updateError) { setPost(p => ({ ...p, upvotes: currentUpvotes })); throw updateError; }
        } catch (error) {
            console.error("Error handling upvote:", error.message); setError(`Vote failed: ${error.message}`);
            setPost(p => ({ ...p, upvotes: currentUpvotes })); // Revert on error
        } finally { setIsUpdatingVote(false); }
    };

    // Handle Post Deletion Click
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this post? This cannot be undone.")) return;
        if (!user || user.id !== post?.author_id) { alert("You are not authorized to delete this post."); return; }
        if (isDeleting) return;
        setIsDeleting(true); setError(null);
        try {
            const { error: deleteError } = await supabase.from('posts').delete().match({ id: postId });
            if (deleteError) throw deleteError;
            alert("Post deleted successfully."); navigate('/');
        } catch (error) {
            console.error("Error deleting post:", error); setError(`Failed to delete post: ${error.message}`); alert(`Error: ${error.message}`);
        } finally { setIsDeleting(false); }
    };

    // Handle successful comment submission (refresh comments)
    const handleCommentAdded = () => {
        console.log("New comment added, refetching comments (and post)...");
        // Simple approach: re-fetch everything for this post
        // Could be optimized later to only fetch new comments if needed
        fetchPostAndComments();
    };

    // --- Render Logic ---
    if (loading) { return <div className="container post-detail-page"><p style={{ textAlign: 'center', margin: '2rem' }}>Loading post...</p></div>; }
    if (error && !post) { return <div className="container post-detail-page"><p className="error-message" style={{ color: 'red', textAlign: 'center', margin: '2rem' }}>Error: {error}</p></div>; }
    if (!post) { return <div className="container post-detail-page"><p style={{ textAlign: 'center', margin: '2rem' }}>Post not found.</p></div>; }

    // --- Render the Full Post Details ---
    return (
        <div className="container post-detail-page">
            {/* Display non-critical errors (like vote/delete errors) above the post */}
            {error && <p className="error-message" style={{ textAlign: 'center', color: 'red', marginBottom: '1rem' }}>{error}</p>}

            <article className="post-full">
                <header className="post-header">
                    <h1>{post.title}</h1>
                    <div className="post-meta">
                        <span>Posted {timeAgo(post.created_at)}</span>
                        <span> by {post.author_username ?? 'Unknown User'}</span>
                        <span className="separator">|</span>
                        <span className="upvote-count">{post.upvotes ?? 0} upvotes</span>
                        <div className="post-actions">
                            <button onClick={handleUpvote} disabled={isUpdatingVote || !user} className="upvote-button" title={!user ? "Sign in to upvote" : "Upvote"}>
                                <span className="arrow">▲</span> Upvote
                            </button>
                            {user && user.id === post.author_id && (
                                <>
                                    <Link to={`/post/${postId}/edit`} className="edit-button">Edit</Link>
                                    <button onClick={handleDelete} className="delete-button" disabled={isDeleting} title="Delete this post">
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </header>

                {post.image_url && (<div className="post-image-container"><img src={post.image_url} alt={post.title || 'Post image'} className="post-image" /></div>)}
                {post.content && (<section className="post-content">{post.content.split('\n').map((p, i) => (<p key={i}>{p || <>&nbsp;</>}</p>))}</section>)}
                <hr className="post-divider" />

                {/* --- Comments Section --- */}
                <section className="comments-section">
                    <h2>Comments ({comments.length})</h2>
                    {commentsLoading && <p>Loading comments...</p>}
                    {commentsError && <p className="error-message">{commentsError}</p>}
                    {!commentsLoading && !commentsError && comments.length === 0 && (
                        <p>No comments yet. Be the first!</p>
                    )}
                    {comments.map(comment => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                        // Pass the author_username field directly from the view result
                        // to the prop your Comment component expects (e.g., author_username)
                        // Assuming Comment component expects `comment.author_username`
                        />
                    ))}
                    {/* Conditionally render AddCommentForm */}
                    {user && <AddCommentForm postId={postId} onCommentAdded={handleCommentAdded} />}
                    {!user && <p style={{ marginTop: '1rem' }}>Please <Link to="/signin">sign in</Link> to leave a comment.</p>}
                </section>
            </article>
        </div>
    );
}

export default PostDetailPage;
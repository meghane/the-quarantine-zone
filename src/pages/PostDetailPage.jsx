import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import Comment from '../components/Comments';
import AddCommentForm from '../components/AddCommentForm';
import './PostDetailPage.css';

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

    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [commentsError, setCommentsError] = useState(null);

    const [isUpdatingVote, setIsUpdatingVote] = useState(false);

    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPostAndComments = useCallback(async () => {
        setLoading(true);
        setCommentsLoading(true);
        setError(null);
        setCommentsError(null);
        setPost(null);
        setComments([]);

        try {
            const { data: postData, error: postError } = await supabase
                .from('posts_with_author_username')
                .select('*')
                .eq('id', postId)
                .single();

            if (postError) {
                if (postError.code === 'PGRST116') throw new Error("Post not found.");
                else throw postError;
            }
            if (!postData) throw new Error("Post not found.");

            setPost(postData);

            const { data: commentsData, error: commentsFetchError } = await supabase
                .from('comments_with_author_username')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: true });

            if (commentsFetchError) {
                console.error("Error fetching comments:", commentsFetchError);
                setCommentsError("Could not load comments.");
            } else {
                setComments(commentsData || []);
            }

        } catch (err) {
            console.error("Error fetching post details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
            setCommentsLoading(false);
        }
    }, [postId]);

    useEffect(() => {
        if (postId) {
            fetchPostAndComments();
        } else {
            setError("No post ID provided.");
            setLoading(false);
            setCommentsLoading(false);
        }
    }, [postId, fetchPostAndComments]);

    const handleUpvote = async () => {
        if (!user) { alert("Please sign in to upvote posts!"); navigate('/signin', { state: { from: location } }); return; }
        if (isUpdatingVote) return;
        setIsUpdatingVote(true); setError(null);
        const currentUpvotes = post.upvotes; const newUpvotes = currentUpvotes + 1;
        setPost(p => ({ ...p, upvotes: newUpvotes }));
        try {
            const { error: updateError } = await supabase.from('posts').update({ upvotes: newUpvotes }).eq('id', postId);
            if (updateError) { setPost(p => ({ ...p, upvotes: currentUpvotes })); throw updateError; }
        } catch (error) {
            console.error("Error handling upvote:", error.message); setError(`Vote failed: ${error.message}`);
            setPost(p => ({ ...p, upvotes: currentUpvotes }));
        } finally { setIsUpdatingVote(false); }
    };

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

    const handleCommentAdded = () => {
        console.log("New comment added, refetching comments (and post)...");
        fetchPostAndComments();
    };

    if (loading) { return <div className="container post-detail-page"><p style={{ textAlign: 'center', margin: '2rem' }}>Loading post...</p></div>; }
    if (error && !post) { return <div className="container post-detail-page"><p className="error-message" style={{ color: 'red', textAlign: 'center', margin: '2rem' }}>Error: {error}</p></div>; }
    if (!post) { return <div className="container post-detail-page"><p style={{ textAlign: 'center', margin: '2rem' }}>Post not found.</p></div>; }

    return (
        <div className="container post-detail-page">
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
                        />
                    ))}
                    {user && <AddCommentForm postId={postId} onCommentAdded={handleCommentAdded} />}
                    {!user && <p style={{ marginTop: '1rem' }}>Please <Link to="/signin">sign in</Link> to leave a comment.</p>}
                </section>
            </article>
        </div>
    );
}

export default PostDetailPage;
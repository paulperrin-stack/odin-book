import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import PostCard from '../components/PostCard.jsx';
import { userLabel, userInitial } from '../utils/user.js';

export default function PostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [commentText, setCommentText] = useState('');
    const [posting, setPosting] = useState(false);
    const [commentError, setCommentError] = useState(null);

    useEffect(() => {
        async function fetchPostAndComments() {
            setLoading(true);
            try {
                const [postData, commentsData] = await Promise.all([
                    api.get(`/api/posts/${id}`),
                    api.get(`/api/posts/${id}/comments`),
                ]);

                setPost(postData.post);
                setComments(commentsData.comments);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPostAndComments();
    }, [id]);

    async function handleAddComment(e) {
        e.preventDefault();
        if (!commentText.trim()) return;

        setPosting(true);
        setCommentError(null);

        try {
            const data = await api.post(`/api/posts/${id}/comments`, {
                content: commentText.trim(),
            });

            setComments((prev) => [data.comment, ...prev]);
            setCommentText('');
            setPost((p) =>
                p
                    ? {
                          ...p,
                          _count: {
                              ...p._count,
                              comments: p._count.comments + 1,
                          },
                      }
                    : p
            );
        } catch (err) {
            setCommentError(err.message);
        } finally {
            setPosting(false);
        }
    }

    async function handleDeleteComment(commentId) {
        if (!window.confirm('Delete this comment?')) return;

        try {
            await api.delete(`/api/comments/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
            setPost((p) =>
                p
                    ? {
                          ...p,
                          _count: {
                              ...p._count,
                              comments: Math.max(0, p._count.comments - 1),
                          },
                      }
                    : p
            );
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) {
        return (
            <main className="container">
                <p className="muted">Loading…</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="container">
                <p className="form-error">{error}</p>
            </main>
        );
    }

    if (!post) {
        return (
            <main className="container">
                <p className="muted">Post not found.</p>
            </main>
        );
    }

    return (
        <main className="container">
            <button className="back-link" onClick={() => navigate(-1)}>
                ← Back
            </button>

            <PostCard post={post} onDeleted={() => navigate('/')} />

            <section className="comments">
                <h2 className="section-title">
                    Comments ({post._count.comments})
                </h2>

                <form className="card comment-form" onSubmit={handleAddComment}>
                    <textarea
                        className="textarea"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment…"
                        rows={2}
                    />
                    <div className="create-post-foot">
                        {commentError && (
                            <span className="form-error">{commentError}</span>
                        )}
                        <button
                            type="submit"
                            className="btn btn-accent btn-sm"
                            disabled={posting}
                        >
                            {posting ? 'Posting…' : 'Comment'}
                        </button>
                    </div>
                </form>

                {comments.length === 0 ? (
                    <p className="muted">No comments yet. Be the first.</p>
                ) : (
                    <div className="comment-list">
                        {comments.map((comment) => {
                            const cName = userLabel(comment.author);
                            const mine =
                                user && comment.author.id === user.id;

                            return (
                                <div key={comment.id} className="comment card">
                                    <div className="comment-head">
                                        {comment.author.avatarUrl ? (
                                            <img
                                                src={comment.author.avatarUrl}
                                                alt=""
                                                className="avatar avatar--sm"
                                            />
                                        ) : (
                                            <span className="avatar avatar--sm avatar--fallback">
                                                {userInitial(comment.author)}
                                            </span>
                                        )}
                                        <span className="comment-meta">
                                            <strong>{cName}</strong>
                                            <span className="muted">
                                                {comment.author.username
                                                    ? ` @${comment.author.username} · `
                                                    : ' · '}
                                                {formatDistanceToNow(
                                                    new Date(
                                                        comment.createdAt
                                                    ),
                                                    { addSuffix: true }
                                                )}
                                            </span>
                                        </span>
                                        {mine && (
                                            <button
                                                className="comment-delete"
                                                onClick={() =>
                                                    handleDeleteComment(
                                                        comment.id
                                                    )
                                                }
                                                aria-label="Delete comment"
                                            >
                                                ✕
                                            </button>
                                        )}
                                    </div>
                                    <p className="comment-body">
                                        {comment.content}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </main>
    );
}
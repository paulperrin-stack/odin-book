import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import api from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import { userLabel, userInitial } from '../utils/user.js';

/**
 * PostCard
 * props:
 *  - post: post object (must include author, _count, likedByMe)
 *  - onDeleted(id): optional. When provided, a Delete button is shown
 *    to the post's author and this is called after a successful delete.
 */
export default function PostCard({ post, onDeleted }) {
    const { user } = useAuth();

    const [liked, setLiked] = useState(Boolean(post.likedByMe));
    const [likeCount, setLikeCount] = useState(post._count?.likes ?? 0);
    const [busy, setBusy] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isOwner = user && post.author && user.id === post.author.id;
    const authorName = userLabel(post.author);

    async function toggleLike() {
        if (busy) return;
        setBusy(true);

        // optimistic update
        const next = !liked;
        setLiked(next);
        setLikeCount((c) => c + (next ? 1 : -1));

        try {
            const data = next
                ? await api.post(`/api/posts/${post.id}/like`)
                : await api.delete(`/api/posts/${post.id}/like`);
            setLikeCount(data.likes);
        } catch {
            // revert on failure
            setLiked(!next);
            setLikeCount((c) => c + (next ? -1 : 1));
        } finally {
            setBusy(false);
        }
    }

    async function handleDelete() {
        if (!window.confirm('Delete this post?')) return;
        setDeleting(true);
        try {
            await api.delete(`/api/posts/${post.id}`);
            onDeleted?.(post.id);
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    }

    return (
        <article className="post">
            <header className="post-head">
                <Link
                    to={`/users/${post.author.username}`}
                    className="post-author"
                >
                    {post.author.avatarUrl ? (
                        <img
                            src={post.author.avatarUrl}
                            alt=""
                            className="avatar"
                        />
                    ) : (
                        <span className="avatar avatar--fallback">
                            {userInitial(post.author)}
                        </span>
                    )}
                    <span className="post-author-text">
                        <strong>{authorName}</strong>
                        {post.author.username && (
                            <span className="muted">
                                @{post.author.username}
                            </span>
                        )}
                    </span>
                </Link>

                <time className="muted post-time">
                    {formatDistanceToNow(new Date(post.createdAt), {
                        addSuffix: true,
                    })}
                </time>
            </header>

            <Link to={`/posts/${post.id}`} className="post-body">
                {post.content}
            </Link>

            <footer className="post-actions">
                <button
                    type="button"
                    className={`like-btn ${liked ? 'is-liked' : ''}`}
                    onClick={toggleLike}
                    disabled={busy}
                >
                    {liked ? '♥' : '♡'} {likeCount}
                </button>

                <Link to={`/posts/${post.id}`} className="comment-link">
                    💬 {post._count?.comments ?? 0}
                </Link>

                {isOwner && onDeleted && (
                    <button
                        type="button"
                        className="btn btn-danger btn-sm post-delete"
                        onClick={handleDelete}
                        disabled={deleting}
                    >
                        {deleting ? 'Deleting…' : 'Delete'}
                    </button>
                )}
            </footer>
        </article>
    );
}
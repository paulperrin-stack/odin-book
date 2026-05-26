import { useState, useEffect } from 'react';
import api from '../api/client.js';
import CreatePost from '../components/CreatePost.jsx';
import PostCard from '../components/PostCard.jsx';

export default function HomePage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchFeed() {
            try {
                const data = await api.get('/api/posts/feed');
                setPosts(data.posts);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchFeed();
    }, []);

    function handlePostCreated(newPost) {
        setPosts((prev) => [newPost, ...prev]);
    }

    function handleDeleted(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
    }

    return (
        <main className="container">
            <header className="page-head">
                <h1 className="page-title">Your feed</h1>
                <p className="muted">Posts from you and people you follow.</p>
            </header>

            <CreatePost onPostCreated={handlePostCreated} />

            {loading && <p className="muted">Loading…</p>}
            {error && <p className="form-error">{error}</p>}

            {!loading &&
                !error &&
                (posts.length === 0 ? (
                    <p className="muted">
                        No posts yet — follow some people or write the first
                        one.
                    </p>
                ) : (
                    <div className="feed">
                        {posts.map((post) => (
                            <PostCard
                                key={post.id}
                                post={post}
                                onDeleted={handleDeleted}
                            />
                        ))}
                    </div>
                ))}
        </main>
    );
}
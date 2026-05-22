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
        setPosts((prevPosts) => [
            newPost,
            ...prevPosts,
        ]);
    }

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <h1>Home</h1>

            <CreatePost onPostCreated={handlePostCreated} />

            {posts.length === 0 ? (
                <p>No posts yet.</p>
            ) : (
                posts.map((post) => (
                    <PostCard
                        key={post.id}
                        post={post}
                    />
                ))
            )}
        </div>
    );
}
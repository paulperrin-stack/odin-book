import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/client.js';
import { useAuth } from '../hooks/useAuth.js';
import PostCard from '../components/PostCard.jsx';
import { userLabel, userInitial } from '../utils/user.js';

export default function ProfilePage() {
    const { username } = useParams();
    const { user: currentUser } = useAuth();

    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [followBusy, setFollowBusy] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [profileData, postsData] = await Promise.all([
                api.get(`/api/users/${username}`),
                api.get(`/api/users/${username}/posts`),
            ]);
            setProfile(profileData);
            setPosts(postsData.posts);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [username]);

    useEffect(() => {
        load();
    }, [load]);

    async function follow() {
        setFollowBusy(true);
        try {
            const data = await api.post(`/api/users/${username}/follow`);
            setProfile((p) => ({ ...p, followStatus: data.follow.status }));
        } catch (err) {
            alert(err.message);
        } finally {
            setFollowBusy(false);
        }
    }

    async function unfollow() {
        setFollowBusy(true);
        try {
            await api.delete(`/api/users/${username}/follow`);
            setProfile((p) => ({ ...p, followStatus: null }));
        } catch (err) {
            alert(err.message);
        } finally {
            setFollowBusy(false);
        }
    }

    function handleDeleted(id) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
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

    if (!profile) {
        return (
            <main className="container">
                <p className="muted">User not found.</p>
            </main>
        );
    }

    const name = userLabel(profile);
    const isMe = currentUser && currentUser.id === profile.id;
    const status = profile.followStatus ?? null;

    return (
        <main className="container">
            <section className="profile-head card">
                {profile.avatarUrl ? (
                    <img
                        src={profile.avatarUrl}
                        alt=""
                        className="avatar avatar--xl"
                    />
                ) : (
                    <span className="avatar avatar--xl avatar--fallback">
                        {userInitial(profile)}
                    </span>
                )}

                <div className="profile-info">
                    <h1 className="page-title">{name}</h1>
                    {profile.username && (
                        <p className="muted">@{profile.username}</p>
                    )}
                    <div className="profile-stats">
                        <span>
                            <strong>{profile._count.posts}</strong> posts
                        </span>
                        <span>
                            <strong>{profile._count.followers}</strong>{' '}
                            followers
                        </span>
                        <span>
                            <strong>{profile._count.following}</strong>{' '}
                            following
                        </span>
                    </div>
                </div>

                {!isMe && (
                    <div className="profile-action">
                        {status === 'ACCEPTED' ? (
                            <button
                                className="btn btn-ghost"
                                onClick={unfollow}
                                disabled={followBusy}
                            >
                                Following
                            </button>
                        ) : status === 'PENDING' ? (
                            <button
                                className="btn btn-ghost"
                                onClick={unfollow}
                                disabled={followBusy}
                            >
                                Requested
                            </button>
                        ) : (
                            <button
                                className="btn btn-accent"
                                onClick={follow}
                                disabled={followBusy}
                            >
                                Follow
                            </button>
                        )}
                    </div>
                )}
            </section>

            <h2 className="section-title">Posts</h2>

            {posts.length === 0 ? (
                <p className="muted">No posts yet.</p>
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
            )}
        </main>
    );
}
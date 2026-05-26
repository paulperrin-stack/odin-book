import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';

export default function RequestsPage() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.get('/api/follows/pending');
                setRequests(data.requests);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, []);

    async function accept(followId) {
        try {
            await api.post(`/api/follows/${followId}/accept`);
            setRequests((prev) => prev.filter((r) => r.id !== followId));
        } catch (err) {
            alert(err.message);
        }
    }

    async function decline(followId) {
        try {
            await api.delete(`/api/follows/${followId}`);
            setRequests((prev) => prev.filter((r) => r.id !== followId));
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <main className="container">
            <header className="page-head">
                <h1 className="page-title">Follow requests</h1>
                <p className="muted">People who want to follow you.</p>
            </header>

            {loading && <p className="muted">Loading…</p>}
            {error && <p className="form-error">{error}</p>}

            {!loading &&
                !error &&
                (requests.length === 0 ? (
                    <p className="muted">No pending requests.</p>
                ) : (
                    <div className="user-list">
                        {requests.map((req) => {
                            const u = req.follower;
                            const name = u.displayName || u.username;

                            return (
                                <div key={req.id} className="user-card card">
                                    <Link
                                        to={`/users/${u.username}`}
                                        className="user-card-main"
                                    >
                                        {u.avatarUrl ? (
                                            <img
                                                src={u.avatarUrl}
                                                alt=""
                                                className="avatar avatar--lg"
                                            />
                                        ) : (
                                            <span className="avatar avatar--lg avatar--fallback">
                                                {name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </span>
                                        )}
                                        <span className="user-card-text">
                                            <strong>{name}</strong>
                                            <span className="muted">
                                                @{u.username}
                                            </span>
                                        </span>
                                    </Link>

                                    <div className="request-actions">
                                        <button
                                            className="btn btn-accent btn-sm"
                                            onClick={() => accept(req.id)}
                                        >
                                            Accept
                                        </button>
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => decline(req.id)}
                                        >
                                            Decline
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
        </main>
    );
}
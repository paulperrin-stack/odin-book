import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client.js';
import { userLabel, userInitial } from '../utils/user.js';

/**
 * UserCard
 * props:
 *  - user: { id, username, displayName, avatarUrl, followStatus }
 *    followStatus is null | 'PENDING' | 'ACCEPTED'
 */
export default function UserCard({ user }) {
    const [status, setStatus] = useState(user.followStatus ?? null);
    const [busy, setBusy] = useState(false);

    const name = userLabel(user);

    async function follow() {
        setBusy(true);
        try {
            const data = await api.post(`/api/users/${user.username}/follow`);
            setStatus(data.follow.status);
        } catch (err) {
            alert(err.message);
        } finally {
            setBusy(false);
        }
    }

    async function unfollow() {
        setBusy(true);
        try {
            // DELETE removes both accepted follows and pending requests.
            await api.delete(`/api/users/${user.username}/follow`);
            setStatus(null);
        } catch (err) {
            alert(err.message);
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="user-card card">
            <Link to={`/users/${user.username}`} className="user-card-main">
                {user.avatarUrl ? (
                    <img
                        src={user.avatarUrl}
                        alt=""
                        className="avatar avatar--lg"
                    />
                ) : (
                    <span className="avatar avatar--lg avatar--fallback">
                        {userInitial(user)}
                    </span>
                )}
                <span className="user-card-text">
                    <strong>{name}</strong>
                    {user.username && (
                        <span className="muted">@{user.username}</span>
                    )}
                </span>
            </Link>

            {status === 'ACCEPTED' ? (
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={unfollow}
                    disabled={busy}
                >
                    Following
                </button>
            ) : status === 'PENDING' ? (
                <button
                    className="btn btn-ghost btn-sm"
                    onClick={unfollow}
                    disabled={busy}
                >
                    Requested
                </button>
            ) : (
                <button
                    className="btn btn-accent btn-sm"
                    onClick={follow}
                    disabled={busy}
                >
                    Follow
                </button>
            )}
        </div>
    );
}
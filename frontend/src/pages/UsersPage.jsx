import { useEffect, useState } from 'react';
import api from '../api/client.js';
import UserCard from '../components/UserCard.jsx';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await api.get('/api/users');
                setUsers(data.users);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        load(); 
    }, []);

    return (
        <main className="container">
            <header className="page-head">
                <h1 className="page-title">People</h1>
                <p className="muted">Find people to follow.</p>
            </header>
 
            {loading && <p className="muted">Loading…</p>}
            {error && <p className="form-error">{error}</p>}
 
            {!loading &&
                !error &&
                (users.length === 0 ? (
                    <p className="muted">No other users yet.</p>
                ) : (
                    <div className="user-list">
                        {users.map((u) => (
                            <UserCard key={u.id} user={u} />
                        ))}
                    </div>
                ))}
        </main>
    );
}
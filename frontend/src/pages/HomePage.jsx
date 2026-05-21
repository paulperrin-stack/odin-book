import { useAuth } from '../hooks/useAuth.js';

export default function HomePage() {
    const { user, loading } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            Home - user: {user ? user.username : 'not logged in'}
        </div>
    );
}
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js'

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    if (loading) {
        return null;
    }

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', err);
        }
    }

    return (
        <nav>
            <Link to="/">Home</Link>
            {' '}
            <Link to="/users">Users</Link>

            {' | '}

            {user ? (
                <>
                    <span>
                        Signed in as {user.username}
                    </span>

                    {' '}

                    <button onClick={handleLogout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login">Login</Link>

                    {' '}

                    <Link to="/register">Register</Link>
                </>
            )}
        </nav>
    );
}
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function Navbar() {
    const { user, loading, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    }

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <Link to="/" className="brand">
                    odin<span>book</span>
                </Link>

                {!loading && (
                    <div className="nav-links">
                        {user ? (
                            <>
                                <NavLink to="/" end className="nav-link">
                                    Feed
                                </NavLink>
                                <NavLink to="/users" className="nav-link">
                                    People
                                </NavLink>
                                <NavLink to="/requests" className="nav-link">
                                    Requests
                                </NavLink>
                                <NavLink
                                    to={`/users/${user.username}`}
                                    className="nav-link nav-link--me"
                                >
                                    {user.avatarUrl && (
                                        <img
                                            src={user.avatarUrl}
                                            alt=""
                                            className="avatar avatar--xs"
                                        />
                                    )}
                                    @{user.username}
                                </NavLink>
                                <button
                                    onClick={handleLogout}
                                    className="btn btn-ghost btn-sm"
                                >
                                    Log out
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="nav-link">
                                    Log in
                                </NavLink>
                                <NavLink
                                    to="/register"
                                    className="btn btn-accent btn-sm"
                                >
                                    Sign up
                                </NavLink>
                            </>
                        )}
                    </div>
                )}
            </div>
        </nav>
    );
}
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL;

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();

        setError(null);
        setSubmitting(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleGithub() {
        // Full-page redirect to the backend OAuth route.
        window.location.href = `${API_URL}/api/auth/github`;
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card card">
                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-sub">Log in to see your feed.</p>

                {error && (
                    <p className="form-error" style={{ marginBottom: 12 }}>
                        {error}
                    </p>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="field">
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-accent btn-block"
                        disabled={submitting}
                    >
                        {submitting ? 'Logging in…' : 'Log in'}
                    </button>
                </form>

                <div className="auth-divider">or</div>

                <button
                    type="button"
                    className="btn btn-github"
                    onClick={handleGithub}
                >
                    Continue with GitHub
                </button>

                <p className="auth-foot">
                    No account? <Link to="/register">Sign up</Link>
                </p>
            </div>
        </div>
    );
}
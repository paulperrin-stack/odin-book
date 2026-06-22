import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

const API_URL = import.meta.env.VITE_API_URL;

const USERNAME_REGEX = /^[a-zA-Z0-9_.]{3,30}$/;

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    function validate() {
        if (!email || !username || !password) {
            return 'Email, username, and password are required.';
        }
        if (!USERNAME_REGEX.test(username.trim())) {
            return 'Username must be 3-30 characters: letters, numbers, underscores, or periods.';
        }
        if (password.length < 8) {
            return 'Password must be at least 8 characters long.';
        }
        return null;
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);

        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setSubmitting(true);

        try {
            await register(
                email.trim(),
                password,
                username.trim(),
                displayName.trim() || undefined
            );
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    function handleGithub() {
        window.location.href = `${API_URL}/api/auth/github`;
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card card">
                <h1 className="auth-title">Create your account</h1>
                <p className="auth-sub">Join odinbook and start posting.</p>

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
                        <label htmlFor="username">Username</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="3-30 characters"
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="displayName">
                            Display name <span className="muted">(optional)</span>
                        </label>
                        <input
                            id="displayName"
                            type="text"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="At least 8 characters"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-accent btn-block"
                        disabled={submitting}
                    >
                        {submitting ? 'Creating account...' : 'Sign up'}
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
                    Already have an account? <Link to="/login">Log in</Link>
                </p>
            </div>
        </div>
    );
}

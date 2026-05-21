import {
    createContext,
    useCallback,
    useEffect,
    useState,
} from 'react';
import api from '../api/client';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const refreshUser = useCallback(async () => {
        try {
            const data = await api.get('/api/auth/me');
            setUser(data.user);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = useCallback(
        async (email, password) => {
            await api.post('/api/auth/login', {
                email,
                password,
            });

            await refreshUser();
        },
        [refreshUser]
    );

    const register = useCallback(
        async (email, password, username, displayName) => {
            await api.post('/api/auth/register', {
                email,
                password,
                username,
                displayName,
            });

            await refreshUser();
        },
        [refreshUser]
    );

    const logout = useCallback(async () => {
        await api.post('/api/auth/logout', {});
        setUser(null);
    }, []);

    useEffect(() => {
        void refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                refreshUser,
                login,
                register,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
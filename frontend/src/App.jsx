import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Navbar from './components/Navbar';

import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import UsersPage from './pages/UsersPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PostDetailPage from './pages/PostDetailPage';

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Navbar />

                <Routes>

                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    <Route element={<ProtectedRoute />}>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/users/:username" element={<ProfilePage />} />
                        <Route path="/posts/:id" element={<PostDetailPage />} />
                    </Route>
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
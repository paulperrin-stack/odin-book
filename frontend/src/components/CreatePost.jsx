import { useState } from 'react';
import api from '../api/client.js';

export default function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!content.trim()) {
            setError('Post content is required');
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const data = await api.post('/api/posts', {
                content: content.trim(),
            });

            onPostCreated(data.post);
            setContent('');
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <p>{error}</p>}

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                required
            />

            <button
                type="submit"
                disabled={submitting}
            >
                {submitting ? 'Posting...' : 'Post'}
            </button>
        </form>
    );
}
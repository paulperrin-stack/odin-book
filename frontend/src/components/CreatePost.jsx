import { useState } from 'react';
import api from '../api/client.js';

export default function CreatePost({ onPostCreated }) {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    async function handleSubmit(e) {
        e.preventDefault();

        if (!content.trim()) {
            setError('Write something first.');
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
        <form className="card create-post" onSubmit={handleSubmit}>
            <textarea
                className="textarea"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's happening?"
                rows={3}
            />

            <div className="create-post-foot">
                {error && <span className="form-error">{error}</span>}
                <span className="char-count">{content.length}</span>
                <button
                    type="submit"
                    className="btn btn-accent"
                    disabled={submitting}
                >
                    {submitting ? 'Posting…' : 'Post'}
                </button>
            </div>
        </form>
    );
}
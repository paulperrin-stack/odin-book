import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../api/client.js'
import PostCard from '../components/PostCard.jsx'

export default function PostDetailPage() {
    const { id } = useParams();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchPostAndComments() {
            try {
                const [postData, commentsData] = await Promise.all([
                    api.get(`/api/posts/${id}`),
                    api.get(`/api/posts/${id}/comments`),
                ]);

                setPost(postData.post);
                setComments(commentsData.comments);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        fetchPostAndComments();
    }, [id]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    if (!post) {
        return <div>Post not found</div>;
    }

    return (
        <div>
            <PostCard post={post} />

            <h2>Comments</h2>

            {comments.length === 0 ? (
                <p>No comments yet</p>
            ) : (
                comments.map((comment) => (
                    <div key={comment.id}>
                        <strong>
                            {comment.author.displayName || comment.author.username}
                        </strong>

                        {comment.author.username && (
                            <span> @{comment.author.username}</span>
                        )}

                        <p>{comment.content}</p>
                        <small>
                            {new Date(comment.createdAt).toLocaleString()}
                        </small>
                    </div>
                ))
            )}
        </div>
    );
}
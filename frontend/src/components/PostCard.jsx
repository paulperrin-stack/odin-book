import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

export default function PostCard({ post }) {
    return (
        <div>
            <div>
                {post.author.avatarUrl && (
                    <img
                        src={post.author.avatarUrl}
                        alt={`${post.author.username} avatar`}
                        width="40"
                        height="40"
                    />
                )}

                <div>
                    <strong>
                        {post.author.displayName || post.author.username}
                    </strong>

                    <span> @{post.author.username}</span>
                </div>

                <div>
                    {formatDistanceToNow(
                        new Date(post.createdAt),
                        { addSuffix: true }
                    )}
                </div>
            </div>

            <Link to={`/posts/${post.id}`}>
                <p>{post.content}</p>
            </Link>

            <div>
                <span>Likes: {post._count.likes}</span>
                {' · '}
                <span>Comments: {post._count.comments}</span>
            </div>
        </div>
    );
}
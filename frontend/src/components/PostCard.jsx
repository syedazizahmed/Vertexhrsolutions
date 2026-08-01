import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
  return (
    <article className="post-card">
      {post.coverImage && <img src={post.coverImage} alt={post.title} />}
      <div className="tags">
        {post.tags?.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
      <h3>
        <Link to={`/post/${post.slug}`}>{post.title}</Link>
      </h3>
      <p>{post.excerpt}</p>
      <small>{new Date(post.createdAt).toLocaleDateString()}</small>
    </article>
  );
}

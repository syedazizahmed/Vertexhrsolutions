import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import api from '../api/api.js';
import { SITE_NAME, SITE_URL } from '../config/site.js';

export default function PostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setPost(null);
    setNotFound(false);
    api
      .get(`/posts/${slug}`)
      .then((res) => setPost(res.data))
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return <main className="container"><p>Post not found.</p></main>;
  if (!post) return <main className="container"><p>Loading...</p></main>;

  const pageTitle = `${post.title} | ${SITE_NAME}`;
  const pageUrl = `${SITE_URL}/post/${post.slug}`;

  return (
    <main className="container post-detail">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={post.excerpt} />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={post.excerpt} />
        <meta property="og:url" content={pageUrl} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
        <meta name="twitter:card" content={post.coverImage ? 'summary_large_image' : 'summary'} />
      </Helmet>
      <Link to="/">&larr; Back to all jobs</Link>
      <h1>{post.title}</h1>
      <div className="tags">
        {post.tags?.map((tag) => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <small>
        By {post.author?.name} on {new Date(post.createdAt).toLocaleDateString()}
      </small>
      {post.coverImage && <img src={post.coverImage} alt={post.title} />}
      <div className="content" dangerouslySetInnerHTML={{ __html: post.content }} />
      {post.applyLink && (
        <a className="apply-btn" href={post.applyLink} target="_blank" rel="noreferrer">
          Apply Now
        </a>
      )}
    </main>
  );
}

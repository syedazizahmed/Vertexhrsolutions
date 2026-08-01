import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/api.js';

export default function AdminDashboard() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadPosts = () => {
    api.get('/posts', { params: { page, limit: 10 } }).then((res) => {
      setPosts(res.data.posts);
      setTotalPages(res.data.totalPages);
    });
  };

  useEffect(loadPosts, [page]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/posts/${id}`);
    loadPosts();
  };

  return (
    <main className="container">
      <div className="admin-header">
        <h1>Manage Posts</h1>
        <Link to="/admin/new" className="btn">+ New Post</Link>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Tags</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post._id}>
              <td>{post.title}</td>
              <td>{post.tags?.join(', ')}</td>
              <td>{new Date(post.createdAt).toLocaleDateString()}</td>
              <td>
                <Link to={`/admin/edit/${post._id}`}>Edit</Link>{' '}
                <button onClick={() => handleDelete(post._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</button>
        <span> Page {page} of {totalPages} </span>
        <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>Next</button>
      </div>
    </main>
  );
}

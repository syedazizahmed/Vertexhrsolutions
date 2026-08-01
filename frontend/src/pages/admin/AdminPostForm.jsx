import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/api.js';

const emptyForm = {
  title: '',
  excerpt: '',
  content: '',
  tags: '',
  company: '',
  applyLink: '',
  coverImage: '',
};

export default function AdminPostForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      api.get(`/posts/id/${id}`).then((res) => {
        setForm({ ...res.data, tags: res.data.tags?.join(', ') || '' });
      });
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setUploading(true);
    try {
      const data = new FormData();
      data.append('image', file);
      const res = await api.post('/upload', data);
      setForm((prev) => ({ ...prev, coverImage: res.data.url }));
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
    };

    if (isEdit) {
      await api.put(`/posts/${id}`, payload);
    } else {
      await api.post('/posts', payload);
    }
    navigate('/admin');
  };

  return (
    <main className="container">
      <h1>{isEdit ? 'Edit Post' : 'New Post'}</h1>
      <form onSubmit={handleSubmit} className="form">
        <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input name="excerpt" placeholder="Short excerpt" value={form.excerpt} onChange={handleChange} required />
        <textarea
          name="content"
          placeholder="Full content (basic HTML like <p> and <b> is allowed)"
          rows={10}
          value={form.content}
          onChange={handleChange}
          required
        />
        <input name="tags" placeholder="Tags, comma separated (e.g. Freshers, Internship)" value={form.tags} onChange={handleChange} />
        <input name="company" placeholder="Company name" value={form.company} onChange={handleChange} />
        <input name="applyLink" placeholder="Apply link URL" value={form.applyLink} onChange={handleChange} />

        <label className="file-label">
          Cover image
          <input type="file" accept="image/*" onChange={handleImageSelect} />
        </label>
        {uploading && <p>Uploading...</p>}
        {uploadError && <p className="error">{uploadError}</p>}
        {form.coverImage && (
          <img className="image-preview" src={form.coverImage} alt="Cover preview" />
        )}

        <button type="submit" disabled={uploading}>{isEdit ? 'Update' : 'Publish'}</button>
      </form>
    </main>
  );
}

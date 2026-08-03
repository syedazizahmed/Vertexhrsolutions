import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Save } from 'lucide-react';
import api from '@/api/api';

const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'];
const EXPERIENCE = ['Fresher', '1-2 years', '3-5 years', '5-10 years', '10+ years'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card-flat" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
      <h2 style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
    </div>
  );
}

export default function AdminJobForm() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', excerpt: '', description: '', company: '', companyLogo: '', location: '',
    jobType: 'Full-time', salary: '', experience: '', qualification: '',
    tags: '', applyLink: '', coverImage: '', deadline: '', isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.get(`/jobs/id/${id}`).then((r) => {
      const j = r.data;
      setForm({ title: j.title || '', excerpt: j.excerpt || '', description: j.description || '', company: j.company || '', companyLogo: j.companyLogo || '', location: j.location || '', jobType: j.jobType || 'Full-time', salary: j.salary || '', experience: j.experience || '', qualification: j.qualification || '', tags: (j.tags || []).join(', '), applyLink: j.applyLink || '', coverImage: j.coverImage || '', deadline: j.deadline ? j.deadline.slice(0, 10) : '', isActive: j.isActive ?? true });
    });
  }, [id]);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setError('');
    try {
      const payload = { ...form, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean) };
      if (isEdit) await api.put(`/jobs/${id}`, payload);
      else await api.post('/jobs', payload);
      navigate('/admin');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const G2 = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' };
  const G3 = { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' };
  const MB = { marginBottom: '1rem' };

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        <ChevronLeft size={15} /> Dashboard
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
          {isEdit ? 'Edit Job' : 'Post New Job'}
        </h1>

        <form onSubmit={handleSubmit}>
          <Section title="Basic Info">
            <div style={MB}><Field label="Job Title *"><input className="input" value={form.title} onChange={set('title')} required placeholder="e.g. Senior React Developer" /></Field></div>
            <div style={G2}>
              <Field label="Company *"><input className="input" value={form.company} onChange={set('company')} required placeholder="Company name" /></Field>
              <Field label="Company Logo URL"><input className="input" value={form.companyLogo} onChange={set('companyLogo')} placeholder="https://..." /></Field>
            </div>
            <div style={{ ...G2, marginTop: '1rem' }}>
              <Field label="Location *"><input className="input" value={form.location} onChange={set('location')} required placeholder="e.g. Mumbai / Remote" /></Field>
              <Field label="Job Type *">
                <select className="input" value={form.jobType} onChange={set('jobType')}>
                  {JOB_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <div style={{ ...G3, marginTop: '1rem' }}>
              <Field label="Salary"><input className="input" value={form.salary} onChange={set('salary')} placeholder="e.g. ₹6-9 LPA" /></Field>
              <Field label="Experience">
                <select className="input" value={form.experience} onChange={set('experience')}>
                  <option value="">Any</option>
                  {EXPERIENCE.map((e) => <option key={e}>{e}</option>)}
                </select>
              </Field>
              <Field label="Qualification"><input className="input" value={form.qualification} onChange={set('qualification')} placeholder="e.g. B.Tech" /></Field>
            </div>
            <div style={{ marginTop: '1rem' }}><Field label="Tags (comma separated)"><input className="input" value={form.tags} onChange={set('tags')} placeholder="React, Node.js, MongoDB" /></Field></div>
          </Section>

          <Section title="Job Content">
            <div style={MB}><Field label="Short Excerpt *"><textarea className="input" value={form.excerpt} onChange={set('excerpt')} required rows={2} placeholder="One-line role summary..." /></Field></div>
            <Field label="Full Description * (HTML supported)">
              <textarea className="input" value={form.description} onChange={set('description')} required rows={10} placeholder="<p>Full job description...</p>" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }} />
            </Field>
          </Section>

          <Section title="Links & Settings">
            <div style={G2}>
              <Field label="External Apply Link"><input className="input" value={form.applyLink} onChange={set('applyLink')} placeholder="https://company.com/apply" /></Field>
              <Field label="Cover Image URL"><input className="input" value={form.coverImage} onChange={set('coverImage')} placeholder="https://..." /></Field>
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <div><Field label="Application Deadline"><input className="input" type="date" value={form.deadline} onChange={set('deadline')} style={{ width: 'auto' }} /></Field></div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--text-2)', marginTop: '1.2rem' }}>
                <input type="checkbox" checked={form.isActive} onChange={set('isActive')} style={{ accentColor: 'var(--accent)', width: 15, height: 15 }} />
                Active (visible to public)
              </label>
            </div>
          </Section>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem' }}>
            {saving ? 'Saving...' : <><Save size={15} /> {isEdit ? 'Update Job' : 'Post Job'}</>}
          </button>
        </form>
      </motion.div>
    </main>
  );
}

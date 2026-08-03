import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, Upload } from 'lucide-react';
import api from '@/api/api';
import type { Job } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().min(10, 'Valid phone required'),
  coverLetter: z.string().optional(),
  linkedin: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  portfolio: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  currentCompany: z.string().optional(),
  currentCTC: z.string().optional(),
  expectedCTC: z.string().optional(),
  noticePeriod: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="form-label">{label}</label>
      {children}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}

export default function Apply() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    api.get<Job>(`/jobs/${slug}`)
      .then((r) => {
        setJob(r.data);
        api.get<{ applied: boolean }>(`/applications/check/${r.data._id}`)
          .then((res) => { if (res.data.applied) navigate(`/jobs/${slug}`, { replace: true }); })
          .catch(() => {});
      })
      .catch(() => navigate('/'));
  }, [slug]);

  const onSubmit = async (data: FormData) => {
    if (!job) return;
    setSubmitting(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => v && fd.append(k, v as string));
      if (resume) fd.append('resume', resume);
      await api.post(`/applications/${job._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/jobs/${slug}/thanks`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Submission failed. Please try again.');
    } finally { setSubmitting(false); }
  };

  if (!job) return <main style={{ maxWidth: 680, margin: '2rem auto', padding: '0 1.5rem' }}>
    <div className="skeleton" style={{ height: 500, borderRadius: 16 }} />
  </main>;

  return (
    <main style={{ maxWidth: 680, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <Link to={`/jobs/${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')} onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
        <ChevronLeft size={15} /> Back to Job
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* Summary */}
        <div className="card-flat" style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
          <p style={{ fontSize: '0.74rem', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.2rem' }}>Applying for</p>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>{job.title}</p>
          <p style={{ color: 'var(--text-2)', fontSize: '0.82rem' }}>{job.company} · {job.location}</p>
        </div>

        <div className="card-flat" style={{ padding: '1.75rem' }}>
          <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Application Form</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.82rem', marginBottom: '1.75rem' }}>Fields marked * are required.</p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Full Name *" error={errors.name?.message}>
                <input className="input" placeholder="John Doe" {...register('name')} />
              </Field>
              <Field label="Email *" error={errors.email?.message}>
                <input className="input" type="email" placeholder="you@email.com" {...register('email')} />
              </Field>
            </div>

            <Field label="Phone *" error={errors.phone?.message}>
              <input className="input" placeholder="+91 98765 43210" {...register('phone')} />
            </Field>

            <div className="divider" />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Current Company"><input className="input" placeholder="Company" {...register('currentCompany')} /></Field>
              <Field label="Notice Period"><input className="input" placeholder="e.g. 30 days" {...register('noticePeriod')} /></Field>
              <Field label="Current CTC"><input className="input" placeholder="e.g. ₹6 LPA" {...register('currentCTC')} /></Field>
              <Field label="Expected CTC"><input className="input" placeholder="e.g. ₹9 LPA" {...register('expectedCTC')} /></Field>
            </div>

            <div className="divider" />

            <Field label="LinkedIn Profile" error={errors.linkedin?.message}>
              <input className="input" placeholder="https://linkedin.com/in/..." {...register('linkedin')} />
            </Field>
            <Field label="Portfolio / GitHub" error={errors.portfolio?.message}>
              <input className="input" placeholder="https://github.com/..." {...register('portfolio')} />
            </Field>

            <div className="divider" />

            <Field label="Resume (PDF / DOC)">
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', background: 'var(--surface)', border: `1px solid ${resume ? 'rgba(16,185,129,0.4)' : 'var(--border-2)'}`, borderRadius: 10, padding: '0.75rem 1rem', transition: 'border-color 0.18s' }}>
                <Upload size={16} color={resume ? 'var(--green)' : 'var(--text-3)'} />
                <span style={{ fontSize: '0.88rem', color: resume ? 'var(--green)' : 'var(--text-3)' }}>
                  {resume ? resume.name : 'Click to upload resume'}
                </span>
                <input type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={(e) => setResume(e.target.files?.[0] || null)} />
              </label>
            </Field>

            <Field label="Cover Letter / Message">
              <textarea className="input" rows={4} placeholder="Tell us why you're a great fit..." {...register('coverLetter')} />
            </Field>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.75rem 1rem', color: '#f87171', fontSize: '0.85rem' }}>{error}</div>
            )}

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', justifyContent: 'center', padding: '0.75rem', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              {submitting ? 'Submitting...' : <><Send size={15} /> Submit Application</>}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
}

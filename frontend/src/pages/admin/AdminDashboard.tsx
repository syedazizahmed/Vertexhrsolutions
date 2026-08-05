import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Eye, EyeOff, Users, Briefcase, TrendingUp } from 'lucide-react';
import api from '@/api/api';
import { useAuth } from '@/context/AuthContext';
import type { Job, PaginatedJobs } from '@/types';
import JobApplicantsModal from '@/components/admin/JobApplicantsModal';

export default function AdminDashboard() {
  const { admin } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [appTotal, setAppTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewingJob, setViewingJob] = useState<Job | null>(null);

  const fetchJobs = () => {
    setLoading(true);
    api.get<PaginatedJobs>('/jobs', { params: { page, limit: 15, all: true } })
      .then((r) => { setJobs(r.data.jobs); setTotalPages(r.data.totalPages); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchJobs(); }, [page]);
  useEffect(() => { api.get('/applications', { params: { limit: 1 } }).then((r) => setAppTotal(r.data.total)); }, []);

  const deleteJob = async (id: string) => {
    if (!confirm('Delete this job? This cannot be undone.')) return;
    await api.delete(`/jobs/${id}`); fetchJobs();
  };

  const toggleActive = async (job: Job) => {
    await api.put(`/jobs/${job._id}`, { isActive: !job.isActive }); fetchJobs();
  };

  return (
    <main style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Welcome back, {admin?.name}</p>
        </div>
        <Link to="/admin/jobs/new" className="btn btn-primary"><Plus size={15} /> Post New Job</Link>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total Jobs', value: total, icon: <Briefcase size={20} color="var(--accent)" />, bg: 'var(--accent-dim)' },
          { label: 'Applications', value: appTotal, icon: <Users size={20} color="var(--green)" />, bg: 'var(--green-dim)' },
          { label: 'Active Listings', value: jobs.filter(j => j.isActive).length, icon: <TrendingUp size={20} color="#fbbf24" />, bg: 'rgba(245,158,11,0.1)', isSmall: true },
        ].map((s) => (
          <motion.div key={s.label} className="card-flat"
            style={{ padding: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center' }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ color: 'var(--text-3)', fontSize: '0.78rem', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          </motion.div>
        ))}

        <Link to="/admin/applications" className="card-flat" style={{ padding: '1.25rem', display: 'flex', gap: '0.875rem', alignItems: 'center', textDecoration: 'none', transition: 'border-color 0.18s, box-shadow 0.18s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(99,102,241,0.3)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)'; }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Users size={20} color="var(--accent)" />
          </div>
          <div>
            <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text)' }}>View Applications</div>
            <div style={{ color: 'var(--text-3)', fontSize: '0.75rem', marginTop: '0.15rem' }}>All applicant details</div>
          </div>
        </Link>
      </div>

      {/* Jobs table */}
      <div className="card-flat" style={{ padding: '1.5rem', overflowX: 'auto' }}>
        <h2 style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.25rem' }}>Job Listings</h2>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Title', 'Company', 'Location', 'Type', 'Status', 'Actions'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.5rem 0.75rem', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jobs.map((job) => (
                <tr key={job._id} style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => setViewingJob(job)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.75rem', fontWeight: 500, color: 'var(--text)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.title}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-2)' }}>{job.company}</td>
                  <td style={{ padding: '0.75rem', color: 'var(--text-3)', fontSize: '0.82rem' }}>{job.location}</td>
                  <td style={{ padding: '0.75rem' }}><span className="badge badge-zinc" style={{ fontSize: '0.72rem' }}>{job.jobType}</span></td>
                  <td style={{ padding: '0.75rem' }}>
                    <span style={{ padding: '0.2rem 0.6rem', borderRadius: 99, fontSize: '0.72rem', fontWeight: 500,
                      background: job.isActive ? 'var(--green-dim)' : 'var(--surface-2)',
                      color: job.isActive ? '#34d399' : 'var(--text-3)',
                      border: `1px solid ${job.isActive ? 'rgba(16,185,129,0.2)' : 'var(--border-2)'}` }}>
                      {job.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <Link to={`/admin/jobs/edit/${job._id}`} className="btn btn-secondary btn-sm btn-icon" title="Edit"><Edit2 size={13} /></Link>
                      <button onClick={() => toggleActive(job)} className="btn btn-secondary btn-sm btn-icon" title={job.isActive ? 'Hide' : 'Show'}>{job.isActive ? <EyeOff size={13} /> : <Eye size={13} />}</button>
                      <button onClick={() => deleteJob(job._id)} className="btn btn-danger btn-sm btn-icon" title="Delete"><Trash2 size={13} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.35rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border-2)',
                  background: page === p ? 'var(--accent)' : 'var(--surface-2)', color: page === p ? '#fff' : 'var(--text-2)' }}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {viewingJob && <JobApplicantsModal job={viewingJob} onClose={() => setViewingJob(null)} />}
    </main>
  );
}

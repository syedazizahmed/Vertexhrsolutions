import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Briefcase, ArrowRight, ClipboardList, Search, X, Star } from 'lucide-react';
import api from '@/api/api';
import type { Application } from '@/types';

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'] as const;

export default function AppliedJobs() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const statusFilter = searchParams.get('status') || '';

  useEffect(() => {
    api.get<Application[]>('/applications/mine')
      .then((r) => setApplications(r.data))
      .finally(() => setLoading(false));
  }, []);

  const setStatusFilter = (status: string) => {
    setSearchParams(status ? { status } : {});
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return applications.filter((app) => {
      const matchesStatus = !statusFilter || app.status === statusFilter;
      const matchesSearch = !q ||
        app.job?.title?.toLowerCase().includes(q) ||
        app.job?.company?.toLowerCase().includes(q) ||
        app.job?.location?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [applications, search, statusFilter]);

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem', letterSpacing: '-0.01em' }}>
        {statusFilter ? `${statusFilter} Jobs` : 'Applied Jobs'}
      </h1>
      <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Jobs you've applied to and their current status.</p>

      {!loading && applications.length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              className="input"
              style={{ paddingLeft: '2.25rem', paddingRight: search ? '2.25rem' : undefined }}
              placeholder="Search by job title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Clear search"
                style={{ position: 'absolute', right: '0.7rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: '0.2rem', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <select className="input" style={{ width: 'auto', flexShrink: 0 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Status</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 110, borderRadius: 16 }} />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="card-flat" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <ClipboardList size={28} color="var(--text-3)" style={{ marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem', marginBottom: '1rem' }}>You haven't applied to any jobs yet.</p>
          <Link to="/" className="btn btn-primary btn-sm">Browse Jobs</Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card-flat" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
          <Search size={28} color="var(--text-3)" style={{ marginBottom: '0.75rem' }} />
          <p style={{ color: 'var(--text-2)', fontSize: '0.9rem' }}>
            {statusFilter ? `No ${statusFilter.toLowerCase()} applications${search ? ` match "${search}"` : ''}.` : `No applications match "${search}".`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {filtered.map((app, i) => (
            <motion.div key={app._id} className="card-flat"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }}
              style={{ padding: '1.25rem', border: app.status === 'Shortlisted' ? '1px solid rgba(16,185,129,0.3)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>{app.job?.title}</h3>
                    {app.job?.isActive === false && <span className="badge badge-zinc" style={{ fontSize: '0.68rem' }}>Closed</span>}
                  </div>
                  <div style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{app.job?.company}</div>
                </div>
                <span className={`status-badge status-${app.status}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  {app.status === 'Shortlisted' && <Star size={12} fill="#34d399" />}
                  {app.status}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem' }}>
                {app.job?.location && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                    <MapPin size={12} /> {app.job.location}
                  </span>
                )}
                {app.job?.jobType && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>
                    <Briefcase size={12} /> {app.job.jobType}
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', marginTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
                  Applied {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                {app.job?.slug && (
                  <Link to={`/jobs/${app.job.slug}`} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem', color: 'var(--accent)' }}>
                    View Job <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </main>
  );
}

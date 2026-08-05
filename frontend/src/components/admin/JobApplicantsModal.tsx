import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, Mail, Phone, FileText, ExternalLink, UserRound } from 'lucide-react';
import api from '@/api/api';
import type { Application, Job, PaginatedApplications } from '@/types';

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'] as const;

export default function JobApplicantsModal({ job, onClose }: { job: Job; onClose: () => void }) {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get<PaginatedApplications>('/applications', { params: { jobId: job._id, limit: 100 } })
      .then((r) => setApplications(r.data.applications))
      .finally(() => setLoading(false));
  }, [job._id]);

  const updateStatus = async (id: string, status: string) => {
    setApplications((prev) => prev.map((a) => (a._id === id ? { ...a, status: status as Application['status'] } : a)));
    await api.patch(`/applications/${id}/status`, { status });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem' }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 12, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className="card-flat"
          style={{ width: '100%', maxWidth: 560, maxHeight: '80vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border)' }}>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>{job.title}</h3>
              <p style={{ color: 'var(--text-3)', fontSize: '0.8rem', marginTop: '0.15rem' }}>
                {job.company} · {applications.length} applicant{applications.length === 1 ? '' : 's'}
              </p>
            </div>
            <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon"><X size={16} /></button>
          </div>

          <div style={{ overflowY: 'auto', padding: '1rem 1.5rem' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 8 }} />)}
              </div>
            ) : applications.length === 0 ? (
              <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '2rem 0', fontSize: '0.85rem' }}>No applicants yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {applications.map((app) => (
                  <div key={app._id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '0.75rem 0.9rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.88rem' }}>{app.name}</div>
                        <div style={{ color: 'var(--text-3)', fontSize: '0.76rem', marginTop: '0.1rem' }}>
                          {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </div>
                      </div>
                      <select className="input" style={{ width: 'auto', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                        value={app.status} onChange={(e) => updateStatus(app._id, e.target.value)}>
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.6rem' }}>
                      <a href={`mailto:${app.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.78rem' }}>
                        <Mail size={12} color="var(--accent)" />{app.email}
                      </a>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', fontSize: '0.78rem' }}>
                        <Phone size={12} color="var(--accent)" />{app.phone}
                      </span>
                      {app.resume && (
                        <a href={app.resume} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.78rem' }}>
                          <FileText size={12} color="#818cf8" />Resume
                        </a>
                      )}
                      {app.linkedin && (
                        <a href={app.linkedin} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-2)', textDecoration: 'none', fontSize: '0.78rem' }}>
                          <ExternalLink size={12} color="#818cf8" />LinkedIn
                        </a>
                      )}
                    </div>
                    <button onClick={() => navigate(`/admin/applications/${app._id}`)}
                      className="btn btn-secondary btn-sm" style={{ marginTop: '0.65rem', width: '100%', justifyContent: 'center' }}>
                      <UserRound size={13} /> View Full Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, Mail, Phone, MapPin, Briefcase, Building2, Wallet,
  Clock3, ExternalLink, FileText, User,
} from 'lucide-react';
import api from '@/api/api';
import type { Application } from '@/types';

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'] as const;

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid var(--border)' }}>
      <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ color: 'var(--text-3)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>{label}</div>
        <div style={{ color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

export default function AdminApplicantProfile() {
  const { id } = useParams<{ id: string }>();
  const [app, setApp] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchApp = () => {
    setLoading(true);
    api.get<Application>(`/applications/${id}`).then((r) => setApp(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchApp(); }, [id]);

  const updateStatus = async (status: string) => {
    setApp((prev) => prev ? { ...prev, status: status as Application['status'] } : prev);
    await api.patch(`/applications/${id}/status`, { status });
  };

  if (loading) {
    return (
      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <div className="skeleton" style={{ height: 480, borderRadius: 16 }} />
      </main>
    );
  }

  if (!app) {
    return (
      <main style={{ maxWidth: 900, margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-2)' }}>Application not found.</p>
        <Link to="/admin/applications" className="btn btn-secondary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>← Back to Applications</Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <Link to="/admin/applications" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.82rem', marginBottom: '1.25rem' }}>
        <ChevronLeft size={13} /> Applications
      </Link>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

        {/* Header */}
        <div className="card-flat" style={{ padding: '1.75rem', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--accent-dim)', border: '1px solid rgba(var(--accent-rgb), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <User size={24} color="var(--accent)" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.2rem' }}>{app.name}</h1>
              <div style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
                Applied for <span style={{ color: 'var(--accent)', fontWeight: 500 }}>{app.job?.title}</span> at {app.job?.company}
              </div>
            </div>
          </div>
          <span className={`status-badge status-${app.status}`} style={{ fontSize: '0.82rem', padding: '0.4rem 0.9rem' }}>{app.status}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', alignItems: 'start' }}>

          {/* Contact */}
          <div className="card-flat" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Contact</h2>
            <InfoRow icon={<Mail size={15} color="var(--accent)" />} label="Email" value={app.email} />
            <InfoRow icon={<Phone size={15} color="var(--accent)" />} label="Phone" value={app.phone} />
            <InfoRow icon={<MapPin size={15} color="var(--accent)" />} label="Location" value={app.location} />
          </div>

          {/* Professional */}
          <div className="card-flat" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Professional</h2>
            <InfoRow icon={<Briefcase size={15} color="var(--accent)" />} label="Experience" value={app.experience} />
            <InfoRow icon={<Building2 size={15} color="var(--accent)" />} label="Current Company" value={app.currentCompany} />
            <InfoRow icon={<Wallet size={15} color="var(--accent)" />} label="Current CTC" value={app.currentCTC} />
            <InfoRow icon={<Wallet size={15} color="var(--accent)" />} label="Expected CTC" value={app.expectedCTC} />
            <InfoRow icon={<Clock3 size={15} color="var(--accent)" />} label="Notice Period" value={app.noticePeriod} />
          </div>
        </div>

        {/* Links */}
        {(app.linkedin || app.portfolio || app.resume) && (
          <div className="card-flat" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Links</h2>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              {app.linkedin && <a href={app.linkedin} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={13} /> LinkedIn</a>}
              {app.portfolio && <a href={app.portfolio} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><ExternalLink size={13} /> Portfolio</a>}
              {app.resume && <a href={app.resume} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm"><FileText size={13} /> Resume</a>}
            </div>
          </div>
        )}

        {/* Cover letter */}
        {app.coverLetter && (
          <div className="card-flat" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
            <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Cover Letter</h2>
            <p style={{ color: 'var(--text-2)', fontSize: '0.88rem', lineHeight: 1.7, background: 'var(--surface-2)', borderRadius: 10, padding: '1rem' }}>{app.coverLetter}</p>
          </div>
        )}

        {/* Status */}
        <div className="card-flat" style={{ padding: '1.5rem', marginTop: '1.25rem' }}>
          <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>Update Status</h2>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => updateStatus(s)}
                className={`status-badge status-${s}`}
                style={{ cursor: 'pointer', border: 'none', fontFamily: 'Inter, sans-serif', padding: '0.45rem 0.9rem', fontSize: '0.85rem',
                  opacity: app.status === s ? 1 : 0.45, transition: 'opacity 0.15s, transform 0.15s',
                  transform: app.status === s ? 'scale(1.05)' : 'scale(1)' }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}

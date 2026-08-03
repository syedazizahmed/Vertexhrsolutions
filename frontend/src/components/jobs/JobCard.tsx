import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Clock, Briefcase, Building2, ArrowRight } from 'lucide-react';
import type { Job } from '@/types';

const typeVariant: Record<string, string> = {
  'Full-time': 'badge-green',
  'Part-time': 'badge-amber',
  'Contract':  'badge-amber',
  'Internship':'badge-indigo',
  'Freelance': 'badge-zinc',
};

export default function JobCard({ job, index = 0 }: { job: Job; index?: number }) {
  return (
    <motion.article
      className="card"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
      style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        {job.companyLogo ? (
          <img src={job.companyLogo} alt={job.company}
            style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid var(--border-2)' }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Building2 size={18} color="var(--accent)" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <Link to={`/jobs/${job.slug}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3, marginBottom: '0.15rem',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = '#818cf8')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--text)')}>
              {job.title}
            </h3>
          </Link>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-2)', fontWeight: 500 }}>{job.company}</div>
        </div>
        <span className={`badge ${typeVariant[job.jobType] || 'badge-zinc'}`}>{job.jobType}</span>
      </div>

      {/* Meta row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>
          <MapPin size={12} /> {job.location}
        </span>
        {job.experience && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', fontSize: '0.8rem' }}>
            <Briefcase size={12} /> {job.experience}
          </span>
        )}
        {job.salary && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8rem', color: 'var(--green)', fontWeight: 500 }}>
            <Clock size={12} /> {job.salary}
          </span>
        )}
      </div>

      {/* Excerpt */}
      <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', lineHeight: 1.55,
        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
        {job.excerpt}
      </p>

      {/* Tags */}
      {job.tags?.length > 0 && (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {job.tags.slice(0, 4).map((tag) => (
            <span key={tag} className="badge badge-zinc" style={{ fontSize: '0.7rem' }}>{tag}</span>
          ))}
          {job.tags.length > 4 && <span className="badge badge-zinc" style={{ fontSize: '0.7rem' }}>+{job.tags.length - 4}</span>}
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.625rem', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
        <span style={{ color: 'var(--text-3)', fontSize: '0.75rem' }}>
          {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </span>
        <Link to={`/jobs/${job.slug}`} className="btn btn-ghost btn-sm" style={{ gap: '0.25rem', color: 'var(--accent)' }}>
          View <ArrowRight size={13} />
        </Link>
      </div>
    </motion.article>
  );
}

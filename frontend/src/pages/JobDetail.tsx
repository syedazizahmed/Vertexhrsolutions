import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { MapPin, Clock, Briefcase, Building2, Calendar, GraduationCap, ChevronLeft, ExternalLink, CheckCircle2 } from 'lucide-react';
import api from '@/api/api';
import GoogleAd from '@/components/ui/GoogleAd';
import { useSeeker } from '@/context/SeekerContext';
import { SITE_NAME, SITE_URL, GOOGLE_ADS_SLOT_INLINE } from '@/config/site';
import type { Job } from '@/types';

export default function JobDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const { trackView, seeker } = useSeeker();

  useEffect(() => {
    setJob(null); setNotFound(false); setAlreadyApplied(false);
    api.get<Job>(`/jobs/${slug}`)
      .then((r) => {
        setJob(r.data);
        trackView(r.data._id, r.data.tags);
        if (seeker) {
          api.get<{ applied: boolean }>(`/applications/check/${r.data._id}`)
            .then((res) => setAlreadyApplied(res.data.applied))
            .catch(() => {});
        }
      })
      .catch(() => setNotFound(true));
  }, [slug, seeker]);

  if (notFound) return (
    <main style={{ maxWidth: 800, margin: '5rem auto', padding: '0 1.5rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-2)' }}>Job not found or has been closed.</p>
      <Link to="/" className="btn btn-secondary" style={{ marginTop: '1.25rem', display: 'inline-flex' }}>← Back to Jobs</Link>
    </main>
  );

  if (!job) return (
    <main style={{ maxWidth: 860, margin: '2rem auto', padding: '0 1.5rem' }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
    </main>
  );

  return (
    <>
      <Helmet>
        <title>{job.title} at {job.company} | {SITE_NAME}</title>
        <meta name="description" content={job.excerpt} />
        <link rel="canonical" href={`${SITE_URL}/jobs/${job.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={`${job.title} at ${job.company} | ${SITE_NAME}`} />
        <meta property="og:description" content={job.excerpt} />
        {job.coverImage && <meta property="og:image" content={job.coverImage} />}
      </Helmet>

      <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '1.5rem', transition: 'color 0.15s' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}>
          <ChevronLeft size={15} /> All Jobs
        </Link>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

          {/* Header */}
          <div className="card-flat" style={{ padding: '1.75rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', gap: '1.1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {job.companyLogo ? (
                <img src={job.companyLogo} alt={job.company} style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-2)', flexShrink: 0 }} />
              ) : (
                <div style={{ width: 60, height: 60, borderRadius: 12, background: 'var(--accent-dim)', border: '1px solid rgba(var(--accent-rgb), 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Building2 size={26} color="var(--accent)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <h1 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 700, color: 'var(--text)', lineHeight: 1.25, marginBottom: '0.35rem', letterSpacing: '-0.01em' }}>
                  {job.title}
                </h1>
                <div style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.9rem' }}>{job.company}</div>

                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
                  {[
                    { icon: <MapPin size={13} />, val: job.location },
                    { icon: <Briefcase size={13} />, val: job.jobType },
                    job.experience && { icon: <Clock size={13} />, val: job.experience },
                    job.salary && { icon: null, val: job.salary, color: 'var(--green)' },
                    job.qualification && { icon: <GraduationCap size={13} />, val: job.qualification },
                    job.deadline && { icon: <Calendar size={13} />, val: `Apply by ${new Date(job.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`, color: '#fbbf24' },
                  ].filter(Boolean).map((m: any, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: m.color || 'var(--text-3)', fontSize: '0.82rem' }}>
                      {m.icon} {m.val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {job.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '1.25rem', paddingTop: '1.1rem', borderTop: '1px solid var(--border)' }}>
                {job.tags.map((tag) => <span key={tag} className="badge badge-zinc">{tag}</span>)}
              </div>
            )}
          </div>

          {/* Content + Sidebar */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: '1.25rem', alignItems: 'start' }}>

            <div>
              {job.coverImage && <img src={job.coverImage} alt={job.title} style={{ width: '100%', borderRadius: 12, marginBottom: '1.25rem', maxHeight: 260, objectFit: 'cover', border: '1px solid var(--border)' }} />}

              <div className="card-flat" style={{ padding: '1.75rem' }}>
                <h2 style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '1.1rem' }}>Job Description</h2>
                <div style={{ color: 'var(--text-2)', lineHeight: 1.75, fontSize: '0.9rem' }}
                  dangerouslySetInnerHTML={{ __html: job.description }} />
              </div>

              <GoogleAd slot={GOOGLE_ADS_SLOT_INLINE} format="rectangle" style={{ minHeight: 200, margin: '1.25rem 0' }} />
            </div>

            {/* Apply sidebar */}
            <div style={{ position: 'sticky', top: 98 }}>
              <div className="card-flat" style={{ padding: '1.25rem', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-2)', fontSize: '0.82rem', marginBottom: '1rem', lineHeight: 1.5 }}>
                  {alreadyApplied ? "You've already applied to this job." : 'Ready to apply? Our team will follow up within 3–5 business days.'}
                </p>
                {alreadyApplied ? (
                  <div className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', cursor: 'default', color: 'var(--green)' }}>
                    <CheckCircle2 size={15} /> Already Applied
                  </div>
                ) : job.applyLink ? (
                  <a href={job.applyLink} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    Apply Now <ExternalLink size={13} />
                  </a>
                ) : (
                  <Link to={`/jobs/${job.slug}/apply`} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                    {seeker ? 'Apply Now →' : 'Sign in to Apply →'}
                  </Link>
                )}
                {!job.applyLink && !seeker && (
                  <p style={{ marginTop: '0.6rem', color: 'var(--text-3)', fontSize: '0.74rem' }}>
                    You'll need an account to apply.
                  </p>
                )}
                <p style={{ marginTop: '0.875rem', color: 'var(--text-3)', fontSize: '0.74rem' }}>
                  Posted {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </>
  );
}

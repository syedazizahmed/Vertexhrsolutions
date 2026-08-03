import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { TrendingUp, Sparkles } from 'lucide-react';
import api from '@/api/api';
import JobCard from '@/components/jobs/JobCard';
import TagFilter from '@/components/jobs/TagFilter';
import SearchBar from '@/components/jobs/SearchBar';
import Pagination from '@/components/ui/Pagination';
import { useSeeker } from '@/context/SeekerContext';
import { SITE_NAME, DEFAULT_DESCRIPTION, SITE_URL } from '@/config/site';
import type { Job, PaginatedJobs } from '@/types';

function SkeletonCard() {
  return (
    <div className="card-flat" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
        <div className="skeleton" style={{ width: 40, height: 40, borderRadius: 8, flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="skeleton" style={{ height: 14, width: '70%', marginBottom: 8 }} />
          <div className="skeleton" style={{ height: 12, width: '40%' }} />
        </div>
      </div>
      <div className="skeleton" style={{ height: 12, width: '55%' }} />
      <div className="skeleton" style={{ height: 40 }} />
      <div style={{ display: 'flex', gap: '0.35rem' }}>
        {[60, 50, 70].map((w, i) => <div key={i} className="skeleton" style={{ height: 20, width: w, borderRadius: 99 }} />)}
      </div>
    </div>
  );
}

export default function Home() {
  const { interestTags, seeker } = useSeeker();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [recommended, setRecommended] = useState<Job[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [activeTag, setActiveTag] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { api.get('/jobs/tags').then((r) => setTags(r.data)); }, []);

  useEffect(() => {
    setLoading(true);
    api.get<PaginatedJobs>('/jobs', { params: { tag: activeTag, search, page, limit: 10 } })
      .then((r) => { setJobs(r.data.jobs); setTotalPages(r.data.totalPages); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [activeTag, search, page]);

  useEffect(() => {
    if (interestTags.length === 0) return;
    const exclude = jobs.map((j) => j._id).join(',');
    api.get<Job[]>('/jobs/recommended', { params: { tags: interestTags.join(','), exclude } })
      .then((r) => setRecommended(r.data));
  }, [interestTags, jobs]);

  const handleTagSelect = (tag: string) => { setActiveTag(tag); setPage(1); };
  const handleSearch = (v: string) => { setSearch(v); setPage(1); };

  return (
    <>
      <Helmet>
        <title>{SITE_NAME} | Find Your Dream Job</title>
        <meta name="description" content={DEFAULT_DESCRIPTION} />
        <link rel="canonical" href={SITE_URL} />
      </Helmet>

      {/* ── Hero ── */}
      <section className="hero-bg" style={{ padding: '4.5rem 1.5rem 3.5rem', textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'var(--accent-dim)', border: '1px solid rgba(var(--accent-rgb), 0.25)', borderRadius: 99, padding: '0.3rem 0.9rem', marginBottom: '1.5rem', fontSize: '0.78rem', color: 'var(--accent-text)', fontWeight: 500 }}>
              <Sparkles size={12} /> Vertex HR Solutions
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.07 }}
            style={{ fontSize: 'clamp(1.9rem, 5vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1rem', letterSpacing: '-0.02em' }}
          >
            Find your next{' '}
            <span className="gradient-text">great opportunity</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            style={{ color: 'var(--text-2)', fontSize: '1rem', marginBottom: '2.25rem', lineHeight: 1.6 }}
          >
            We connect exceptional talent with top companies.
            {total > 0 && <> <strong style={{ color: 'var(--text)' }}>{total.toLocaleString()} jobs</strong> available right now.</>}
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}
            style={{ display: 'flex', justifyContent: 'center' }}>
            <SearchBar onSearch={handleSearch} />
          </motion.div>
        </div>
      </section>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5rem' }}>

        {/* Personalized recommendations */}
        {(seeker || interestTags.length > 0) && recommended.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
            style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.1rem' }}>
              <TrendingUp size={17} color="var(--accent)" />
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>
                {seeker ? `Recommended for you, ${seeker.name.split(' ')[0]}` : 'Based on your activity'}
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
              {recommended.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
            </div>
            <div className="divider" style={{ marginTop: '2.5rem' }} />
          </motion.section>
        )}

        {/* Filter row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.9rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)' }}>
            {activeTag ? `${activeTag} jobs` : 'All jobs'}
            <span style={{ color: 'var(--text-3)', fontWeight: 400, marginLeft: '0.4rem', fontSize: '0.85rem' }}>({total})</span>
          </h2>
          <TagFilter tags={tags} activeTag={activeTag} onSelect={handleTagSelect} />
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-3)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔍</div>
            <p style={{ fontSize: '0.95rem' }}>No jobs found. Try a different search term.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1rem' }}>
            {jobs.map((job, i) => <JobCard key={job._id} job={job} index={i} />)}
          </div>
        )}

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      </main>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Download, ChevronLeft, Search } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '@/api/api';
import type { Application, PaginatedApplications } from '@/types';

const STATUSES = ['New', 'Reviewed', 'Shortlisted', 'Rejected'] as const;

export default function AdminApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    api.get<PaginatedApplications>('/applications', { params: { page, limit: 20, search, status: statusFilter } })
      .then((r) => { setApplications(r.data.applications); setTotal(r.data.total); setTotalPages(r.data.totalPages); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchData(); };

  const exportCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Location', 'Experience', 'Job', 'Company', 'Current Company', 'Current CTC', 'Expected CTC', 'Notice Period', 'Status', 'Applied'];
    const rows = applications.map((a) => [a.name, a.email, a.phone, a.location || '', a.experience || '', a.job?.title || '', a.job?.company || '', a.currentCompany || '', a.currentCTC || '', a.expectedCTC || '', a.noticePeriod || '', a.status, new Date(a.createdAt).toLocaleDateString()]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'applications.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-3)', textDecoration: 'none', fontSize: '0.82rem', marginBottom: '0.4rem' }}>
            <ChevronLeft size={13} /> Dashboard
          </Link>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.01em' }}>
            Applications <span style={{ color: 'var(--text-3)', fontWeight: 400, fontSize: '1rem' }}>({total})</span>
          </h1>
        </div>
        <button onClick={exportCSV} className="btn btn-secondary"><Download size={14} /> Export CSV</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: 200 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={14} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search name or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-secondary" style={{ flexShrink: 0 }}>Search</button>
        </form>
        <select className="input" style={{ width: 'auto', flexShrink: 0 }} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card-flat" style={{ overflowX: 'auto' }}>
        {loading ? (
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 44, borderRadius: 8 }} />)}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Applicant', 'Applied For', 'Status', 'Date', ''].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', color: 'var(--text-3)', fontWeight: 500, fontSize: '0.75rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app._id}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.15s' }}
                  onClick={() => navigate(`/admin/applications/${app._id}`)}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-2)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '0.875rem' }}>{app.name}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{app.email}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ color: 'var(--text-2)', fontSize: '0.85rem' }}>{app.job?.title}</div>
                    <div style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>{app.job?.company}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`status-badge status-${app.status}`}>{app.status}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-3)', fontSize: '0.78rem' }}>
                    {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <button className="btn btn-secondary btn-sm">View Profile</button>
                  </td>
                </tr>
              ))}
              {applications.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-3)' }}>No applications found.</td></tr>
              )}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', gap: '0.35rem', padding: '1rem', justifyContent: 'flex-end' }}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)}
                style={{ padding: '0.35rem 0.65rem', borderRadius: 6, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid var(--border-2)', background: page === p ? 'var(--accent)' : 'var(--surface-2)', color: page === p ? '#fff' : 'var(--text-2)' }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

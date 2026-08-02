import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props { currentPage: number; totalPages: number; onPageChange: (p: number) => void }

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => Math.abs(p - currentPage) <= 2 || p === 1 || p === totalPages);

  return (
    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center', alignItems: 'center', margin: '2.5rem 0', flexWrap: 'wrap' }}>
      <button className="btn btn-secondary btn-sm btn-icon" disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{ opacity: currentPage === 1 ? 0.4 : 1, padding: '0.4rem 0.6rem' }}>
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) => (
        <span key={p} style={{ display: 'contents' }}>
          {i > 0 && pages[i] - pages[i - 1] > 1 && (
            <span style={{ color: 'var(--text-3)', padding: '0 0.15rem', fontSize: '0.85rem' }}>…</span>
          )}
          <button onClick={() => onPageChange(p)}
            style={{
              padding: '0.4rem 0.7rem', borderRadius: 8, fontSize: '0.82rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s', border: '1px solid var(--border-2)',
              background: currentPage === p ? 'var(--accent)' : 'var(--surface-2)',
              color: currentPage === p ? '#fff' : 'var(--text-2)',
              minWidth: 34, outline: 'none',
            }}>
            {p}
          </button>
        </span>
      ))}

      <button className="btn btn-secondary btn-sm btn-icon" disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{ opacity: currentPage === totalPages ? 0.4 : 1, padding: '0.4rem 0.6rem' }}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

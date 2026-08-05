import { AnimatePresence, motion } from 'framer-motion';
import { X, LayoutGrid, GraduationCap, Briefcase, Laptop, Star } from 'lucide-react';

export interface Category { value: string; label: string; icon: React.ReactNode }

export const CATEGORIES: Category[] = [
  { value: '', label: 'All Jobs', icon: <LayoutGrid size={16} /> },
  { value: 'freshers', label: 'Freshers', icon: <GraduationCap size={16} /> },
  { value: 'experienced', label: 'Experienced', icon: <Briefcase size={16} /> },
  { value: 'internships', label: 'Internships', icon: <Laptop size={16} /> },
];

// Not a job-attribute filter like the others — routes to the seeker's own shortlisted applications.
export const SHORTLISTED_CATEGORY: Category = { value: 'shortlisted', label: 'Shortlisted', icon: <Star size={16} /> };

interface Props {
  open: boolean;
  onClose: () => void;
  active: string;
  onSelect: (value: string) => void;
}

export default function CategoryDrawer({ open, onClose, active, onSelect }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(2px)', zIndex: 110 }}
          />
          <motion.aside
            initial={{ x: -320 }} animate={{ x: 0 }} exit={{ x: -320 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, width: 280, maxWidth: '85vw',
              background: 'var(--surface)', borderRight: '1px solid var(--border)', zIndex: 111,
              display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.25rem 1rem' }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)' }}>Job Categories</h2>
              <button onClick={onClose} className="btn btn-ghost btn-sm btn-icon"><X size={16} /></button>
            </div>
            <div className="divider" style={{ margin: '0 0 0.75rem' }} />
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', padding: '0 0.75rem' }}>
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { onSelect(c.value); onClose(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.7rem', width: '100%', textAlign: 'left',
                    padding: '0.7rem 0.85rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: active === c.value ? 600 : 500,
                    background: active === c.value ? 'var(--accent-dim)' : 'transparent',
                    color: active === c.value ? 'var(--accent-text)' : 'var(--text-2)',
                    transition: 'background 0.15s, color 0.15s',
                  }}
                  onMouseEnter={e => { if (active !== c.value) (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                  onMouseLeave={e => { if (active !== c.value) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                >
                  {c.icon} {c.label}
                </button>
              ))}
              <div className="divider" style={{ margin: '0.5rem 0' }} />
              <button
                key={SHORTLISTED_CATEGORY.value}
                onClick={() => { onSelect(SHORTLISTED_CATEGORY.value); onClose(); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.7rem', width: '100%', textAlign: 'left',
                  padding: '0.7rem 0.85rem', borderRadius: 10, border: 'none', cursor: 'pointer',
                  fontFamily: 'Inter, sans-serif', fontSize: '0.88rem', fontWeight: 500,
                  background: 'transparent', color: '#fbbf24',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--surface-2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              >
                {SHORTLISTED_CATEGORY.icon} {SHORTLISTED_CATEGORY.label}
              </button>
            </nav>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

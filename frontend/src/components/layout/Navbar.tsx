import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Menu, Sun, Moon, LogOut, LogIn, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSeeker } from '@/context/SeekerContext';
import { useTheme } from '@/context/ThemeContext';
import { useCategory } from '@/context/CategoryContext';

export default function Navbar() {
  const { admin, adminLogout } = useAuth();
  const { seeker, seekerLogout } = useSeeker();
  const { theme, toggleTheme } = useTheme();
  const { openCategoryDrawer } = useCategory();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const navLink = (to: string, label: string) => (
    <Link to={to} style={{
      fontSize: '0.875rem', fontWeight: 500, textDecoration: 'none',
      color: pathname === to ? 'var(--text)' : 'var(--text-2)',
      transition: 'color 0.15s',
      paddingBottom: '2px',
      borderBottom: pathname === to ? '1px solid var(--accent)' : '1px solid transparent',
    }}
    onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
    onMouseLeave={e => { if (pathname !== to) e.currentTarget.style.color = 'var(--text-2)'; }}>
      {label}
    </Link>
  );

  return (
    <motion.nav
      initial={{ y: -16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 1.5rem',
        height: 82,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      {/* Left: category menu + logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={openCategoryDrawer}
          title="Job categories"
        >
          <Menu size={18} />
        </button>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none', flexShrink: 0 }}>
        <img
          src="/logo-mark.png"
          alt="Vertex HR Solutions logo"
          style={{ height: 72, width: 72, borderRadius: 12, flexShrink: 0 }}
        />
        <span style={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--text)',
          letterSpacing: '-0.01em',
          lineHeight: 1,
        }}>
          Vertex HR Solutions
        </span>
      </Link>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
        {navLink('/', 'Jobs')}
        {admin && navLink('/admin', 'Dashboard')}
        {admin && navLink('/admin/applications', 'Applications')}
        {seeker && navLink('/applied-jobs', 'Applied Jobs')}
      </div>

      {/* Right: theme toggle + auth */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          className="btn btn-ghost btn-sm btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {admin ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', paddingRight: '0.5rem' }}>{admin.name}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => { adminLogout(); navigate('/'); }}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : seeker ? (
          <>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-2)', paddingRight: '0.5rem' }}>{seeker.name}</span>
            <button className="btn btn-secondary btn-sm" onClick={() => { seekerLogout(); navigate('/'); }}>
              <LogOut size={13} /> Sign out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost btn-sm"><LogIn size={13} /> Sign in</Link>
            <Link to="/register" className="btn btn-primary btn-sm"><UserPlus size={13} /> Register</Link>
          </>
        )}
      </div>
    </motion.nav>
  );
}

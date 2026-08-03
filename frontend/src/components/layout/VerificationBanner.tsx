import { Link, useLocation } from 'react-router-dom';
import { MailWarning } from 'lucide-react';
import { useSeeker } from '@/context/SeekerContext';

export default function VerificationBanner() {
  const { seeker } = useSeeker();
  const location = useLocation();

  if (!seeker || seeker.isVerified || location.pathname === '/verify-email') return null;

  return (
    <div style={{
      background: 'rgba(245,158,11,0.1)', borderBottom: '1px solid rgba(245,158,11,0.2)',
      padding: '0.6rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '0.6rem', flexWrap: 'wrap', fontSize: '0.82rem',
    }}>
      <MailWarning size={14} color="#fbbf24" style={{ flexShrink: 0 }} />
      <span style={{ color: 'var(--text-2)' }}>Please verify your email address.</span>
      <Link to="/verify-email" state={{ from: location.pathname }}
        style={{ color: '#fbbf24', fontWeight: 600, textDecoration: 'underline' }}>
        Enter code →
      </Link>
    </div>
  );
}

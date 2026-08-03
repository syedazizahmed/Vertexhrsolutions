import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MailCheck } from 'lucide-react';
import api from '@/api/api';
import { useSeeker } from '@/context/SeekerContext';

export default function VerifyEmail() {
  const { seeker, markVerified, resendVerification } = useSeeker();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  if (seeker?.isVerified) {
    return (
      <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
        <div className="card-flat" style={{ width: '100%', maxWidth: 420, padding: '2.5rem', textAlign: 'center' }}>
          <MailCheck size={36} color="var(--green)" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>Already Verified</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Your email is already confirmed.</p>
          <Link to="/" className="btn btn-primary">Browse Jobs</Link>
        </div>
      </main>
    );
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true); setError('');
    try {
      await api.post('/seekers/verify-email', { otp });
      markVerified();
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Verification failed.');
    } finally { setVerifying(false); }
  };

  const handleResend = async () => {
    setResending(true); setError(''); setResent(false);
    try { await resendVerification(); setResent(true); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Could not resend code.');
    } finally { setResending(false); }
  };

  return (
    <main style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="card-flat" style={{ width: '100%', maxWidth: 420, padding: '2.5rem' }}>

        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <MailCheck size={30} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Verify your email</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>
            Enter the 6-digit code we sent to {seeker?.email || 'your email'}.
          </p>
        </div>

        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <input
            className="input"
            inputMode="numeric"
            autoFocus
            maxLength={6}
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '0.5rem', fontWeight: 700 }}
            required
          />

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
          {resent && !error && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#34d399', fontSize: '0.82rem' }}>A new code has been sent.</div>}

          <button type="submit" className="btn btn-primary" disabled={verifying || otp.length !== 6} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
            {verifying ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.83rem', marginTop: '1.5rem' }}>
          Didn't get a code?{' '}
          <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 500, cursor: resending ? 'default' : 'pointer', padding: 0, fontSize: 'inherit' }}>
            {resending ? 'Sending...' : 'Resend code'}
          </button>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to={from} style={{ color: 'var(--text-3)', fontSize: '0.78rem', textDecoration: 'none' }}>Skip for now →</Link>
        </p>
      </motion.div>
    </main>
  );
}

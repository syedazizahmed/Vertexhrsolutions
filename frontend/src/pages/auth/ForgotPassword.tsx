import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { KeyRound, CheckCircle2 } from 'lucide-react';
import api from '@/api/api';
import PasswordInput from '@/components/ui/PasswordInput';

type Step = 'email' | 'otp' | 'password' | 'done';

interface ForgotPasswordProps {
  variant: 'seeker' | 'admin';
}

const errorMessage = (err: unknown, fallback: string) => {
  const e = err as { response?: { data?: { message?: string } } };
  return e?.response?.data?.message || fallback;
};

export default function ForgotPassword({ variant }: ForgotPasswordProps) {
  const prefix = variant === 'admin' ? '/auth' : '/seekers';
  const loginPath = variant === 'admin' ? '/admin/login' : '/login';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.post(`${prefix}/forgot-password`, { email });
      setStep('otp');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Something went wrong. Please try again.'));
    } finally { setLoading(false); }
  };

  const handleResend = async () => {
    setError(''); setResent(false);
    try { await api.post(`${prefix}/forgot-password`, { email }); setResent(true); }
    catch (err: unknown) { setError(errorMessage(err, 'Could not resend code.')); }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true); setError('');
    try {
      await api.post(`${prefix}/reset-password`, { email, otp, newPassword });
      setStep('done');
    } catch (err: unknown) {
      setError(errorMessage(err, 'Could not reset password.'));
    } finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="card-flat" style={{ width: '100%', maxWidth: 400, padding: '2.25rem' }}>

        {step === 'email' && (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Reset your password</h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Enter your email and we'll send you a reset code.</p>
            </div>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label className="form-label">Email</label>
                <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <KeyRound size={30} color="var(--accent)" style={{ marginBottom: '0.75rem' }} />
              <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Enter reset code</h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Enter the 6-digit code we sent to {email}.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setError(''); setStep('password'); }} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
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
              <button type="submit" className="btn btn-primary" disabled={otp.length !== 6} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
                Continue
              </button>
            </form>
            <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.83rem', marginTop: '1.5rem' }}>
              Didn't get a code?{' '}
              <button onClick={handleResend} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontWeight: 500, cursor: 'pointer', padding: 0, fontSize: 'inherit' }}>
                Resend code
              </button>
            </p>
          </>
        )}

        {step === 'password' && (
          <>
            <div style={{ marginBottom: '1.75rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Set a new password</h1>
              <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Choose a new password for your account.</p>
            </div>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div>
                <label className="form-label">New password</label>
                <PasswordInput value={newPassword} onChange={setNewPassword} required autoFocus />
              </div>
              <div>
                <label className="form-label">Confirm password</label>
                <PasswordInput value={confirmPassword} onChange={setConfirmPassword} required />
              </div>
              {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </form>
            <p style={{ textAlign: 'center', marginTop: '1rem' }}>
              <button onClick={() => { setError(''); setStep('otp'); }} style={{ background: 'none', border: 'none', color: 'var(--text-3)', fontSize: '0.78rem', cursor: 'pointer', padding: 0 }}>
                ← Back to code entry
              </button>
            </p>
          </>
        )}

        {step === 'done' && (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={36} color="var(--green)" style={{ marginBottom: '1rem' }} />
            <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.4rem' }}>Password reset</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>You can now sign in with your new password.</p>
            <Link to={loginPath} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.7rem' }}>Sign in</Link>
          </div>
        )}

        {step !== 'done' && (
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to={loginPath} style={{ color: 'var(--text-3)', fontSize: '0.78rem', textDecoration: 'none' }}>← Back to sign in</Link>
          </p>
        )}
      </motion.div>
    </main>
  );
}

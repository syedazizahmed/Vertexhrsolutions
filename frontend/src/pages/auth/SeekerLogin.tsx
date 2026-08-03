import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useSeeker } from '@/context/SeekerContext';

export default function SeekerLogin() {
  const { seekerLogin } = useSeeker();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await seekerLogin(email, password); navigate(from); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Invalid email or password');
    } finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="card-flat" style={{ width: '100%', maxWidth: 400, padding: '2.25rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Sign in to track applications & get personalised jobs</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input className="input" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ paddingRight: '2.75rem' }} />
              <button type="button" onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 0 }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.83rem', marginTop: '1.5rem' }}>
          No account? <Link to="/register" state={{ from }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Register</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>
          <Link to="/admin/login" style={{ color: 'var(--text-3)', fontSize: '0.78rem', textDecoration: 'none' }}>Admin login →</Link>
        </p>
      </motion.div>
    </main>
  );
}

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSeeker } from '@/context/SeekerContext';
import PasswordInput from '@/components/ui/PasswordInput';

export default function SeekerRegister() {
  const { seekerRegister } = useSeeker();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || '/';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try { await seekerRegister(name, email, password); navigate('/verify-email', { state: { from } }); }
    catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="card-flat" style={{ width: '100%', maxWidth: 400, padding: '2.25rem' }}>

        <div style={{ marginBottom: '1.75rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.3rem' }}>Create an account</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.85rem' }}>Get personalised job recommendations</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[{ label: 'Full Name', type: 'text', val: name, set: setName, ph: 'John Doe' },
            { label: 'Email', type: 'email', val: email, set: setEmail, ph: 'you@email.com' },
          ].map(({ label, type, val, set, ph }) => (
            <div key={label}>
              <label className="form-label">{label}</label>
              <input className="input" type={type} placeholder={ph} value={val} onChange={(e) => set(e.target.value)} required />
            </div>
          ))}
          <div>
            <label className="form-label">Password</label>
            <PasswordInput value={password} onChange={setPassword} required />
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', color: 'var(--text-3)', fontSize: '0.83rem', marginTop: '1.5rem' }}>
          Already have an account? <Link to="/login" state={{ from }} style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 500 }}>Sign in</Link>
        </p>
      </motion.div>
    </main>
  );
}

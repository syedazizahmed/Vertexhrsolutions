import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import PasswordInput from '@/components/ui/PasswordInput';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try { await adminLogin(email, password); navigate('/admin'); }
    catch { setError('Invalid email or password'); }
    finally { setLoading(false); }
  };

  return (
    <main style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="card-flat" style={{ width: '100%', maxWidth: 380, padding: '2.25rem' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--accent-dim)', border: '1px solid rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Shield size={17} color="var(--accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.2 }}>Admin Access</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.78rem' }}>Vertex HR Solutions</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <label className="form-label">Email</label>
            <input className="input" type="email" placeholder="admin@vertexhr.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label className="form-label">Password</label>
              <Link to="/admin/forgot-password" style={{ color: 'var(--accent)', fontSize: '0.78rem', textDecoration: 'none', marginBottom: '0.375rem' }}>Forgot password?</Link>
            </div>
            <PasswordInput value={password} onChange={setPassword} required />
          </div>

          {error && <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.65rem 0.875rem', color: '#f87171', fontSize: '0.82rem' }}>{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.7rem', marginTop: '0.25rem' }}>
            {loading ? 'Authenticating...' : 'Sign in'}
          </button>
        </form>
      </motion.div>
    </main>
  );
}

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export default function Thanks() {
  return (
    <main style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="card-flat"
        style={{ maxWidth: 460, width: '100%', padding: '3rem 2.5rem', textAlign: 'center' }}
      >
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 18 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--green-dim)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
            <CheckCircle2 size={30} color="var(--green)" />
          </div>
        </motion.div>

        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text)', marginBottom: '0.75rem', letterSpacing: '-0.01em' }}>
          Application submitted!
        </h1>
        <p style={{ color: 'var(--text-2)', lineHeight: 1.65, marginBottom: '2rem', fontSize: '0.9rem' }}>
          Thanks for applying through <strong style={{ color: 'var(--text)' }}>Vertex HR Solutions</strong>. Our team will review your application and reach out within 3–5 business days.
        </p>

        <Link to="/" className="btn btn-primary" style={{ display: 'inline-flex', padding: '0.7rem 1.5rem' }}>
          Browse more jobs <ArrowRight size={15} />
        </Link>

        <p style={{ marginTop: '1.5rem', color: 'var(--text-3)', fontSize: '0.78rem' }}>
          Keep an eye on your inbox for updates.
        </p>
      </motion.div>
    </main>
  );
}

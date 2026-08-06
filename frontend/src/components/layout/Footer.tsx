import { Mail } from 'lucide-react';

const socialLinks = [
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/vertexhrsolutionsofficial/?hl=en',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="1.15" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/vertex-hr-solutions-a6a933426',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.15 1.45-2.15 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45z" />
      </svg>
    ),
  },
  {
    label: 'X',
    href: 'https://x.com/vertexhr1',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.9 2.4h3.1l-6.77 7.73L23.2 21.6h-6.23l-4.88-6.38-5.58 6.38H3.4l7.24-8.27L2.8 2.4h6.39l4.41 5.83 5.3-5.83zm-1.09 17.3h1.72L7.28 4.2H5.44l12.37 15.5z" />
      </svg>
    ),
  },
  {
    label: 'WhatsApp',
    href: 'https://wa.me/918008821693',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.47 14.38c-.29-.15-1.73-.85-2-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.71-1.61-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.49-.66-.5h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.02c.15.2 2.06 3.14 4.99 4.41.7.3 1.24.48 1.67.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.98-1.39.24-.68.24-1.27.17-1.39-.07-.13-.27-.2-.56-.34z" />
        <path d="M12.02 2.5A9.5 9.5 0 0 0 3.9 17.24L2.5 21.5l4.4-1.36a9.5 9.5 0 1 0 5.12-17.64zm0 17.28a7.75 7.75 0 0 1-3.96-1.08l-.28-.17-2.61.81.82-2.55-.18-.28a7.78 7.78 0 1 1 6.21 3.27z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=admin@vertexhrsolutions.careers',
    icon: <Mail size={18} />,
  },
];

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--border)',
        background: 'var(--surface)',
        marginTop: '4rem',
        padding: '2.5rem 1.5rem',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 700,
              color: 'var(--text)',
              fontSize: '1rem',
              marginBottom: '0.25rem',
            }}
          >
            Vertex HR Solutions
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-3)' }}>
            &copy; {new Date().getFullYear()} Vertex HR Solutions. All rights reserved.
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {socialLinks.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              title={label}
              className="btn btn-ghost btn-icon"
              style={{ color: 'var(--text-2)' }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

interface Props { tags: string[]; activeTag: string; onSelect: (tag: string) => void }

export default function TagFilter({ tags, activeTag, onSelect }: Props) {
  if (tags.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
      {['', ...tags].map((tag) => {
        const active = tag === activeTag;
        return (
          <button key={tag || '__all'}
            onClick={() => onSelect(tag)}
            style={{
              padding: '0.3rem 0.8rem', borderRadius: 99, fontSize: '0.78rem', fontWeight: 500,
              cursor: 'pointer', transition: 'all 0.15s', border: 'none',
              background: active ? 'var(--accent)' : 'var(--surface-2)',
              color: active ? '#fff' : 'var(--text-2)',
              outline: 'none',
            }}
            onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-3)'; e.currentTarget.style.color = 'var(--text)'; }}}
            onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-2)'; }}}
          >
            {tag || 'All'}
          </button>
        );
      })}
    </div>
  );
}

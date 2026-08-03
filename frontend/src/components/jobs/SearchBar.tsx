import { useState } from 'react';
import { Search } from 'lucide-react';

export default function SearchBar({ onSearch }: { onSearch: (v: string) => void }) {
  const [value, setValue] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSearch(value); }}
      style={{ display: 'flex', gap: '0.5rem', maxWidth: 560 }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input className="input" style={{ paddingLeft: '2.5rem' }}
          placeholder="Search jobs, companies, skills..."
          value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.25rem', flexShrink: 0 }}>Search</button>
    </form>
  );
}

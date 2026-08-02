import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '@/api/api';

interface SeekerUser { name: string; email: string; interestTags: string[] }
interface SeekerCtx {
  seeker: SeekerUser | null;
  seekerLogin: (email: string, password: string) => Promise<void>;
  seekerRegister: (name: string, email: string, password: string) => Promise<void>;
  seekerLogout: () => void;
  trackView: (jobId: string, tags: string[]) => void;
  interestTags: string[];
}

const SeekerContext = createContext<SeekerCtx | null>(null);

export function SeekerProvider({ children }: { children: ReactNode }) {
  const [seeker, setSeeker] = useState<SeekerUser | null>(() => {
    const token = localStorage.getItem('seekerToken');
    const raw = localStorage.getItem('seekerUser');
    return token && raw ? JSON.parse(raw) : null;
  });

  const [interestTags, setInterestTags] = useState<string[]>(() => {
    const raw = localStorage.getItem('interestTags');
    return raw ? JSON.parse(raw) : [];
  });

  const save = (token: string, user: SeekerUser) => {
    localStorage.setItem('seekerToken', token);
    localStorage.setItem('seekerUser', JSON.stringify(user));
    setSeeker(user);
  };

  const seekerLogin = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/seekers/login', { email, password });
    save(data.token, { name: data.name, email: data.email, interestTags: [] });
    const me = await api.get('/seekers/me');
    const updated = { ...seeker!, interestTags: me.data.interestTags };
    setSeeker(updated);
    setInterestTags(me.data.interestTags);
    localStorage.setItem('interestTags', JSON.stringify(me.data.interestTags));
  }, [seeker]);

  const seekerRegister = useCallback(async (name: string, email: string, password: string) => {
    const { data } = await api.post('/seekers/register', { name, email, password });
    save(data.token, { name: data.name, email: data.email, interestTags: [] });
  }, []);

  const seekerLogout = useCallback(() => {
    localStorage.removeItem('seekerToken');
    localStorage.removeItem('seekerUser');
    localStorage.removeItem('interestTags');
    setSeeker(null);
    setInterestTags([]);
  }, []);

  const trackView = useCallback((jobId: string, tags: string[]) => {
    if (localStorage.getItem('seekerToken')) {
      api.post(`/seekers/view/${jobId}`).catch(() => {});
    }
    // update local interest tags
    const stored: Record<string, number> = JSON.parse(localStorage.getItem('tagFreq') || '{}');
    tags.forEach((t) => { stored[t] = (stored[t] || 0) + 1; });
    localStorage.setItem('tagFreq', JSON.stringify(stored));
    const sorted = Object.entries(stored).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([t]) => t);
    setInterestTags(sorted);
    localStorage.setItem('interestTags', JSON.stringify(sorted));
  }, []);

  return (
    <SeekerContext.Provider value={{ seeker, seekerLogin, seekerRegister, seekerLogout, trackView, interestTags }}>
      {children}
    </SeekerContext.Provider>
  );
}

export const useSeeker = () => {
  const ctx = useContext(SeekerContext);
  if (!ctx) throw new Error('useSeeker must be inside SeekerProvider');
  return ctx;
};

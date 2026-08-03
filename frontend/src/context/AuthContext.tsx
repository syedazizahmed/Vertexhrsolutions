import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import api from '@/api/api';

interface AdminUser { name: string; email: string }
interface AuthCtx {
  admin: AdminUser | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(() => {
    const token = localStorage.getItem('adminToken');
    const name = localStorage.getItem('adminName');
    const email = localStorage.getItem('adminEmail');
    return token && name && email ? { name, email } : null;
  });

  const adminLogin = useCallback(async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminName', data.name);
    localStorage.setItem('adminEmail', data.email);
    setAdmin({ name: data.name, email: data.email });
  }, []);

  const adminLogout = useCallback(() => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    setAdmin(null);
  }, []);

  return <AuthContext.Provider value={{ admin, adminLogin, adminLogout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

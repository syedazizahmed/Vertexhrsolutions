import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import type { ReactNode } from 'react';

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  return admin ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

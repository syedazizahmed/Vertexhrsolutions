import { Navigate, useLocation } from 'react-router-dom';
import { useSeeker } from '@/context/SeekerContext';
import type { ReactNode } from 'react';

export default function SeekerPrivateRoute({ children }: { children: ReactNode }) {
  const { seeker } = useSeeker();
  const location = useLocation();
  return seeker ? <>{children}</> : <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
}

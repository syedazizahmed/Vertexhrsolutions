import { Routes, Route } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import VerificationBanner from '@/components/layout/VerificationBanner';
import PrivateRoute from '@/components/ui/PrivateRoute';
import SeekerPrivateRoute from '@/components/ui/SeekerPrivateRoute';
import Home from '@/pages/Home';
import JobDetail from '@/pages/JobDetail';
import Apply from '@/pages/Apply';
import Thanks from '@/pages/Thanks';
import AppliedJobs from '@/pages/AppliedJobs';
import VerifyEmail from '@/pages/VerifyEmail';
import SeekerLogin from '@/pages/auth/SeekerLogin';
import SeekerRegister from '@/pages/auth/SeekerRegister';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminJobForm from '@/pages/admin/AdminJobForm';
import AdminApplications from '@/pages/admin/AdminApplications';

export default function App() {
  return (
    <>
      <Navbar />
      <VerificationBanner />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route path="/jobs/:slug/apply" element={<SeekerPrivateRoute><Apply /></SeekerPrivateRoute>} />
        <Route path="/jobs/:slug/thanks" element={<Thanks />} />

        {/* Seeker auth */}
        <Route path="/login" element={<SeekerLogin />} />
        <Route path="/register" element={<SeekerRegister />} />
        <Route path="/verify-email" element={<SeekerPrivateRoute><VerifyEmail /></SeekerPrivateRoute>} />
        <Route path="/applied-jobs" element={<SeekerPrivateRoute><AppliedJobs /></SeekerPrivateRoute>} />

        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin/jobs/new" element={<PrivateRoute><AdminJobForm /></PrivateRoute>} />
        <Route path="/admin/jobs/edit/:id" element={<PrivateRoute><AdminJobForm /></PrivateRoute>} />
        <Route path="/admin/applications" element={<PrivateRoute><AdminApplications /></PrivateRoute>} />
      </Routes>
    </>
  );
}

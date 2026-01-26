import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Public pages
import Home from '@/pages/Home';
import Login from '@/pages/Login';
import DonorRegistration from '@/pages/DonorRegistration';
import Unauthorized from '@/pages/Unauthorized';
import NotFound from '@/pages/NotFound';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import PublicResources from '@/pages/PublicResources';

// Teacher pages
import TeacherDashboard from '@/pages/teacher/TeacherDashboard';
import SubmitWelfareRequest from '@/pages/teacher/SubmitWelfareRequest';
import TrackWelfareRequests from '@/pages/teacher/TrackWelfareRequests';
import UploadResource from '@/pages/teacher/UploadResource';
import TeacherCirculars from '@/pages/teacher/TeacherCirculars';
import TeacherProfile from '@/pages/teacher/TeacherProfile';

// Principal pages
import PrincipalDashboard from '@/pages/principal/PrincipalDashboard';
import ReviewWelfareRequests from '@/pages/principal/ReviewWelfareRequests';
import SubmitReport from '@/pages/principal/SubmitReport';
import PrincipalCirculars from '@/pages/principal/PrincipalCirculars';
import PrincipalProfile from '@/pages/principal/PrincipalProfile';

// ZEO pages
import ZEODashboard from '@/pages/zeo/ZEODashboard';
import UserManagement from '@/pages/zeo/UserManagement';
import WelfareApproval from '@/pages/zeo/WelfareApproval';
import DonationManagement from '@/pages/zeo/DonationManagement';
import PublishCircular from '@/pages/zeo/PublishCircular';
import ResourceApproval from '@/pages/zeo/ResourceApproval';
import ReportReview from '@/pages/zeo/ReportReview';
import Analytics from '@/pages/zeo/Analytics';

// Donor pages
import DonorDashboard from '@/pages/donor/DonorDashboard';
import BrowseWelfareRequests from '@/pages/donor/BrowseWelfareRequests';
import MakeDonation from '@/pages/donor/MakeDonation';
import TrackDonations from '@/pages/donor/TrackDonations';
import DonorProfile from '@/pages/donor/DonorProfile';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/resources" element={<PublicResources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donor/register" element={<DonorRegistration />} />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Teacher routes */}
          <Route path="/teacher/dashboard" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherDashboard />
            </ProtectedRoute>
          } />
          <Route path="/teacher/submit-request" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <SubmitWelfareRequest />
            </ProtectedRoute>
          } />
          <Route path="/teacher/track-requests" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TrackWelfareRequests />
            </ProtectedRoute>
          } />
          <Route path="/teacher/upload-resource" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <UploadResource />
            </ProtectedRoute>
          } />
          <Route path="/teacher/circulars" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherCirculars />
            </ProtectedRoute>
          } />
          <Route path="/teacher/profile" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherProfile />
            </ProtectedRoute>
          } />

          {/* Principal routes */}
          <Route path="/principal/dashboard" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalDashboard />
            </ProtectedRoute>
          } />
          <Route path="/principal/review-requests" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <ReviewWelfareRequests />
            </ProtectedRoute>
          } />
          <Route path="/principal/submit-report" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <SubmitReport />
            </ProtectedRoute>
          } />
          <Route path="/principal/circulars" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalCirculars />
            </ProtectedRoute>
          } />
          <Route path="/principal/profile" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalProfile />
            </ProtectedRoute>
          } />

          {/* ZEO routes */}
          <Route path="/zeo/dashboard" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <ZEODashboard />
            </ProtectedRoute>
          } />
          <Route path="/zeo/users" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <UserManagement />
            </ProtectedRoute>
          } />
          <Route path="/zeo/welfare-approval" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <WelfareApproval />
            </ProtectedRoute>
          } />
          <Route path="/zeo/donations" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <DonationManagement />
            </ProtectedRoute>
          } />
          <Route path="/zeo/publish-circular" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <PublishCircular />
            </ProtectedRoute>
          } />
          <Route path="/zeo/resources" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <ResourceApproval />
            </ProtectedRoute>
          } />
          <Route path="/zeo/reports" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <ReportReview />
            </ProtectedRoute>
          } />
          <Route path="/zeo/analytics" element={
            <ProtectedRoute allowedRoles={['zeo']}>
              <Analytics />
            </ProtectedRoute>
          } />

          {/* Donor routes */}
          <Route path="/donor/dashboard" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/donor/browse-requests" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <BrowseWelfareRequests />
            </ProtectedRoute>
          } />
          <Route path="/donor/make-donation" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <MakeDonation />
            </ProtectedRoute>
          } />
          <Route path="/donor/track-donations" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <TrackDonations />
            </ProtectedRoute>
          } />
          <Route path="/donor/profile" element={
            <ProtectedRoute allowedRoles={['donor']}>
              <DonorProfile />
            </ProtectedRoute>
          } />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;

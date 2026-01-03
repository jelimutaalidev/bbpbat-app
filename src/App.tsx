import { useState, useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { getCurrentUser } from './api/apiService';
import { clearAuthStorage } from './api/utils/authUtils';
// Components (Lazy Loaded)
const LandingPage = lazy(() => import('./components/LandingPage'));
const RegistrationMenu = lazy(() => import('./components/RegistrationMenu'));
const StudentRegistration = lazy(() => import('./components/StudentRegistration'));
const GeneralRegistration = lazy(() => import('./components/GeneralRegistration'));
const InfoPage = lazy(() => import('./components/InfoPage'));
const HomePage = lazy(() => import('./components/HomePage'));
const LoginPage = lazy(() => import('./components/LoginPage'));
const MainPage = lazy(() => import('./components/MainPage'));
const AdminLoginPage = lazy(() => import('./components/admin/AdminLoginPage'));
const AdminMainPage = lazy(() => import('./components/admin/AdminMainPage'));
// Type for navigation state is no longer needed for state, but might be used in props if we haven't refactored children yet.
// We will keep it for now to avoid breaking imports in children, but we won't use it in App.tsx.
export type NavigationState = 'landing' | 'info' | 'registration-menu' | 'student-registration' | 'general-registration' | 'home' | 'login' | 'main' | 'admin-login' | 'admin-main';
// Protected Route Component
const ProtectedRoute = ({ children, isAdmin = false, isAuthenticated, isChecking }: { children: JSX.Element, isAdmin?: boolean, isAuthenticated: boolean, isChecking: boolean }) => {
  const location = useLocation();
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-lg font-semibold text-gray-700">Memverifikasi sesi...</p>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to={isAdmin ? "/admin/login" : "/login"} state={{ from: location }} replace />;
  }
  return children;
};
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);
function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const location = useLocation();
  const [pendingLogout, setPendingLogout] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsCheckingAuth(false);
        return;
      }
      try {
        const { data: user } = await getCurrentUser();
        if (user.role === 'ADMIN') {
          setIsAdminLoggedIn(true);
        } else {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error("Gagal memvalidasi sesi:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    validateSession();
  }, []);

  useEffect(() => {
    // Only clear auth state once we are safely on the public landing page
    if (pendingLogout && location.pathname === '/') {
      setIsLoggedIn(false);
      setIsAdminLoggedIn(false);
      setPendingLogout(false);
    }
  }, [location.pathname, pendingLogout]);

  const handleLogout = () => {
    clearAuthStorage();
    setPendingLogout(true);
    navigate('/');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigate={() => { }} />} />
          <Route path="/info" element={<InfoPage onNavigate={() => { }} />} />
          <Route path="/registration" element={<RegistrationMenu onNavigate={() => { }} />} />
          <Route path="/registration/student" element={<StudentRegistration onNavigate={() => { }} />} />
          <Route path="/registration/general" element={<GeneralRegistration onNavigate={() => { }} />} />
          <Route path="/home" element={<HomePage onNavigate={() => { }} />} />
          {/* Login Routes */}
          <Route
            path="/login"
            element={
              isCheckingAuth ? <PageLoader /> :
                isLoggedIn ? <Navigate to="/dashboard" replace /> : <LoginPage onNavigate={() => { }} onLogin={setIsLoggedIn} />
            }
          />
          <Route
            path="/admin/login"
            element={
              isCheckingAuth ? <PageLoader /> :
                isAdminLoggedIn ? <Navigate to="/admin/dashboard" replace /> : <AdminLoginPage onNavigate={() => { }} onLogin={setIsAdminLoggedIn} />
            }
          />
          {/* Protected User Routes */}
          <Route
            path="/dashboard/*"
            element={
              <ProtectedRoute isAuthenticated={isLoggedIn} isChecking={isCheckingAuth}>
                <MainPage onNavigate={() => { }} onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          {/* Protected Admin Routes */}
          <Route
            path="/admin/dashboard/*"
            element={
              <ProtectedRoute isAuthenticated={isAdminLoggedIn} isAdmin={true} isChecking={isCheckingAuth}>
                <AdminMainPage onLogout={handleLogout} />
              </ProtectedRoute>
            }
          />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
export default App;
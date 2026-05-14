import { useEffect, useMemo, useState } from 'react';
import SiteFooter from './components/SiteFooter';
import SiteHeader from './components/SiteHeader';
import CartDrawer from './components/CartDrawer';
import { Navigate, Route, Routes } from 'react-router-dom';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CoursesPage from './pages/CoursesPage';
import HomePage from './pages/HomePage';
import RecipeDetailPage from './pages/RecipeDetailPage';
import RecipeLibraryPage from './pages/RecipeLibraryPage';
import NewsletterPage from './pages/NewsletterPage';
import WpPageDetailPage from './pages/WpPageDetailPage';
import { useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import AdminSetupPage from './pages/AdminSetupPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuthStore } from './store/authStore';
import DashboardPage from './pages/DashboardPage';
import CourseLearnPage from './pages/CourseLearnPage';
import CertificatesPage from './pages/CertificatesPage';
import CertificateDetailPage from './pages/CertificateDetailPage';
import CertificateVerifyPage from './pages/CertificateVerifyPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import OrderDetailPage from './pages/OrderDetailPage';
import LiveSessionsPage from './pages/LiveSessionsPage';
import LiveSessionDetailPage from './pages/LiveSessionDetailPage';
import SupportTicketsPage from './pages/SupportTicketsPage';
import SupportTicketDetailPage from './pages/SupportTicketDetailPage';
import InstructorDashboardPage from './pages/InstructorDashboardPage';
import { api } from './api/client';

function getAnalyticsSessionId() {
  try {
    const key = 'lf:session_id';
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(key, id);
    return id;
  } catch {
    return `mem-${Date.now().toString(36)}`;
  }
}

function ProtectedRoute({ children }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const location = useLocation();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function AdminRoute({ children }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
}

function InstructorRoute({ children }) {
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const location = useLocation();
  if (!hydrated) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  const role = user?.role;
  if (role !== 'instructor' && role !== 'admin' && role !== 'super_admin') return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);
  const [persistHydrated, setPersistHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    setCartOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const unsub = useAuthStore.persist.onFinishHydration(() => setPersistHydrated(true));
    // In case hydration already finished before this effect runs.
    if (useAuthStore.persist.hasHydrated()) setPersistHydrated(true);
    return typeof unsub === 'function' ? unsub : undefined;
  }, []);

  // Anonymous analytics for conversion funnel (backend aggregates).
  useEffect(() => {
    const sessionId = getAnalyticsSessionId();
    api.analytics.track({
      event_type: 'page_view',
      metadata: {
        session_id: sessionId,
        path: location.pathname,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
      },
    });
  }, [location.pathname]);

  useEffect(() => {
    const onCartEvent = (event) => {
      const detail = event?.detail ?? {};
      const sessionId = getAnalyticsSessionId();
      const kind = String(detail.kind ?? '');
      const eventType = kind === 'add' ? 'cart_add' : kind === 'remove' ? 'cart_remove' : null;
      if (!eventType) return;
      api.analytics.track({
        event_type: eventType,
        entity_type: detail.entity_type ?? 'course',
        entity_id: detail.entity_id ?? null,
        metadata: { session_id: sessionId, path: location.pathname },
      });
    };
    window.addEventListener('lf:cart_event', onCartEvent);
    return () => window.removeEventListener('lf:cart_event', onCartEvent);
  }, [location.pathname]);

  useEffect(() => {
    // One-time session bootstrap to prevent route flicker and restore sessions.
    if (!persistHydrated) return;
    useAuthStore.getState().hydrateSession();
  }, [persistHydrated]);

  // Back-compat: if something else sets token, ensure we validate it once hydrated.
  const shouldValidate = useMemo(() => Boolean(token && hydrated), [token, hydrated]);
  useEffect(() => {
    if (!shouldValidate) return;
    useAuthStore.getState().refreshProfile();
  }, [shouldValidate]);

  return (
    <div className="page">
      <SiteHeader onCartClick={() => setCartOpen(true)} />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />
        <Route path="/live-sessions" element={<LiveSessionsPage />} />
        <Route path="/live-sessions/:slug" element={<LiveSessionDetailPage />} />
        <Route
          path="/course/:slug/learn"
          element={
            <ProtectedRoute>
              <CourseLearnPage />
            </ProtectedRoute>
          }
        />
        <Route path="/recipe-library" element={<RecipeLibraryPage />} />
        <Route path="/recipes/:slug" element={<RecipeDetailPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/certificates/verify/:certificateCode" element={<CertificateVerifyPage />} />
        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-success"
          element={
            <ProtectedRoute>
              <OrderSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support"
          element={
            <ProtectedRoute>
              <SupportTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/support/:id"
          element={
            <ProtectedRoute>
              <SupportTicketDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates"
          element={
            <ProtectedRoute>
              <CertificatesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/certificates/:courseId"
          element={
            <ProtectedRoute>
              <CertificateDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/setup" element={<AdminSetupPage />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/analytics/*"
          element={
            <AdminRoute>
              <AdminAnalyticsPage />
            </AdminRoute>
          }
        />
        <Route
          path="/instructor/dashboard"
          element={
            <InstructorRoute>
              <InstructorDashboardPage />
            </InstructorRoute>
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/newsletter" element={<NewsletterPage />} />
        <Route path="/pages/:slug" element={<WpPageDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <SiteFooter />
    </div>
  );
}

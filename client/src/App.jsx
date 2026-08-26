import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { Toaster } from "@/ui/sonner";
import ErrorBoundary from "./shared/components/ErrorBoundary";
import { SpeedInsights } from "@vercel/speed-insights/react";

import AdminSkeleton from "./crm/components/AdminSkeleton";
import CustomerSkeleton from "./website/components/CustomerSkeleton";
import CookieConsentBanner from "./website/components/CookieConsentBanner";

// Lazy-loaded routes for optimal performance and code splitting
const Landing = lazy(() => import("./website/pages/Landing"));
const FleetPage = lazy(() => import("./website/pages/FleetPage"));
const CustomerAuth = lazy(() => import("./website/pages/CustomerAuth"));
const AboutPage = lazy(() => import("./website/pages/AboutPage"));
const BookingPage = lazy(() => import("./website/pages/BookingPage"));
const BookingSuccess = lazy(() => import("./website/pages/BookingSuccess"));
const CustomerProfile = lazy(() => import("./website/pages/CustomerProfile"));
const NotFound = lazy(() => import("./website/pages/NotFound"));

const AdminLogin = lazy(() => import("./crm/pages/AdminLogin"));
const AdminLayout = lazy(() => import("./crm/pages/AdminLayout"));
const Dashboard = lazy(() => import("./crm/pages/Dashboard"));
const FleetManage = lazy(() => import("./crm/pages/FleetManage"));
const BookingsManage = lazy(() => import("./crm/pages/BookingsManage"));
const CouponsManage = lazy(() => import("./crm/pages/CouponsManage"));
const CalendarView = lazy(() => import("./crm/pages/CalendarView"));
const AdminSettings = lazy(() => import("./crm/pages/AdminSettings"));

function ProtectedAdmin({ children }) {
  const { owner, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AdminSkeleton />;
  }
  if (!owner) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}

function RequireCustomerAuth({ children }) {
  const { customer, user, loading } = useAuth();
  const activeCustomer = customer || user;
  const location = useLocation();

  if (loading) {
    return <CustomerSkeleton />;
  }
  if (!activeCustomer) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }) {
  const { customer, user, loading } = useAuth();
  const activeCustomer = customer || user;
  if (loading) return <CustomerSkeleton />;
  if (activeCustomer) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuestAdminRoute({ children }) {
  const { owner, loading } = useAuth();
  if (loading) return <AdminSkeleton />;
  if (owner) return <Navigate to="/admin" replace />;
  return <>{children}</>;
}

function BookRedirect() {
  const { vehicleId } = useParams();
  const location = useLocation();
  return <Navigate to={`/booking/${vehicleId || ''}${location.search}`} replace />;
}

function CarDetailsRedirect() {
  const { id } = useParams();
  const location = useLocation();
  return <Navigate to={`/booking/${id || ''}${location.search}`} replace />;
}

function ScrollToTop() {
  const { pathname, search, state } = useLocation();

  React.useEffect(() => {
    if (!state?.scrollTo && !window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, search, state]);

  return null;
}

function AppContent() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      {!isOnline && (
        <div className="bg-[#E8826B] text-white font-mono text-xs font-bold text-center py-2 px-4 sticky top-0 z-50 shadow-md">
          ⚠️ You are currently offline. Some live fleet availability data may not update automatically.
        </div>
      )}
      <Routes>
        {/* Customer Website Routes */}
        <Route path="/" element={<Suspense fallback={<CustomerSkeleton />}><Landing /></Suspense>} />
        <Route path="/fleet" element={<Suspense fallback={<CustomerSkeleton />}><FleetPage /></Suspense>} />
        <Route path="/vehicles" element={<Navigate to="/fleet" replace />} />
        <Route path="/cars" element={<Navigate to="/fleet" replace />} />
        <Route path="/bikes" element={<Navigate to="/fleet?type=bike" replace />} />
        <Route path="/about" element={<Suspense fallback={<CustomerSkeleton />}><AboutPage /></Suspense>} />
        <Route path="/faq" element={<Navigate to="/about" replace />} />
        <Route path="/faqs" element={<Navigate to="/about" replace />} />
        <Route path="/help" element={<Navigate to="/about" replace />} />
        <Route path="/help-center" element={<Navigate to="/about" replace />} />
        <Route path="/support" element={<Navigate to="/about" replace />} />
        <Route path="/contact" element={<Navigate to="/about" replace />} />
        <Route path="/contact-us" element={<Navigate to="/about" replace />} />
        <Route path="/terms" element={<Navigate to="/about" replace />} />
        <Route path="/terms-and-conditions" element={<Navigate to="/about" replace />} />
        <Route path="/terms-conditions" element={<Navigate to="/about" replace />} />
        <Route path="/privacy" element={<Navigate to="/about" replace />} />
        <Route path="/privacy-policy" element={<Navigate to="/about" replace />} />
        <Route path="/booking/:vehicleId" element={<Suspense fallback={<CustomerSkeleton />}><BookingPage /></Suspense>} />
        <Route path="/car-details/:id" element={<CarDetailsRedirect />} />
        <Route path="/book/:vehicleId" element={<BookRedirect />} />
        <Route path="/booking-success/:bookingId" element={<Suspense fallback={<CustomerSkeleton />}><BookingSuccess /></Suspense>} />
        <Route path="/profile" element={<RequireCustomerAuth><Suspense fallback={<CustomerSkeleton />}><CustomerProfile /></Suspense></RequireCustomerAuth>} />
        <Route path="/account" element={<Navigate to="/profile" replace />} />
        <Route path="/login" element={<GuestRoute><Suspense fallback={<CustomerSkeleton />}><CustomerAuth defaultSignup={false} /></Suspense></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Suspense fallback={<CustomerSkeleton />}><CustomerAuth defaultSignup={true} /></Suspense></GuestRoute>} />
        <Route path="/auth" element={<Navigate to="/login" replace />} />
        <Route path="/verify-otp" element={<Suspense fallback={<CustomerSkeleton />}><CustomerAuth defaultSignup={false} /></Suspense>} />

        {/* Admin / CRM Routes */}
        <Route path="/admin/login" element={<GuestAdminRoute><Suspense fallback={<AdminSkeleton />}><AdminLogin /></Suspense></GuestAdminRoute>} />
        <Route path="/owner-login" element={<Navigate to="/admin/login" replace />} />
        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <Suspense fallback={<AdminSkeleton />}>
                <AdminLayout />
              </Suspense>
            </ProtectedAdmin>
          }
        >
          <Route index element={<Suspense fallback={<AdminSkeleton />}><Dashboard /></Suspense>} />
          <Route path="calendar" element={<Suspense fallback={<AdminSkeleton />}><CalendarView /></Suspense>} />
          <Route path="fleet" element={<Suspense fallback={<AdminSkeleton />}><FleetManage /></Suspense>} />
          <Route path="bookings" element={<Suspense fallback={<AdminSkeleton />}><BookingsManage /></Suspense>} />
          <Route path="coupons" element={<Suspense fallback={<AdminSkeleton />}><CouponsManage /></Suspense>} />
          <Route path="settings" element={<Suspense fallback={<AdminSkeleton />}><AdminSettings /></Suspense>} />
        </Route>

        {/* Backward compatible redirects for owner routes */}
        <Route path="/owner" element={<Navigate to="/admin" replace />} />
        <Route path="/owner/add-car" element={<Navigate to="/admin/fleet" replace />} />
        <Route path="/owner/manage-cars" element={<Navigate to="/admin/fleet" replace />} />
        <Route path="/owner/manage-bookings" element={<Navigate to="/admin/bookings" replace />} />
        <Route path="/owner/fleet-editor" element={<Navigate to="/admin/fleet" replace />} />
        <Route path="/owner/profile" element={<Navigate to="/admin/settings" replace />} />

        {/* 404 Catch-All */}
        <Route path="*" element={<Suspense fallback={<CustomerSkeleton />}><NotFound /></Suspense>} />
      </Routes>
      <CookieConsentBanner />
      <Toaster position="top-right" closeButton />
      <SpeedInsights />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
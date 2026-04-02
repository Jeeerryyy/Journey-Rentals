import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SpeedInsights } from '@vercel/speed-insights/react'

const Home = lazy(() => import('./pages/Home'))
const Cars = lazy(() => import('./pages/Cars'))
const CarDetails = lazy(() => import('./pages/CarDetails'))
const Account = lazy(() => import('./pages/MyBookings'))
const Login = lazy(() => import('./pages/Login'))
const OTPVerification = lazy(() => import('./pages/OTPVerification'))
const HelpSupport = lazy(() => import('./pages/HelpSupport'))

const OwnerLogin = lazy(() => import('./pages/owner/OwnerLogin'))
const Layout = lazy(() => import('./pages/owner/Layout'))
const Dashboard = lazy(() => import('./pages/owner/Dashboard'))
const AddCar = lazy(() => import('./pages/owner/AddCar'))
const ManageCars = lazy(() => import('./pages/owner/ManageCars'))
const ManageBookings = lazy(() => import('./pages/owner/ManageBookings'))
const FleetEditor = lazy(() => import('./pages/owner/FleetEditor'))
const OwnerProfile = lazy(() => import('./pages/owner/Profile'))

import Navbar from './components/Navbar'
import Footer from './components/Footer'

// ── Error Boundary ──
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  componentDidCatch(error, errorInfo) {
    console.error('Crash caught by ErrorBoundary:', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
          <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>SOMETHING WENT WRONG</h1>
          <p style={{ color: '#888', marginBottom: '32px' }}>An unexpected error occurred. Please refresh the page to try again.</p>
          <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: '#ffd200', color: '#111', border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '4px' }}>
            REFRESH PAGE
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

// Protect customer-only routes
const CustomerRoute = ({ children }) => {
  const { customer, isLoaded } = useAuth()
  const location = useLocation()

  if (!isLoaded) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.1em' }}>LOADING...</div>
  if (!customer) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

// Protect owner routes
const OwnerRoute = ({ children }) => {
  const { owner } = useAuth()
  if (!owner) return <Navigate to="/owner-login" replace />
  return children
}

const GuestRoute = ({ children }) => {
  const { customer, isLoaded } = useAuth()
  if (!isLoaded) return null
  if (customer) return <Navigate to="/" replace />
  return children
}

const GuestOwnerRoute = ({ children }) => {
  const { owner } = useAuth()
  if (owner) return <Navigate to="/owner" replace />
  return children
}

const AppInner = () => {
  const location = useLocation()
  const isOwnerPath = location.pathname.startsWith('/owner')
  const isAuthPage = ['/login', '/owner-login', '/verify-otp'].includes(location.pathname)

  return (
    <div>
      {!isOwnerPath && !isAuthPage && <Navbar />}
      <Suspense fallback={<div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>LOADING...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car-details/:id" element={<CarDetails />} />
          <Route path="/support" element={<HelpSupport />} />
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/owner-login" element={<GuestOwnerRoute><OwnerLogin /></GuestOwnerRoute>} />
          <Route path="/account" element={<CustomerRoute><Account /></CustomerRoute>} />
          <Route path="/owner" element={<OwnerRoute><Layout /></OwnerRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="manage-cars" element={<ManageCars />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
            <Route path="fleet-editor" element={<FleetEditor />} />
            <Route path="profile" element={<OwnerProfile />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!isOwnerPath && !isAuthPage && <Footer />}
    </div>
  )
}

const App = () => (
  <ErrorBoundary>
    <AuthProvider>
      <AppInner />
      <SpeedInsights />
    </AuthProvider>
  </ErrorBoundary>
)

export default App
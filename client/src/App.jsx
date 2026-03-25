import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

const Home = lazy(() => import('./pages/Home'))
const Cars = lazy(() => import('./pages/Cars'))
const CarDetails = lazy(() => import('./pages/CarDetails'))
const Account = lazy(() => import('./pages/MyBookings'))
const Login = lazy(() => import('./pages/Login'))
const HelpSupport = lazy(() => import('./pages/HelpSupport'))

const OwnerLogin = lazy(() => import('./pages/owner/OwnerLogin'))
const Layout = lazy(() => import('./pages/owner/Layout'))
const Dashboard = lazy(() => import('./pages/owner/Dashboard'))
const AddCar = lazy(() => import('./pages/owner/AddCar'))
const ManageCars = lazy(() => import('./pages/owner/ManageCars'))
const ManageBookings = lazy(() => import('./pages/owner/ManageBookings'))
const FleetEditor = lazy(() => import('./pages/owner/FleetEditor'))

import Navbar from './components/Navbar'
import Footer from './components/Footer'

// Protect customer-only routes
const CustomerRoute = ({ children }) => {
  const { customer, isLoaded } = useAuth()
  const location = useLocation()

  if (!isLoaded) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.1em' }}>
      LOADING...
    </div>
  )
  if (!customer) return <Navigate to="/login" state={{ from: location.pathname }} replace />
  return children
}

// Protect owner routes
const OwnerRoute = ({ children }) => {
  const { owner } = useAuth()
  if (!owner) return <Navigate to="/owner-login" replace />
  return children
}

// Redirect already-authenticated users away from login pages
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
  const isAuthPage = location.pathname === '/login' || location.pathname === '/owner-login'

  return (
    <div>
      {!isOwnerPath && !isAuthPage && <Navbar />}
      <Suspense fallback={
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '24px', letterSpacing: '0.1em' }}>
          LOADING...
        </div>
      }>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/car-details/:id" element={<CarDetails />} />
          <Route path="/support" element={<HelpSupport />} />

          {/* Auth (guest only — redirect logged-in users) */}
          <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/owner-login" element={<GuestOwnerRoute><OwnerLogin /></GuestOwnerRoute>} />

          {/* Customer protected */}
          <Route path="/account" element={<CustomerRoute><Account /></CustomerRoute>} />

          {/* Owner protected */}
          <Route path="/owner" element={<OwnerRoute><Layout /></OwnerRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="add-car" element={<AddCar />} />
            <Route path="manage-cars" element={<ManageCars />} />
            <Route path="manage-bookings" element={<ManageBookings />} />
            <Route path="fleet-editor" element={<FleetEditor />} />
          </Route>

          {/* Catch-all 404 → redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {!isOwnerPath && !isAuthPage && <Footer />}
    </div>
  )
}

const App = () => (
  <AuthProvider>
    <AppInner />
  </AuthProvider>
)

export default App
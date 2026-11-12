import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Doctors from './pages/Doctors'
import DoctorDetail from './pages/DoctorDetail'
import Appointments from './pages/Appointments'
import Prescriptions from './pages/Prescriptions'
import PrescriptionCreate from './pages/PrescriptionCreate'
import PrescriptionShow from './pages/PrescriptionShow'
import Inventory from './pages/Inventory'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import { PageLoader } from './components/ui'

function Protected({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Public landing + doctors directory */}
      <Route path="/" element={<Landing />} />
      <Route path="/medecins" element={<Doctors />} />
      <Route path="/medecins/:id" element={<DoctorDetail />} />

      {/* Authenticated area */}
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/prescriptions" element={<Prescriptions />} />
        <Route path="/prescriptions/nouveau" element={<PrescriptionCreate />} />
        <Route path="/prescriptions/:id" element={<PrescriptionShow />} />
        <Route
          path="/stock"
          element={
            <Protected roles={['pharmacy']}>
              <Inventory />
            </Protected>
          }
        />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profil" element={<Profile />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

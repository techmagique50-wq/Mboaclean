import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createHashRouter, RouterProvider } from 'react-router-dom'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'
import { useStore } from './store.ts'
import { MapPage } from './pages/MapPage.tsx'
import { ReportPage } from './pages/ReportPage.tsx'
import { ReportDetailPage } from './pages/ReportDetailPage.tsx'
import { ProfilePage } from './pages/ProfilePage.tsx'
import { DashboardPage } from './pages/DashboardPage.tsx'
import { EducationPage } from './pages/EducationPage.tsx'
import { LoginPage } from './pages/LoginPage.tsx'
import { SignupPage } from './pages/SignupPage.tsx'
import { PickupRequestPage } from './pages/PickupRequestPage.tsx'
import { PickupsPage } from './pages/PickupsPage.tsx'

// suivi de la connexion (mode hors-ligne natif)
const sync = () => {
  useStore.getState().setOnline(navigator.onLine)
  if (navigator.onLine) useStore.getState().syncPending()
}
window.addEventListener('online', sync)
window.addEventListener('offline', sync)
useStore.getState().setOnline(navigator.onLine)

const router = createHashRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <SignupPage /> },
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <MapPage /> },
      { path: 'signaler', element: <ReportPage /> },
      { path: 'signalement/:id', element: <ReportDetailPage /> },
      { path: 'profil', element: <ProfilePage /> },
      { path: 'conseils', element: <EducationPage /> },
      { path: 'ramassage', element: <PickupRequestPage /> },
      { path: 'demandes', element: <PickupsPage /> },
      { path: 'tableau-de-bord', element: <DashboardPage /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)

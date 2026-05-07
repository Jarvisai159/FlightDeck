import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import StatusPage from './pages/StatusPage'
import HistoryPage from './pages/HistoryPage'
import SearchPage from './pages/SearchPage'
import AssemblyPage from './pages/AssemblyPage'

function App() {
  const { pathname } = useLocation()
  const isAssembly = pathname.startsWith('/assembly') || pathname === '/'

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      {isAssembly ? (
        <Routes>
          <Route path="/" element={<Navigate to="/assembly" replace />} />
          <Route path="/assembly" element={<AssemblyPage />} />
        </Routes>
      ) : (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
          <Routes>
            <Route path="/status" element={<StatusPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
      )}
    </div>
  )
}

export default App

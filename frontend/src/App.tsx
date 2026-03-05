import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import AdPanel from './components/layout/AdPanel'
import StatusPage from './pages/StatusPage'
import HistoryPage from './pages/HistoryPage'
import SearchPage from './pages/SearchPage'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <div className="flex justify-center px-4 pt-4 pb-12">
        <AdPanel position="left" />
        <main className="flex-1 max-w-5xl min-w-0">
          <Routes>
            <Route path="/" element={<Navigate to="/status" replace />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/search" element={<SearchPage />} />
          </Routes>
        </main>
        <AdPanel position="right" />
      </div>
    </div>
  )
}

export default App

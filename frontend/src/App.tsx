import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import ExplorePage from './pages/ExplorePage'
import TourDetailPage from './pages/TourDetailPage'
import MyToursPage from './pages/MyToursPage'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12">
        <Routes>
          <Route path="/" element={<Navigate to="/explore" replace />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/tour/:id" element={<TourDetailPage />} />
          <Route path="/my-tours" element={<MyToursPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App

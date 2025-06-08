import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './Components/ProtectedRoute'
import LoginPage from './Components/pages/LoginPage'
import SignupPage from './Components/pages/SignupPage'
import Header from './Components/Header'
import Sidebar from './Components/Sidebar'
import DraftPage from './Components/pages/DraftPage'
import SentPage from './Components/pages/SentPage'
import TemplatesPage from './Components/pages/TemplatesPage'
import CreateTemplatePage from './Components/pages/CreateTemplatePage'
import DataPage from './Components/pages/DataPage'
import PreviewModal from './Components/PreviewModal'

// Wrapper component to access location
const AppContent = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const location = useLocation()

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (!mobile) {
        setSidebarOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false)
    }
  }, [location, isMobile])

  const [previewModal, setPreviewModal] = useState({ open: false, content: null })
  const activePage = location.pathname.substring(1) || 'draft'

  // Don't show header and sidebar on auth pages
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'
  if (isAuthPage) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Routes>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4E7E1] via-[#FF9B45]/30 to-[#D5451B]/20">
      <Header 
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      
      <div className="flex">
        <Sidebar 
          isOpen={sidebarOpen}
          isMobile={isMobile}
          onClose={() => setSidebarOpen(false)}
        />
        
        <main className={`flex-1 p-6 transition-all duration-300 ${
          sidebarOpen && !isMobile ? 'ml-64' : 'ml-0'
        }`}>
          <div className="animate-fade-in">
            <Routes>
              <Route path="/" element={<Navigate to="/draft" replace />} />
              <Route 
                path="/draft" 
                element={
                  <ProtectedRoute>
                    <DraftPage onPreview={setPreviewModal} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/sent" 
                element={
                  <ProtectedRoute>
                    <SentPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/templates" 
                element={
                  <ProtectedRoute>
                    <TemplatesPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/templates/create" 
                element={
                  <ProtectedRoute>
                    <CreateTemplatePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/data" 
                element={
                  <ProtectedRoute>
                    <DataPage />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </main>
      </div>

      <PreviewModal 
        isOpen={previewModal.open}
        content={previewModal.content}
        onClose={() => setPreviewModal({ open: false, content: null })}
      />
    </div>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
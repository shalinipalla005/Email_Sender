import { Menu, Bell, Settings, User, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Header = ({ onMenuToggle, sidebarOpen }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-50 bg-[#F4E7E1]/80 backdrop-blur-lg border-b border-[#521C0D]/10">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuToggle}
            className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors"
          >
            <Menu size={24} className="text-[#521C0D]" />
          </button>
          <h1 className="text-2xl font-bold text-[#521C0D]">Email Sender</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600">
            {user?.userName || user?.email}
          </div>
          <button
            onClick={handleLogout}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600 flex items-center gap-2"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
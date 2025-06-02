import { NavLink } from 'react-router-dom'
import { PenSquare, Send, FileText, Database, X } from 'lucide-react'

const Sidebar = ({ isOpen, isMobile, onClose }) => {
  const navItems = [
    { path: '/draft', icon: PenSquare, label: 'Draft' },
    { path: '/sent', icon: Send, label: 'Sent' },
    { path: '/templates', icon: FileText, label: 'Templates' },
    { path: '/data', icon: Database, label: 'Data' }
  ]

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-[73px] h-[calc(100vh-73px)] bg-[#F4E7E1]/80 backdrop-blur-lg border-r border-[#521C0D]/10 transition-all duration-300 z-40 ${
          isOpen ? 'left-0' : '-left-64'
        } ${isMobile ? 'w-64' : isOpen ? 'w-64' : 'w-20'}`}
      >
        {isMobile && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors"
          >
            <X size={20} className="text-[#521C0D]" />
          </button>
        )}

        <nav className="p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => isMobile && onClose()}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-[#FF9B45] text-white'
                        : 'text-[#521C0D] hover:bg-[#FF9B45]/10'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span className={`${!isOpen && !isMobile && 'hidden'} font-medium`}>
                    {item.label}
                  </span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
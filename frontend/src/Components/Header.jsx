import { Menu, Bell, Settings, User } from 'lucide-react'

const Header = ({ onMenuToggle, sidebarOpen }) => {
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

        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors relative">
            <Bell size={20} className="text-[#521C0D]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#D5451B] rounded-full" />
          </button>
          <button className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors">
            <Settings size={20} className="text-[#521C0D]" />
          </button>
          <button className="p-2 hover:bg-[#FF9B45]/10 rounded-lg transition-colors">
            <User size={20} className="text-[#521C0D]" />
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
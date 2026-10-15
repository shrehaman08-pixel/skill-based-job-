import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Zap, User, Briefcase, BookmarkIcon, FileText, LogOut, Menu, X } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

export function CandidateLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const navItems = [
    { to: '/candidate', label: 'Job Feed', icon: Briefcase, end: true },
    { to: '/candidate/profile', label: 'My Profile', icon: User },
    { to: '/candidate/applications', label: 'Applications', icon: FileText },
    { to: '/candidate/saved', label: 'Saved Jobs', icon: BookmarkIcon },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-white border-r border-gray-100 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-100">
          <Zap className="h-5 w-5 text-brand-600" />
          <span className="font-bold text-gray-900">SkillMatch</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {profile?.full_name?.charAt(0) ?? 'C'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'Candidate'}</p>
              <p className="text-xs text-gray-500 truncate">Candidate</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="btn-ghost w-full justify-start text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-brand-600" />
          <span className="font-bold text-gray-900">SkillMatch</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-white pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 w-full">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}

export function RecruiterLayout() {
  const { signOut, profile } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleSignOut() {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  const navItems = [
    { to: '/recruiter', label: 'My Jobs', icon: Briefcase, end: true },
    { to: '/recruiter/post', label: 'Post a Job', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col bg-white border-r border-gray-100 lg:flex">
        <div className="flex h-16 items-center gap-2 px-6 border-b border-gray-100">
          <Zap className="h-5 w-5 text-brand-600" />
          <span className="font-bold text-gray-900">SkillMatch</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="h-8 w-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
              {profile?.full_name?.charAt(0) ?? 'R'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name ?? 'Recruiter'}</p>
              <p className="text-xs text-gray-500 truncate">Recruiter</p>
            </div>
          </div>
          <button onClick={handleSignOut} className="btn-ghost w-full justify-start text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      <header className="lg:hidden flex h-16 items-center justify-between px-4 bg-white border-b border-gray-100 fixed top-0 left-0 right-0 z-20">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-brand-600" />
          <span className="font-bold text-gray-900">SkillMatch</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-2">
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {menuOpen && (
        <div className="lg:hidden fixed inset-0 z-10 bg-white pt-16">
          <nav className="p-4 space-y-1">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-600'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <button onClick={handleSignOut} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 w-full">
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </nav>
        </div>
      )}

      <main className="lg:ml-64 pt-16 lg:pt-0">
        <Outlet />
      </main>
    </div>
  )
}

import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import Background3D from '../components/Background3D';
import {
  FiLogOut,
  FiMenu,
  FiX,
  FiSun,
  FiMoon,
  FiChevronRight
} from 'react-icons/fi';

/**
 * Accessibility notes:
 * ✅ Semantic landmarks (header, nav, main, aside)
 * ✅ Keyboard accessible controls
 * ✅ Screen-reader friendly navigation
 * ✅ aria-current via NavLink
 * ✅ Mobile overlay marked modal-like
 */

const NAV_ITEMS = [
  { path: '/dashboard', iconEmoji: '📊', label: 'Overview', end: true },
  { path: '/dashboard/timeline', iconEmoji: '📅', label: 'Timeline' },
  { path: '/dashboard/chat', iconEmoji: '🤖', label: 'AI Chat' },
  { path: '/dashboard/booth', iconEmoji: '📍', label: 'Booth' },
  { path: '/dashboard/eci-map', iconEmoji: '🌐', label: 'ECI Map' },
  { path: '/dashboard/parliament', iconEmoji: '🏛️', label: 'Parliament' },
  { path: '/dashboard/scenarios', iconEmoji: '🎭', label: 'Scenarios' },
  { path: '/dashboard/quiz', iconEmoji: '🧠', label: 'Quiz' },
  { path: '/dashboard/translator', iconEmoji: '🌐', label: 'Translate' }
];

// ── Framer motion variants ─────────────────────────────────────
const sidebarNav = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.15 }
  },
  exit: {
    opacity: 0,
    transition: { staggerChildren: 0.03, staggerDirection: -1 }
  }
};

const sidebarItem = {
  hidden: { opacity: 0, x: -24 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  },
  exit: { opacity: 0, x: -24 }
};

export default function DashboardLayout() {
  const { user, logoutUser } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });

  const navigate = useNavigate();

  // Theme toggle persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Lock body scroll when modal nav open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [mobileMenuOpen]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = () => {
    logoutUser();
    navigate('/auth');
  };

  const UserAvatar = ({ size = 'w-8 h-8', textSize = 'text-xs' }) =>
    user?.avatar ? (
      <img
        src={user.avatar}
        alt=""
        className={`${size} rounded-full object-cover shadow-sm`}
        referrerPolicy="no-referrer"
      />
    ) : (
      <div
        className={`${size} rounded-full bg-bg-elevated border border-border flex items-center justify-center ${textSize} font-bold text-primary shadow-sm`}
        aria-hidden="true"
      >
        {user?.name?.charAt(0)?.toUpperCase()}
      </div>
    );

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-bg-dark transition-colors duration-500">
      <Background3D isDarkMode={isDarkMode} />

      {/* ================= HEADER / TOP NAV ================= */}
      <header
        className="sticky top-0 z-40 bg-bg-card/80 backdrop-blur-xl border-b border-border shadow-sm px-4 lg:px-6 flex-shrink-0"
        role="banner"
      >
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl bg-bg-elevated flex items-center justify-center text-lg shadow-md"
              aria-hidden="true"
            >
              🗳️
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-primary">VotePath AI</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-wider">
                Election Commission
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav
            className="hidden lg:flex flex-1 justify-center items-center px-8 space-x-1"
            role="navigation"
            aria-label="Primary"
          >
            {NAV_ITEMS.map(({ path, iconEmoji, label, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-bg-elevated'
                      : 'hover:bg-bg-elevated/50'
                  }`
                }
              >
                <span aria-hidden="true">{iconEmoji}</span>
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <FiSun /> : <FiMoon />}
            </button>

            <NavLink to="/dashboard/profile" aria-label="My Profile">
              <UserAvatar />
            </NavLink>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg"
              aria-label="Logout"
            >
              <FiLogOut />
            </button>

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 rounded-lg"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <FiMenu />
            </button>
          </div>
        </div>
      </header>

      {/* ================= MAIN CONTENT ================= */}
      <main
        className="flex-1 overflow-y-auto w-full relative"
        role="main"
      >
        <div className="p-4 lg:p-8 max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>

      {/* ================= MOBILE SIDEBAR ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/60"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            <motion.aside
              className="fixed top-0 left-0 z-50 h-full w-[280px] bg-bg-card flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Mobile navigation menu"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
            >
              <div className="px-5 py-4 flex items-center justify-between">
                <span className="font-bold">VotePath AI</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                >
                  <FiX />
                </button>
              </div>

              <nav
                className="flex-1 px-4 space-y-1"
                aria-label="Mobile navigation"
              >
                {NAV_ITEMS.map(({ path, label }) => (
                  <NavLink
                    key={path}
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg"
                  >
                    {label}
                  </NavLink>
                ))}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
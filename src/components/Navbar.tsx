import { Link, useLocation } from 'react-router-dom';
import { Code2, Menu, X, Zap, LogOut, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const { user, isAuthenticated, signOut } = useAuth();

  const links = [
    { to: '/', label: 'Problems' },
    { to: '/roadmaps', label: 'Roadmaps' },
    { to: '/courses', label: 'Courses' },
    { to: '/leaderboard', label: 'Leaderboard' },
    { to: '/learn', label: 'Learn' },
  ];

  const openSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-400 p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-blue-500/25 transition-all">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Apex<span className="text-cyan-400">Playground</span>
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-gray-800 text-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated && user ? (
                <>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">
                      {user.problems_solved} / 15 solved
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">
                        {user.display_name || user.username}
                      </span>
                    </div>
                    <button
                      onClick={signOut}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                      title="Sign Out"
                    >
                      <LogOut className="h-4 w-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-1.5">
                    <Code2 className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-gray-300">0 / 15 solved</span>
                  </div>
                  <button
                    onClick={openSignIn}
                    className="text-gray-400 hover:text-white px-3 py-2 text-sm font-medium transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={openSignUp}
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            <button
              className="md:hidden text-gray-400 hover:text-white"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-gray-800 bg-gray-900">
            <div className="px-4 py-3 space-y-1">
              {links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === link.to
                      ? 'bg-gray-800 text-cyan-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-gray-800">
                {isAuthenticated && user ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 px-4 py-2">
                      <User className="h-4 w-4 text-cyan-400" />
                      <span className="text-sm text-gray-300">
                        {user.display_name || user.username}
                      </span>
                    </div>
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <button
                      onClick={() => { openSignIn(); setMobileOpen(false); }}
                      className="w-full text-gray-400 hover:text-white px-4 py-2.5 rounded-lg text-sm font-medium text-left hover:bg-gray-800/50 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { openSignUp(); setMobileOpen(false); }}
                      className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium"
                    >
                      Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />
    </>
  );
}

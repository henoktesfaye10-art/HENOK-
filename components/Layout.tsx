import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  user?: { name: string; role: string } | null;
  onLogout?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout }) => {
  return (
    <div className="min-h-screen relative flex flex-col">
      {/* Background Image - Gecko Themed */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1504450874802-0ca2bcd9fb21?q=80&w=2670&auto=format&fit=crop')`,
          // Fallback solid color if image fails to load or for better text contrast overlay
          backgroundColor: '#1a4731' 
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full bg-white/95 border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-inner">
            🦎
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">GeckoTracker CS</h1>
            <p className="text-xs text-gray-500 font-medium">Study Tracker & Gamification</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold text-gray-800">{user.name}</p>
              <span className="text-xs text-green-600 font-bold px-2 py-0.5 bg-green-100 rounded-full uppercase">
                {user.role}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
            >
              Sign Out
            </button>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow p-4 sm:p-6 lg:p-8 flex justify-center overflow-auto">
        <div className="w-full max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

import React from 'react';
import { LayoutDashboard, History, User, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  const location = useLocation();

  const getLinkClasses = (path: string) => {
    const isActive = location.pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
      isActive 
        ? 'bg-slate-800 text-white' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    }`;
  };

  const getIconClasses = (path: string) => {
    return `w-5 h-5 ${location.pathname === path ? 'text-lime-400' : ''}`;
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 h-screen border-r border-slate-800 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          AI<span className="text-lime-400">Scanner</span>
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        <Link to="/" className={getLinkClasses('/')}>
          <LayoutDashboard className={getIconClasses('/')} />
          <span className="font-medium">Overview</span>
        </Link>
        <Link to="/history" className={getLinkClasses('/history')}>
          <History className={getIconClasses('/history')} />
          <span className="font-medium">Scan History</span>
        </Link>
        <Link to="/account" className={getLinkClasses('/account')}>
          <User className={getIconClasses('/account')} />
          <span className="font-medium">Account</span>
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={logout}
          className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-colors hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

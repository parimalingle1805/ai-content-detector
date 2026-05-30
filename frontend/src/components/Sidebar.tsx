import React from 'react';
import { LayoutDashboard, History, User, LogOut, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
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
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-100 h-screen border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        md:static md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white tracking-tight">
            AI<span className="text-lime-400">Scanner</span>
          </h1>
          <button 
            onClick={() => setIsOpen(false)}
            className="md:hidden p-2 text-slate-400 hover:text-white bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link to="/" onClick={() => setIsOpen(false)} className={getLinkClasses('/')}>
            <LayoutDashboard className={getIconClasses('/')} />
            <span className="font-medium">Overview</span>
          </Link>
          <Link to="/history" onClick={() => setIsOpen(false)} className={getLinkClasses('/history')}>
            <History className={getIconClasses('/history')} />
            <span className="font-medium">Scan History</span>
          </Link>
          <Link to="/account" onClick={() => setIsOpen(false)} className={getLinkClasses('/account')}>
            <User className={getIconClasses('/account')} />
            <span className="font-medium">Account</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { setIsOpen(false); logout(); }}
            className="flex w-full items-center gap-3 px-4 py-3 text-slate-400 rounded-xl transition-colors hover:bg-slate-800 hover:text-red-400"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

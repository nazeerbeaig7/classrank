import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  FileUp, 
  FileDown, 
  Settings as SettingsIcon, 
  LogOut,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'Students', path: '/admin/students', icon: Users },
    { name: 'Import Data', path: '/admin/import', icon: FileUp },
    { name: 'Export Data', path: '/admin/export', icon: FileDown },
    { name: 'Settings', path: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col min-h-screen sticky top-0 shadow-xl border-r border-slate-800 z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
          <ShieldCheck className="w-6 h-6 text-amber-300" />
        </div>
        <div>
          <h1 className="font-extrabold text-white text-lg tracking-tight">ClassRank</h1>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400">Admin Control Center</p>
        </div>
      </div>

      {/* Admin User Info Card */}
      <div className="p-4 mx-3 my-4 rounded-xl bg-slate-800/80 border border-slate-700/50 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-400 font-bold">
          {user?.name?.charAt(0) || 'A'}
        </div>
        <div className="overflow-hidden">
          <div className="text-sm font-semibold text-white truncate">{user?.name || 'Administrator'}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 py-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2">Navigation</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer / Logout */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

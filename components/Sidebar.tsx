import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, LogOut, Map, Shield, Key, User, X } from 'lucide-react';
import { useAuth, Role } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  // Define menu items with allowed roles
  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      allowedRoles: ['ADMIN', 'OWNER', 'TENANT'] as Role[]
    },
    { 
      path: '/properties', 
      label: 'Properties', 
      icon: Building2,
      allowedRoles: ['ADMIN', 'OWNER', 'TENANT'] as Role[]
    },
    { 
      path: '/cities', 
      label: 'Cities', 
      icon: Map,
      allowedRoles: ['ADMIN', 'OWNER', 'TENANT'] as Role[]
    },
    { 
      path: '/owners', 
      label: 'Owners/Agents', 
      icon: Key,
      allowedRoles: ['ADMIN', 'OWNER'] as Role[] 
    },
    { 
      path: '/tenants', 
      label: 'Tenants', 
      icon: User,
      allowedRoles: ['ADMIN', 'TENANT'] as Role[]
    },
    { 
      path: '/admins', 
      label: 'Admins', 
      icon: Shield,
      allowedRoles: ['ADMIN'] as Role[]
    },
  ];

  const filteredItems = navItems.filter(item => 
    user && item.allowedRoles.includes(user.role)
  );

  return (
    <>
      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 text-slate-800 
        transform transition-transform duration-300 ease-in-out flex flex-col h-[100dvh]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-blue-600 text-white p-1 rounded">KV</span>
            CRM
          </h1>
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="md:hidden p-1 text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => {
                // Close sidebar on mobile when a link is clicked
                if (window.innerWidth < 768) {
                  onClose();
                }
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-600 text-white' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-white">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 text-slate-500 hover:text-slate-900 hover:bg-slate-50 w-full rounded-lg transition-colors"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
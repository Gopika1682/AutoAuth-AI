import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  PlusCircle, 
  ClipboardList,
  ShieldCheck,
  UserPlus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { DoctorChatbot } from './DoctorChatbot';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Sidebar: React.FC = () => {
  const { currentUser, logout } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const doctorLinks = [
    { to: '/doctor-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/add-patient', icon: UserPlus, label: 'Add Patient' },
    { to: '/create-request', icon: PlusCircle, label: 'Create Request' },
    { to: '/track-requests', icon: ClipboardList, label: 'Track Requests' },
  ];

  const adminLinks = [
    { to: '/admin-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/doctor-approvals', icon: Users, label: 'Doctor Approvals' },
    { to: '/request-management', icon: FileText, label: 'Request Management' },
    { to: '/policy-management', icon: ShieldCheck, label: 'Policy Management' },
  ];

  const links = currentUser?.role === 'admin' ? adminLinks : doctorLinks;

  return (
    <div className="w-72 bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
          <ShieldCheck className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-black text-xl text-gray-900 tracking-tighter leading-none">AutoAuth</h1>
          <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest mt-1">AI Prior Auth</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 group",
              isActive 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-100" 
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            {({ isActive }) => (
              <>
                <link.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", isActive ? "text-white" : "text-gray-400")} />
                {link.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 font-bold shadow-sm border border-gray-100">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{currentUser?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex">
      <Sidebar />
      <div className="flex-1 ml-72">
        <header className="h-20 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-40 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
            <span>Portal</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-bold">Dashboard</span>
          </div>
          
        </header>
        <main className="p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
        <DoctorChatbot />
      </div>
    </div>
  );
};

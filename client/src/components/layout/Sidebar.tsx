import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    LogOut,
    User,
    Menu,
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';

interface SidebarProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen, onLogout }) => {
    const user = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null;
    const isRecruiter = user?.role === 'recruiter';
    const location = useLocation();

    const navItems = isRecruiter ? [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/job-form', label: 'Post a Job', icon: Briefcase },
        { path: '/talent-match', label: 'AI Talent Matcher', icon: Sparkles },
    ] : [
        { path: '/candidate-jobs', label: 'Find Jobs', icon: Briefcase },
        { path: '/candidate-dashboard', label: 'My Applications', icon: FileText },
        { path: '/candidate-interviews-complete', label: 'Interviews', icon: User },
    ];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
          fixed top-0 left-0 z-50 h-full w-72 
          bg-white/80 backdrop-blur-xl border-r border-white/20 shadow-2xl
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
            >
                <div className="flex flex-col h-full bg-gradient-to-b from-white/50 to-transparent">
                    {/* Logo Section */}
                    <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                                Recruit AI
                            </span>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="md:hidden p-2 hover:bg-black/5 rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                        <div className="px-4 mb-2">
                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                Menu
                            </span>
                        </div>
                        {navItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setIsOpen(false)} // Close on mobile click
                                    className={`
                    group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive
                                            ? 'bg-primary text-white shadow-lg shadow-primary/30'
                                            : 'text-gray-600 hover:bg-white hover:shadow-md hover:text-primary'
                                        }
                  `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500 group-hover:text-primary'} transition-colors`} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-80" />}
                                </NavLink>
                            );
                        })}
                    </nav>

                    {/* User Profile Section */}
                    <div className="p-4 m-4 bg-white/50 rounded-2xl border border-white/40 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold shadow-lg">
                                {user?.name?.[0] || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {user?.name || 'User'}
                                </p>
                                <p className="text-xs text-gray-500 truncate capitalize">
                                    {user?.role || 'Guest'}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                        >
                            <LogOut size={16} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;

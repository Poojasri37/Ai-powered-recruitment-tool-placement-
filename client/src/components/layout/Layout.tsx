import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, onLogout }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50/50 flex">
            <Sidebar
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                onLogout={onLogout}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <span className="font-bold text-lg text-gray-900">Recruit AI</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                        AI
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-8 overflow-y-auto w-full max-w-7xl mx-auto">
                    <div className="animate-fade-in w-full">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;

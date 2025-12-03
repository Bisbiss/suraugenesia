import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, LogOut, Image, Settings, Menu, X } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    }, []);

    const isActive = (path: string) => {
        return location.pathname === path ? "bg-teal-700 text-white" : "text-teal-100 hover:bg-teal-800 hover:text-white";
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-teal-900 text-white p-4 flex justify-between items-center z-40 shadow-md">
                <span className="font-bold text-lg">Admin Panel</span>
                <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2">
                    {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-teal-900 text-white flex flex-col transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-teal-800 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Admin Panel</h1>
                        <p className="text-teal-400 text-sm truncate max-w-[200px]" title={user?.email}>
                            {user?.email || 'Surau Genesia'}
                        </p>
                    </div>
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-teal-100">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <Link
                        to="/admin"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin')}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/agenda"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/agenda')}`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Agenda</span>
                    </Link>

                    <Link
                        to="/admin/documentation"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/documentation')}`}
                    >
                        <Image className="w-5 h-5" />
                        <span>Documentation</span>
                    </Link>

                    <Link
                        to="/admin/settings"
                        onClick={() => setIsSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings')}`}
                    >
                        <Settings className="w-5 h-5" />
                        <span>Pengaturan</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-teal-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-teal-100 hover:bg-teal-800 hover:text-white transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto pt-16 md:pt-0">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

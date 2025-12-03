import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, LogOut, Image, Settings } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

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
            {/* Sidebar */}
            <aside className="w-64 bg-teal-900 text-white flex flex-col">
                <div className="p-6 border-b border-teal-800">
                    <h1 className="text-2xl font-bold">Admin Panel</h1>
                    <p className="text-teal-400 text-sm truncate" title={user?.email}>
                        {user?.email || 'Surau Genesia'}
                    </p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/admin"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin')}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    <Link
                        to="/admin/agenda"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/agenda')}`}
                    >
                        <Calendar className="w-5 h-5" />
                        <span>Agenda</span>
                    </Link>

                    <Link
                        to="/admin/documentation"
                        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/documentation')}`}
                    >
                        <Image className="w-5 h-5" />
                        <span>Documentation</span>
                    </Link>

                    <Link
                        to="/admin/settings"
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
            <main className="flex-1 overflow-auto">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;

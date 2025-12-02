import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Image as ImageIcon, Eye, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        agendas: 0,
        documentation: 0,
        visitors: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const [agendaCount, docCount, visitorCount] = await Promise.all([
                supabase.from('agendas').select('*', { count: 'exact', head: true }),
                supabase.from('documentation_items').select('*', { count: 'exact', head: true }),
                supabase.from('page_views').select('*', { count: 'exact', head: true })
            ]);

            setStats({
                agendas: agendaCount.count || 0,
                documentation: docCount.count || 0,
                visitors: visitorCount.count || 0
            });
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Agenda Card */}
                <Link to="/admin/agenda" className="block group">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 h-full group-hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-teal-100 rounded-lg text-teal-600">
                                <Calendar className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold text-gray-800">{stats.agendas}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Agenda</h2>
                        <p className="text-gray-600 text-sm">Kelola agenda kegiatan dan berita terbaru.</p>
                    </div>
                </Link>

                {/* Documentation Card */}
                <Link to="/admin/documentation" className="block group">
                    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all border border-gray-100 h-full group-hover:-translate-y-1">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                                <ImageIcon className="w-6 h-6" />
                            </div>
                            <span className="text-3xl font-bold text-gray-800">{stats.documentation}</span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Dokumentasi</h2>
                        <p className="text-gray-600 text-sm">Kelola galeri foto dan video kegiatan.</p>
                    </div>
                </Link>

                {/* Visitor Stats Card (Non-clickable) */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 h-full">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                            <Eye className="w-6 h-6" />
                        </div>
                        <span className="text-3xl font-bold text-gray-800">{stats.visitors}</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Pengunjung</h2>
                    <p className="text-gray-600 text-sm">Jumlah total kunjungan halaman website.</p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

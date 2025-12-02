import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Sparkles, ArrowRight, Calendar, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

interface Agenda {
    id: number;
    title: string;
    slug: string;
    content: string;
    image_url: string;
    created_at: string;
}

const AgendaList = () => {
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgendas();
    }, []);

    const fetchAgendas = async () => {
        try {
            const { data, error } = await supabase
                .from("agendas")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setAgendas(data || []);
        } catch (error) {
            console.error("Error fetching agendas:", error);
        } finally {
            setLoading(false);
        }
    };

    const currentUrl = window.location.href;

    return (
        <div className="min-h-screen bg-slate-50">
            <Helmet>
                <title>Agenda & Berita - Surau Genesia</title>
                <meta name="description" content="Daftar lengkap agenda dan berita terbaru dari Surau Genesia." />
                <link rel="canonical" href={currentUrl} />
                <meta property="og:title" content="Agenda & Berita - Surau Genesia" />
                <meta property="og:description" content="Daftar lengkap agenda dan berita terbaru dari Surau Genesia." />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:image" content={`${window.location.origin}/image/hero-bg.jpg`} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Header */}
            <div className="bg-teal-600 text-white py-12">
                <div className="container mx-auto px-6">
                    <Link to="/" className="inline-flex items-center text-teal-100 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Kembali ke Beranda
                    </Link>
                    <h1 className="text-4xl font-bold mb-4">Agenda & Berita</h1>
                    <p className="text-teal-100 text-lg max-w-2xl">
                        Ikuti kegiatan dan perkembangan terbaru dari Surau Genesia.
                    </p>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 py-12">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-500">Memuat agenda...</p>
                    </div>
                ) : agendas.length > 0 ? (
                    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {agendas.map((agenda) => (
                            <div
                                key={agenda.id}
                                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                            >
                                <div className="h-48 bg-gray-200 relative">
                                    {agenda.image_url ? (
                                        <img
                                            src={agenda.image_url}
                                            alt={agenda.title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Sparkles className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                                        {agenda.title}
                                    </h3>
                                    <div className="flex items-center text-gray-500 text-sm mb-4">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {new Date(agenda.created_at).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}
                                    </div>
                                    <div
                                        className="text-gray-600 text-sm mb-4 line-clamp-3 prose prose-sm"
                                        dangerouslySetInnerHTML={{ __html: agenda.content }}
                                    />
                                    <div className="mt-auto pt-4 border-t border-gray-100">
                                        <Link
                                            to={`/agenda/${agenda.slug}`}
                                            className="text-teal-600 hover:text-teal-700 text-sm font-medium flex items-center justify-end"
                                        >
                                            Baca Selengkapnya
                                            <ArrowRight className="w-4 h-4 ml-1" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                        <p className="text-gray-500">Belum ada agenda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AgendaList;

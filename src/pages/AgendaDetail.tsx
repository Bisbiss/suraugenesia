import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { ArrowLeft, Calendar, Sparkles, Clock, Share2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import PublicNavbar from "../components/PublicNavbar";

interface Agenda {
    id: number;
    title: string;
    slug: string;
    content: string;
    image_url: string;
    created_at: string;
}

const AgendaDetail = () => {
    const { slug } = useParams<{ slug: string }>();
    const [agenda, setAgenda] = useState<Agenda | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (slug) {
            fetchAgenda(slug);
        }
    }, [slug]);

    const fetchAgenda = async (agendaSlug: string) => {
        try {
            const { data, error } = await supabase
                .from("agendas")
                .select("*")
                .eq("slug", agendaSlug)
                .single();

            if (error) throw error;
            setAgenda(data);
        } catch (error) {
            console.error("Error fetching agenda:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500">Memuat agenda...</p>
                </div>
            </div>
        );
    }

    if (!agenda) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Agenda Tidak Ditemukan</h2>
                    <p className="text-gray-600 mb-6">Maaf, agenda yang Anda cari tidak dapat ditemukan.</p>
                    <Link to="/agenda" className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Agenda
                    </Link>
                </div>
            </div>
        );
    }

    // Strip HTML tags for meta description
    const plainTextDescription = agenda.content.replace(/<[^>]+>/g, '').substring(0, 160);
    const currentUrl = window.location.href;



    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <Helmet>
                <title>{agenda.title} - Surau Genesia</title>
                <meta name="description" content={plainTextDescription} />
                <link rel="canonical" href={currentUrl} />
                <meta property="og:title" content={agenda.title} />
                <meta property="og:description" content={plainTextDescription} />
                <meta property="og:image" content={agenda.image_url} />
                <meta property="og:url" content={currentUrl} />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            <PublicNavbar />

            {/* Header Image */}
            <div className="h-[400px] w-full relative bg-gray-900">
                {agenda.image_url ? (
                    <img
                        src={agenda.image_url}
                        alt={agenda.title}
                        className="w-full h-full object-cover opacity-80"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 bg-gray-200">
                        <Sparkles className="w-16 h-16" />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 container mx-auto">
                    <Link to="/agenda" className="inline-flex items-center text-white/80 hover:text-white mb-6 transition-colors backdrop-blur-sm bg-black/20 px-3 py-1 rounded-full">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Kembali ke Daftar Agenda
                    </Link>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {agenda.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-white/90">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2" />
                            {new Date(agenda.created_at).toLocaleDateString("id-ID", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                            })}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-5 h-5 mr-2" />
                            {new Date(agenda.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit",
                            })} WIB
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 mt-10 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 max-w-4xl mx-auto">
                    <div
                        className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-a:text-teal-600 hover:prose-a:text-teal-700"
                        dangerouslySetInnerHTML={{ __html: agenda.content }}
                    />

                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Bagikan Agenda Ini</h3>
                        <div className="flex gap-4">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link berhasil disalin!');
                                }}
                                className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                Salin Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgendaDetail;

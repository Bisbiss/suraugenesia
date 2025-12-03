import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

const PublicNavbar = () => {
    const [logoUrl, setLogoUrl] = useState<string>("/Logo Surau Genesia.jpg");

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data } = await supabase
                .from('site_settings')
                .select('logo_url')
                .single();

            if (data?.logo_url) {
                setLogoUrl(data.logo_url);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        }
    };

    return (
        <nav className="bg-teal-700 text-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                        <img
                            src={logoUrl}
                            alt="Surau Genesia"
                            className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                        />
                        <div>
                            <h1 className="text-xl font-bold leading-none">Surau Genesia</h1>
                            <p className="text-xs text-teal-100">Lampung Cerdas</p>
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default PublicNavbar;

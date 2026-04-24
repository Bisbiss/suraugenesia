import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

export default function LinkRedirect() {
    const { slug } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAndRedirect = async () => {
            if (!slug) {
                navigate('/');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('direct_links')
                    .select('target_url')
                    .eq('slug', slug)
                    .single();

                if (data && data.target_url) {
                    // Check if it has http:// or https://
                    let finalUrl = data.target_url;
                    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                        finalUrl = 'https://' + finalUrl;
                    }
                    window.location.href = finalUrl;
                } else {
                    console.error('Link not found or error:', error);
                    navigate('/'); 
                }
            } catch (err) {
                console.error('Unexpected error:', err);
                navigate('/');
            }
        };

        fetchAndRedirect();
    }, [slug, navigate]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-600 mb-4"></div>
            <p className="text-gray-600">Mengalihkan halaman...</p>
        </div>
    );
}

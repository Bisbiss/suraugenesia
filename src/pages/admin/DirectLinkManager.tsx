import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Plus, Pencil, Trash2, X, Link as LinkIcon, ExternalLink, Copy, Check } from 'lucide-react';

interface DirectLink {
    id: string;
    slug: string;
    target_url: string;
    created_at: string;
}

export default function DirectLinkManager() {
    const [links, setLinks] = useState<DirectLink[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingLink, setEditingLink] = useState<DirectLink | null>(null);
    const [formData, setFormData] = useState({ slug: '', target_url: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        fetchLinks();
    }, []);

    const fetchLinks = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('direct_links')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching links:', error);
            // Ignore error gracefully if table doesn't exist yet, we can't show a generic alert since it might be a schema issue
        } else if (data) {
            setLinks(data);
        }
        setIsLoading(false);
    };

    const handleOpenModal = (link?: DirectLink) => {
        if (link) {
            setEditingLink(link);
            setFormData({ slug: link.slug, target_url: link.target_url });
        } else {
            setEditingLink(null);
            setFormData({ slug: '', target_url: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingLink(null);
        setFormData({ slug: '', target_url: '' });
    };

    const generateRandomSlug = () => {
        const randomString = Math.random().toString(36).substring(2, 8);
        setFormData({ ...formData, slug: randomString });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Clean slug (remove spaces, special chars)
            const cleanSlug = formData.slug.replace(/[^a-zA-Z0-9-_]/g, '').toLowerCase();
            
            const linkData = {
                slug: cleanSlug,
                target_url: formData.target_url
            };

            if (editingLink) {
                const { error } = await supabase
                    .from('direct_links')
                    .update(linkData)
                    .eq('id', editingLink.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('direct_links')
                    .insert([linkData]);

                if (error) throw error;
            }

            handleCloseModal();
            fetchLinks();
        } catch (error: any) {
            console.error('Error saving link:', error);
            alert('Gagal menyimpan link. Pastikan slug belum pernah digunakan (unik). \n\nError: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus direct link ini?')) {
            const { error } = await supabase
                .from('direct_links')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting link:', error);
                alert('Gagal menghapus link.');
            } else {
                fetchLinks();
            }
        }
    };

    const handleCopy = (slug: string, id: string) => {
        const url = `${window.location.origin}/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Direct Link Manager</h1>
                    <p className="text-gray-600 text-sm mt-1">Kelola tautan pendek (shortlink) untuk diarahkan ke URL tujuan (misal: Google Form).</p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center space-x-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Buat Link Baru</span>
                </button>
            </div>

            {/* Note about Database Setup */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-lg">
                <div className="flex">
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            <strong>Penting:</strong> Pastikan Anda telah membuat tabel <code className="bg-blue-100 px-1 rounded">direct_links</code> di Supabase dengan kolom: 
                            <code className="bg-blue-100 px-1 rounded ml-1">id (uuid)</code>, 
                            <code className="bg-blue-100 px-1 rounded ml-1">slug (text, unique)</code>, 
                            <code className="bg-blue-100 px-1 rounded ml-1">target_url (text)</code>, dan 
                            <code className="bg-blue-100 px-1 rounded ml-1">created_at (timestamp)</code>. 
                            Serta aktifkan RLS policy untuk mengizinkan insert/update/delete untuk anon/authenticated (sesuai kebutuhan admin).
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-teal-900 text-white">
                                <th className="p-4 border-b border-teal-800 font-semibold">Short Link</th>
                                <th className="p-4 border-b border-teal-800 font-semibold">Target URL</th>
                                <th className="p-4 border-b border-teal-800 font-semibold text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-600 mx-auto"></div>
                                    </td>
                                </tr>
                            ) : links.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="p-8 text-center text-gray-500">
                                        Belum ada direct link yang ditambahkan.
                                    </td>
                                </tr>
                            ) : (
                                links.map((link) => (
                                    <tr key={link.id} className="hover:bg-gray-50 border-b border-gray-100 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="bg-teal-50 text-teal-700 px-3 py-1 rounded font-medium font-mono text-sm border border-teal-100 flex items-center">
                                                    /{link.slug}
                                                </div>
                                                <button 
                                                    onClick={() => handleCopy(link.slug, link.id)}
                                                    className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                                                    title="Copy link"
                                                >
                                                    {copiedId === link.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                </button>
                                                <a 
                                                    href={`/${link.slug}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Test link"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600">
                                            <div className="max-w-md truncate" title={link.target_url}>
                                                {link.target_url}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button
                                                    onClick={() => handleOpenModal(link)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Link"
                                                >
                                                    <Pencil className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(link.id)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Hapus Link"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-bold text-gray-800">
                                {editingLink ? 'Edit Direct Link' : 'Buat Direct Link Baru'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target URL (Tujuan)</label>
                                <input
                                    type="url"
                                    required
                                    value={formData.target_url}
                                    onChange={(e) => setFormData({ ...formData, target_url: e.target.value })}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                    placeholder="Contoh: https://forms.gle/xyz..."
                                />
                                <p className="text-xs text-gray-500 mt-1">Tautan lengkap ke Google Form atau website lain.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Custom Slug (Jalur URL)</label>
                                <div className="flex">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                                        {window.location.host}/
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        value={formData.slug}
                                        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                        className="flex-1 min-w-0 block w-full px-4 py-2 border rounded-none rounded-r-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
                                        placeholder="form-pendaftaran"
                                    />
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">Gunakan huruf, angka, strip (-), atau underscore (_).</p>
                                    <button 
                                        type="button" 
                                        onClick={generateRandomSlug}
                                        className="text-xs text-teal-600 hover:text-teal-700 font-medium"
                                    >
                                        Generate Random
                                    </button>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors flex items-center"
                                >
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Save, Loader2, Upload, Image as ImageIcon } from "lucide-react";

interface SiteSettings {
    id: number;
    phone: string;
    email: string;
    address: string;
    bank_name: string;
    bank_number: string;
    bank_holder: string;
    vision: string;
    mission: string;
    logo_url: string;
    pamphlet_url: string;
    instagram_url: string;
    facebook_url: string;
    youtube_url: string;
}

const SiteSettingsManager = () => {
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingLogo, setUploadingLogo] = useState(false);
    const [uploadingPamphlet, setUploadingPamphlet] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const { data, error } = await supabase
                .from('site_settings')
                .select('*')
                .single();

            if (error) throw error;
            setSettings(data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (file: File, type: 'logo' | 'pamphlet') => {
        try {
            if (type === 'logo') setUploadingLogo(true);
            else setUploadingPamphlet(true);

            const fileExt = file.name.split('.').pop();
            const fileName = `${type}-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('site-assets').getPublicUrl(filePath);

            setSettings(prev => prev ? ({
                ...prev,
                [type === 'logo' ? 'logo_url' : 'pamphlet_url']: data.publicUrl
            }) : null);

        } catch (error) {
            console.error(`Error uploading ${type}:`, error);
            alert(`Gagal mengupload ${type}`);
        } finally {
            if (type === 'logo') setUploadingLogo(false);
            else setUploadingPamphlet(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!settings) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('site_settings')
                .update({
                    phone: settings.phone,
                    email: settings.email,
                    address: settings.address,
                    bank_name: settings.bank_name,
                    bank_number: settings.bank_number,
                    bank_holder: settings.bank_holder,
                    vision: settings.vision,
                    mission: settings.mission,
                    logo_url: settings.logo_url,
                    pamphlet_url: settings.pamphlet_url,
                    instagram_url: settings.instagram_url,
                    facebook_url: settings.facebook_url,
                    youtube_url: settings.youtube_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', settings.id);

            if (error) throw error;
            alert('Pengaturan berhasil disimpan!');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Gagal menyimpan pengaturan');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
            </div>
        );
    }

    if (!settings) return null;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Pengaturan Website</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Identitas & Kontak */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        Identitas & Kontak
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telepon / WhatsApp</label>
                            <input
                                type="text"
                                value={settings.phone || ''}
                                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={settings.email || ''}
                                onChange={e => setSettings({ ...settings, email: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                            <textarea
                                value={settings.address || ''}
                                onChange={e => setSettings({ ...settings, address: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Media Sosial */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Media Sosial</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
                            <input
                                type="text"
                                value={settings.instagram_url || ''}
                                onChange={e => setSettings({ ...settings, instagram_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Facebook URL</label>
                            <input
                                type="text"
                                value={settings.facebook_url || ''}
                                onChange={e => setSettings({ ...settings, facebook_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">YouTube URL</label>
                            <input
                                type="text"
                                value={settings.youtube_url || ''}
                                onChange={e => setSettings({ ...settings, youtube_url: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Rekening Bank */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Informasi Rekening Donasi</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
                            <input
                                type="text"
                                value={settings.bank_name || ''}
                                onChange={e => setSettings({ ...settings, bank_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                            <input
                                type="text"
                                value={settings.bank_number || ''}
                                onChange={e => setSettings({ ...settings, bank_number: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Atas Nama</label>
                            <input
                                type="text"
                                value={settings.bank_holder || ''}
                                onChange={e => setSettings({ ...settings, bank_holder: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Visi & Misi */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Visi & Misi</h2>
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Visi</label>
                            <textarea
                                value={settings.vision || ''}
                                onChange={e => setSettings({ ...settings, vision: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Misi</label>
                            <textarea
                                value={settings.mission || ''}
                                onChange={e => setSettings({ ...settings, mission: e.target.value })}
                                rows={5}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none"
                                placeholder="Pisahkan dengan baris baru untuk setiap poin misi"
                            />
                        </div>
                    </div>
                </div>

                {/* Upload Gambar */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Aset Gambar</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Logo Website</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {settings.logo_url ? (
                                    <div className="mb-4 relative h-32 w-full flex items-center justify-center bg-gray-50 rounded">
                                        <img src={settings.logo_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="mb-4 h-32 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'logo')}
                                        className="hidden"
                                        id="logo-upload"
                                        disabled={uploadingLogo}
                                    />
                                    <label
                                        htmlFor="logo-upload"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload Logo
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Pamphlet Upload */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Pamflet / Banner Utama</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                {settings.pamphlet_url ? (
                                    <div className="mb-4 relative h-32 w-full flex items-center justify-center bg-gray-50 rounded">
                                        <img src={settings.pamphlet_url} alt="Pamflet" className="max-h-full max-w-full object-contain" />
                                    </div>
                                ) : (
                                    <div className="mb-4 h-32 flex items-center justify-center bg-gray-50 rounded text-gray-400">
                                        <ImageIcon className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'pamphlet')}
                                        className="hidden"
                                        id="pamphlet-upload"
                                        disabled={uploadingPamphlet}
                                    />
                                    <label
                                        htmlFor="pamphlet-upload"
                                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
                                    >
                                        {uploadingPamphlet ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                                        Upload Pamflet
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-6">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 shadow-lg shadow-teal-600/30 transition-all disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SiteSettingsManager;

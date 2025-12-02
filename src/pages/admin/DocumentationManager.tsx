import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Plus, Trash2, Image as ImageIcon, Video, Loader2, ExternalLink } from "lucide-react";

interface DocumentationItem {
    id: number;
    title: string;
    type: 'image' | 'video';
    url: string;
    created_at: string;
}

const DocumentationManager = () => {
    const [items, setItems] = useState<DocumentationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        type: 'image' as 'image' | 'video',
    });
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const { data, error } = await supabase
                .from('documentation_items')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            console.log('Fetched items:', data);
            setItems(data || []);
        } catch (error) {
            console.error('Error fetching documentation:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('documentation')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Supabase storage upload error:', uploadError);
                throw uploadError;
            }

            const { data } = supabase.storage.from('documentation').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            alert('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        setUploading(true);

        try {
            const url = await uploadFile(selectedFile);

            const { error } = await supabase
                .from('documentation_items')
                .insert([{
                    title: formData.title,
                    type: formData.type,
                    url: url
                }]);

            if (error) {
                console.error('Supabase database insert error:', error);
                throw error;
            }

            alert('Data berhasil disimpan!');
            setFormData({ title: '', type: 'image' });
            setSelectedFile(null);
            setIsModalOpen(false);
            fetchItems();
        } catch (error: any) {
            console.error('Error adding item:', error);
            alert(`Error adding item: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const handleDelete = async (id: number, url: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            // Try to delete from storage if it's a storage URL
            if (url.includes('supabase.co/storage')) {
                const path = url.split('/').pop();
                if (path) {
                    await supabase.storage.from('documentation').remove([path]);
                }
            }

            const { error } = await supabase
                .from('documentation_items')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchItems();
        } catch (error) {
            console.error('Error deleting item:', error);
            alert('Error deleting item');
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Documentation Manager</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Add New
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                            <div className="aspect-video bg-gray-100 relative group">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                                ) : (
                                    <video src={item.url} className="w-full h-full object-cover" controls />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <a
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-white rounded-full hover:bg-gray-100"
                                    >
                                        <ExternalLink className="w-5 h-5 text-gray-700" />
                                    </a>
                                    <button
                                        onClick={() => handleDelete(item.id, item.url)}
                                        className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                                    >
                                        <Trash2 className="w-5 h-5 text-white" />
                                    </button>
                                </div>
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded text-xs text-white uppercase font-bold flex items-center">
                                    {item.type === 'image' ? <ImageIcon className="w-3 h-3 mr-1" /> : <Video className="w-3 h-3 mr-1" />}
                                    {item.type}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold mb-4">Add Documentation</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as 'image' | 'video' })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                >
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File</label>
                                <input
                                    type="file"
                                    required
                                    accept={formData.type === 'image' ? "image/*" : "video/*"}
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Supported formats: {formData.type === 'image' ? 'JPG, PNG, GIF' : 'MP4, WebM'}</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting || uploading}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 disabled:opacity-50 flex items-center"
                                >
                                    {uploading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    {submitting ? 'Saving...' : 'Save Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentationManager;

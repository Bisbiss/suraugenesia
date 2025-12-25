import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Plus, Trash2, Image as ImageIcon, Video, Loader2, ExternalLink, Eye, EyeOff, Edit } from "lucide-react";

interface DocumentationItem {
    id: number;
    title: string;
    description?: string;
    is_active: boolean;
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
        description: '',
        is_active: true,
        type: 'image' as 'image' | 'video',
    });
    const [editingId, setEditingId] = useState<number | null>(null);
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

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('documentation').getPublicUrl(filePath);
            return data.publicUrl;
        } catch (error) {
            console.error('Error in uploadFile:', error);
            throw error;
        }
    };

    const handleEdit = (item: DocumentationItem) => {
        setFormData({
            title: item.title,
            description: item.description || '',
            is_active: item.is_active,
            type: item.type,
        });
        setEditingId(item.id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ title: '', description: '', is_active: true, type: 'image' });
        setSelectedFile(null);
        setEditingId(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile && !editingId) {
            alert('Please select a file to upload.');
            return;
        }

        setSubmitting(true);
        setUploading(true);

        try {
            let url = '';

            if (selectedFile) {
                url = await uploadFile(selectedFile);
            }

            if (editingId) {
                // Update existing item
                const updates: any = {
                    title: formData.title,
                    description: formData.description,
                    is_active: formData.is_active,
                    type: formData.type,
                };
                if (url) updates.url = url;

                const { error } = await supabase
                    .from('documentation_items')
                    .update(updates)
                    .eq('id', editingId);

                if (error) throw error;
                alert('Data berhasil diperbarui!');
            } else {
                // Create new item
                const { error } = await supabase
                    .from('documentation_items')
                    .insert([{
                        title: formData.title,
                        description: formData.description,
                        is_active: formData.is_active,
                        type: formData.type,
                        url: url
                    }]);

                if (error) throw error;
                alert('Data berhasil disimpan!');
            }

            closeModal();
            fetchItems();
        } catch (error: any) {
            console.error('Error saving item:', error);
            alert(`Error saving item: ${error.message || 'Unknown error'}`);
        } finally {
            setSubmitting(false);
            setUploading(false);
        }
    };

    const toggleStatus = async (id: number, currentStatus: boolean) => {
        try {
            const { error } = await supabase
                .from('documentation_items')
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            fetchItems(); // Refresh list
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Gagal mengubah status');
        }
    };

    const handleDelete = async (id: number, url: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
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
                    onClick={() => {
                        setEditingId(null);
                        setFormData({ title: '', description: '', is_active: true, type: 'image' });
                        setIsModalOpen(true);
                    }}
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
                        <div key={item.id} className={`bg-white rounded-xl shadow-md overflow-hidden border ${item.is_active ? 'border-gray-100' : 'border-red-200 bg-red-50'}`}>
                            <div className="aspect-video bg-gray-100 relative group">
                                {item.type === 'image' ? (
                                    <img src={item.url} alt={item.title} className={`w-full h-full object-cover ${!item.is_active && 'grayscale'}`} />
                                ) : (
                                    <video src={item.url} className={`w-full h-full object-cover ${!item.is_active && 'grayscale'}`} controls />
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <button
                                        onClick={() => toggleStatus(item.id, item.is_active)}
                                        className={`p-2 rounded-full hover:bg-gray-100 ${item.is_active ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}
                                        title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
                                    >
                                        {item.is_active ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 bg-blue-500 rounded-full hover:bg-blue-600 text-white"
                                        title="Edit"
                                    >
                                        <Edit className="w-5 h-5" />
                                    </button>
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
                                {!item.is_active && (
                                    <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 rounded text-xs text-white uppercase font-bold">
                                        Nonaktif
                                    </div>
                                )}
                            </div>
                            <div className="p-4">
                                <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                                {item.description && (
                                    <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Edit Documentation' : 'Add Documentation'}</h2>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_active}
                                        onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                                        className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Active / Tampilkan di Website</span>
                                </label>
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Upload File {editingId && '(Only if changing file)'}</label>
                                <input
                                    type="file"
                                    required={!editingId}
                                    accept={formData.type === 'image' ? "image/*" : "video/*"}
                                    onChange={handleFileChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                />
                                <p className="text-xs text-gray-500 mt-1">Supported formats: {formData.type === 'image' ? 'JPG, PNG, GIF' : 'MP4, WebM'}</p>
                            </div>

                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={closeModal}
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
                                    {submitting ? 'Saving...' : (editingId ? 'Update Item' : 'Save Item')}
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

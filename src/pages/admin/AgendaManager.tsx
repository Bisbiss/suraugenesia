import { useState, useEffect } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Plus, Edit, Trash2, Image as ImageIcon, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

interface Agenda {
    id: number;
    title: string;
    slug: string;
    content: string; // Rich text content
    image_url: string;
    created_at?: string;
}

const AgendaManager = () => {
    const [agendas, setAgendas] = useState<Agenda[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAgenda, setCurrentAgenda] = useState<Partial<Agenda>>({});
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchAgendas();
    }, []);

    const fetchAgendas = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("agendas")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching agendas:", error);
        } else {
            setAgendas(data || []);
        }
        setLoading(false);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("agenda-images")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from("agenda-images").getPublicUrl(filePath);

            setCurrentAgenda({ ...currentAgenda, image_url: data.publicUrl });
        } catch (error) {
            alert("Error uploading image!");
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-');
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const slug = generateSlug(currentAgenda.title || '') + '-' + Date.now(); // Ensure uniqueness with timestamp

            if (currentAgenda.id) {
                // Update
                const { error } = await supabase
                    .from("agendas")
                    .update({
                        title: currentAgenda.title,
                        slug: currentAgenda.slug || slug, // Keep existing slug if possible, or generate new one
                        content: currentAgenda.content,
                        image_url: currentAgenda.image_url,
                    })
                    .eq("id", currentAgenda.id);

                if (error) throw error;
            } else {
                // Insert
                const { error } = await supabase
                    .from("agendas")
                    .insert([
                        {
                            title: currentAgenda.title,
                            slug: slug,
                            content: currentAgenda.content,
                            image_url: currentAgenda.image_url,
                        },
                    ]);

                if (error) throw error;
            }

            await fetchAgendas();
            setIsModalOpen(false);
            setCurrentAgenda({});
        } catch (error) {
            console.error("Error saving agenda:", error);
            alert("Gagal menyimpan agenda.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this agenda?")) {
            try {
                setLoading(true);
                const { error } = await supabase.from("agendas").delete().eq("id", id);
                if (error) throw error;
                await fetchAgendas();
            } catch (error) {
                console.error("Error deleting agenda:", error);
                alert("Gagal menghapus agenda.");
            } finally {
                setLoading(false);
            }
        }
    };

    const openModal = (agenda?: Agenda) => {
        setCurrentAgenda(agenda || { content: "" });
        setIsModalOpen(true);
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manajemen Agenda</h1>
                    <p className="text-gray-600">Kelola agenda, foto, dan konten rich text.</p>
                </div>
                <button
                    onClick={() => openModal()}
                    className="flex items-center space-x-2 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    <span>Tambah Agenda</span>
                </button>
            </div>

            {loading && <p className="text-center text-gray-500">Loading...</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agendas.map((agenda) => (
                    <div key={agenda.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                        <div className="h-48 bg-gray-100 relative">
                            {agenda.image_url ? (
                                <img src={agenda.image_url} alt={agenda.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-12 h-12" />
                                </div>
                            )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-800 mb-2">{agenda.title}</h3>
                            <div
                                className="text-gray-600 text-sm mb-4 line-clamp-3 prose prose-sm"
                                dangerouslySetInnerHTML={{ __html: agenda.content }}
                            />
                            <div className="mt-auto flex justify-end space-x-2 pt-4 border-t border-gray-100">
                                <button onClick={() => openModal(agenda)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleDelete(agenda.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 my-8">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {currentAgenda.id ? "Edit Agenda" : "Tambah Agenda Baru"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Agenda</label>
                                <div className="flex items-center space-x-4">
                                    <div className="w-32 h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden relative">
                                        {currentAgenda.image_url ? (
                                            <img src={currentAgenda.image_url} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <ImageIcon className="w-8 h-8 text-gray-400" />
                                        )}
                                        {uploading && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs">
                                                Uploading...
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Agenda</label>
                                <input
                                    type="text"
                                    value={currentAgenda.title || ""}
                                    onChange={(e) => setCurrentAgenda({ ...currentAgenda, title: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                                    placeholder="Judul kegiatan..."
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Konten / Deskripsi</label>
                                <div className="h-64 mb-12">
                                    <ReactQuill
                                        theme="snow"
                                        value={currentAgenda.content || ""}
                                        onChange={(content) => setCurrentAgenda({ ...currentAgenda, content })}
                                        className="h-full"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-gray-100">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={loading || uploading}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium shadow-lg shadow-teal-600/30 flex items-center disabled:opacity-50"
                            >
                                <Save className="w-4 h-4 mr-2" />
                                {loading ? "Menyimpan..." : "Simpan Agenda"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AgendaManager;

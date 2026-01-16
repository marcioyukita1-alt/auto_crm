import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { File, Upload, Download, Trash2, Loader2, Paperclip } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileManagerProps {
    leadId: string;
}

interface ClientFile {
    id: string;
    name: string;
    file_path: string;
    size: number;
    created_at: string;
}

const FileManager: React.FC<FileManagerProps> = ({ leadId }) => {
    const [files, setFiles] = useState<ClientFile[]>([]);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFiles();
    }, [leadId]);

    const fetchFiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('client_files')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching files:', error);
        } else {
            setFiles(data || []);
        }
        setLoading(false);
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${leadId}/${fileName}`;

            // 1. Upload to Storage
            const { error: uploadError } = await supabase.storage
                .from('client-files')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // 2. Save record to database
            const { error: dbError } = await supabase
                .from('client_files')
                .insert({
                    lead_id: leadId,
                    name: file.name,
                    file_path: filePath,
                    size: file.size
                });

            if (dbError) throw dbError;

            await fetchFiles();
        } catch (error: any) {
            alert('Erro no upload: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = async (file: ClientFile) => {
        try {
            const { data, error } = await supabase.storage
                .from('client-files')
                .download(file.file_path);

            if (error) throw error;

            const url = URL.createObjectURL(data);
            const a = document.createElement('a');
            a.href = url;
            a.download = file.name;
            a.click();
        } catch (error: any) {
            alert('Erro no download: ' + error.message);
        }
    };

    const handleDelete = async (file: ClientFile) => {
        if (!confirm('Deseja realmente excluir este arquivo?')) return;

        try {
            const { error: storageError } = await supabase.storage
                .from('client-files')
                .remove([file.file_path]);

            if (storageError) throw storageError;

            const { error: dbError } = await supabase
                .from('client_files')
                .delete()
                .eq('id', file.id);

            if (dbError) throw dbError;

            await fetchFiles();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <div className="file-manager" style={{ color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Paperclip size={24} color="var(--accent)" /> Arquivos do Projeto
                </h3>
                <label className="btn btn-accent" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    {uploading ? 'Enviando...' : 'Enviar Arquivo'}
                    <input type="file" hidden onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            <div className="glass" style={{ borderRadius: '1.5rem', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ padding: '4rem', textAlign: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--accent)" />
                    </div>
                ) : files.length === 0 ? (
                    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--muted-foreground)' }}>
                        <File size={48} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                        <p>Nenhum arquivo enviado ainda.</p>
                    </div>
                ) : (
                    <div style={{ padding: '1rem' }}>
                        {files.map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    borderRadius: '1rem',
                                    background: 'rgba(255,255,255,0.02)',
                                    marginBottom: '0.5rem',
                                    border: '1px solid rgba(255,255,255,0.05)',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <div style={{ padding: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '0.75rem', color: 'var(--accent)' }}>
                                        <File size={20} />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.925rem' }}>{file.name}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                            {formatSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleDownload(file)}
                                        className="btn-icon"
                                        style={{ color: 'var(--accent)', background: 'rgba(37, 99, 235, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(file)}
                                        className="btn-icon"
                                        style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '0.5rem' }}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FileManager;

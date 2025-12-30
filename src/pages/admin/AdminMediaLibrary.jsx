import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Image as ImageIcon,
    Upload,
    Trash2,
    Copy,
    Check,
    Loader,
    ArrowLeft,
    FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminMediaLibrary() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
        loadMedia();
    }, []);

    const loadMedia = async () => {
        try {
            setLoading(true);
            const data = await api.getMedia();
            setMedia(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploading(true);
            setError(null);
            setSuccess(null);

            await api.uploadMedia(file);
            setSuccess('File uploaded successfully');
            loadMedia();
        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this file?')) return;
        try {
            await api.deleteMedia(id);
            setMedia(prev => prev.filter(item => item.id !== id));
            setSuccess('File deleted');
        } catch (err) {
            setError(err.message);
        }
    };

    const copyToClipboard = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="admin-page">
            <div className="admin-page-header">
                <div className="page-title">
                    <button onClick={() => navigate('/admin')} className="back-btn">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <ImageIcon className="w-8 h-8" />
                    <div>
                        <h1>Media Library</h1>
                        <p>Manage uploaded images and files</p>
                    </div>
                </div>
                <div className="page-actions">
                    <label className="btn-primary" style={{ cursor: 'pointer' }}>
                        {uploading ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
                        <input
                            type="file"
                            hidden
                            onChange={handleFileUpload}
                            accept="image/*,application/pdf"
                        />
                    </label>
                </div>
            </div>

            {error && <div className="admin-error">{error}</div>}
            {success && <div className="admin-success">{success}</div>}

            {loading ? (
                <div className="admin-loading"><div className="loading-spinner"></div></div>
            ) : (
                <div className="media-grid" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px',
                    marginTop: '20px'
                }}>
                    {media.length === 0 ? (
                        <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                            <ImageIcon className="w-10 h-10" />
                            <p>No media files uploaded yet</p>
                        </div>
                    ) : (
                        media.map(item => (
                            <div key={item.id} className="media-item" style={{
                                background: 'white',
                                borderRadius: '12px',
                                overflow: 'hidden',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                position: 'relative'
                            }}>
                                <div className="media-preview" style={{
                                    height: '150px',
                                    background: '#f3f4f6',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    {item.mimetype.startsWith('image/') ? (
                                        <img src={item.url} alt={item.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    ) : (
                                        <FileText className="w-10 h-10 text-gray-400" />
                                    )}
                                </div>
                                <div className="media-info" style={{ padding: '12px' }}>
                                    <p className="filename" style={{
                                        fontSize: '14px',
                                        fontWeight: '500',
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        marginBottom: '8px'
                                    }} title={item.filename}>
                                        {item.filename}
                                    </p>
                                    <div className="media-actions" style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <button
                                            onClick={() => copyToClipboard(item.url, item.id)}
                                            className="btn-text"
                                            title="Copy URL"
                                            style={{ color: copiedId === item.id ? 'green' : '#6b7280' }}
                                        >
                                            {copiedId === item.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="btn-text text-red"
                                            style={{ color: '#ef4444' }}
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

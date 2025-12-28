import React, { useState, useRef } from 'react';
import './ImagePicker.css';

const ImagePicker = ({ currentImage, onImageSelect, onImageUpload, eventId, label = "Event Banner" }) => {
    const [preview, setPreview] = useState(currentImage || null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            setError('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
            return;
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            setError('File size exceeds 5MB limit.');
            return;
        }

        setError(null);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Notify parent component
        if (onImageSelect) {
            onImageSelect(file);
        }

        // Auto-upload if eventId and callback provided
        if (eventId && onImageUpload) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        setUploading(true);
        setError(null);

        try {
            const imageUrl = await onImageUpload(file, eventId);
            setPreview(imageUrl);
        } catch (err) {
            setError(err.message || 'Failed to upload image');
            setPreview(currentImage);
        } finally {
            setUploading(false);
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleRemove = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (onImageSelect) {
            onImageSelect(null);
        }
    };

    return (
        <div className="image-picker">
            <label className="image-picker-label">{label}</label>

            <div className="image-picker-container">
                {preview ? (
                    <div className="image-preview">
                        <img src={preview} alt="Preview" />
                        {uploading && (
                            <div className="upload-overlay">
                                <div className="spinner"></div>
                                <p>Uploading...</p>
                            </div>
                        )}
                        {!uploading && (
                            <div className="image-actions">
                                <button
                                    type="button"
                                    onClick={handleClick}
                                    className="btn-change"
                                >
                                    Change
                                </button>
                                <button
                                    type="button"
                                    onClick={handleRemove}
                                    className="btn-remove"
                                >
                                    Remove
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="image-placeholder" onClick={handleClick}>
                        <svg
                            className="upload-icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                        <p className="upload-text">Click to upload image</p>
                        <p className="upload-hint">JPEG, PNG, or WebP (max 5MB)</p>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                />
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}
        </div>
    );
};

export default ImagePicker;

import React, { useMemo, useState } from 'react';

const CreateLinkModal = ({ isOpen, onClose, onCreate }) => {
    const [originalUrl, setOriginalUrl] = useState('');
    const [customCode, setCustomCode] = useState('');
    const [title, setTitle] = useState('');
    const [tagsInput, setTagsInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen) return null;

    const parsedTags = useMemo(
        () => tagsInput.split(',').map((t) => t.trim()).filter(Boolean),
        [tagsInput]
    );

    const resetForm = () => {
        setOriginalUrl('');
        setCustomCode('');
        setTitle('');
        setTagsInput('');
        setError('');
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const handleCreate = async () => {
        if (!originalUrl.trim()) {
            setError('Destination URL is required');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await onCreate({
                originalUrl: originalUrl.trim(),
                customCode: customCode.trim() || undefined,
                title: title.trim() || undefined,
                tags: parsedTags
            });
            resetForm();
        } catch (createError) {
            setError(createError?.response?.data?.error || 'Unable to create link');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay active" onClick={handleClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Link</h2>
                    <button className="modal-close-btn" onClick={handleClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-form-column">
                        <div className="form-field">
                            <label className="form-label">Destination URL</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="https://…"
                                value={originalUrl}
                                onChange={(e) => setOriginalUrl(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Short code</label>
                            <div className="shortcode-input-wrapper">
                                <div className="shortcode-prefix">bkn.so/</div>
                                <input
                                    type="text"
                                    className="shortcode-input"
                                    placeholder="auto-generated"
                                    value={customCode}
                                    onChange={(e) => setCustomCode(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Link title (optional)</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="e.g. Product Launch Campaign"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Tags</label>
                            <div className="tag-input-wrapper">
                                <input
                                    type="text"
                                    className="tag-input-field"
                                    placeholder="Add tag… (comma separated)"
                                    value={tagsInput}
                                    onChange={(e) => setTagsInput(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <div className="collapsible-row">
                                <span>UTM Parameters</span>
                                <i className="fas fa-chevron-right"></i>
                            </div>
                        </div>
                    </div>

                    <div className="modal-preview-column">
                        <div className="preview-panel">
                            <div className="preview-section">
                                <div className="preview-label">Link Preview</div>
                                <div className="preview-url">bkn.so/{customCode || 'auto-generated'}</div>
                                <div className="preview-destination">{originalUrl || 'https://…'}</div>
                            </div>

                            <div className="preview-section">
                                <div className="qr-placeholder">
                                    <i className="fas fa-qrcode"></i>
                                </div>
                            </div>

                            <div className="preview-section">
                                <div className="preview-label">Tags</div>
                                <div className="preview-tags">
                                    {parsedTags.length === 0 ? <span className="tag">No tags</span> : parsedTags.map((tag) => (
                                        <span key={tag} className="tag">{tag}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    {error && (
                        <div style={{ color: '#DC2626', fontSize: '13px', marginBottom: '8px' }}>
                            {error}
                        </div>
                    )}
                    <div className="modal-footer-actions">
                        <button className="btn-ghost" onClick={handleClose} disabled={isSubmitting}>Cancel</button>
                        <button className="btn-primary" onClick={handleCreate} disabled={isSubmitting}>
                            {isSubmitting ? 'Creating...' : 'Create Link'}
                        </button>
                    </div>
                    <div className="modal-footer-note">Your link will be live immediately.</div>
                </div>
            </div>
        </div>
    );
};

export default CreateLinkModal;

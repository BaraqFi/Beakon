import React from 'react';

const CreateLinkModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">Create New Link</h2>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="modal-body">
                    <div className="modal-form-column">
                        <div className="form-field">
                            <label className="form-label">Destination URL</label>
                            <input type="text" className="form-input" placeholder="https://…" />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Short code</label>
                            <div className="shortcode-input-wrapper">
                                <div className="shortcode-prefix">bkn.so/</div>
                                <input type="text" className="shortcode-input" placeholder="auto-generated" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="form-label">Link title (optional)</label>
                            <input type="text" className="form-input" placeholder="e.g. Product Launch Campaign" />
                        </div>

                        <div className="form-field">
                            <label className="form-label">Tags</label>
                            <div className="tag-input-wrapper">
                                <span className="tag campaign">Campaign</span>
                                <span className="tag event">Event</span>
                                <input type="text" className="tag-input-field" placeholder="Add tag…" />
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
                                <div className="preview-url">bkn.so/auto-generated</div>
                                <div className="preview-destination">https://…</div>
                            </div>

                            <div className="preview-section">
                                <div className="qr-placeholder">
                                    <i className="fas fa-qrcode"></i>
                                </div>
                            </div>

                            <div className="preview-section">
                                <div className="preview-label">Tags</div>
                                <div className="preview-tags">
                                    <span className="tag campaign">Campaign</span>
                                    <span className="tag event">Event</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <div className="modal-footer-actions">
                        <button className="btn-ghost" onClick={onClose}>Cancel</button>
                        <button className="btn-primary" onClick={onCreate}>Create Link</button>
                    </div>
                    <div className="modal-footer-note">Your link will be live immediately.</div>
                </div>
            </div>
        </div>
    );
};

export default CreateLinkModal;

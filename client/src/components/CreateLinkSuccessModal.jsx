import React from 'react';

const CreateLinkSuccessModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div className="success-modal" onClick={(e) => e.stopPropagation()}>
                <div className="success-header">
                    <div className="success-header-left">
                        <div className="success-icon">
                            <i className="fas fa-check"></i>
                        </div>
                        <h2 className="success-title">Link Created!</h2>
                    </div>
                    <button className="modal-close-btn" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="success-body">
                    <div className="success-left-column">
                        <div>
                            <h3 className="success-section-title">Your link is live</h3>
                            <div className="link-display">
                                <span className="link-text">bkn.so/launch</span>
                                <button className="copy-icon-btn">
                                    <i className="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <div className="destination-info">
                            <div className="destination-label">Destination URL</div>
                            <div className="destination-url">https://example.com/product-launch-2024</div>
                        </div>

                        <div className="action-buttons">
                            <button className="btn-copy">
                                <i className="fas fa-copy"></i>
                                <span>Copy Link</span>
                            </button>
                            <button className="btn-analytics">
                                <span>View Analytics</span>
                                <i className="fas fa-arrow-right"></i>
                            </button>
                        </div>

                        <div className="tags-section">
                            <div className="tags-label">Tags</div>
                            <div className="tags">
                                <span className="tag campaign">Campaign</span>
                                <span className="tag event">Event</span>
                            </div>
                        </div>
                    </div>

                    <div className="success-right-column">
                        <div className="qr-card">
                            <svg className="qr-code" viewBox="0 0 80 80">
                                <rect width="80" height="80" fill="#161921"></rect>
                                <rect x="4" y="4" width="20" height="20" fill="#F8FAFC" rx="2"></rect>
                                <rect x="8" y="8" width="12" height="12" fill="#161921" rx="1"></rect>
                                <rect x="10" y="10" width="8" height="8" fill="#F8FAFC"></rect>
                                
                                <rect x="56" y="4" width="20" height="20" fill="#F8FAFC" rx="2"></rect>
                                <rect x="60" y="8" width="12" height="12" fill="#161921" rx="1"></rect>
                                <rect x="62" y="10" width="8" height="8" fill="#F8FAFC"></rect>
                                
                                <rect x="4" y="56" width="20" height="20" fill="#F8FAFC" rx="2"></rect>
                                <rect x="8" y="60" width="12" height="12" fill="#161921" rx="1"></rect>
                                <rect x="10" y="62" width="8" height="8" fill="#F8FAFC"></rect>
                                
                                <rect x="28" y="4" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="32" y="4" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="40" y="4" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="48" y="4" width="3" height="3" fill="#F8FAFC"></rect>
                                
                                <rect x="4" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="4" y="32" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="4" y="40" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="4" y="48" width="3" height="3" fill="#F8FAFC"></rect>
                                
                                <rect x="28" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="32" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="36" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="40" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="44" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="48" y="28" width="3" height="3" fill="#F8FAFC"></rect>
                                
                                <rect x="28" y="32" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="36" y="32" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="44" y="32" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="48" y="32" width="3" height="3" fill="#F8FAFC"></rect>
                                
                                <rect x="28" y="36" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="32" y="36" width="3" height="3" fill="#F8FAFC"></rect>
                                <rect x="40" y="36" width="3" height="3" fill="#F8FAFC"></rect>
                            </svg>
                            <div className="qr-label">bkn.so/launch</div>
                            
                            <div className="qr-divider"></div>
                            
                            <div className="stat-row">
                                <span className="stat-label">Created on</span>
                                <span className="stat-value">Oct 24, 2024</span>
                            </div>
                            <div className="stat-row">
                                <span className="stat-label">Workspace</span>
                                <span className="stat-value">Marketing Team</span>
                            </div>
                            
                            <div className="qr-note">QR code is ready to download or share.</div>
                        </div>
                    </div>
                </div>

                <div className="success-footer">
                    <button className="btn-done" onClick={onClose}>Done</button>
                </div>
            </div>
        </div>
    );
};

export default CreateLinkSuccessModal;

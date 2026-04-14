import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import useClipboard from '../../hooks/useClipboard';

const CreateLinkSuccessModal = ({ isOpen, onClose, link }) => {
    const navigate = useNavigate();
    const { copied, copy } = useClipboard();
    const [qrDataUrl, setQrDataUrl] = useState('');

    if (!isOpen) return null;

    const shortUrl = link?.shortUrl || '';
    const destinationUrl = link?.destinationUrl || '';

    useEffect(() => {
        let isMounted = true;
        const generateQr = async () => {
            if (!shortUrl) {
                setQrDataUrl('');
                return;
            }

            try {
                const result = await QRCode.toDataURL(shortUrl, {
                    width: 220,
                    margin: 1
                });
                if (isMounted) setQrDataUrl(result);
            } catch (error) {
                if (isMounted) setQrDataUrl('');
            }
        };

        generateQr();
        return () => {
            isMounted = false;
        };
    }, [shortUrl]);

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
                                <span className="link-text">{shortUrl}</span>
                                <button className="copy-icon-btn" onClick={() => copy(shortUrl)}>
                                    <i className="fas fa-copy"></i>
                                </button>
                            </div>
                        </div>

                        <div className="destination-info">
                            <div className="destination-label">Destination URL</div>
                            <div className="destination-url">{destinationUrl}</div>
                        </div>

                        <div className="action-buttons">
                            <button className="btn-copy" onClick={() => copy(shortUrl)}>
                                <i className="fas fa-copy"></i>
                                <span>{copied ? 'Copied' : 'Copy Link'}</span>
                            </button>
                            <button className="btn-analytics" onClick={() => navigate(`/analytics/${link?.shortCode}`)}>
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
                            {qrDataUrl ? (
                                <img className="qr-code" src={qrDataUrl} alt="QR code for short link" />
                            ) : (
                                <div className="qr-code" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', fontSize: '12px' }}>
                                    QR unavailable
                                </div>
                            )}
                            <div className="qr-label">{shortUrl}</div>
                            
                            <div className="qr-divider"></div>
                            
                            <div className="stat-row">
                                <span className="stat-label">Created on</span>
                                <span className="stat-value">{new Date().toLocaleDateString()}</span>
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

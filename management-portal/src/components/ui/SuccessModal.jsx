import React from 'react';
import { CheckCircle2 } from 'lucide-react';

export const SuccessModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    color: '#10b981'
                }}>
                    <CheckCircle2 size={40} />
                </div>
                <h3 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{title}</h3>
                <p style={{ color: 'var(--text-dim)', marginBottom: '30px', lineHeight: '1.5' }}>
                    {message}
                </p>
                <button
                    className="btn-primary"
                    onClick={onClose}
                    style={{ width: '100%', padding: '12px' }}
                >
                    Понятно
                </button>
            </div>
        </div>
    );
};

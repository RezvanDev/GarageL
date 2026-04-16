import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Phone, Lock, Loader2 } from 'lucide-react';

export const Login = ({ onLogin, error, loading }) => {
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onLogin(phone, password);
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#050507'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '400px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Garage <span style={{ color: 'var(--accent-blue)' }}>Admin</span></h1>
                    <p style={{ color: 'var(--text-dim)', marginTop: '10px' }}>Вход для сотрудников</p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Телефон</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Phone size={18} style={{ position: 'absolute', left: '15px', color: 'var(--accent-blue)' }} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px 12px 45px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Пароль</label>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <Lock size={18} style={{ position: 'absolute', left: '15px', color: 'var(--accent-blue)' }} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px 15px 12px 45px',
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid var(--glass-border)',
                                    borderRadius: '10px',
                                    color: '#fff',
                                    outline: 'none'
                                }}
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
                    >
                        {loading ? <Loader2 className="spin" size={20} /> : 'ВОЙТИ'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
};

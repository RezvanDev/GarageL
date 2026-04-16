import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/UI';
import { LogIn, UserPlus, Phone, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export const Auth = ({ onLogin, onRegister, isLoading, error }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isLogin) {
            onLogin(phone, password);
        } else {
            onRegister(phone, password, name);
        }
    };

    return (
        <div className="auth-view">
            {/* Background Blobs */}
            <div className="auth-bg-blobs">
                <div className="blob blob-1"></div>
                <div className="blob blob-2"></div>
                <div className="blob blob-3"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="auth-container"
            >
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 style={{ marginBottom: '10px', fontSize: '2.8rem', fontWeight: 900, letterSpacing: '-1.5px' }}>
                            Garage <span className="accent-text">Pro</span>
                        </h1>
                        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: 400 }}>
                            {isLogin ? 'Авторизация в систему' : 'Регистрация клиента'}
                        </p>
                    </motion.div>
                </div>

                <GlassCard className="auth-card">
                    <div className="auth-tabs">
                        <button
                            className={`auth-tab ${isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(true); }}
                        >
                            <LogIn size={20} /> Вход
                        </button>
                        <button
                            className={`auth-tab ${!isLogin ? 'active' : ''}`}
                            onClick={() => { setIsLogin(false); }}
                        >
                            <UserPlus size={20} /> Регистрация
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isLogin ? 'login' : 'register'}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.3 }}
                            >
                                {!isLogin && (
                                    <div className="form-group" style={{ marginBottom: '20px' }}>
                                        <label>Ваше имя</label>
                                        <div className="input-wrapper">
                                            <input
                                                className="auth-input"
                                                type="text"
                                                placeholder="Введите имя..."
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                required={!isLogin}
                                                disabled={isLoading}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: '20px' }}>
                                    <label>Телефон</label>
                                    <div className="input-wrapper">
                                        <Phone size={18} className="input-icon" />
                                        <input
                                            className="auth-input"
                                            type="tel"
                                            placeholder="+998 90 123 45 67"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                    </div>
                                </div>

                                <div className="form-group" style={{ marginBottom: '10px' }}>
                                    <label>Пароль</label>
                                    <div className="input-wrapper">
                                        <Lock size={18} className="input-icon" />
                                        <input
                                            className="auth-input"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoading}
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowPassword(!showPassword)}
                                            disabled={isLoading}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        {error && (
                            <div style={{ color: '#ff4d4d', fontSize: '0.8rem', marginBottom: '15px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn-primary auth-submit"
                            disabled={isLoading}
                            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}
                        >
                            {isLoading ? (
                                <Loader2 className="spinner" size={24} />
                            ) : (
                                isLogin ? 'ВОЙТИ' : 'СОЗДАТЬ АККАУНТ'
                            )}
                        </button>
                    </form>
                </GlassCard>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    style={{ textAlign: 'center', marginTop: '35px', color: 'var(--text-dim)', fontSize: '0.9rem' }}
                >
                    {isLogin ? (
                        <>Ещё нет аккаунта? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700 }} onClick={() => setIsLogin(false)}>Присоединиться</span></>
                    ) : (
                        <>Уже зарегистрированы? <span style={{ color: 'var(--accent-blue)', cursor: 'pointer', fontWeight: 700 }} onClick={() => setIsLogin(true)}>Войти в профиль</span></>
                    )}
                </motion.p>
            </motion.div>
        </div>
    );
};

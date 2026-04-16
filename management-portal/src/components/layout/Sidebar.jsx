import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, Truck, Users, Settings, LogOut, CheckCircle2 } from 'lucide-react';

export const Sidebar = ({ user, onLogout, activeTab, onTabChange }) => {
    const menuItems = [
        { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, roles: ['admin', 'supplier', 'logist'] },
        { id: 'orders', label: 'Биржа заказов', icon: Package, roles: ['admin', 'supplier'] },
        { id: 'moderation', label: 'Модерация', icon: CheckCircle2, roles: ['admin'] },
        { id: 'products', label: 'Управление каталогом', icon: Settings, roles: ['admin', 'supplier'] },
        { id: 'users', label: 'Пользователи', icon: Users, roles: ['admin'] },
    ].filter(item => item.roles.includes(user?.role));

    return (
        <aside className="sidebar">
            <div className="logo" style={{ marginBottom: '40px', padding: '0 10px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                    Garage <span style={{ color: 'var(--accent-blue)' }}>Admin</span>
                </h1>
            </div>

            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none' }}>
                    {menuItems.map(item => (
                        <li key={item.id} style={{ marginBottom: '8px' }}>
                            <button
                                onClick={() => onTabChange(item.id)}
                                style={{
                                    width: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    padding: '12px 16px',
                                    background: activeTab === item.id ? 'rgba(14, 165, 233, 0.1)' : 'transparent',
                                    border: 'none',
                                    borderRadius: '10px',
                                    color: activeTab === item.id ? 'var(--accent-blue)' : 'var(--text-dim)',
                                    cursor: 'pointer',
                                    fontWeight: activeTab === item.id ? 600 : 400,
                                    transition: 'var(--transition)'
                                }}
                            >
                                <item.icon size={20} />
                                {item.label}
                            </button>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="sidebar-footer" style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <div style={{ padding: '0 16px', marginBottom: '15px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700 }}>{user?.full_name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{user?.role}</p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer'
                    }}
                >
                    <LogOut size={20} />
                    Выйти
                </button>
            </div>
        </aside >
    );
};

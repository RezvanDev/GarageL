import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';

/**
 * Shared sidebar layout for all portals.
 * Props:
 *   - user: { full_name, phone }
 *   - onLogout: function
 *   - menuItems: [{ path, label, icon, exact? }]
 *   - theme: { accent, accentRgb, label, labelColor, labelBg, title }
 */
const PortalSidebar = ({ user, onLogout, menuItems, theme }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (item) =>
        item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

    return (
        <aside className="sidebar">
            {/* Logo */}
            <div style={{ marginBottom: '40px', padding: '0 10px' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                    Garage{' '}
                    <span style={{ color: theme.accent }}>{theme.title}</span>
                </h1>
                <div style={{
                    marginTop: '6px',
                    fontSize: '0.75rem',
                    color: theme.labelColor,
                    fontWeight: 600,
                    background: theme.labelBg,
                    padding: '2px 10px',
                    borderRadius: '20px',
                    display: 'inline-block',
                }}>
                    {theme.label}
                </div>
            </div>

            {/* Navigation */}
            <nav style={{ flex: 1 }}>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                    {menuItems.map(item => {
                        const active = isActive(item);
                        return (
                            <li key={item.path} style={{ marginBottom: '6px' }}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '11px 16px',
                                        background: active
                                            ? `rgba(${theme.accentRgb}, 0.1)`
                                            : 'transparent',
                                        border: active
                                            ? `1px solid rgba(${theme.accentRgb}, 0.3)`
                                            : '1px solid transparent',
                                        borderRadius: '10px',
                                        color: active ? theme.accent : 'var(--text-dim)',
                                        cursor: 'pointer',
                                        fontWeight: active ? 600 : 400,
                                        fontSize: '0.9rem',
                                        textAlign: 'left',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <item.icon size={19} />
                                    {item.label}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                <div style={{ padding: '0 16px', marginBottom: '12px' }}>
                    <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: 0 }}>
                        {user?.full_name}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', margin: '2px 0 0' }}>
                        {user?.phone}
                    </p>
                </div>
                <button
                    onClick={onLogout}
                    style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 16px',
                        background: 'transparent',
                        border: '1px solid transparent',
                        borderRadius: '10px',
                        color: '#ef4444',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.2s ease',
                    }}
                >
                    <LogOut size={19} />
                    Выйти
                </button>
            </div>
        </aside>
    );
};

/**
 * Full portal layout = sidebar + main content.
 * Just wrap your <Routes> in this component.
 */
export const PortalLayout = ({ user, onLogout, menuItems, theme, children }) => (
    <div className="admin-layout">
        <PortalSidebar
            user={user}
            onLogout={onLogout}
            menuItems={menuItems}
            theme={theme}
        />
        <main className="main-content">
            {children}
        </main>
    </div>
);

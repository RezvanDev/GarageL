import { Package, ClipboardList, ShoppingCart, LayoutDashboard } from 'lucide-react';

export const Navbar = ({ currentView, onNavigate, user, onLogout }) => {
    const navItems = [
        { id: 'dashboard', icon: LayoutDashboard },
        { id: 'catalog', icon: Package },
        { id: 'orders', icon: ClipboardList },
        { id: 'cart', icon: ShoppingCart }
    ];

    return (
        <nav className="navbar glass">
            <div className="logo" onClick={() => onNavigate('dashboard')} style={{ cursor: 'pointer' }}>
                <span className="accent">G</span>arage
            </div>
            <ul className="nav-links">
                {navItems.map(({ id, icon: Icon }) => (
                    <li
                        key={id}
                        className={`nav-item ${currentView === id ? 'active' : ''}`}
                        onClick={() => onNavigate(id)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <Icon size={20} />
                    </li>
                ))}
            </ul>
        </nav>
    );
};

export const Footer = () => (
    <footer className="status-bar glass">
        <div className="status-indicator">
            <span className="dot"></span>
            <a href="https://t.me/rezvanmax" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                Написать в тех поддержку
            </a>
        </div>
    </footer>
);

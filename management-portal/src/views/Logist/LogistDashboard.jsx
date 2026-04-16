import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
    Package, 
    Truck, 
    ClipboardList, 
    AlertCircle, 
    ArrowRight, 
    CheckCircle2, 
    Loader2 
} from 'lucide-react';

export const LogistDashboard = ({ user }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.orders.getLogisticsStats();
                setStats(res.data);
            } catch (err) {
                console.error('Failed to fetch stats:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    const cards = [
        { 
            title: 'К приемке', 
            count: stats?.to_receive || 0, 
            icon: Package, 
            color: 'var(--accent-blue)',
            desc: 'Отправлено поставщиками'
        },
        { 
            title: 'На складе', 
            count: stats?.in_warehouse || 0, 
            icon: ClipboardList, 
            color: '#f59e0b',
            desc: 'Ожидают замера веса'
        },
        { 
            title: 'Готовы к отправке', 
            count: stats?.ready_to_ship || 0, 
            icon: Truck, 
            color: '#10b981',
            desc: 'Доставка оплачена клиентом'
        },
        { 
            title: 'В пути в Ташкент', 
            count: stats?.in_transit || 0, 
            icon: ArrowRight, 
            color: 'var(--accent-blue)',
            desc: 'Транспортировка'
        }
    ];

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '40px' }}>
                <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>
                    Добро пожаловать, <span style={{ color: 'var(--accent-blue)' }}>{user?.name}</span>
                </h2>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
                    Обзор текущих логистических процессов
                </p>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '25px', marginBottom: '40px' }}>
                {cards.map((card, i) => (
                    <div key={i} className="glass-card" style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-10px', right: '-10px', opacity: 0.05 }}>
                            <card.icon size={100} color={card.color} />
                        </div>
                        <div style={{ 
                            width: '50px', 
                            height: '50px', 
                            borderRadius: '12px', 
                            background: `${card.color}15`, 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: card.color
                        }}>
                            <card.icon size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-dim)', marginBottom: '5px' }}>{card.title}</div>
                            <div style={{ fontSize: '2rem', fontWeight: 800 }}>{card.count}</div>
                        </div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{card.desc}</div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                <div className="glass-card" style={{ padding: '30px' }}>
                    <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertCircle size={20} color="#f59e0b" /> Требует внимания
                    </h3>
                    {stats?.waiting_payment > 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f59e0b' }}>{stats.waiting_payment}</div>
                            <div style={{ fontSize: '0.95rem', opacity: 0.8 }}>Заказов ожидают оплаты доставки от клиентов.</div>
                        </div>
                    ) : (
                        <p style={{ opacity: 0.5 }}>Все заказы обработаны или оплачены.</p>
                    )}
                </div>

                <div className="glass-card" style={{ padding: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                        <CheckCircle2 size={32} />
                    </div>
                    <div>
                        <h3 style={{ marginBottom: '5px' }}>Склад работает в штатном режиме</h3>
                        <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>Все системы логистики активны</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

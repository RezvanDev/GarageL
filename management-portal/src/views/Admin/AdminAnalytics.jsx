import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { TrendingUp, Users, DollarSign, ShoppingBag, Loader2, Search } from 'lucide-react';

export const AdminAnalytics = () => {
    const [analyticsData, setAnalyticsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('suppliers'); // suppliers, orders
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        setLoading(true);
        try {
            const res = await api.orders.getAdminAnalytics();
            if (res.status === 'success') {
                setAnalyticsData(res.data);
            }
        } catch (err) {
            console.error('Failed to fetch analytics:', err);
            alert('Ошибка при загрузке аналитики: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '100px' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    const { summaryBySupplier = [], detailedOrders = [] } = analyticsData || {};

    // Calculate totals
    const totalSalesUzs = summaryBySupplier.reduce((acc, item) => acc + parseFloat(item.total_client_uzs || 0), 0);
    const totalPayoutsCny = summaryBySupplier.reduce((acc, item) => acc + parseFloat(item.total_supplier_cny || 0), 0);
    const totalOrdersCount = detailedOrders.length;
    const totalSuppliersCount = summaryBySupplier.length;

    // Filter suppliers/orders based on search
    const filteredSuppliers = summaryBySupplier.filter(s => 
        s.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.supplier_phone && s.supplier_phone.includes(searchTerm))
    );

    const filteredOrders = detailedOrders.filter(o => 
        o.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.car_info.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.supplier_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(o.id).includes(searchTerm)
    );

    const formatStatus = (status) => {
        switch (status) {
            case 'paid_product': return 'Оплачен клиентом';
            case 'shipped_by_seller': return 'Отправлен продавцом';
            case 'logistics_review': return 'На замере логиста';
            case 'waiting_delivery_payment': return 'Ожидает оплаты доставки';
            case 'delivery_paid': return 'Доставка оплачена';
            case 'shipped_to_uzbekistan': return 'В пути в Ташкент';
            case 'delivered': return 'Доставлен';
            default: return status;
        }
    };

    return (
        <div className="fade-in" style={{ paddingBottom: '40px' }}>
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Финансовая аналитика</h2>
                <p style={{ color: 'var(--text-dim)' }}>Учет продаж, баланс выплат продавцам и детализация по заказам</p>
            </header>

            {/* Financial Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(0, 255, 136, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        <TrendingUp size={28} color="#00ff88" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Общий оборот продаж</div>
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#00ff88' }}>
                            {totalSalesUzs.toLocaleString()} UZS
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(14, 165, 233, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        <DollarSign size={28} color="var(--accent-blue)" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>К выплате продавцам</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                            ¥{totalPayoutsCny.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(167, 139, 250, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        <ShoppingBag size={28} color="#a78bfa" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Оплаченных заказов</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>
                            {totalOrdersCount} шт
                        </div>
                    </div>
                </div>

                <div className="glass-card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '12px', borderRadius: '12px' }}>
                        <Users size={28} color="#f59e0b" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Активных поставщиков</div>
                        <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>
                            {totalSuppliersCount}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation and Search */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '20px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => { setActiveTab('suppliers'); setSearchTerm(''); }}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none',
                            background: activeTab === 'suppliers' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                            color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Сводка по продавцам
                    </button>
                    <button
                        onClick={() => { setActiveTab('orders'); setSearchTerm(''); }}
                        style={{
                            padding: '10px 20px', borderRadius: '10px', border: 'none',
                            background: activeTab === 'orders' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                            color: '#fff', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s'
                        }}
                    >
                        Детализация заказов
                    </button>
                </div>

                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '280px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', color: 'var(--text-dim)' }} />
                    <input
                        type="text"
                        placeholder="Поиск..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 15px 10px 45px',
                            background: 'var(--glass-bg)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '10px',
                            color: '#fff',
                            outline: 'none'
                        }}
                    />
                </div>
            </div>

            {/* Tables Area */}
            <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                {activeTab === 'suppliers' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th style={{ padding: '16px', textAlign: 'left' }}>Поставщик / Контакт</th>
                                <th style={{ padding: '16px', textAlign: 'center' }}>Кол-во продаж</th>
                                <th style={{ padding: '16px', textAlign: 'right' }}>Получено от клиентов (UZS)</th>
                                <th style={{ padding: '16px', textAlign: 'right', color: 'var(--accent-blue)' }}>Нужно отправить поставщику (CNY)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.length > 0 ? (
                                filteredSuppliers.map(supplier => (
                                    <tr key={supplier.supplier_id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '16px' }}>
                                            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{supplier.supplier_name}</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{supplier.supplier_phone}</div>
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'center', fontWeight: 600 }}>
                                            {supplier.total_orders}
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700 }}>
                                            {parseFloat(supplier.total_client_uzs).toLocaleString()} UZS
                                        </td>
                                        <td style={{ padding: '16px', textAlign: 'right', fontWeight: 800, color: 'var(--accent-blue)', fontSize: '1.05rem' }}>
                                            ¥{parseFloat(supplier.total_supplier_cny).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        Поставщики не найдены
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>ID Заказа</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Деталь / Авто</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Клиент</th>
                                    <th style={{ padding: '16px', textAlign: 'left' }}>Продавец</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Цена поставщика (CNY)</th>
                                    <th style={{ padding: '16px', textAlign: 'right' }}>Цена продажи (UZS)</th>
                                    <th style={{ padding: '16px', textAlign: 'center' }}>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.length > 0 ? (
                                    filteredOrders.map(order => (
                                        <tr key={order.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                                #{order.id}
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 700 }}>{order.item_name}</div>
                                                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>{order.car_info} {order.quantity > 1 && `(x${order.quantity} шт)`}</div>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: 600 }}>{order.client_name}</div>
                                                <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', opacity: 0.7 }}>
                                                    {order.client_code}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px', fontWeight: 600 }}>
                                                {order.supplier_name}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-blue)' }}>
                                                ¥{(parseFloat(order.supplier_price_cny || order.client_price_uzs) * order.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'right', fontWeight: 700, color: '#00ff88' }}>
                                                {(parseFloat(order.client_price_uzs) * order.quantity).toLocaleString()} UZS
                                            </td>
                                            <td style={{ padding: '16px', textAlign: 'center' }}>
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '4px 10px',
                                                    borderRadius: '20px',
                                                    background: order.status === 'delivered' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                                                    color: order.status === 'delivered' ? '#00ff88' : '#f59e0b',
                                                    fontWeight: 600
                                                }}>
                                                    {formatStatus(order.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                            Заказы не найдены
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

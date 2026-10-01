import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { 
    CreditCard, 
    CheckCircle2, 
    Loader2, 
    DollarSign, 
    Truck, 
    Clock, 
    Search, 
    Filter, 
    Check, 
    X, 
    AlertCircle, 
    RefreshCw, 
    Package, 
    Calendar,
    Plane,
    TrendingUp,
    ShieldCheck
} from 'lucide-react';

const STATUS_CONFIG = {
    'offer_selected': {
        label: 'Ожидает оплаты товара',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: Clock
    },
    'waiting_payment': {
        label: 'Ожидает оплаты',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.12)',
        border: 'rgba(245, 158, 11, 0.3)',
        icon: Clock
    },
    'paid_product': {
        label: 'Товар оплачен',
        color: '#10b981',
        bg: 'rgba(16, 185, 129, 0.12)',
        border: 'rgba(16, 185, 129, 0.3)',
        icon: CheckCircle2
    },
    'shipped_by_seller': {
        label: 'Отправлен продавцом',
        color: '#38bdf8',
        bg: 'rgba(56, 189, 248, 0.12)',
        border: 'rgba(56, 189, 248, 0.3)',
        icon: Truck
    },
    'logistics_review': {
        label: 'На замере логиста',
        color: '#a78bfa',
        bg: 'rgba(167, 139, 250, 0.12)',
        border: 'rgba(167, 139, 250, 0.3)',
        icon: Clock
    },
    'arrived_warehouse': {
        label: 'Прибыл на склад',
        color: '#6366f1',
        bg: 'rgba(99, 102, 241, 0.12)',
        border: 'rgba(99, 102, 241, 0.3)',
        icon: Package
    },
    'waiting_delivery_payment': {
        label: 'Ожидает оплаты доставки',
        color: '#f97316',
        bg: 'rgba(249, 115, 22, 0.12)',
        border: 'rgba(249, 115, 22, 0.3)',
        icon: Clock
    },
    'delivery_paid': {
        label: 'Доставка оплачена',
        color: '#0ea5e9',
        bg: 'rgba(14, 165, 233, 0.12)',
        border: 'rgba(14, 165, 233, 0.3)',
        icon: ShieldCheck
    },
    'shipped_to_uzbekistan': {
        label: 'В пути в Ташкент',
        color: '#8b5cf6',
        bg: 'rgba(139, 92, 246, 0.12)',
        border: 'rgba(139, 92, 246, 0.3)',
        icon: Plane
    },
    'delivered': {
        label: 'Доставлен клиенту',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: 'rgba(34, 197, 94, 0.35)',
        icon: CheckCircle2
    },
    'cancelled': {
        label: 'Отменен',
        color: '#ef4444',
        bg: 'rgba(239, 68, 68, 0.12)',
        border: 'rgba(239, 68, 68, 0.3)',
        icon: X
    }
};

const getStatusBadge = (status) => {
    const config = STATUS_CONFIG[status] || {
        label: status || '—',
        color: 'var(--text-dim)',
        bg: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.1)',
        icon: AlertCircle
    };
    const Icon = config.icon;
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            background: config.bg,
            color: config.color,
            border: `1px solid ${config.border}`,
            whiteSpace: 'nowrap'
        }}>
            <Icon size={13} />
            {config.label}
        </span>
    );
};

export const AdminPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'product', 'delivery', 'history'
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');

    // Confirm Modal state
    const [confirmModal, setConfirmModal] = useState(null); // { order, type: 'product' | 'delivery' }
    const [submitting, setSubmitting] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const showToast = (msg) => {
        setToastMessage(msg);
        setTimeout(() => setToastMessage(null), 4000);
    };

    const fetchOrders = async (isManualRefresh = false) => {
        if (isManualRefresh) setRefreshing(true);
        try {
            const allStatuses = 'offer_selected,waiting_delivery_payment,waiting_payment,cancelled,paid_product,delivery_paid,shipped_to_uzbekistan,delivered,arrived_warehouse,shipped_by_seller,logistics_review';
            const res = await api.orders.getByStatus(allStatuses);
            setOrders(res?.data?.orders || []);
        } catch (err) {
            console.error('Ошибка загрузки заказов:', err);
        } finally {
            setLoading(false);
            if (isManualRefresh) setRefreshing(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (!confirmModal) return;
        const { order, type } = confirmModal;
        setSubmitting(true);
        try {
            if (type === 'product') {
                await api.orders.confirmProductPayment(order.id);
                showToast(`✅ Оплата за товар заказа #${order.id} успешно подтверждена!`);
            } else {
                await api.orders.confirmDeliveryPayment(order.id);
                showToast(`✅ Оплата доставки заказа #${order.id} успешно подтверждена!`);
            }
            setConfirmModal(null);
            fetchOrders();
        } catch (err) {
            alert(err.message || 'Ошибка при подтверждении оплаты');
        } finally {
            setSubmitting(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleString('ru-RU', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    // Filtered lists
    const productPayments = useMemo(() => {
        return orders.filter(o => o.status === 'offer_selected' || (o.status === 'waiting_payment' && !o.shipping_price));
    }, [orders]);

    const deliveryPayments = useMemo(() => {
        return orders.filter(o => o.status === 'waiting_delivery_payment' || (o.status === 'waiting_payment' && o.shipping_price));
    }, [orders]);

    const paymentHistory = useMemo(() => {
        return orders.filter(o => ['paid_product', 'delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(o.status));
    }, [orders]);

    // Financial KPI Totals
    const stats = useMemo(() => {
        const totalPaidProducts = paymentHistory.reduce((acc, o) => acc + parseFloat(o.price || 0), 0);
        const totalPaidDelivery = paymentHistory
            .filter(o => ['delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(o.status))
            .reduce((acc, o) => acc + parseFloat(o.shipping_price || 0), 0);
        const pendingProductSum = productPayments.reduce((acc, o) => acc + parseFloat(o.price || 0), 0);
        const pendingDeliverySum = deliveryPayments.reduce((acc, o) => acc + parseFloat(o.shipping_price || 0), 0);

        return {
            totalPaidProducts,
            totalPaidDelivery,
            pendingProductSum,
            pendingDeliverySum
        };
    }, [paymentHistory, productPayments, deliveryPayments]);

    // Filtered payment history based on search & status
    const filteredHistory = useMemo(() => {
        return paymentHistory.filter(order => {
            const matchesSearch = 
                !searchQuery ||
                String(order.id).includes(searchQuery) ||
                (order.user_code && order.user_code.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.item_name && order.item_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (order.car_info && order.car_info.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesStatus = selectedStatusFilter === 'all' || order.status === selectedStatusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [paymentHistory, searchQuery, selectedStatusFilter]);

    if (loading) {
        return (
            <div style={{ padding: '80px', textAlign: 'center' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" style={{ margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>Загрузка платежей и истории...</p>
            </div>
        );
    }

    return (
        <div className="fade-in" style={{ paddingBottom: '60px' }}>
            {/* Toast Notification */}
            {toastMessage && (
                <div style={{
                    position: 'fixed',
                    top: '24px',
                    right: '24px',
                    background: 'rgba(16, 185, 129, 0.95)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                    padding: '14px 22px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease-out'
                }}>
                    <span>{toastMessage}</span>
                </div>
            )}

            {/* Header */}
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start', 
                marginBottom: '28px',
                flexWrap: 'wrap',
                gap: '16px'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.9rem', fontWeight: 800, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <CreditCard size={28} color="var(--accent-blue)" />
                        Контроль и история платежей
                    </h2>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem' }}>
                        Ручное подтверждение оплат за товары и доставку, финансовый контроль и полная история
                    </p>
                </div>
                <button
                    onClick={() => fetchOrders(true)}
                    disabled={refreshing}
                    className="btn-secondary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        fontSize: '0.9rem',
                        cursor: refreshing ? 'not-allowed' : 'pointer'
                    }}
                >
                    <RefreshCw size={16} className={refreshing ? 'spinner' : ''} />
                    {refreshing ? 'Обновление...' : 'Обновить данные'}
                </button>
            </div>

            {/* KPI Financial Metric Cards */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
                gap: '18px', 
                marginBottom: '32px' 
            }}>
                {/* 1. Товар оплачен */}
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Оплачено за товары</span>
                        <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
                            <DollarSign size={18} color="#10b981" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#10b981', marginBottom: '4px' }}>
                        {stats.totalPaidProducts.toLocaleString()} UZS
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Успешных заказов: <strong style={{ color: 'var(--text-main)' }}>{paymentHistory.length}</strong>
                    </div>
                </div>

                {/* 2. Доставка оплачена */}
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid var(--accent-blue)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Оплачено за доставку</span>
                        <div style={{ background: 'rgba(14, 165, 233, 0.15)', padding: '8px', borderRadius: '10px' }}>
                            <Truck size={18} color="var(--accent-blue)" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--accent-blue)', marginBottom: '4px' }}>
                        {stats.totalPaidDelivery.toLocaleString()} UZS
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        Оплаченных доставок: <strong style={{ color: 'var(--text-main)' }}>
                            {paymentHistory.filter(o => ['delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(o.status)).length}
                        </strong>
                    </div>
                </div>

                {/* 3. Ожидает оплаты за товар */}
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Ожидают оплаты товара</span>
                        <div style={{ background: 'rgba(245, 158, 11, 0.15)', padding: '8px', borderRadius: '10px' }}>
                            <Clock size={18} color="#f59e0b" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f59e0b', marginBottom: '4px' }}>
                        {productPayments.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dim)' }}>заказов</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        На сумму: <strong style={{ color: 'var(--text-main)' }}>{stats.pendingProductSum.toLocaleString()} UZS</strong>
                    </div>
                </div>

                {/* 4. Ожидает оплаты за доставку */}
                <div className="glass-card" style={{ padding: '20px', borderLeft: '4px solid #f97316' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Ожидают оплаты доставки</span>
                        <div style={{ background: 'rgba(249, 115, 22, 0.15)', padding: '8px', borderRadius: '10px' }}>
                            <Clock size={18} color="#f97316" />
                        </div>
                    </div>
                    <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#f97316', marginBottom: '4px' }}>
                        {deliveryPayments.length} <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-dim)' }}>заказов</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                        На сумму: <strong style={{ color: 'var(--text-main)' }}>{stats.pendingDeliverySum.toLocaleString()} UZS</strong>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div style={{ 
                display: 'flex', 
                gap: '10px', 
                marginBottom: '32px', 
                borderBottom: '1px solid var(--glass-border)',
                paddingBottom: '12px',
                overflowX: 'auto'
            }}>
                <button
                    onClick={() => setActiveTab('all')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: activeTab === 'all' ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                        color: activeTab === 'all' ? 'var(--accent-blue)' : 'var(--text-dim)',
                        border: activeTab === 'all' ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    Все разделы
                </button>

                <button
                    onClick={() => setActiveTab('product')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: activeTab === 'product' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        color: activeTab === 'product' ? '#10b981' : 'var(--text-dim)',
                        border: activeTab === 'product' ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid transparent',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <DollarSign size={16} />
                    Оплата за товар
                    {productPayments.length > 0 && (
                        <span style={{
                            background: '#10b981',
                            color: '#000',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 800
                        }}>
                            {productPayments.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('delivery')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: activeTab === 'delivery' ? 'rgba(14, 165, 233, 0.15)' : 'transparent',
                        color: activeTab === 'delivery' ? 'var(--accent-blue)' : 'var(--text-dim)',
                        border: activeTab === 'delivery' ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Truck size={16} />
                    Оплата за доставку
                    {deliveryPayments.length > 0 && (
                        <span style={{
                            background: 'var(--accent-blue)',
                            color: '#000',
                            fontSize: '0.75rem',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontWeight: 800
                        }}>
                            {deliveryPayments.length}
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('history')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '10px',
                        background: activeTab === 'history' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                        color: activeTab === 'history' ? '#fff' : 'var(--text-dim)',
                        border: activeTab === 'history' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid transparent',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <CheckCircle2 size={16} />
                    История оплат
                    <span style={{
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'var(--text-dim)',
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontWeight: 700
                    }}>
                        {paymentHistory.length}
                    </span>
                </button>
            </div>

            {/* SECTION 1: Оплата за ТОВАР */}
            {(activeTab === 'all' || activeTab === 'product') && (
                <section style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981' }} />
                            Ожидают подтверждения оплаты за ТОВАР
                            <span style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(16, 185, 129, 0.15)', 
                                color: '#10b981', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontWeight: 700 
                            }}>
                                {productPayments.length}
                            </span>
                        </h3>
                    </div>

                    {productPayments.length === 0 ? (
                        <div className="glass-card" style={{ padding: '36px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                            <ShieldCheck size={36} color="#10b981" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Все платежи за товар подтверждены</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>В данный момент нет ожидающих оплаты товаров</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                            {productPayments.map(order => (
                                <div 
                                    key={order.id} 
                                    className="glass-card" 
                                    style={{ 
                                        padding: '22px', 
                                        border: '1px solid rgba(16, 185, 129, 0.25)',
                                        background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.04) 0%, rgba(26, 28, 35, 0.7) 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '16px'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ 
                                                fontWeight: 800, 
                                                fontSize: '1rem', 
                                                color: 'var(--text-main)', 
                                                background: 'rgba(255,255,255,0.06)',
                                                padding: '4px 10px',
                                                borderRadius: '8px'
                                            }}>
                                                Заказ #{order.id}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: 700, 
                                                color: 'var(--accent-blue)', 
                                                background: 'rgba(14, 165, 233, 0.1)', 
                                                padding: '4px 10px', 
                                                borderRadius: '8px' 
                                            }}>
                                                Код: {order.user_code || '—'}
                                            </span>
                                        </div>

                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{order.item_name}</h4>
                                        {order.car_info && (
                                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '12px' }}>
                                                Авто: {order.car_info}
                                            </p>
                                        )}

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                            background: 'rgba(0,0,0,0.25)',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            marginTop: '10px'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>К оплате:</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>
                                                {parseFloat(order.price || 0).toLocaleString()} UZS
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-primary" 
                                        style={{ 
                                            width: '100%', 
                                            background: 'linear-gradient(135deg, #10b981, #059669)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            fontWeight: 700
                                        }} 
                                        onClick={() => setConfirmModal({ order, type: 'product' })}
                                    >
                                        <Check size={18} />
                                        Подтвердить оплату товара
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* SECTION 2: Оплата за ДОСТАВКУ */}
            {(activeTab === 'all' || activeTab === 'delivery') && (
                <section style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-blue)' }} />
                            Ожидают подтверждения оплаты за ДОСТАВКУ
                            <span style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(14, 165, 233, 0.15)', 
                                color: 'var(--accent-blue)', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontWeight: 700 
                            }}>
                                {deliveryPayments.length}
                            </span>
                        </h3>
                    </div>

                    {deliveryPayments.length === 0 ? (
                        <div className="glass-card" style={{ padding: '36px', textAlign: 'center', border: '1px dashed var(--glass-border)' }}>
                            <Truck size={36} color="var(--accent-blue)" style={{ margin: '0 auto 12px', opacity: 0.8 }} />
                            <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>Все платежи за доставку подтверждены</p>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>В данный момент нет ожидающих оплат доставки</p>
                        </div>
                    ) : (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                            {deliveryPayments.map(order => (
                                <div 
                                    key={order.id} 
                                    className="glass-card" 
                                    style={{ 
                                        padding: '22px', 
                                        border: '1px solid rgba(14, 165, 233, 0.25)',
                                        background: 'linear-gradient(180deg, rgba(14, 165, 233, 0.04) 0%, rgba(26, 28, 35, 0.7) 100%)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        gap: '16px'
                                    }}
                                >
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <span style={{ 
                                                fontWeight: 800, 
                                                fontSize: '1rem', 
                                                color: 'var(--text-main)', 
                                                background: 'rgba(255,255,255,0.06)',
                                                padding: '4px 10px',
                                                borderRadius: '8px'
                                            }}>
                                                Заказ #{order.id}
                                            </span>
                                            <span style={{ 
                                                fontSize: '0.8rem', 
                                                fontWeight: 700, 
                                                color: 'var(--accent-blue)', 
                                                background: 'rgba(14, 165, 233, 0.1)', 
                                                padding: '4px 10px', 
                                                borderRadius: '8px' 
                                            }}>
                                                Код: {order.user_code || '—'}
                                            </span>
                                        </div>

                                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '6px' }}>{order.item_name}</h4>
                                        
                                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                            {order.delivery_method && (
                                                <span style={{
                                                    fontSize: '0.75rem',
                                                    padding: '3px 8px',
                                                    borderRadius: '6px',
                                                    background: 'rgba(255,255,255,0.05)',
                                                    color: 'var(--text-dim)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '4px'
                                                }}>
                                                    {order.delivery_method === 'air' ? <Plane size={12} /> : <Truck size={12} />}
                                                    {order.delivery_method === 'air' ? 'Авиа' : 'Авто'}
                                                </span>
                                            )}
                                            {order.weight && (
                                                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                                                    Вес: {order.weight} кг
                                                </span>
                                            )}
                                            {order.dimensions && (
                                                <span style={{ fontSize: '0.75rem', padding: '3px 8px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-dim)' }}>
                                                    {order.dimensions}
                                                </span>
                                            )}
                                        </div>

                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'baseline',
                                            background: 'rgba(0,0,0,0.25)',
                                            padding: '12px 14px',
                                            borderRadius: '10px',
                                            marginTop: '10px'
                                        }}>
                                            <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Стоимость доставки:</span>
                                            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                                                {parseFloat(order.shipping_price || 0).toLocaleString()} UZS
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        className="btn-primary" 
                                        style={{ 
                                            width: '100%', 
                                            background: 'linear-gradient(135deg, var(--accent-blue), #0284c7)',
                                            color: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            padding: '12px',
                                            fontWeight: 700
                                        }} 
                                        onClick={() => setConfirmModal({ order, type: 'delivery' })}
                                    >
                                        <Truck size={18} />
                                        Подтвердить оплату доставки
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            )}

            {/* SECTION 3: ИСТОРИЯ ОПЛАТ */}
            {(activeTab === 'all' || activeTab === 'history') && (
                <section>
                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        marginBottom: '20px',
                        flexWrap: 'wrap',
                        gap: '16px'
                    }}>
                        <h3 style={{ fontSize: '1.3rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <CheckCircle2 color="var(--accent-blue)" size={22} />
                            История оплат
                            <span style={{ 
                                fontSize: '0.8rem', 
                                background: 'rgba(255, 255, 255, 0.08)', 
                                color: 'var(--text-dim)', 
                                padding: '2px 8px', 
                                borderRadius: '12px',
                                fontWeight: 600 
                            }}>
                                Всего: {paymentHistory.length}
                            </span>
                        </h3>

                        {/* Search & Filter Controls */}
                        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <div style={{ position: 'relative', minWidth: '240px' }}>
                                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                                <input
                                    type="text"
                                    placeholder="Поиск по ID, клиенту, детали..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        padding: '9px 12px 9px 36px',
                                        fontSize: '0.85rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                />
                            </div>

                            <div style={{ minWidth: '190px' }}>
                                <select
                                    value={selectedStatusFilter}
                                    onChange={(e) => setSelectedStatusFilter(e.target.value)}
                                    style={{
                                        padding: '9px 14px',
                                        fontSize: '0.85rem',
                                        background: 'rgba(255,255,255,0.04)',
                                        borderRadius: '10px',
                                        border: '1px solid var(--glass-border)'
                                    }}
                                >
                                    <option value="all">Все статусы</option>
                                    <option value="paid_product">Товар оплачен</option>
                                    <option value="delivery_paid">Доставка оплачена</option>
                                    <option value="shipped_to_uzbekistan">В пути в Ташкент</option>
                                    <option value="delivered">Доставлен клиенту</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--glass-border)' }}>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Дата</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Заказ / Клиент</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Деталь</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Оплата товара</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Оплата доставки</th>
                                        <th style={{ padding: '14px 18px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Статус заказа</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                                {searchQuery || selectedStatusFilter !== 'all' 
                                                    ? 'Ничего не найдено по заданным параметрам поиска'
                                                    : 'История оплат пока пуста'}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredHistory.map(order => (
                                            <tr 
                                                key={order.id} 
                                                style={{ 
                                                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                                                    transition: 'background 0.2s ease'
                                                }}
                                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                            >
                                                {/* 1. Дата */}
                                                <td style={{ padding: '14px 18px', fontSize: '0.82rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
                                                    {formatDate(order.updated_at || order.created_at)}
                                                </td>

                                                {/* 2. Заказ / Клиент */}
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                                                        #{order.id}
                                                    </div>
                                                    <div style={{ 
                                                        display: 'inline-block',
                                                        fontSize: '0.75rem', 
                                                        color: 'var(--accent-blue)', 
                                                        fontWeight: 700,
                                                        background: 'rgba(14, 165, 233, 0.08)',
                                                        padding: '1px 6px',
                                                        borderRadius: '4px',
                                                        marginTop: '3px'
                                                    }}>
                                                        {order.user_code || '—'}
                                                    </div>
                                                </td>

                                                {/* 3. Деталь */}
                                                <td style={{ padding: '14px 18px', maxWidth: '280px' }}>
                                                    <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {order.item_name}
                                                    </div>
                                                    {order.car_info && (
                                                        <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                                                            {order.car_info}
                                                        </div>
                                                    )}
                                                </td>

                                                {/* 4. Оплата товара */}
                                                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                    <div style={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                                                        {parseFloat(order.price || 0).toLocaleString()} UZS
                                                    </div>
                                                    <span style={{ fontSize: '0.7rem', color: '#10b981', opacity: 0.8 }}>
                                                        Товар оплачен
                                                    </span>
                                                </td>

                                                {/* 5. Оплата доставки */}
                                                <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                                                    {order.shipping_price ? (
                                                        <>
                                                            <div style={{ 
                                                                fontWeight: 800, 
                                                                color: ['delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(order.status) 
                                                                    ? 'var(--accent-blue)' 
                                                                    : 'var(--text-dim)',
                                                                fontSize: '0.95rem' 
                                                            }}>
                                                                {parseFloat(order.shipping_price).toLocaleString()} UZS
                                                            </div>
                                                            <span style={{ 
                                                                fontSize: '0.7rem', 
                                                                color: ['delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(order.status) ? 'var(--accent-blue)' : 'var(--text-dim)', 
                                                                opacity: 0.8 
                                                            }}>
                                                                {['delivery_paid', 'shipped_to_uzbekistan', 'delivered'].includes(order.status) ? 'Доставка оплачена' : 'Ожидает оплаты'}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-dim)', opacity: 0.4 }}>—</span>
                                                    )}
                                                </td>

                                                {/* 6. Статус заказа на русском */}
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    {getStatusBadge(order.status)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </section>
            )}

            {/* Custom Payment Confirmation Modal */}
            {confirmModal && (
                <div className="modal-overlay" style={{ zIndex: 1500 }}>
                    <div className="modal-content" style={{ maxWidth: '480px', padding: '28px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <ShieldCheck size={22} color={confirmModal.type === 'product' ? '#10b981' : 'var(--accent-blue)'} />
                                Подтверждение оплаты {confirmModal.type === 'product' ? 'товара' : 'доставки'}
                            </h3>
                            <button 
                                onClick={() => !submitting && setConfirmModal(null)}
                                style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ 
                            background: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--glass-border)', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            marginBottom: '20px' 
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Заказ:</span>
                                <strong style={{ color: 'var(--text-main)' }}>#{confirmModal.order.id}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Клиент:</span>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                                    {confirmModal.order.user_code || confirmModal.order.client_name || '—'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Деталь:</span>
                                <span style={{ color: 'var(--text-main)', fontWeight: 600, maxWidth: '240px', textAlign: 'right' }}>
                                    {confirmModal.order.item_name}
                                </span>
                            </div>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                borderTop: '1px solid rgba(255,255,255,0.06)', 
                                paddingTop: '10px',
                                marginTop: '10px' 
                            }}>
                                <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem', fontWeight: 600 }}>Сумма к зачислению:</span>
                                <span style={{ 
                                    fontSize: '1.25rem', 
                                    fontWeight: 800, 
                                    color: confirmModal.type === 'product' ? '#10b981' : 'var(--accent-blue)' 
                                }}>
                                    {confirmModal.type === 'product' 
                                        ? `${parseFloat(confirmModal.order.price || 0).toLocaleString()} UZS`
                                        : `${parseFloat(confirmModal.order.shipping_price || 0).toLocaleString()} UZS`}
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)', marginBottom: '24px', lineHeight: 1.5 }}>
                            ⚠️ Вы подтверждаете, что средства от клиента получены (наличными или переводом). Статус заказа будет переведен в следующий этап обработки.
                        </p>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button
                                className="btn-secondary"
                                onClick={() => setConfirmModal(null)}
                                disabled={submitting}
                                style={{ flex: 1, padding: '12px' }}
                            >
                                Отмена
                            </button>
                            <button
                                className="btn-primary"
                                onClick={handleConfirmPayment}
                                disabled={submitting}
                                style={{
                                    flex: 1.5,
                                    padding: '12px',
                                    background: confirmModal.type === 'product'
                                        ? 'linear-gradient(135deg, #10b981, #059669)'
                                        : 'linear-gradient(135deg, var(--accent-blue), #0284c7)',
                                    color: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 size={18} className="spinner" />
                                        Подтверждение...
                                    </>
                                ) : (
                                    <>
                                        <Check size={18} />
                                        Подтвердить оплату
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

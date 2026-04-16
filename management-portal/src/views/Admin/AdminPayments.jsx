import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CreditCard, CheckCircle2, Loader2, DollarSign } from 'lucide-react';

export const AdminPayments = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await api.orders.getByStatus('offer_selected,waiting_delivery_payment,paid_product,delivery_paid');
            setOrders(res.data.orders);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const confirmPayment = async (orderId, type) => {
        if (!window.confirm('Вы подтверждаете получение оплаты вручную?')) return;
        try {
            if (type === 'product') {
                await api.orders.confirmProductPayment(orderId);
            } else {
                await api.orders.confirmDeliveryPayment(orderId);
            }
            fetchOrders();
            alert('Оплата подтверждена!');
        } catch (err) {
            alert(err.message);
        }
    };

    if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spinner" /></div>;

    const productPayments = orders.filter(o => o.status === 'offer_selected');
    const deliveryPayments = orders.filter(o => o.status === 'waiting_delivery_payment');

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '24px', fontSize: '1.8rem', fontWeight: 800 }}>Контроль оплат</h2>
            
            <section style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <DollarSign color="#10b981" /> Оплата за ТОВАР
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {productPayments.length === 0 && <p style={{ opacity: 0.5 }}>Нет ожидающих оплат</p>}
                    {productPayments.map(order => (
                        <div key={order.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 700 }}>#{order.id} / {order.user_code}</span>
                                <span style={{ color: '#10b981', fontWeight: 700 }}>${order.price}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem', marginBottom: '15px' }}>{order.item_name}</p>
                            <button className="btn-primary" style={{ width: '100%', background: '#10b981' }} onClick={() => confirmPayment(order.id, 'product')}>
                                ПОДТВЕРДИТЬ ОПЛАТУ
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Truck color="var(--accent-blue)" /> Оплата за ДОСТАВКУ
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {deliveryPayments.length === 0 && <p style={{ opacity: 0.5 }}>Нет ожидающих оплат</p>}
                    {deliveryPayments.map(order => (
                        <div key={order.id} className="glass-card" style={{ padding: '20px', border: '1px solid var(--glass-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 700 }}>#{order.id} / {order.user_code}</span>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>${order.shipping_price}</span>
                            </div>
                            <p style={{ fontSize: '0.9rem' }}>{order.item_name}</p>
                            <p style={{ fontSize: '0.8rem', opacity: 0.5, marginBottom: '15px' }}>Вес: {order.weight}кг / {order.dimensions}</p>
                            <button className="btn-primary" style={{ width: '100%', background: 'var(--accent-blue)' }} onClick={() => confirmPayment(order.id, 'delivery')}>
                                ПОДТВЕРДИТЬ ОПЛАТУ ДОСТАВКИ
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

const Truck = ({ color }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path>
        <path d="M15 18H9"></path>
        <path d="M19 18h2a1 1 0 0 0 1-1v-5h-7v5a1 1 0 0 0 1 1h2"></path>
        <circle cx="7" cy="18" r="2"></circle>
        <circle cx="17" cy="18" r="2"></circle>
    </svg>
);

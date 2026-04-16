import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '../../components/common/UI';

const formatStatus = (s) => {
    const map = {
        'pending': 'На рассмотрении',
        'offer_created': 'Есть предложение',
        'offer_selected': 'Выбрано (ожидает оплаты)',
        'paid_product': 'Товар оплачен',
        'shipped_by_seller': 'В пути на склад',
        'waiting_delivery_payment': 'Прибыл на склад',
        'delivery_paid': 'Доставка оплачена',
        'shipped_to_uzbekistan': 'В пути в Ташкент',
        'delivered': 'Готов к выдаче'
    };
    return map[s] || s;
};

export const Orders = ({ orders, onSelectOrder, user }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Мои заказы</h2>
            <div style={{ background: 'rgba(14,165,233, 0.1)', color: '#0ea5e9', padding: '5px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 800 }}>
                ID: {user?.user_code}
            </div>
        </div>
        <div className="orders-container">
            {orders.length === 0 ? (
                <p style={{ textAlign: 'center', opacity: 0.5 }}>У вас пока нет заказов</p>
            ) : (
                orders.map((order, idx) => (
                    <motion.div
                        key={order.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                    >
                        <GlassCard
                            className="order-item"
                            onClick={() => onSelectOrder(order)}
                            style={{ padding: '18px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>Заказ #{order.id}</span>
                                <Badge status={order.status}>{order.status_text || formatStatus(order.status)}</Badge>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                                {order.item_name || 'Деталь'}
                            </div>

                            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                {order.car_info}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))
            )}
        </div>
    </motion.div>
);

import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard, Badge } from '../../components/common/UI';
import { SUPPLIER_CATEGORIES } from '../../data/constants';

const formatStatus = (s) => {
    const map = {
        'pending': 'На рассмотрении',
        'offer_created': 'Есть предложение',
        'offer_selected': 'Выбрано (ожидает оплаты)',
        'waiting_payment': 'Ожидает оплаты',
        'paid_product': 'Товар оплачен',
        'shipped_by_seller': 'В пути на склад',
        'waiting_delivery_payment': 'Прибыл на склад',
        'delivery_paid': 'Доставка оплачена',
        'shipped_to_uzbekistan': 'В пути в Ташкент',
        'delivered': 'Готов к выдаче',
        'cancelled': 'Отменен'
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: 700, color: 'var(--accent-blue)', fontSize: '0.9rem' }}>Заказ #{order.id}</span>
                                    <button 
                                        style={{ 
                                            background: 'rgba(255,255,255,0.05)', 
                                            border: '1px solid rgba(255,255,255,0.1)', 
                                            borderRadius: '6px', 
                                            color: 'var(--accent-blue)',
                                            width: '26px',
                                            height: '26px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer'
                                        }}
                                        title="Задать вопрос по заказу"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const supportUser = 'RezvanMax'; // Ваш юзернейм в Telegram
                                            let text = `Здравствуйте! У меня вопрос по заказу #${order.id}:\n`;
                                            if (order.item_name) text += `📦 ${order.item_name}\n`;
                                            text += `Статус: ${order.status_text || formatStatus(order.status)}\n`;
                                            window.open(`https://t.me/${supportUser}?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                    </button>
                                </div>
                                <Badge status={order.status}>{order.status_text || formatStatus(order.status)}</Badge>
                            </div>

                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '4px' }}>
                                {order.item_name || 'Деталь'}
                            </div>

                            <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                {order.car_info}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '4px', fontWeight: 600 }}>
                                {SUPPLIER_CATEGORIES[order.category] || order.category || 'Запчасти'}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))
            )}
        </div>
    </motion.div>
);

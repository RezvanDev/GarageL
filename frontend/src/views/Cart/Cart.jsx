import React from 'react';
import { motion } from 'framer-motion';
import { GlassCard } from '../../components/common/UI';

export const Cart = ({ cart }) => {
    const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '40px' }}>
            <h2>Корзина</h2>
            <GlassCard style={{ padding: '40px', marginTop: '20px' }}>
                {cart.length === 0 ? (
                    <p>Ваша корзина пуста</p>
                ) : (
                    <div>
                        {cart.map((item, i) => (
                            <div key={i} style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ textAlign: 'left' }}>
                                    <span style={{ display: 'block', fontWeight: 600 }}>{item.name}</span>
                                    {item.quantity > 1 && <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.quantity} шт. x ${item.price}</span>}
                                </div>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>
                                    ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                                </span>
                            </div>
                        ))}
                        <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem' }}>
                            <span>Итого:</span>
                            <span style={{ color: '#00ff88' }}>${total.toFixed(2)}</span>
                        </div>
                        <button className="btn-primary" style={{ marginTop: '20px', width: '100%' }}>Оформить заказ</button>
                    </div>
                )}
            </GlassCard>
        </motion.div>
    );
};

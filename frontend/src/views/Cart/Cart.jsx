import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { GlassCard } from '../../components/common/UI';
import { ImageCarousel } from '../../components/common/ImageCarousel';

export const Cart = ({ cart, removeFromCart, updateCartQuantity, checkoutCart, navigate }) => {
    const total = cart.reduce((acc, item) => acc + (parseFloat(item.price) * (item.quantity || 1)), 0);
    const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="cart-view"
            style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 10px' }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => navigate('catalog')}
                    style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '50%',
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--accent-blue)',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    <ArrowLeft size={20} />
                </button>
                <h2 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Корзина</h2>
            </div>

            {cart.length === 0 ? (
                <motion.div 
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    style={{ textAlign: 'center', padding: '60px 20px' }}
                >
                    <GlassCard style={{ padding: '50px 30px', maxWidth: '500px', margin: '0 auto' }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'rgba(0, 242, 254, 0.1)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            margin: '0 auto 20px',
                            boxShadow: '0 0 20px rgba(0, 242, 254, 0.2)'
                        }}>
                            <ShoppingBag size={40} color="var(--accent-blue)" />
                        </div>
                        <h3 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '10px' }}>Ваша корзина пуста</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '25px' }}>
                            Похоже, вы еще не добавили товары в корзину. Перейдите в каталог, чтобы найти необходимые автозапчасти.
                        </p>
                        <button 
                            className="btn-primary" 
                            onClick={() => navigate('catalog')}
                            style={{ padding: '12px 30px', fontSize: '0.85rem' }}
                        >
                            Перейти в каталог
                        </button>
                    </GlassCard>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }} className="cart-grid-layout">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <AnimatePresence mode="popLayout">
                            {cart.map((item) => (
                                <motion.div 
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 50, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <GlassCard style={{ padding: '15px', display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {/* Image */}
                                        <div style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            borderRadius: '12px', 
                                            overflow: 'hidden', 
                                            background: 'rgba(0,0,0,0.2)', 
                                            flexShrink: 0 
                                        }}>
                                            <ImageCarousel images={item.image_url} height="100%" />
                                        </div>

                                        {/* Details */}
                                        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ 
                                                    fontSize: '0.65rem', 
                                                    fontWeight: 800, 
                                                    background: 'rgba(0, 242, 254, 0.1)', 
                                                    color: 'var(--accent-blue)', 
                                                    padding: '2px 8px', 
                                                    borderRadius: '10px',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {item.brand}
                                                </span>
                                                <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{item.model}</span>
                                            </div>
                                            <h4 style={{ 
                                                fontSize: '0.95rem', 
                                                fontWeight: 700, 
                                                lineHeight: 1.3, 
                                                whiteSpace: 'nowrap', 
                                                overflow: 'hidden', 
                                                textOverflow: 'ellipsis',
                                                color: '#fff'
                                            }} title={item.name}>
                                                {item.name}
                                            </h4>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                                                Код: {String(item.id).padStart(4, '0')} | Арт: {item.code}
                                            </div>
                                        </div>

                                        {/* Quantity and Price section */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'space-between', width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '12px', marginTop: '5px' }} className="cart-item-actions">
                                            {/* Quantity Selector */}
                                            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)', width: '100px' }}>
                                                <button 
                                                    style={{ background: 'none', border: 'none', color: '#fff', flex: 1, height: '24px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => updateCartQuantity(item.id, (item.quantity || 1) - 1)}
                                                >
                                                    <Minus size={12} />
                                                </button>
                                                <span style={{ width: '30px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                                                    {item.quantity || 1}
                                                </span>
                                                <button 
                                                    style={{ background: 'none', border: 'none', color: '#fff', flex: 1, height: '24px', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                    onClick={() => updateCartQuantity(item.id, (item.quantity || 1) + 1)}
                                                >
                                                    <Plus size={12} />
                                                </button>
                                            </div>

                                            {/* Price */}
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent-blue)' }}>
                                                    ${(parseFloat(item.price) * (item.quantity || 1)).toFixed(2)}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                                                    ${parseFloat(item.price).toFixed(2)} / шт
                                                </div>
                                            </div>

                                            {/* Delete Button */}
                                            <button
                                                onClick={() => removeFromCart(item.id)}
                                                style={{
                                                    background: 'rgba(255, 77, 77, 0.1)',
                                                    border: '1px solid rgba(255, 77, 77, 0.2)',
                                                    borderRadius: '10px',
                                                    width: '36px',
                                                    height: '36px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#ff4d4d',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.2s'
                                                }}
                                                title="Удалить товар"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </GlassCard>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Summary Panel */}
                    <motion.div layout>
                        <GlassCard style={{ padding: '25px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '12px' }}>
                                Детали заказа
                            </h3>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                <span>Товары ({totalItems})</span>
                                <span>${total.toFixed(2)}</span>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text-dim)' }}>
                                <span>Доставка</span>
                                <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Рассчитывается позже</span>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                fontWeight: 800, 
                                fontSize: '1.25rem', 
                                borderTop: '1px solid rgba(255,255,255,0.05)', 
                                paddingTop: '15px',
                                marginTop: '10px'
                            }}>
                                <span>Итого к оплате:</span>
                                <span style={{ color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.2)' }}>
                                    ${total.toFixed(2)}
                                </span>
                            </div>

                            <button 
                                className="btn-primary" 
                                style={{ marginTop: '15px', width: '100%', padding: '16px', fontSize: '0.9rem' }}
                                onClick={checkoutCart}
                            >
                                Оформить заказ
                            </button>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </motion.div>
    );
};

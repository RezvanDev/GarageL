import React from 'react';
import { motion } from 'framer-motion';
import { Package, ClipboardList, ShoppingCart, PenTool, Bell, Crown } from 'lucide-react';
import { GlassCard } from '../../components/common/UI';
import { api } from '../../services/api';

export const Dashboard = ({ onNavigate, user }) => {
    const isTelegramConnected = !!user?.telegram_chat_id;

    return (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-container"
    >
        <div style={{ textAlign: 'center', marginBottom: '25px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '5px' }}>Добро пожаловать в <span className="accent-text">Tez Parts</span></h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', marginBottom: '15px' }}>Управляйте заказами и ищите запчасти</p>
            
            <button
                onClick={() => window.open('https://t.me/RezvanMax', '_blank')}
                style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    color: '#000',
                    border: 'none',
                    borderRadius: '20px',
                    padding: '8px 20px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3)',
                    transition: 'all 0.2s ease',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(245, 158, 11, 0.3)';
                }}
            >
                <Crown size={14} fill="#000" />
                Купить мастер аккаунт
            </button>
        </div>

        <div className="dashboard-grid">
            <GlassCard className="view-card" onClick={() => onNavigate('catalog')}>
                <Package size={48} color="var(--accent-blue)" />
                <h3>Каталог запчастей</h3>
                <p>Поиск и выбор деталей для вашего авто</p>
            </GlassCard>

            <GlassCard className="view-card" onClick={() => onNavigate('request')}>
                <PenTool size={48} color="var(--accent-blue)" />
                <h3>Заказать запчасти</h3>
                <p>Если не нашли нужную деталь в поиске</p>
            </GlassCard>

            <GlassCard className="view-card" onClick={() => onNavigate('orders')}>
                <ClipboardList size={48} color="var(--accent-blue)" />
                <h3>Мои заказы</h3>
                <p>История и статусы ваших запросов</p>
            </GlassCard>

            <GlassCard className="view-card" onClick={() => onNavigate('cart')}>
                <ShoppingCart size={48} color="var(--accent-blue)" />
                <h3>Корзина</h3>
                <p>Выбранные товары для оплаты</p>
            </GlassCard>

            {!isTelegramConnected && (
                <GlassCard 
                    className="view-card" 
                    style={{ background: 'rgba(0, 136, 204, 0.15)', borderColor: 'rgba(0, 136, 204, 0.3)' }}
                    onClick={async () => {
                        const tgData = window.Telegram?.WebApp?.initData;
                        
                        if (tgData) {
                            // If in Telegram Web App, sync instantly
                            try {
                                const res = await api.auth.syncTelegramWebApp(tgData);
                                if (res.status === 'success') {
                                    alert('Аккаунт успешно привязан!');
                                    window.location.reload(); // Refresh to update user state
                                }
                            } catch (err) {
                                console.error('WebApp Sync Error:', err);
                                alert('Ошибка при синхронизации. Попробуйте обновить страницу.');
                            }
                        } else {
                            // If in regular browser, use the link method
                            const newWindow = window.open('', '_blank');
                            try {
                                const res = await api.auth.getTelegramToken();
                                if (res.data?.link && newWindow) {
                                    newWindow.location.href = res.data.link;
                                } else if (newWindow) {
                                    newWindow.close();
                                }
                            } catch (err) {
                                if (newWindow) newWindow.close();
                                console.error('Telegram Link Error:', err);
                                alert('Ошибка при получении ссылки. Попробуйте позже.');
                            }
                        }
                    }}
                >
                    <Bell size={48} color="#0088cc" />
                    <h3>Уведомления в Telegram</h3>
                    <p>Получайте сообщения о новых офферах и статусах</p>
                </GlassCard>
            )}
        </div>
    </motion.div>
    );
};

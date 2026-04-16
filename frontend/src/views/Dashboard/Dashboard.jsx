import React from 'react';
import { motion } from 'framer-motion';
import { Package, ClipboardList, ShoppingCart, PenTool, Bell } from 'lucide-react';
import { GlassCard } from '../../components/common/UI';
import { api } from '../../services/api';

export const Dashboard = ({ onNavigate }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-container"
    >
        <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <h1 style={{ fontSize: '1.5rem' }}>Добро пожаловать в <span className="accent-text">Garage</span></h1>
            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>Управляйте заказами и ищите запчасти</p>
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

            <GlassCard 
                className="view-card" 
                style={{ background: 'rgba(0, 136, 204, 0.15)', borderColor: 'rgba(0, 136, 204, 0.3)' }}
                onClick={async () => {
                    try {
                        const res = await api.auth.getTelegramToken();
                        if (res.data?.link) {
                            window.open(res.data.link, '_blank');
                        }
                    } catch (err) {
                        alert('Ошибка при получении ссылки. Попробуйте позже.');
                    }
                }}
            >
                <Bell size={48} color="#0088cc" />
                <h3>Уведомления в Telegram</h3>
                <p>Получайте сообщения о новых офферах и статусах</p>
            </GlassCard>
        </div>
    </motion.div>
);

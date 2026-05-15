import React from 'react';
import { Bell, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';

export const SupplierDashboard = () => {
    const { user } = useAuth();
    const isTelegramConnected = !!user?.telegram_chat_id;

    const handleLinkTelegram = async () => {
        const tgData = window.Telegram?.WebApp?.initData;
        
        if (tgData) {
            try {
                const res = await api.auth.syncTelegramWebApp(tgData);
                if (res.status === 'success') {
                    alert('Аккаунт успешно привязан!');
                    window.location.reload();
                }
            } catch (err) {
                console.error('WebApp Sync Error:', err);
                alert('Ошибка при синхронизации: ' + err.message);
            }
        } else {
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
                alert('Ошибка при получении ссылки: ' + err.message);
            }
        }
    };

    return (
        <div className="fade-in">
            <h2 style={{ marginBottom: '32px', fontWeight: 800 }}>Кабинет Поставщика / 供应商面板</h2>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass-card" style={{ padding: '30px' }}>
                    <Zap size={32} color="var(--accent-blue)" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>Быстрый старт / 快速开始</h3>
                    <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
                        В разделе "Заявки клиентов" вы можете видеть актуальные запросы на запчасти. 
                        Предлагайте свои варианты цен и условий, чтобы получить заказ.
                        <br /><br />
                        在“客户订单”部分，您可以查看当前的配件请求。提供您的价格和条款建议以获取订单。
                    </p>
                </div>

                <div className="glass-card" style={{ padding: '30px' }}>
                    <ShieldCheck size={32} color="#10b981" style={{ marginBottom: '16px' }} />
                    <h3 style={{ marginBottom: '12px' }}>Ваши бренды / 您的品牌</h3>
                    <p style={{ color: 'var(--text-dim)', lineHeight: 1.6 }}>
                        Вы будете получать уведомления только по брендам, которые закреплены за вашим аккаунтом:
                        <br />您将仅收到与您的账户关联nd品牌的通知：
                        <br /><br />
                        <strong style={{ color: '#fff', fontSize: '1.1rem' }}>
                            {user?.allowed_brands?.length > 0 ? user.allowed_brands.join(', ') : 'Все бренды / 所有品牌'}
                        </strong>
                    </p>
                </div>

                {!isTelegramConnected ? (
                    <div className="glass-card" style={{ 
                        padding: '30px', 
                        background: 'linear-gradient(135deg, rgba(0, 136, 204, 0.15) 0%, rgba(0, 136, 204, 0.05) 100%)',
                        borderColor: 'rgba(0, 136, 204, 0.3)',
                        cursor: 'pointer'
                    }} onClick={handleLinkTelegram}>
                        <Bell size={32} color="#0088cc" style={{ marginBottom: '16px' }} />
                        <h3 style={{ marginBottom: '12px' }}>Уведомления в Telegram / Telegram 通知</h3>
                        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginBottom: '20px' }}>
                            Подключите Telegram, чтобы мгновенно узнавать о новых заявках и статусах ваших заказов.
                            <br />连接 Telegram，即时了解新请求和订单状态。
                        </p>
                        <button className="btn-primary" style={{ background: '#0088cc', width: '100%' }}>
                            Привязать Telegram / 绑定 Telegram
                        </button>
                    </div>
                ) : (
                    <div className="glass-card" style={{ padding: '30px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#10b981' }}>
                            <Bell size={24} />
                            <h3 style={{ margin: 0 }}>Уведомления активны / 通知已激活</h3>
                        </div>
                        <p style={{ color: 'var(--text-dim)', lineHeight: 1.6, marginTop: '16px' }}>
                            Вы успешно привязали Telegram. Все уведомления о новых запросах будут приходить в бот.
                            <br />您已成功绑定 Telegram。所有新请求通知都将发送到机器人。
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

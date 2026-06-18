import React, { useState, useEffect } from 'react';
import { api, BASE_IMAGE_URL } from '../../services/api';
import { CheckCircle2, XCircle, Loader2, Edit3, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderModeration = () => {
    const [activeTab, setActiveTab] = useState('offers'); // offers, logistics
    const [offers, setOffers] = useState([]);
    const [logisticsOrders, setLogisticsOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);
    const [approvingLogistics, setApprovingLogistics] = useState(null);
    const [finalPrice, setFinalPrice] = useState('');
    const [itemName, setItemName] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [finalShippingPrice, setFinalShippingPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPendingOffers();
        fetchLogisticsReview();
    }, []);

    const fetchPendingOffers = async () => {
        try {
            const res = await api.orders.getPendingOffers();
            setOffers(res?.data?.offers || []);
        } catch (err) {
            console.error('Failed to fetch pending offers:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLogisticsReview = async () => {
        try {
            const res = await api.orders.getByStatus('logistics_review');
            setLogisticsOrders(res?.data?.orders || []);
        } catch (err) {
            console.error('Failed to fetch logistics review:', err);
        }
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        if (!finalPrice) return;

        setSubmitting(true);
        try {
            await api.orders.approveOffer(approving.id, {
                finalPrice: parseFloat(finalPrice),
                itemName,
                deliveryTime
            });
            setApproving(null);
            setFinalPrice('');
            setItemName('');
            setDeliveryTime('');
            fetchPendingOffers();
            alert('Предложение одобрено и отправлено клиенту!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleApproveLogistics = async (e) => {
        e.preventDefault();
        if (!finalShippingPrice) return;

        setSubmitting(true);
        try {
            await api.orders.approveLogistics({
                orderId: approvingLogistics.id,
                finalShippingPrice: parseFloat(finalShippingPrice)
            });
            setApprovingLogistics(null);
            setFinalShippingPrice('');
            fetchLogisticsReview();
            alert('Стоимость доставки одобрена и отправлена клиенту!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="order-moderation">
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Модерация</h2>
                <p style={{ color: 'var(--text-dim)' }}>Проверка предложений поставщиков и стоимости логистики</p>
            </header>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button 
                    onClick={() => setActiveTab('offers')}
                    style={{
                        padding: '10px 20px', borderRadius: '10px', border: 'none',
                        background: activeTab === 'offers' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Предложения ({(offers || []).length})
                </button>
                <button 
                    onClick={() => setActiveTab('logistics')}
                    style={{
                        padding: '10px 20px', borderRadius: '10px', border: 'none',
                        background: activeTab === 'logistics' ? 'var(--accent-blue)' : 'rgba(255,255,255,0.05)',
                        color: '#fff', fontWeight: 600, cursor: 'pointer'
                    }}
                >
                    Логистика ({(logisticsOrders || []).length})
                </button>
            </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                {activeTab === 'offers' ? (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Время / ID</th>
                                <th>Деталь</th>
                                <th>Состояние</th>
                                <th>Поставщик</th>
                                <th>Цена пост. (¥)</th>
                                <th>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(offers || []).length > 0 ? (
                                offers.map(offer => (
                                    <tr key={offer.id}>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: 700 }}>#{offer.order_id}</div>
                                            <div style={{ opacity: 0.5 }}>{formatDate(offer.created_at)}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{offer.item_name || 'Без названия'}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{offer.car_info}</div>
                                            {offer.year && <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>Год: {offer.year}</div>}
                                            {offer.item_code && <div style={{ fontSize: '0.7rem', color: 'var(--accent-blue)' }}>Код: {offer.item_code}</div>}
                                        </td>
                                        <td>
                                            <span style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '10px',
                                                background: offer.condition === 'new' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                                                color: offer.condition === 'new' ? '#10b981' : '#f59e0b',
                                                fontWeight: 700
                                            }}>
                                                {offer.condition === 'new' ? 'НОВЫЙ' : 'Б/У'}
                                            </span>
                                        </td>
                                        <td>{offer.supplier_name}</td>
                                        <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>{offer.price} ¥</td>
                                        <td>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                                onClick={() => {
                                                    setApproving(offer);
                                                    setItemName(offer?.item_name || '');
                                                    setDeliveryTime(offer?.delivery_time || '');
                                                    const price = parseFloat(offer?.price || 0);
                                                    setFinalPrice('');
                                                }}
                                            >
                                                <Edit3 size={14} style={{ marginRight: '5px' }} />
                                                Одобрить
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        Нет предложений, ожидающих проверки
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                ) : (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Время / ID</th>
                                <th>Товар / Клиент</th>
                                <th>Логистика</th>
                                <th>Замеры</th>
                                <th>Цена лог.</th>
                                <th>Действие</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(logisticsOrders || []).length > 0 ? (
                                logisticsOrders.map(order => (
                                    <tr key={order.id}>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            <div style={{ fontWeight: 700 }}>#{order.id}</div>
                                            <div style={{ opacity: 0.5 }}>{formatDate(order.updated_at)}</div>
                                        </td>
                                        <td>
                                            <div style={{ fontWeight: 600 }}>{order.item_name}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>{order.client_name} ({order.user_code})</div>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>
                                            {order.delivery_method === 'air' ? '✈️ Авиа' : '🚛 Авто'}
                                        </td>
                                        <td style={{ fontSize: '0.8rem' }}>
                                            <div>{order.weight} кг</div>
                                            <div style={{ opacity: 0.5 }}>{order.dimensions}</div>
                                        </td>
                                        <td style={{ fontWeight: 700, color: '#f59e0b' }}>${order.logist_shipping_price || order.shipping_price}</td>
                                        <td>
                                            <button
                                                className="btn-primary"
                                                style={{ fontSize: '0.75rem', padding: '6px 12px', background: '#f59e0b' }}
                                                onClick={() => {
                                                    setApprovingLogistics(order);
                                                    setFinalShippingPrice(order?.shipping_price || 0);
                                                }}
                                            >
                                                <Edit3 size={14} style={{ marginRight: '5px' }} />
                                                Одобрить
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: 'center', padding: '40px', opacity: 0.5 }}>
                                        Нет заявок на проверку логистики
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <AnimatePresence>
                {approvingLogistics && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card modal-content"
                            onClick={e => e.stopPropagation()}
                            style={{ maxWidth: '500px', width: '95%' }}
                        >
                            <h3 style={{ marginBottom: '15px' }}>Проверка логистики: #{approvingLogistics?.id}</h3>
                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '5px' }}>{approvingLogistics?.item_name}</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.6, marginBottom: '10px' }}>Замеры логиста: {approvingLogistics?.weight}кг / {approvingLogistics?.dimensions}</div>
                                <div style={{ display: 'flex', gap: '5px' }}>
                                    {approvingLogistics.warehouse_photo_url?.split(',').filter(Boolean).map((url, i) => (
                                        <img key={i} src={`${BASE_IMAGE_URL}${url}`} style={{ width: '50px', height: '50px', borderRadius: '4px', objectFit: 'cover' }} alt="" />
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={handleApproveLogistics} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Итоговая стоимость доставки для клиента (UZS)</label>
                                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="number"
                                            value={finalShippingPrice}
                                            onChange={e => setFinalShippingPrice(e.target.value)}
                                            placeholder="Введите стоимость в UZS"
                                            style={{ paddingRight: '60px', fontSize: '1.2rem', fontWeight: 700 }}
                                            required
                                        />
                                        <span style={{ position: 'absolute', right: '15px', fontWeight: 700, opacity: 0.5 }}>UZS</span>
                                    </div>
                                    <p style={{ fontSize: '0.75rem', opacity: 0.6, marginTop: '8px' }}>
                                        Цена от логиста (в $): <strong>${approvingLogistics.logist_shipping_price || approvingLogistics.shipping_price}</strong>
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setApprovingLogistics(null)} style={{ flex: 1 }}>Отмена</button>
                                    <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2 }}>
                                        {submitting ? <Loader2 className="spinner" size={18} /> : 'Подтвердить и отправить счет'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {approving && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card modal-content"
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: '500px',
                                width: '95%',
                                maxHeight: '90vh',
                                overflowY: 'auto'
                            }}
                        >
                            <h3 style={{ marginBottom: '15px' }}>Редактирование предложения</h3>

                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '15px', marginBottom: '20px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
                                    {approving.photo_url ? (
                                        <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', paddingBottom: '5px' }}>
                                            {approving.photo_url.split(',').filter(Boolean).map((url, i) => (
                                                <img key={i} src={`${BASE_IMAGE_URL}${url}`} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={24} style={{ opacity: 0.2 }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{approving?.item_name} {approving?.year && `(${approving?.year}г.)`}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{approving?.car_info}</div>
                                        {approving?.condition && <div style={{ fontSize: '0.7rem', color: approving?.condition === 'new' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{approving?.condition === 'new' ? 'Новый' : 'Б/У'}</div>}
                                    </div>
                                </div>
                                {approving.comment && (
                                    <p style={{ fontSize: '0.8rem', fontStyle: 'italic', color: 'var(--text-dim)', background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px' }}>
                                        "{approving.comment}"
                                    </p>
                                )}
                            </div>

                            <form onSubmit={handleApprove} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Название детали (для клиента)</label>
                                    <input
                                        type="text"
                                        value={itemName}
                                        onChange={e => setItemName(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Срок доставки</label>
                                    <input
                                        type="text"
                                        value={deliveryTime}
                                        onChange={e => setDeliveryTime(e.target.value)}
                                        placeholder="Например: 2-3 дня"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Итоговая цена для клиента (UZS)</label>
                                    <div style={{ position: 'relative' }}>
                                        <DollarSign size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                                        <input
                                            type="number"
                                            value={finalPrice}
                                            onChange={e => setFinalPrice(e.target.value)}
                                            style={{ paddingLeft: '40px' }}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Цена поставщика: {approving.price} ¥</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                                            Итоговая цена: {parseFloat(finalPrice || 0).toLocaleString()} UZS
                                        </span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setApproving(null)} style={{ flex: 1 }}>Отмена</button>
                                    <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        {submitting ? <Loader2 className="spinner" size={18} /> : <CheckCircle2 size={18} />}
                                        Опубликовать
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

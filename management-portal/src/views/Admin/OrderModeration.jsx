import React, { useState, useEffect } from 'react';
import { api, BASE_IMAGE_URL } from '../../services/api';
import { CheckCircle2, XCircle, Loader2, Edit3, DollarSign, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const OrderModeration = () => {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);
    const [finalPrice, setFinalPrice] = useState('');
    const [itemName, setItemName] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPendingOffers();
    }, []);

    const fetchPendingOffers = async () => {
        try {
            const res = await api.orders.getPendingOffers();
            setOffers(res.data.offers);
        } catch (err) {
            console.error('Failed to fetch pending offers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        if (!finalPrice) return;

        setSubmitting(true);
        try {
            // Send the payload as an object, NOT nested under finalPrice
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

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    return (
        <div className="order-moderation">
            <header style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Модерация предложений</h2>
                <p style={{ color: 'var(--text-dim)' }}>Проверьте цены поставщиков и добавьте маржу перед отправкой клиенту</p>
            </header>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Заказ</th>
                            <th>Деталь</th>
                            <th>Состояние</th>
                            <th>Поставщик</th>
                            <th>Цена пост.</th>
                            <th>Действие</th>
                        </tr>
                    </thead>
                    <tbody>
                        {offers.length > 0 ? (
                            offers.map(offer => (
                                <tr key={offer.id}>
                                    <td>#{offer.order_id}</td>
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
                                    <td style={{ fontWeight: 700, color: 'var(--accent-blue)' }}>${offer.price}</td>
                                    <td>
                                        <button
                                            className="btn-primary"
                                            style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                                            onClick={() => {
                                                setApproving(offer);
                                                setItemName(offer.item_name);
                                                setDeliveryTime(offer.delivery_time || '');
                                                // Default markup: +20%
                                                setFinalPrice(Math.round(parseFloat(offer.price) * 1.2));
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
            </div>

            <AnimatePresence>
                {approving && (
                    <div className="modal-overlay" onClick={() => setApproving(null)}>
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
                                            {approving.photo_url.split(',').map((url, i) => (
                                                <img key={i} src={`${BASE_IMAGE_URL}${url}`} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <Package size={24} style={{ opacity: 0.2 }} />
                                        </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>{approving.item_name} {approving.year && `(${approving.year}г.)`}</div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{approving.car_info}</div>
                                        {approving.condition && <div style={{ fontSize: '0.7rem', color: approving.condition === 'new' ? '#10b981' : '#f59e0b', fontWeight: 700 }}>{approving.condition === 'new' ? 'Новый' : 'Б/У'}</div>}
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
                                    <label>Итоговая цена для клиента ($)</label>
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
                                        <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Цена поставщика: ${approving.price}</span>
                                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', fontWeight: 600 }}>
                                            Маржа: ${(parseFloat(finalPrice || 0) - parseFloat(approving.price)).toFixed(2)}
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

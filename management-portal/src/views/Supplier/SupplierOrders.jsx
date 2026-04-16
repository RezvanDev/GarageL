import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, BASE_IMAGE_URL } from '../../services/api';
import { Package, Send, Loader2, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ImageCarousel } from '../../components/common/ImageCarousel';

export const SupplierOrders = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState(null);

    const [offerItems, setOfferItems] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [user]);

    const fetchOrders = async () => {
        try {
            const resPending = await api.orders.getPending();
            const resByStatus = await api.orders.getByStatus('paid_product,shipped_by_seller');
            
            setOrders([...resPending.data.orders, ...resByStatus.data.orders]);
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTrack = async (orderId, trackNumber) => {
        if (!trackNumber) return alert('Введите трек-номер');
        try {
            await api.orders.updateTrack({ orderId, trackNumber });
            fetchOrders();
            alert('Трек-номер успешно сохранен!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        }
    };

    const addOfferItem = () => {
        setOfferItems(prev => [
            ...prev,
            {
                id: Date.now() + Math.random(),
                price: '',
                condition: 'new',
                itemName: respondingTo?.item_name || '',
                itemCode: '',
                comment: '',
                quantity: respondingTo?.quantity || 1,
                photoUrls: []
            }
        ]);
    };

    const removeOfferItem = (id) => {
        setOfferItems(prev => prev.filter(item => item.id !== id));
    };

    const updateOfferItem = (id, field, value) => {
        setOfferItems(prev => prev.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const handleFileUpload = async (itemId, e) => {
        const file = e.target.files[0];
        if (!file) return;

        const item = offerItems.find(i => i.id === itemId);
        if (item.photoUrls.length >= 5) {
            alert('Максимум 5 фотографий');
            return;
        }

        setIsUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch(`${BASE_IMAGE_URL}/api/v1/upload/product-image`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: data
            });
            const result = await res.json();
            if (result.status === 'success') {
                updateOfferItem(itemId, 'photoUrls', [...item.photoUrls, result.imageUrl]);
            } else {
                alert('Ошибка загрузки: ' + result.message);
            }
        } catch (err) {
            alert('Ошибка при загрузке: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRespond = async (e) => {
        e.preventDefault();

        if (offerItems.some(i => !i.price || !i.itemName)) {
            alert('Пожалуйста, заполните цену и название для всех позиций');
            return;
        }

        setSubmitting(true);
        try {
            await api.orders.respond({
                orderId: respondingTo.id,
                offers: offerItems.map(item => ({
                    price: parseFloat(item.price),
                    itemName: item.itemName,
                    itemCode: item.itemCode,
                    condition: item.condition,
                    comment: item.comment,
                    quantity: parseInt(item.quantity, 10) || 1,
                    photoUrl: item.photoUrls.join(','),
                    deliveryTime: '3-5 дней',
                    year: item.year
                }))
            });

            setRespondingTo(null);
            setOfferItems([]);
            fetchOrders();
            alert('Предложения успешно отправлены!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const openResponse = (order) => {
        setRespondingTo(order);
        setOfferItems([{
            id: Date.now(),
            price: '',
            condition: 'new',
            itemName: order.item_name,
            itemCode: '',
            comment: '',
            quantity: order.quantity || 1,
            photoUrls: []
        }]);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 className="spinner" size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    return (
        <div className="supplier-portal-container">
            <div className="supplier-orders">
                <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Мои заказы</h2>
                        <p style={{ color: 'var(--text-dim)' }}>Управление предложениями и отправкой товаров</p>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                    {orders.length > 0 ? (
                        orders.map(order => (
                            <div key={order.id} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
                                            <Package size={16} color="var(--accent-blue)" />
                                            <span style={{ fontSize: '0.75rem', fontWeight: 700, opacity: 0.5 }}>ЗАКАЗ #{order.id}</span>
                                        </div>
                                        <div style={{ 
                                            fontSize: '0.7rem', 
                                            background: order.status === 'paid_product' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(14,165,233,0.1)', 
                                            color: order.status === 'paid_product' ? '#10b981' : 'var(--accent-blue)', 
                                            padding: '4px 10px', 
                                            borderRadius: '20px', 
                                            fontWeight: 700 
                                        }}>
                                            {order.status === 'pending' ? 'НОВЫЙ ЗАПРОС' : order.status.toUpperCase()}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '15px' }}>
                                    {order.photo_url ? (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)', flexShrink: 0, position: 'relative' }}>
                                            <ImageCarousel images={order.photo_url} height="100%" />
                                        </div>
                                    ) : (
                                        <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px dashed var(--glass-border)' }}>
                                            <ImageIcon size={24} style={{ opacity: 0.2 }} />
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                                        <p style={{ marginBottom: '5px' }}><strong>Авто:</strong> {order.car_info}</p>
                                        <p style={{ fontSize: '0.8rem', fontStyle: 'italic', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {order.description || 'Нет описания'}
                                        </p>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', paddingTop: '15px', borderTop: '1px solid var(--glass-border)' }}>
                                    {order.status === 'pending' ? (
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div style={{ fontSize: '0.75rem' }}>
                                                <span style={{ opacity: 0.5 }}>От: </span>
                                                <span style={{ fontWeight: 600 }}>{order.client_name}</span>
                                            </div>
                                            <button className="btn-primary" style={{ fontSize: '0.75rem', padding: '8px 16px' }} onClick={() => openResponse(order)}>
                                                Ответить
                                            </button>
                                        </div>
                                    ) : order.status === 'paid_product' ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                            <div style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600 }}>Товар оплачен! Введите трек-номер после отправки:</div>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <input 
                                                    type="text" 
                                                    placeholder="Трек-номер..." 
                                                    id={`track-${order.id}`}
                                                    style={{ flex: 1, padding: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', color: '#fff' }}
                                                />
                                                <button 
                                                    className="btn-primary" 
                                                    style={{ padding: '8px 15px' }}
                                                    onClick={() => {
                                                        const val = document.getElementById(`track-${order.id}`).value;
                                                        handleUpdateTrack(order.id, val);
                                                    }}
                                                >
                                                    Отправить
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={{ fontSize: '0.85rem', opacity: 0.7 }}>
                                            <div><strong>Трек-номер:</strong> {order.track_number}</div>
                                            <div style={{ marginTop: '5px', color: 'var(--accent-blue)' }}>Товар в пути на склад / обработан</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '100px 20px', opacity: 0.3 }}>
                            <Package size={60} style={{ marginBottom: '20px' }} />
                            <p>На данный момент новых запросов нет</p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {respondingTo && (
                    <div className="modal-overlay" onClick={() => setRespondingTo(null)}>
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="glass-card modal-content"
                            onClick={e => e.stopPropagation()}
                            style={{
                                maxWidth: '600px',
                                width: '90%',
                                maxHeight: '90vh',
                                overflowY: 'auto',
                                position: 'relative'
                            }}
                        >
                            <h3 style={{ marginBottom: '5px' }}>Ваше предложение</h3>
                            <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '20px' }}>
                                Деталь для: <strong>{respondingTo.car_info}</strong> (Надо: {respondingTo.quantity || 1} шт)
                            </p>

                            <form onSubmit={handleRespond} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>

                                {offerItems.map((item, index) => (
                                    <div key={item.id} style={{
                                        position: 'relative',
                                        padding: '20px',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '15px',
                                        border: '1px solid var(--glass-border)',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '15px'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <h4 style={{ fontSize: '0.9rem', opacity: 0.7 }}>Вариант #{index + 1}</h4>
                                            {offerItems.length > 1 && (
                                                <button type="button" onClick={() => removeOfferItem(item.id)} style={{ background: 'transparent', border: 'none', color: '#ff4444', fontSize: '0.75rem', cursor: 'pointer' }}>Удалить</button>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', padding: '4px' }}>
                                            <button
                                                type="button"
                                                onClick={() => updateOfferItem(item.id, 'condition', 'new')}
                                                style={{
                                                    flex: 1, border: 'none', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                                    background: item.condition === 'new' ? 'var(--accent-blue)' : 'transparent',
                                                    color: item.condition === 'new' ? 'white' : 'var(--text-dim)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Новый
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => updateOfferItem(item.id, 'condition', 'used')}
                                                style={{
                                                    flex: 1, border: 'none', padding: '8px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                                                    background: item.condition === 'used' ? 'var(--accent-blue)' : 'transparent',
                                                    color: item.condition === 'used' ? 'white' : 'var(--text-dim)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Б/У
                                            </button>
                                        </div>

                                        <div className="form-group">
                                            <label>Фото (до 5 штук)</label>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '5px' }}>
                                                {item.photoUrls.map((url, idx) => (
                                                    <div key={idx} style={{ position: 'relative', width: '60px', height: '60px', borderRadius: '8px', overflow: 'hidden' }}>
                                                        <img src={`${BASE_IMAGE_URL}${url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                                                        <button
                                                            type="button"
                                                            onClick={() => updateOfferItem(item.id, 'photoUrls', item.photoUrls.filter((_, i) => i !== idx))}
                                                            style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                                                        >
                                                            ×
                                                        </button>
                                                    </div>
                                                ))}
                                                {item.photoUrls.length < 5 && (
                                                    <label style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <input type="file" hidden accept="image/*" onChange={(e) => handleFileUpload(item.id, e)} disabled={isUploading} />
                                                        {isUploading ? <Loader2 className="spinner" size={16} /> : <ImageIcon size={20} style={{ opacity: 0.3 }} />}
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Название запчасти</label>
                                            <input
                                                type="text"
                                                placeholder="Напр: Фара левая адаптивная"
                                                value={item.itemName}
                                                onChange={e => updateOfferItem(item.id, 'itemName', e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
                                            <div className="form-group">
                                                <label>Код детали</label>
                                                <input
                                                    type="text"
                                                    placeholder="Напр: 63117263051"
                                                    value={item.itemCode}
                                                    onChange={e => updateOfferItem(item.id, 'itemCode', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Год</label>
                                                <input
                                                    type="text"
                                                    placeholder="2022"
                                                    value={item.year}
                                                    onChange={e => updateOfferItem(item.id, 'year', e.target.value)}
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>В наличии (шт)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={item.quantity}
                                                    onChange={e => updateOfferItem(item.id, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </div>
                                            <div className="form-group">
                                                <label>Цена за шт ($)</label>
                                                <input
                                                    type="number"
                                                    placeholder="45"
                                                    value={item.price}
                                                    onChange={e => updateOfferItem(item.id, 'price', e.target.value)}
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label>Комментарий</label>
                                            <textarea
                                                placeholder="Опишите состояние..."
                                                value={item.comment}
                                                onChange={e => updateOfferItem(item.id, 'comment', e.target.value)}
                                                style={{ height: '60px', paddingTop: '10px', fontSize: '0.85rem' }}
                                            />
                                        </div>
                                    </div>
                                ))}

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={addOfferItem}
                                    style={{ borderStyle: 'dashed', opacity: 0.7 }}
                                >
                                    + Добавить еще вариант (напр. Б/У)
                                </button>

                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '20px' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setRespondingTo(null)} style={{ flex: 1 }}>
                                        Отмена
                                    </button>
                                    <button type="submit" className="btn-primary" disabled={submitting || isUploading} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                                        {submitting ? <Loader2 className="spinner" size={18} /> : <Send size={18} />}
                                        Отправить ({offerItems.length})
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

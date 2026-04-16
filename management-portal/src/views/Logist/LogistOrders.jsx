import React, { useState, useEffect } from 'react';
import { api, BASE_IMAGE_URL } from '../../services/api';
import { 
    Package, 
    Truck, 
    Search, 
    Filter, 
    Camera, 
    Loader2, 
    CheckCircle2, 
    ChevronRight, 
    Info,
    History as HistoryIcon,
    Box,
    Weight
} from 'lucide-react';

export const LogistOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('acceptance'); // acceptance, warehouse, shipping, history
    const [processing, setProcessing] = useState(null);
    const [uploading, setUploading] = useState(false);
    
    // Form state for reception
    const [weight, setWeight] = useState('');
    const [length, setLength] = useState('');
    const [width, setWidth] = useState('');
    const [height, setHeight] = useState('');
    const [shippingPrice, setShippingPrice] = useState('');
    const [photos, setPhotos] = useState([]); // List of photo URLs

    const TABS = [
        { id: 'acceptance', label: 'Приемка', status: ['shipped_by_seller'] },
        { id: 'warehouse', label: 'На складе', status: ['arrived_warehouse', 'waiting_delivery_payment'] },
        { id: 'shipping', label: 'Отправка', status: ['delivery_paid', 'shipped_to_uzbekistan'] },
        { id: 'history', label: 'История', status: ['delivered'] }
    ];

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const allStatuses = 'shipped_by_seller,arrived_warehouse,waiting_delivery_payment,delivery_paid,shipped_to_uzbekistan,delivered';
            const res = await api.orders.getByStatus(allStatuses);
            setOrders(res.data.orders);
        } catch (err) {
            console.error('Fetch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (photos.length >= 5) {
            alert('Максимум 5 фотографий');
            return;
        }

        setUploading(true);
        const data = new FormData();
        data.append('image', file);

        try {
            const res = await fetch(`${BASE_IMAGE_URL}/api/v1/upload/product-image`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                body: data
            });
            const result = await res.json();
            if (result.status === 'success') {
                setPhotos(prev => [...prev, result.imageUrl]);
            }
        } catch (err) {
            alert('Ошибка загрузки: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    const removePhoto = (index) => {
        setPhotos(prev => prev.filter((_, i) => i !== index));
    };

    const calculateSuggestedPrice = (method) => {
        const numWeight = parseFloat(weight) || 0;
        const volWeight = (parseFloat(length) * parseFloat(width) * parseFloat(height)) / 5000 || 0;
        const finalWeight = Math.max(numWeight, volWeight);
        const rate = method === 'air' ? 13 : 6;
        return (finalWeight * rate).toFixed(2);
    };

    const handleReceive = async () => {
        if (!weight || !shippingPrice) return alert('Укажите вес и стоимость');
        try {
            await api.orders.receiveWarehouse({
                orderId: processing.id,
                weight,
                dimensions: `${length}x${width}x${height}`,
                shippingPrice,
                photoUrl: photos.join(',')
            });
            setProcessing(null);
            setWeight(''); setLength(''); setWidth(''); setHeight(''); setPhotos([]); setShippingPrice('');
            fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleShipToUz = async (orderId) => {
        const track = prompt('Введите номер рейса или трек-номер до Ташкента:');
        if (!track) return;
        try {
            await api.orders.shipToUz({ orderId, shippingTrackNumber: track });
            fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    const handleComplete = async (orderId) => {
        if (!window.confirm('Товар выдан клиенту?')) return;
        try {
            await api.orders.markDelivered(orderId);
            fetchOrders();
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesTab = TABS.find(t => t.id === activeTab).status.includes(order.status);
        const matchesSearch = 
            order.id.toString().includes(searchTerm) || 
            order.user_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.item_name?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesTab && matchesSearch;
    });

    if (loading && orders.length === 0) return <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="spinner" size={40} color="var(--accent-blue)" /></div>;

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '5px' }}>Управление Складом</h2>
                    <p style={{ color: 'var(--text-dim)' }}>Приемка, замеры и логистика в Узбекистан</p>
                </div>
                
                <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                    <input 
                        type="text" 
                        placeholder="Поиск по ID или коду..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '12px 15px 12px 45px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff' }}
                    />
                </div>
            </header>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '30px', background: 'rgba(255,255,255,0.03)', padding: '5px', borderRadius: '15px', width: 'fit-content' }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 25px',
                            borderRadius: '12px',
                            border: 'none',
                            background: activeTab === tab.id ? 'var(--accent-blue)' : 'transparent',
                            color: activeTab === tab.id ? '#fff' : 'var(--text-dim)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        {tab.id === 'acceptance' && <Package size={16} />}
                        {tab.id === 'warehouse' && <Box size={16} />}
                        {tab.id === 'shipping' && <Truck size={16} />}
                        {tab.id === 'history' && <HistoryIcon size={16} />}
                        {tab.label}
                    </button>
                ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                {filteredOrders.length > 0 ? filteredOrders.map(order => (
                    <div key={order.id} className="glass-card" style={{ padding: '25px', border: '1px solid var(--glass-border)', position: 'relative' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                                    Заказ #{order.id}
                                </div>
                                <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{order.item_name}</h3>
                            </div>
                            <div style={{ 
                                fontSize: '0.7rem', 
                                background: 'rgba(14, 165, 233, 0.1)', 
                                color: 'var(--accent-blue)', 
                                padding: '6px 12px', 
                                borderRadius: '20px', 
                                fontWeight: 800,
                                height: 'fit-content'
                            }}>
                                {order.status === 'shipped_by_seller' ? 'В ПУТИ ОТ ПОСТАВЩИКА' : 
                                 order.status === 'arrived_warehouse' ? 'ПРИНЯТ' : order.status.toUpperCase()}
                            </div>
                        </div>

                        <div style={{ 
                            background: 'rgba(255,255,255,0.02)', 
                            border: '1px solid rgba(255,255,255,0.05)',
                            padding: '15px', 
                            borderRadius: '12px', 
                            marginBottom: '20px',
                            fontSize: '0.9rem'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ opacity: 0.5 }}>Клиент:</span>
                                <span style={{ fontWeight: 600 }}>{order.client_name} ({order.user_code})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <span style={{ opacity: 0.5 }}>Способ доставки:</span>
                                <span style={{ fontWeight: 600 }}>{order.delivery_method === 'air' ? '✈️ Авиа ($13)' : '🚛 Авто ($6)'}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span style={{ opacity: 0.5 }}>Трек (поставщик):</span>
                                <span style={{ fontWeight: 700, color: '#10b981' }}>{order.track_number || 'Ожидается'}</span>
                            </div>
                        </div>

                        {/* Status specific actions */}
                        {order.status === 'shipped_by_seller' && (
                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', padding: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }} 
                                onClick={() => setProcessing(order)}
                            >
                                <CheckCircle2 size={18} /> ПРИНЯТЬ НА СКЛАД
                            </button>
                        )}

                        {(order.status === 'arrived_warehouse' || order.status === 'waiting_delivery_payment') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)', padding: '12px', borderRadius: '10px' }}>
                                <Info size={16} />
                                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                                    {order.status === 'arrived_warehouse' ? 'Ожидает расчета логистом' : 'Ожидает оплаты доставки клиентом'}
                                </span>
                            </div>
                        )}

                        {order.status === 'delivery_paid' && (
                            <button 
                                className="btn-primary" 
                                style={{ width: '100%', background: '#10b981', padding: '15px' }} 
                                onClick={() => handleShipToUz(order.id)}
                            >
                                ОТПРАВИТЬ В УЗБЕКИСТАН
                            </button>
                        )}

                        {order.status === 'shipped_to_uzbekistan' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                <div style={{ fontSize: '0.85rem', opacity: 0.7, padding: '10px', background: 'rgba(14,165,233,0.05)', borderRadius: '8px' }}>
                                    📦 <strong>Рейс:</strong> {order.shipping_track_number}
                                </div>
                                <button 
                                    className="btn-secondary" 
                                    style={{ width: '100%', borderColor: 'var(--accent-blue)', color: 'var(--accent-blue)', padding: '12px' }} 
                                    onClick={() => handleComplete(order.id)}
                                >
                                    ВЫДАТЬ КЛИЕНТУ
                                </button>
                            </div>
                        )}

                        {order.status === 'delivered' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', background: 'rgba(16, 185, 129, 0.05)', padding: '12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
                                <CheckCircle2 size={18} /> ВЫДАНО КЛИЕНТУ
                            </div>
                        )}
                    </div>
                )) : (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px', opacity: 0.3 }}>
                        <Package size={60} style={{ marginBottom: '20px' }} />
                        <h3>Обращений не найдено</h3>
                        <p>Измените параметры поиска или вкладку</p>
                    </div>
                )}
            </div>

            {processing && (
                <div className="modal-overlay" onClick={() => setProcessing(null)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '550px', width: '90%' }}>
                        <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '20px', marginBottom: '25px' }}>
                            <h3 style={{ fontSize: '1.4rem' }}>Приемка и замеры: #{processing.id}</h3>
                            <p style={{ fontSize: '0.9rem', opacity: 0.5 }}>{processing.item_name} для {processing.client_name}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Вес нетто (кг)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Weight size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
                                        <input 
                                            type="number" 
                                            value={weight} 
                                            onChange={e => setWeight(e.target.value)} 
                                            placeholder="0.00"
                                            style={{ paddingLeft: '45px' }}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Габариты (Д/Ш/В см)</label>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input type="number" placeholder="L" value={length} onChange={e => setLength(e.target.value)} />
                                        <input type="number" placeholder="W" value={width} onChange={e => setWidth(e.target.value)} />
                                        <input type="number" placeholder="H" value={height} onChange={e => setHeight(e.target.value)} />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Фотографии товара (макс. 5)</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                    {photos.map((url, idx) => (
                                        <div key={idx} style={{ position: 'relative', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                                            <img src={`${BASE_IMAGE_URL}${url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Warehouse" />
                                            <button 
                                                onClick={() => removePhoto(idx)}
                                                style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(255,0,0,0.7)', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    {photos.length < 5 && (
                                        <label 
                                            style={{ 
                                                height: '100px', 
                                                border: '2px dashed var(--glass-border)', 
                                                borderRadius: '12px', 
                                                display: 'flex', 
                                                flexDirection: 'column', 
                                                alignItems: 'center', 
                                                justifyContent: 'center',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <input type="file" hidden onChange={handlePhotoUpload} />
                                            {uploading ? <Loader2 className="spinner" size={20} /> : <Camera size={20} style={{ opacity: 0.3 }} />}
                                        </label>
                                    )}
                                </div>
                            </div>

                            <div style={{ 
                                background: 'rgba(14, 165, 233, 0.05)', 
                                border: '1px solid rgba(14, 165, 233, 0.2)',
                                padding: '20px', 
                                borderRadius: '15px' 
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                    <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Стоимость доставки ($)</h4>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--accent-blue)', background: 'rgba(14,165,233,0.1)', padding: '4px 10px', borderRadius: '20px' }}>
                                        Рекомендуем: <strong>${calculateSuggestedPrice(processing.delivery_method)}</strong>
                                    </div>
                                </div>
                                <input 
                                    type="number" 
                                    value={shippingPrice} 
                                    onChange={e => setShippingPrice(e.target.value)} 
                                    placeholder="Введите итоговую стоимость"
                                    style={{ fontSize: '1.2rem', fontWeight: 700, padding: '15px' }}
                                />
                            </div>

                            <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                <button className="btn-secondary" style={{ flex: 1, padding: '15px' }} onClick={() => setProcessing(null)}>ОТМЕНА</button>
                                <button className="btn-primary" style={{ flex: 2, padding: '15px' }} onClick={handleReceive}>СОХРАНИТЬ И ВЫСТАВИТЬ СЧЕТ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

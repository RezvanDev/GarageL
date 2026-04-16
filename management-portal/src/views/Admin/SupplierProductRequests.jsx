import React, { useState, useEffect } from 'react';
import { api, BASE_IMAGE_URL } from '../../services/api';
import { CheckCircle2, XCircle, Image as ImageIcon, Loader2 } from 'lucide-react';

export const SupplierProductRequests = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [approving, setApproving] = useState(null);
    const [finalPrice, setFinalPrice] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPendingProducts();
    }, []);

    const fetchPendingProducts = async () => {
        setLoading(true);
        try {
            const data = await api.products.getAll({ includeUnapproved: 'true' });
            // Show only unapproved ones
            const pending = (data.data.products || []).filter(p => !p.is_approved);
            setProducts(pending);
        } catch (err) {
            console.error('Failed to fetch pending products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (e) => {
        e.preventDefault();
        if (!finalPrice) return;

        setSubmitting(true);
        try {
            await api.products.approve(approving.id, finalPrice);
            setApproving(null);
            setFinalPrice('');
            fetchPendingProducts();
            alert('✅ Товар одобрен и теперь виден в каталоге!');
        } catch (err) {
            alert('Ошибка: ' + err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Вы уверены, что хотите отклонить и удалить этот товар?')) return;
        try {
            await api.products.delete(id);
            fetchPendingProducts();
        } catch (err) {
            alert('Ошибка при удалении: ' + err.message);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={40} color="var(--accent-blue)" />
            </div>
        );
    }

    return (
        <div className="fade-in">
            <div style={{ marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Заявки от поставщиков</h2>
                <p style={{ color: 'var(--text-dim)', marginTop: '8px' }}>
                    Товары ожидающие вашего одобрения. Установите финальную цену и опубликуйте.
                </p>
            </div>

            {products.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 16px', display: 'block' }} />
                    <h3 style={{ marginBottom: '8px' }}>Всё проверено!</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Новых заявок от поставщиков нет.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {products.map(product => (
                        <div key={product.id} className="glass-card" style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: '20px', alignItems: 'center', padding: '20px' }}>
                            {/* Image */}
                            <div style={{ width: '80px', height: '80px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {product.image_url
                                    ? <img src={`${BASE_IMAGE_URL}${product.image_url.split(',')[0]}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    : <ImageIcon size={30} color="rgba(255,255,255,0.2)" />
                                }
                            </div>

                            {/* Info */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                                    <span style={{ fontWeight: 700, fontSize: '1.05rem' }}>{product.name}</span>
                                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', borderRadius: '20px', fontWeight: 600 }}>На модерации</span>
                                </div>
                                <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                                    <span>🚗 {product.brand} {product.model}</span>
                                    <span>📦 Артикул: {product.code}</span>
                                    <span style={{ color: '#a78bfa', fontWeight: 600 }}>Цена поставщика: ${product.supplier_price || product.price}</span>
                                </div>
                                {product.description && (
                                    <p style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>{product.description}</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
                                <button
                                    onClick={() => {
                                        setApproving(product);
                                        setFinalPrice(Math.round((product.supplier_price || product.price) * 1.2));
                                    }}
                                    style={{ padding: '8px 16px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', color: '#10b981', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <CheckCircle2 size={16} /> Одобрить
                                </button>
                                <button
                                    onClick={() => handleReject(product.id)}
                                    style={{ padding: '8px 16px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', color: '#ef4444', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                    <XCircle size={16} /> Отклонить
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approve modal */}
            {approving && (
                <div className="modal-overlay" onClick={() => setApproving(null)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '420px' }}>
                        <h3 style={{ marginBottom: '6px' }}>Одобрение товара</h3>
                        <p style={{ color: 'var(--text-dim)', marginBottom: '24px', fontSize: '0.9rem' }}>
                            Установите итоговую цену для клиентов (с вашей наценкой)
                        </p>

                        <form onSubmit={handleApprove}>
                            <div className="form-group">
                                <label>Товар</label>
                                <input type="text" value={approving.name} disabled style={{ opacity: 0.5 }} />
                            </div>
                            <div className="form-group">
                                <label>Цена поставщика</label>
                                <input type="text" value={`$${approving.supplier_price || approving.price}`} disabled style={{ opacity: 0.5 }} />
                            </div>
                            <div className="form-group">
                                <label>Итоговая цена для клиентов ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={finalPrice}
                                    onChange={e => setFinalPrice(e.target.value)}
                                    required
                                    autoFocus
                                />
                                {finalPrice && (
                                    <p style={{ fontSize: '0.8rem', marginTop: '6px', color: '#10b981' }}>
                                        Ваша маржа: ${(parseFloat(finalPrice) - parseFloat(approving.supplier_price || approving.price)).toFixed(2)}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" onClick={() => setApproving(null)} className="btn-secondary" style={{ flex: 1 }}>Отмена</button>
                                <button type="submit" className="btn-primary" disabled={submitting} style={{ flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                    {submitting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle2 size={18} />}
                                    Опубликовать в каталог
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

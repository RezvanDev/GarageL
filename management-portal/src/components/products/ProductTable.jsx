import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { BASE_IMAGE_URL } from '../../services/api';

export const ProductTable = ({ products, onEdit, onDelete, isSupplier }) => {
    return (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'Фото / 图片' : 'Фото'}</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'Товар / 产品' : 'Товар'}</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'Авто / 车型' : 'Авто'}</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'Артикул / 零件号' : 'Артикул'}</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'В наличии / 在库' : 'В наличии'}</th>
                        {isSupplier ? (
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Цена (¥) / 价格 (¥)</th>
                        ) : (
                            <>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Цена поставщика (¥)</th>
                                <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Цена для клиентов (UZS)</th>
                            </>
                        )}
                        {isSupplier && (
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Статус / 状态</th>
                        )}
                        <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 600 }}>{isSupplier ? 'Действия / 操作' : 'Действия'}</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'all 0.2s', ':hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
                            <td style={{ padding: '16px', fontWeight: 600, color: 'var(--accent-blue)' }}>
                                {String(product.id).padStart(4, '0')}
                            </td>
                            <td style={{ padding: '16px' }}>
                                <div style={{ width: '50px', height: '50px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {product.image_url
                                        ? <img src={`${BASE_IMAGE_URL}${product.image_url.split(',')[0]}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        : <ImageIcon size={20} color="var(--text-dim)" />}
                                </div>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 500 }}>{product.name}</td>
                            <td style={{ padding: '16px', color: 'var(--text-dim)' }}>
                                {product.brand} {product.model}
                            </td>
                            <td style={{ padding: '16px', color: 'var(--text-dim)' }}>{product.code}</td>
                            <td style={{ padding: '16px' }}>
                                <span style={{ 
                                    padding: '4px 10px', 
                                    borderRadius: '12px', 
                                    background: product.quantity > 5 ? 'rgba(0, 255, 136, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                                    color: product.quantity > 5 ? '#00ff88' : '#ef4444', 
                                    fontSize: '0.8rem', 
                                    fontWeight: 700 
                                }}>
                                    {product.quantity || 0} {isSupplier ? '件' : 'шт.'}
                                </span>
                            </td>
                            {isSupplier ? (
                                <td style={{ padding: '16px', fontWeight: 600 }}>
                                    ¥{product.supplier_price || product.price}
                                </td>
                            ) : (
                                <>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>
                                        {product.supplier_price || product.price} ¥
                                    </td>
                                    <td style={{ padding: '16px', fontWeight: 600 }}>
                                        {product.is_approved ? (
                                            <span style={{ color: '#00ff88' }}>
                                                {parseFloat(product.price).toLocaleString()} UZS
                                            </span>
                                        ) : (
                                            <span style={{ color: '#f59e0b', fontWeight: 400, fontSize: '0.85rem' }}>
                                                Ожидает одобрения
                                            </span>
                                        )}
                                    </td>
                                </>
                            )}
                            {isSupplier && (
                                <td style={{ padding: '16px' }}>
                                    {product.is_approved
                                        ? <span style={{ padding: '4px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Одобрен / 已批准</span>
                                        : <span style={{ padding: '4px 8px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>На проверке / 审核中</span>
                                    }
                                </td>
                            )}
                            <td style={{ padding: '16px', textAlign: 'right' }}>
                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                    <button
                                        onClick={() => onEdit(product)}
                                        style={{ background: 'rgba(255, 255, 255, 0.05)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: 'var(--accent-blue)', transition: 'all 0.2s' }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(product.id)}
                                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '8px', borderRadius: '6px', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {products.length === 0 && (
                        <tr>
                            <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                {isSupplier ? 'Товары не найдены / 未找到产品' : 'Товары не найдены'}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

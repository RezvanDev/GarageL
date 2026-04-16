import React from 'react';
import { Edit2, Trash2, Image as ImageIcon } from 'lucide-react';
import { BASE_IMAGE_URL } from '../../services/api';

export const ProductTable = ({ products, onEdit, onDelete, isSupplier }) => {
    return (
        <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Фото</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Товар</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Авто</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Артикул</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>В наличии</th>
                        <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Цена</th>
                        {isSupplier && (
                            <th style={{ padding: '16px', textAlign: 'left', color: 'var(--text-dim)', fontWeight: 600 }}>Статус</th>
                        )}
                        <th style={{ padding: '16px', textAlign: 'right', color: 'var(--text-dim)', fontWeight: 600 }}>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map(product => (
                        <tr key={product.id} style={{ borderBottom: '1px solid var(--glass-border)', transition: 'all 0.2s', ':hover': { background: 'rgba(255, 255, 255, 0.02)' } }}>
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
                                    {product.quantity || 0} шт
                                </span>
                            </td>
                            <td style={{ padding: '16px', fontWeight: 600 }}>
                                {isSupplier ? (
                                    `$${product.supplier_price || product.price}`
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span>${product.price}</span>
                                        {product.supplier_price && product.supplier_price !== product.price && (
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                                                (от пост.: ${product.supplier_price})
                                            </span>
                                        )}
                                    </div>
                                )}
                            </td>
                            {isSupplier && (
                                <td style={{ padding: '16px' }}>
                                    {product.is_approved
                                        ? <span style={{ padding: '4px 8px', borderRadius: '20px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Одобрен</span>
                                        : <span style={{ padding: '4px 8px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', fontSize: '0.75rem', fontWeight: 600 }}>На проверке</span>
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
                            <td colSpan={isSupplier ? 7 : 6} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-dim)' }}>
                                Товары не найдены
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

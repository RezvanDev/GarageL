import React, { useState } from 'react';
import { Upload, X, Loader2, ChevronDown } from 'lucide-react';
import { BASE_IMAGE_URL } from '../../services/api';
import { CAR_BRANDS } from '../../constants/carBrands';

export const ProductFormModal = ({
    isOpen,
    onClose,
    currentProduct,
    formData,
    setFormData,
    onSubmit,
    onImageUpload,
    isUploading,
    userRole,
    userAllowedBrands = []
}) => {
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

    if (!isOpen) return null;

    const availableBrands = userRole === 'supplier' && userAllowedBrands && userAllowedBrands.length > 0
        ? userAllowedBrands
        : Object.keys(CAR_BRANDS);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>{currentProduct ? 'Редактировать товар' : 'Добавить новый товар'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={onSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* ... (rest of form up to the brand select) */}
                    {/* Image Upload Area */}
                    <div style={{ gridColumn: 'span 2' }}>
                        <label style={{ display: 'block', marginBottom: '10px' }}>Фотографии (макс. 5)</label>
                        <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', paddingBottom: '10px' }}>
                            {formData.image_url && formData.image_url.split(',').filter(Boolean).map((imgUrl, idx) => (
                                <div key={idx} style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
                                    <img src={`${BASE_IMAGE_URL}${imgUrl}`} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const newUrls = formData.image_url.split(',').filter(Boolean);
                                            newUrls.splice(idx, 1);
                                            setFormData(prev => ({ ...prev, image_url: newUrls.join(',') }));
                                        }}
                                        style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.6)', border: 'none', color: 'white', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            ))}

                            {(!formData.image_url || formData.image_url.split(',').filter(Boolean).length < 5) && (
                                <div style={{
                                    width: '120px',
                                    height: '120px',
                                    flexShrink: 0,
                                    border: '2px dashed var(--glass-border)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    cursor: isUploading ? 'not-allowed' : 'pointer',
                                    background: 'rgba(255, 255, 255, 0.02)',
                                    position: 'relative',
                                    transition: 'all 0.2s'
                                }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={onImageUpload}
                                        style={{
                                            position: 'absolute',
                                            top: 0, left: 0, width: '100%', height: '100%',
                                            opacity: 0, cursor: isUploading ? 'not-allowed' : 'pointer'
                                        }}
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <Loader2 className="spin" size={24} color="var(--accent-blue)" />
                                    ) : (
                                        <>
                                            <Upload size={24} color="var(--text-dim)" style={{ marginBottom: '8px' }} />
                                            <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Загрузить ({formData.image_url ? 5 - formData.image_url.split(',').filter(Boolean).length : 5})</span>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Бренд</label>
                        <select
                            value={formData.brand}
                            onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value, model: '' }))}
                            required
                            style={{
                                width: '100%',
                                padding: '12px',
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '8px',
                                color: 'white',
                                outline: 'none'
                            }}
                        >
                            <option value="" style={{ color: 'black' }}>Выберите бренд</option>
                            {availableBrands.map(b => (
                                <option key={b} value={b} style={{ color: 'black' }}>{b}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Модель</label>
                        {formData.brand && CAR_BRANDS[formData.brand] ? (
                            <div style={{ position: 'relative' }}>
                                <div
                                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        color: formData.model ? 'white' : 'var(--text-dim)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {formData.model || 'Выберите модели'}
                                    </span>
                                    <ChevronDown size={18} />
                                </div>
                                {isModelDropdownOpen && (
                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        background: '#1a1a1a',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        marginTop: '5px',
                                        maxHeight: '200px',
                                        overflowY: 'auto',
                                        zIndex: 10
                                    }}>
                                        {CAR_BRANDS[formData.brand].map(m => {
                                            const selectedModels = formData.model ? formData.model.split(', ') : [];
                                            const isSelected = selectedModels.includes(m);
                                            return (
                                                <label key={m} style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    padding: '10px 15px',
                                                    cursor: 'pointer',
                                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                    color: 'white',
                                                    gap: '10px'
                                                }}>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => {
                                                            let newModels = [...selectedModels];
                                                            if (isSelected) {
                                                                newModels = newModels.filter(modelItem => modelItem !== m);
                                                            } else {
                                                                newModels.push(m);
                                                            }
                                                            setFormData(prev => ({ ...prev, model: newModels.join(', ') }));
                                                        }}
                                                        style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                                                    />
                                                    {m}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <input
                                type="text"
                                placeholder="Сначала выберите бренд"
                                value={formData.model}
                                onChange={e => setFormData(prev => ({ ...prev, model: e.target.value }))}
                                required
                                disabled={!formData.brand}
                            />
                        )}
                    </div>

                    <div className="form-group">
                        <label>Название</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Артикул</label>
                        <input
                            type="text"
                            value={formData.code}
                            onChange={e => setFormData(prev => ({ ...prev, code: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>{currentProduct || userRole === 'supplier' ? 'Ваша цена ($)' : 'Цена для клиентов ($)'}</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Количество (шт)</label>
                        <input
                            type="number"
                            min="1"
                            value={formData.quantity || 1}
                            onChange={e => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                            required
                        />
                    </div>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Описание (опционально)</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                border: '1px solid var(--glass-border)',
                                color: 'var(--text-main)',
                                padding: '14px',
                                borderRadius: '12px',
                                outline: 'none',
                                height: '46px',
                                resize: 'none'
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ gridColumn: 'span 2', marginTop: '10px' }}
                        disabled={isUploading}
                    >
                        {currentProduct ? 'СОХРАНИТЬ' : 'СОЗДАТЬ'}
                    </button>
                </form>
            </div>
        </div>
    );
};

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Clipboard, Car, Hash, FileText, Send, CheckCircle2, ChevronLeft } from 'lucide-react';
import { GlassCard } from '../../components/common/UI';
import { brands, brandModels } from '../../data/constants';

export const RequestView = ({ onBack, onSubmit }) => {
    const [mode, setMode] = useState('single');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [photoFiles, setPhotoFiles] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const fileInputRef = useRef(null);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newFiles = [...photoFiles, ...files].slice(0, 5);
            setPhotoFiles(newFiles);
            setPhotos(newFiles.map(file => URL.createObjectURL(file)));
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setPhotos([]);
        setPhotoFiles([]);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);

        const data = {
            mode,
            name: mode === 'single' ? fd.get('name') : null,
            description: mode === 'multi' ? fd.get('description') : null,
            brand: selectedBrand,
            model: selectedModel,
            vin: fd.get('vin'),
            year: fd.get('year'),
            quantity: fd.get('quantity'),
            photos: photoFiles
        };

        const itemName = mode === 'single' ? data.name : 'Групповой запрос';
        const carInfo = `${data.brand} ${data.model} ${data.year ? `${data.year}г.` : ''} ${data.vin ? `(VIN: ${data.vin})` : ''}`;
        const description = mode === 'multi' ? data.description : '';

        onSubmit(itemName, carInfo, description, photoFiles, data.brand, data.year, data.quantity);
        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ textAlign: 'center', padding: '60px 20px' }}
            >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <CheckCircle2 size={80} color="#00ff88" />
                </div>
                <h2 style={{ marginBottom: '15px' }}>Запрос принят!</h2>
                <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>
                    Наши специалисты уже ищут нужные детали. <br />
                    Вы получите уведомление, когда будет сформировано предложение.
                </p>
                <button className="btn-primary" onClick={onBack}>
                    Вернуться на главную
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
                <button className="search-clear" style={{ background: 'rgba(255,255,255,0.05)' }} onClick={onBack}>
                    <ChevronLeft size={20} />
                </button>
                <h2 style={{ margin: 0 }}>Заказ запчастей</h2>
            </div>

            <div className="auth-tabs" style={{ marginBottom: '25px' }}>
                <button
                    className={`auth-tab ${mode === 'single' ? 'active' : ''}`}
                    onClick={() => handleModeChange('single')}
                >
                    <Clipboard size={18} /> Одна деталь
                </button>
                <button
                    className={`auth-tab ${mode === 'multi' ? 'active' : ''}`}
                    onClick={() => handleModeChange('multi')}
                >
                    <FileText size={18} /> Много деталей
                </button>
            </div>

            <form onSubmit={handleFormSubmit}>
                <GlassCard className="auth-card" style={{ marginBottom: '20px' }}>
                    <div className="form-group" style={{ textAlign: 'center' }}>
                        {photos.length === 0 ? (
                            <div
                                className="photo-upload-container glass"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    height: '140px',
                                    border: '2px dashed rgba(255,255,255,0.1)',
                                    borderRadius: '15px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    background: 'rgba(255,255,255,0.02)',
                                    transition: 'all 0.3s ease',
                                    marginBottom: '10px'
                                }}
                            >
                                <Camera size={32} color="var(--accent-blue)" style={{ marginBottom: '8px', opacity: 0.6 }} />
                                <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>Нажмите, чтобы добавить фото (до 5)</span>
                            </div>
                        ) : (
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '10px' }}>
                                    {photos.map((p, idx) => (
                                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '10px', overflow: 'hidden' }}>
                                            <img src={p} alt={`preview-${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ))}
                                </div>
                                {photos.length < 5 && (
                                    <button 
                                        type="button" 
                                        onClick={() => fileInputRef.current?.click()}
                                        style={{ background: 'rgba(255,255,255,0.1)', border: 'none', padding: '8px 16px', borderRadius: '8px', color: '#fff', fontSize: '0.8rem', cursor: 'pointer' }}
                                    >
                                        Добавить ещё фото ({photos.length}/5)
                                    </button>
                                )}
                            </div>
                        )}
                        <input
                            type="file"
                            multiple
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handlePhotoChange}
                            accept="image/*"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={mode}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                        >
                            {mode === 'single' ? (
                                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '15px' }}>
                                    <div className="form-group">
                                        <label>Название детали</label>
                                        <div className="input-wrapper">
                                            <Clipboard className="input-icon" size={18} />
                                            <input
                                                name="name"
                                                className="auth-input"
                                                placeholder="Например: Передний бампер"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Кол-во</label>
                                        <div className="input-wrapper">
                                            <input
                                                name="quantity"
                                                type="number"
                                                min="1"
                                                defaultValue="1"
                                                className="auth-input"
                                                style={{ paddingLeft: '15px', textAlign: 'center' }}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="form-group">
                                    <label>Список/Описание деталей</label>
                                    <div className="input-wrapper">
                                        <FileText className="input-icon" size={18} style={{ top: '15px' }} />
                                        <textarea
                                            name="description"
                                            className="auth-input"
                                            placeholder="Перечислите детали через запятую или опишите запрос..."
                                            style={{ height: '100px', paddingLeft: '48px', paddingTop: '15px' }}
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="form-group">
                                    <label>Марка</label>
                                    <div className="input-wrapper">
                                        <Car className="input-icon" size={18} />
                                        <select
                                            name="brand"
                                            className="auth-input"
                                            required
                                            value={selectedBrand}
                                            onChange={(e) => {
                                                setSelectedBrand(e.target.value);
                                                setSelectedModel('');
                                            }}
                                            style={{
                                                appearance: 'none',
                                                paddingRight: '35px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0\' fill=\'none\' stroke=\'rgba(255,255,255,0.3)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center'
                                            }}
                                        >
                                            <option value="" disabled>Выберите марку</option>
                                            {brands.map(b => (
                                                <option key={b.id} value={b.name}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Модель</label>
                                    <div className="input-wrapper">
                                        <Car className="input-icon" size={18} />
                                        <select
                                            name="model"
                                            className="auth-input"
                                            required
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            style={{
                                                appearance: 'none',
                                                paddingRight: '35px',
                                                background: 'rgba(255, 255, 255, 0.05)',
                                                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0\' fill=\'none\' stroke=\'rgba(255,255,255,0.3)\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                                                backgroundRepeat: 'no-repeat',
                                                backgroundPosition: 'right 10px center'
                                            }}
                                            disabled={!selectedBrand}
                                        >
                                            <option value="" disabled>Выберите модель</option>
                                            {selectedBrand && brandModels[selectedBrand.toLowerCase()]?.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Год выпуска</label>
                                <div className="input-wrapper">
                                    <Hash className="input-icon" size={18} />
                                    <input name="year" className="auth-input" placeholder="Например: 2022" required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>VIN номер (необязательно)</label>
                                <div className="input-wrapper">
                                    <Hash className="input-icon" size={18} />
                                    <input name="vin" className="auth-input" placeholder="17 символов" maxLength={17} />
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence >

                    <button type="submit" className="btn-primary auth-submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                        <Send size={18} /> Отправить запрос
                    </button>
                </GlassCard >
            </form >
        </motion.div >
    );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../components/common/UI';
import { Search, X } from 'lucide-react';
import { brands, brandModels } from '../../data/constants';
import { BASE_IMAGE_URL } from '../../services/api';
import { ImageCarousel } from '../../components/common/ImageCarousel';
import { LixiangIcon } from '../../components/common/icons/LixiangIcon';
import { AITOIcon } from '../../components/common/icons/AITOIcon';
import { ZeekrIcon } from '../../components/common/icons/ZeekrIcon';
import { VoyahIcon } from '../../components/common/icons/VoyahIcon';
import { BYDIcon } from '../../components/common/icons/BYDIcon';
import { BMWIcon } from '../../components/common/icons/BMWIcon';
import { CheryIcon } from '../../components/common/icons/CheryIcon';
import { AvatrIcon } from '../../components/common/icons/AvatrIcon';
import { BAICIcon } from '../../components/common/icons/BAICIcon';
import { BestuneIcon } from '../../components/common/icons/BestuneIcon';
import { BMWMIcon } from '../../components/common/icons/BMWMIcon';
import { CadillacIcon } from '../../components/common/icons/CadillacIcon';
import { ChanganIcon } from '../../components/common/icons/ChanganIcon';
import { ChevroletIcon } from '../../components/common/icons/ChevroletIcon';
import { DeepalIcon } from '../../components/common/icons/DeepalIcon';
import { DongfengIcon } from '../../components/common/icons/DongfengIcon';
import { ExeedIcon } from '../../components/common/icons/ExeedIcon';
import { AudiIcon } from '../../components/common/icons/AudiIcon';
import { GACIcon } from '../../components/common/icons/GACIcon';
import { GeelyIcon } from '../../components/common/icons/GeelyIcon';
import { GenesisIcon } from '../../components/common/icons/GenesisIcon';
import { GWMIcon } from '../../components/common/icons/GWMIcon';
import { HondaIcon } from '../../components/common/icons/HondaIcon';
import { HongqiIcon } from '../../components/common/icons/HongqiIcon';
import { HyundaiIcon } from '../../components/common/icons/HyundaiIcon';
import { JetourIcon } from '../../components/common/icons/JetourIcon';
import { KiaIcon } from '../../components/common/icons/KiaIcon';
import { LexusIcon } from '../../components/common/icons/LexusIcon';
import { MaybachIcon } from '../../components/common/icons/MaybachIcon';
import { MercedesAMGIcon } from '../../components/common/icons/MercedesAMGIcon';
import { MercedesBenzIcon } from '../../components/common/icons/MercedesBenzIcon';
import { MGIcon } from '../../components/common/icons/MGIcon';
import { PolestarIcon } from '../../components/common/icons/PolestarIcon';
import { PorscheIcon } from '../../components/common/icons/PorscheIcon';
import { SkodaIcon } from '../../components/common/icons/SkodaIcon';
import { TankIcon } from '../../components/common/icons/TankIcon';
import { TeslaIcon } from '../../components/common/icons/TeslaIcon';
import { ToyotaIcon } from '../../components/common/icons/ToyotaIcon';
import { VolkswagenIcon } from '../../components/common/icons/VolkswagenIcon';
import { VolvoIcon } from '../../components/common/icons/VolvoIcon';
import { XiaomiIcon } from '../../components/common/icons/XiaomiIcon';
import { XpengIcon } from '../../components/common/icons/XpengIcon';



const BrandIconMap = {
    'lixiang': LixiangIcon,
    'aito': AITOIcon,
    'zeekr': ZeekrIcon,
    'voyah': VoyahIcon,
    'byd': BYDIcon,
    'bmw': BMWIcon,
    'chery': CheryIcon,
    'avatr': AvatrIcon,
    'baic': BAICIcon,
    'bestune': BestuneIcon,
    'bmwm': BMWMIcon,
    'cadillac': CadillacIcon,
    'changan': ChanganIcon,
    'chevrolet': ChevroletIcon,
    'deepal': DeepalIcon,
    'dongfeng': DongfengIcon,
    'exeed': ExeedIcon,
    'audi': AudiIcon,
    'gac': GACIcon,
    'geely': GeelyIcon,
    'genesis': GenesisIcon,
    'gwm': GWMIcon,
    'honda': HondaIcon,
    'hongqi': HongqiIcon,
    'hyundai': HyundaiIcon,
    'jetour': JetourIcon,
    'kia': KiaIcon,
    'lexus': LexusIcon,
    'maybach': MaybachIcon,
    'mercedesamg': MercedesAMGIcon,
    'mercedesbenz': MercedesBenzIcon,
    'mg': MGIcon,
    'polestar': PolestarIcon,
    'porsche': PorscheIcon,
    'skoda': SkodaIcon,
    'tank': TankIcon,
    'tesla': TeslaIcon,
    'toyota': ToyotaIcon,
    'volkswagen': VolkswagenIcon,
    'volvo': VolvoIcon,
    'xiaomi': XiaomiIcon,
    'xpeng': XpengIcon,
};

export const Catalog = ({ products = [], fetchProducts, onAddToCart, onOpenRequest }) => {
    useEffect(() => {
        if (fetchProducts) {
            fetchProducts();
        }
    }, [fetchProducts]);
    const [selectedBrand, setSelectedBrand] = useState('hyundai'); // Default to hyundai
    const [selectedModel, setSelectedModel] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [quantities, setQuantities] = useState({}); // { productId: quantity }

    const filtered = products.filter(p => {
        const brandMatch = p.brand.toLowerCase() === selectedBrand.toLowerCase();
        const modelMatch = selectedModel ? p.model.toLowerCase().includes(selectedModel.toLowerCase()) : true;
        const searchMatch = searchQuery
            ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.code.toLowerCase().includes(searchQuery.toLowerCase())
            : true;
        return brandMatch && modelMatch && searchMatch;
    });

    const handleBrandSelect = (brandId) => {
        setSelectedBrand(brandId);
        setSelectedModel(''); // Reset model when brand changes
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <header className="view-header" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                    <h2 style={{ margin: 0 }}>Каталог автозапчастей</h2>

                    <div className="search-wrapper glass">
                        <Search className="search-icon" size={18} />
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск по названию или коду..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button className="search-clear" onClick={() => setSearchQuery('')}>
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Horizontal Brand Scroller */}
                <div className="brand-scroller">
                    {brands.map(brand => {
                        const Icon = BrandIconMap[brand.id];
                        const isActive = selectedBrand === brand.id;
                        return (
                            <div
                                key={brand.id}
                                className={`brand-item ${isActive ? 'active' : ''}`}
                                onClick={() => handleBrandSelect(brand.id)}
                            >
                                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                                    {Icon && <Icon color="currentColor" size={40} />}
                                </div>
                                <span className="brand-name">{brand.name}</span>
                            </div>
                        );
                    })}
                </div>
            </header>

            <div className="catalog-container">
                {/* Models Sidebar */}
                <aside className="model-sidebar glass" style={{ padding: '20px' }}>
                    <h4 style={{ marginBottom: '15px', fontSize: '0.8rem', opacity: 0.5, textTransform: 'uppercase' }}>Модели</h4>
                    <div
                        className={`model-item ${selectedModel === '' ? 'active' : ''}`}
                        onClick={() => setSelectedModel('')}
                    >
                        Все модели
                    </div>
                    {brandModels[selectedBrand]?.map(model => (
                        <div
                            key={model}
                            className={`model-item ${selectedModel === model ? 'active' : ''}`}
                            onClick={() => setSelectedModel(model)}
                        >
                            {model}
                        </div>
                    ))}
                </aside>

                {/* Parts Grid */}
                <main className="catalog-main">
                    <div className="results-grid">
                        <AnimatePresence mode="popLayout">
                            {filtered.length > 0 ? (
                                filtered.map(item => (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <GlassCard className="part-card" style={{ padding: '0', overflow: 'hidden' }}>
                                            <div className="part-image-container" style={{ height: '160px', background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                                                <ImageCarousel images={item.image_url} height="100%" />
                                            </div>
                                            <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: '2px' }}>
                                                    {item.brand.toUpperCase()} {item.model.toUpperCase()}
                                                </div>
                                                <div style={{ 
                                                    fontWeight: 700, 
                                                    fontSize: '0.8rem', 
                                                    lineHeight: '1.2', 
                                                    height: '2.4em', 
                                                    overflow: 'hidden', 
                                                    display: '-webkit-box', 
                                                    WebkitLineClamp: 2, 
                                                    WebkitBoxOrient: 'vertical',
                                                    color: '#fff',
                                                    marginBottom: '4px'
                                                }}>
                                                    {item.name}
                                                </div>
                                                <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)', marginBottom: '8px' }}>
                                                    {item.code}
                                                </div>
                                                
                                                <div style={{ marginTop: 'auto' }}>
                                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent-blue)', marginBottom: '8px' }}>
                                                        ${item.price}
                                                    </div>
                                                    
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {/* Row with Support and Quantity */}
                                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                            {/* Support Button */}
                                                            <button 
                                                                style={{ 
                                                                    background: 'rgba(255,255,255,0.05)', 
                                                                    border: '1px solid rgba(255,255,255,0.1)', 
                                                                    borderRadius: '10px', 
                                                                    color: 'var(--accent-blue)',
                                                                    width: '40px',
                                                                    height: '34px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    cursor: 'pointer'
                                                                }}
                                                                title="Задать вопрос"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const supportUser = 'RezvanMax'; // Ваш юзернейм в Telegram
                                                                    const text = encodeURIComponent(`Здравствуйте! Меня интересует товар:\n📦 ${item.name}\n🔢 Код: ${item.code}\n💰 Цена: $${item.price}`);
                                                                    window.open(`https://t.me/${supportUser}?text=${text}`, '_blank');
                                                                }}
                                                            >
                                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                                            </button>

                                                            {/* Quantity Selector */}
                                                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '4px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                                                <button 
                                                                    style={{ background: 'none', border: 'none', color: '#fff', flex: 1, height: '24px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}
                                                                >
                                                                    -
                                                                </button>
                                                                <span style={{ width: '30px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                                                                    {quantities[item.id] || 1}
                                                                </span>
                                                                <button 
                                                                    style={{ background: 'none', border: 'none', color: '#fff', flex: 1, height: '24px', cursor: 'pointer', fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                                                    onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.min(item.quantity || 999, (prev[item.id] || 1) + 1) }))}
                                                                >
                                                                    +
                                                                </button>
                                                            </div>
                                                        </div>
                                                        
                                                        {/* Add to Cart Button */}
                                                        <button
                                                            className="btn-primary"
                                                            style={{ 
                                                                fontSize: '0.7rem', 
                                                                padding: '10px 5px', 
                                                                width: '100%', 
                                                                borderRadius: '10px',
                                                                letterSpacing: '0.5px'
                                                            }}
                                                            onClick={() => onAddToCart({ ...item, quantity: quantities[item.id] || 1 })}
                                                        >
                                                            В корзину
                                                        </button>
                                                    </div>
                                                </div>
                                                {item.quantity && <div style={{ fontSize: '0.7rem', opacity: 0.5, marginTop: '5px', textAlign: 'right' }}>В наличии: {item.quantity} шт</div>}
                                            </div>
                                        </GlassCard>
                                    </motion.div>
                                ))
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <p style={{ opacity: 0.5, gridColumn: '1/-1', textAlign: 'center', padding: '40px' }}>
                                        Нет в наличии для данной модели
                                    </p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>
            </div>
        </motion.div>
    );
};

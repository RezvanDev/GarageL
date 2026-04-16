import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import { BASE_IMAGE_URL } from '../../services/api';

export const ImageCarousel = ({ images = [], height = '100%' }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const photoList = Array.isArray(images) ? images : (typeof images === 'string' ? images.split(',').filter(i => i) : []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isLightboxOpen) return;
            if (e.key === 'Escape') setIsLightboxOpen(false);
            if (e.key === 'ArrowRight') next(e);
            if (e.key === 'ArrowLeft') prev(e);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isLightboxOpen]);

    if (photoList.length === 0) {
        return (
            <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', opacity: 0.2 }}>
                Нет фото
            </div>
        );
    }

    const next = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % photoList.length);
    };

    const prev = (e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + photoList.length) % photoList.length);
    };

    const openLightbox = (e) => {
        e.stopPropagation();
        setIsLightboxOpen(true);
        // Prevent body scroll when lightbox is open
        document.body.style.overflow = 'hidden';
    };

    const closeLightbox = (e) => {
        e.stopPropagation();
        setIsLightboxOpen(false);
        document.body.style.overflow = 'auto';
    };

    return (
        <>
            <div 
                style={{ position: 'relative', height, width: '100%', overflow: 'hidden', background: '#000', cursor: 'pointer' }}
                onClick={openLightbox}
            >
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentIndex}
                        src={`${BASE_IMAGE_URL}${photoList[currentIndex]}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                </AnimatePresence>

                <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', padding: '6px', borderRadius: '50%', color: '#fff', zIndex: 1 }}>
                    <Maximize2 size={16} />
                </div>

                {photoList.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            style={{
                                position: 'absolute', left: '5px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                                width: '24px', height: '24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 2
                            }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={next}
                            style={{
                                position: 'absolute', right: '5px', top: '50%', transform: 'translateY(-50%)',
                                background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%',
                                width: '24px', height: '24px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', zIndex: 2
                            }}
                        >
                            <ChevronRight size={16} />
                        </button>

                        <div style={{
                            position: 'absolute', bottom: '8px', left: '0', width: '100%',
                            display: 'flex', justifyContent: 'center', gap: '4px', zIndex: 2
                        }}>
                            {photoList.map((_, idx) => (
                                <div
                                    key={idx}
                                    style={{
                                        width: '6px', height: '6px', borderRadius: '50%',
                                        background: idx === currentIndex ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)',
                                        transition: 'background 0.3s'
                                    }}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Lightbox Portal/Overlay */}
            <AnimatePresence>
                {isLightboxOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                            background: 'rgba(0,0,0,0.95)', zIndex: 99999,
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                        }}
                        onClick={closeLightbox}
                    >
                        <div style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 100000 }}>
                            <button 
                                onClick={closeLightbox}
                                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', padding: '10px', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div style={{ position: 'relative', width: '90%', height: '80%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={currentIndex}
                                    src={`${BASE_IMAGE_URL}${photoList[currentIndex]}`}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                    onClick={(e) => e.stopPropagation()} // Prevent close when clicking image
                                />
                            </AnimatePresence>
                        </div>

                        {photoList.length > 1 && (
                            <>
                                <button
                                    onClick={prev}
                                    style={{
                                        position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                        width: '50px', height: '50px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 100000, transition: 'background 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <ChevronLeft size={32} />
                                </button>
                                <button
                                    onClick={next}
                                    style={{
                                        position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)',
                                        background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                                        width: '50px', height: '50px', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', zIndex: 100000, transition: 'background 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
                                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                >
                                    <ChevronRight size={32} />
                                </button>

                                <div style={{
                                    position: 'absolute', bottom: '40px', display: 'flex', gap: '8px', zIndex: 100000
                                }}>
                                    {photoList.map((_, idx) => (
                                        <div
                                            key={idx}
                                            onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                                            style={{
                                                width: '10px', height: '10px', borderRadius: '50%',
                                                background: idx === currentIndex ? 'var(--accent-blue)' : 'rgba(255,255,255,0.3)',
                                                transition: 'background 0.3s', cursor: 'pointer'
                                            }}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

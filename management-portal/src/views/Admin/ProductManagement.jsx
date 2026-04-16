import React, { useState, useEffect } from 'react';
import { BASE_IMAGE_URL } from '../../services/api';
import { Plus, Search, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';
import { CAR_BRANDS } from '../../constants/carBrands';
import { ProductFormModal } from '../../components/products/ProductFormModal';
import { SuccessModal } from '../../components/ui/SuccessModal';
import { ProductTable } from '../../components/products/ProductTable';



export const ProductManagement = () => {
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showUnapproved, setShowUnapproved] = useState(false);
    const [approvingProduct, setApprovingProduct] = useState(null);
    const [finalPrice, setFinalPrice] = useState('');
    const [currentProduct, setCurrentProduct] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [formData, setFormData] = useState({
        brand: '',
        model: '',
        name: '',
        code: '',
        price: '',
        quantity: 1,
        description: '',
        image_url: ''
    });

    const { products, loading, createProduct, updateProduct, deleteProduct, approveProduct, setFilters } = useProducts({
        includeUnapproved: showUnapproved ? 'true' : 'false'
    });

    useEffect(() => {
        setFilters({ includeUnapproved: showUnapproved ? 'true' : 'false' });
    }, [showUnapproved, setFilters]);

    const handleOpenModal = (product = null) => {
        if (product) {
            setCurrentProduct(product);
            setFormData({
                brand: product.brand,
                model: product.model,
                name: product.name,
                code: product.code,
                price: user?.role === 'supplier' ? (product.supplier_price || product.price) : product.price,
                quantity: product.quantity || 1,
                description: product.description || '',
                image_url: product.image_url || ''
            });
        } else {
            setCurrentProduct(null);
            setFormData({
                brand: '',
                model: '',
                name: '',
                code: '',
                price: '',
                quantity: 1,
                description: '',
                image_url: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

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
                setFormData(prev => {
                    const currentUrls = prev.image_url ? prev.image_url.split(',').filter(Boolean) : [];
                    if (currentUrls.length < 5) {
                        currentUrls.push(result.imageUrl);
                    }
                    return { ...prev, image_url: currentUrls.join(',') };
                });
            } else {
                alert('Upload failed: ' + result.message);
            }
        } catch (err) {
            alert('Upload error: ' + err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentProduct) {
                await updateProduct(currentProduct.id, formData);
                setIsModalOpen(false);
            } else {
                await createProduct(formData);
                setIsModalOpen(false);
                if (user?.role === 'supplier') {
                    setShowSuccessMessage(true);
                }
            }
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) return;
        try {
            await deleteProduct(id);
        } catch (err) {
            alert('Error: ' + err.message);
        }
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchTerm.toLowerCase());

        if (user?.role === 'admin') {
            if (showUnapproved) {
                return matchesSearch && !p.is_approved; // Only pending
            } else {
                return matchesSearch && p.is_approved; // Only published
            }
        }

        return matchesSearch;
    });

    return (
        <div className="fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>
                    {user?.role === 'supplier' ? 'Мои товары' : 'Товары'}
                </h2>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '250px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '15px', color: 'var(--text-dim)' }} />
                        <input
                            type="text"
                            placeholder="Поиск..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 15px 10px 45px',
                                background: 'var(--glass-bg)',
                                border: '1px solid var(--glass-border)',
                                borderRadius: '10px',
                                color: '#fff',
                                outline: 'none'
                            }}
                        />
                    </div>
                    {user?.role === 'supplier' && (
                        <button className="btn-primary" onClick={() => handleOpenModal()} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Plus size={20} /> Товар
                        </button>
                    )}
                </div>
            </div>

            {user?.role === 'admin' && (
                <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '10px' }}>
                    <button
                        className={`btn-${showUnapproved ? 'primary' : 'secondary'}`}
                        onClick={() => setShowUnapproved(true)}
                        style={{ flex: 1 }}
                    >
                        На модерации ({products.filter(p => !p.is_approved).length})
                    </button>
                    <button
                        className={`btn-${!showUnapproved ? 'primary' : 'secondary'}`}
                        onClick={() => setShowUnapproved(false)}
                        style={{ flex: 1 }}
                    >
                        Одобренные
                    </button>
                </div>
            )}

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', borderRadius: '16px', padding: '20px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Все товары</h2>
                </div>

                <ProductTable
                    products={filteredProducts}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                    isSupplier={user?.role === 'supplier'}
                />
            </div>

            {/* Modals placed outside any role-specific wrapping */}
            {approvingProduct && (
                <div className="modal-overlay" onClick={() => setApprovingProduct(null)}>
                    <div className="glass-card modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '20px' }}>Одобрение товара</h3>
                        <div style={{ marginBottom: '20px', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', fontSize: '0.9rem' }}>
                            <p><strong>Товар:</strong> {approvingProduct.name}</p>
                            <p><strong>Цена поставщика:</strong> ${approvingProduct.price}</p>
                        </div>
                        <form onSubmit={handleApprove}>
                            <div className="form-group">
                                <label>Итоговая цена для клиентов ($)</label>
                                <input
                                    type="number"
                                    value={finalPrice}
                                    onChange={e => setFinalPrice(e.target.value)}
                                    required
                                    autoFocus
                                />
                                <p style={{ fontSize: '0.75rem', color: 'var(--accent-blue)', marginTop: '8px' }}>
                                    Ваша маржа: ${(finalPrice - approvingProduct.price).toFixed(2)}
                                </p>
                            </div>
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="button" className="btn-secondary" onClick={() => setApprovingProduct(null)} style={{ flex: 1 }}>Отмена</button>
                                <button type="submit" className="btn-primary" style={{ flex: 2 }}>ОДОБРИТЬ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ProductFormModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setCurrentProduct(null);
                    setFormData({ brand: '', model: '', name: '', code: '', price: '', quantity: 1, description: '', image_url: '' });
                }}
                currentProduct={currentProduct}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
                onImageUpload={handleFileUpload}
                isUploading={isUploading}
                userRole={user?.role}
                userAllowedBrands={user?.allowed_brands}
            />

            <SuccessModal
                isOpen={showSuccessMessage}
                onClose={() => setShowSuccessMessage(false)}
                title="Товар успешно отправлен!"
                message="Ваш товар был передан администратору на проверку. После одобрения он автоматически появится в каталоге для всех клиентов."
            />
        </div>
    );
};

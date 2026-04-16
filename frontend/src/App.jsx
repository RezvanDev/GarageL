import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Truck, Package, MapPin, CheckCircle2, Loader2, Image as ImageIcon } from 'lucide-react';
import { ImageCarousel } from './components/common/ImageCarousel';

// Common components
import { Modal } from './components/common/Modal';

// Layout components
import { Navbar, Footer } from './components/layout/Layout';

// Views
import { Dashboard } from './views/Dashboard/Dashboard';
import { Catalog } from './views/Catalog/Catalog';
import { Orders } from './views/Orders/Orders';
import { Cart } from './views/Cart/Cart';
import { Auth } from './views/Auth/Auth';
import { RequestView } from './views/Request/RequestView';

// State hook
import { useGarageState } from './hooks/useGarageState';

// Initialize Telegram Web App
const tg = window.Telegram?.WebApp;
if (tg) {
  tg.ready();
  tg.expand();
  // Enable the background to be stable
  if (tg.enableClosingConfirmation) {
    tg.enableClosingConfirmation();
  }
}

export default function App() {
  const {
    user,
    view,
    orders,
    cart,
    products,
    isLoading,
    error,
    navigate,
    login,
    register,
    logout,
    addToCart,
    addOrder,
    updateOrderStatus,
    fetchProducts,
    fetchOrderOffers,
    selectOffer
  } = useGarageState();

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderOffers, setOrderOffers] = useState([]);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [offerQuantities, setOfferQuantities] = useState({});
  const [selectedDeliveryMethod, setSelectedDeliveryMethod] = useState(null); // 'air' or 'truck'

  // Fetch offers when an order with 'offered' status is selected
  React.useEffect(() => {
    if (selectedOrder && selectedOrder.status === 'offer_created') {
      fetchOrderOffers(selectedOrder.id).then(offers => {
        setOrderOffers(offers);
      });
    } else {
      setOrderOffers([]);
    }
  }, [selectedOrder, fetchOrderOffers]);

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    addOrder(fd.get('item'), fd.get('car'), '', null);
    setIsRequestModalOpen(false);
  };

  const BASE_IMAGE_URL = window.location.hostname === 'localhost' ? 'http://localhost:5001' : '';

  return (
    <div className="dark-theme">
      <AnimatePresence mode="wait">
        {!user ? (
          <Auth
            key="auth"
            onLogin={login}
            onRegister={register}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <motion.div
            key="app-main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="app-container"
          >
            <Navbar currentView={view} onNavigate={navigate} user={user} onLogout={logout} />

            <main id="app-content">
              <AnimatePresence mode="wait">
                {view === 'dashboard' && <Dashboard key="dash" onNavigate={navigate} user={user} />}
                {view === 'catalog' && (
                  <Catalog
                    key="cat"
                    products={products}
                    fetchProducts={fetchProducts}
                    onAddToCart={addToCart}
                    onOpenRequest={() => navigate('request')}
                  />
                )}
                {view === 'orders' && (
                    <Orders
                      key="ord"
                      orders={orders}
                      onSelectOrder={setSelectedOrder}
                      user={user}
                    />
                )}
                {view === 'request' && <RequestView key="req" onBack={() => navigate('dashboard')} onSubmit={addOrder} />}
                {view === 'cart' && <Cart key="cart" cart={cart} />}
              </AnimatePresence>
            </main>

            <Footer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal: Custom Request */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Новый запрос"
      >
        <form onSubmit={handleRequestSubmit}>
          <div className="form-group">
            <label>Что ищем?</label>
            <input name="item" required placeholder="Например: Передний бампер" />
          </div>
          <div className="form-group">
            <label>Марка и модель</label>
            <input name="car" placeholder="Hyundai Sonata 2021" />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>Отправить</button>
        </form>
      </Modal>

      {/* Modal: Order Details */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={selectedOrder ? `Заказ #${selectedOrder.id}` : ''}
      >
        {selectedOrder && (
          <div style={{ paddingBottom: '20px' }}>
            {/* 1. Brief Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{selectedOrder.item_name || selectedOrder.item} {selectedOrder.quantity > 1 ? `(x${selectedOrder.quantity} шт)` : ''}</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem' }}>{selectedOrder.car_info || selectedOrder.car}</p>
              </div>
              <div style={{
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: 'rgba(14,165,233, 0.1)',
                color: '#0ea5e9'
              }}>
                {selectedOrder.status.toUpperCase()}
              </div>
            </div>

            {/* 2. Stepper Progress */}
            <div style={{ display: 'flex', gap: '5px', marginBottom: '25px', opacity: 0.8 }}>
              {['created', 'offer_created', 'paid_product', 'shipped_by_seller', 'waiting_delivery_payment', 'shipped_to_uzbekistan', 'delivered'].map((s, i, arr) => {
                const currentIdx = arr.indexOf(selectedOrder.status);
                const isActive = i <= (currentIdx === -1 ? 0 : currentIdx);
                return (
                  <div key={s} style={{ 
                    flex: 1, 
                    height: '4px', 
                    borderRadius: '2px', 
                    background: isActive ? 'var(--accent-blue)' : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 10px var(--accent-blue)' : 'none'
                  }} />
                );
              })}
            </div>

            {/* 3. Conditional Content based on Status */}
            {selectedOrder.status === 'created' && (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Package size={40} style={{ opacity: 0.2, marginBottom: '10px' }} />
                <p style={{ opacity: 0.6 }}>Ваш запрос на рассмотрении. Скоро здесь появятся предложения от поставщиков.</p>
              </div>
            )}

            {selectedOrder.status === 'offer_created' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '-10px' }}>Предложения от поставщиков</h3>
                
                {orderOffers.map((offer) => (
                  <div key={offer.id} className="glass-card" style={{ padding: '0', border: '1px solid rgba(255,255,255,0.1)', overflow: 'hidden' }}>
                    {/* Offer Header: Image & Main Info */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
                        <div style={{ width: '100px', height: '100px', borderRadius: '12px', overflow: 'hidden', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }}>
                          <ImageCarousel images={offer.photo_url} height="100%" />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <span style={{ 
                              fontSize: '0.65rem', 
                              fontWeight: 900, 
                              background: offer.condition === 'new' ? '#0ea5e9' : '#f59e0b', 
                              color: '#fff',
                              padding: '3px 8px', 
                              borderRadius: '6px',
                              textTransform: 'uppercase'
                            }}>
                              {offer.condition === 'new' ? 'Новый' : 'Б/У'}
                            </span>
                            <span style={{ fontWeight: 800, fontSize: '1.5rem', color: '#10b981' }}>${offer.final_price || offer.price}</span>
                          </div>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '8px', lineHeight: 1.2 }}>{offer.item_name}</h4>
                          <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '4px' }}>Срок: {offer.delivery_time || '3-5 дней'}</p>
                        </div>
                      </div>

                      {/* Delivery Selection */}
                      <div style={{ 
                        padding: '15px', 
                        background: 'rgba(255,255,255,0.03)', 
                        borderRadius: '12px', 
                        border: '1px solid rgba(255,255,255,0.05)',
                        marginBottom: '15px'
                      }}>
                        <p style={{ fontSize: '0.85rem', fontWeight: 600, opacity: 0.8, marginBottom: '10px' }}>Выберите способ доставки:</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => setSelectedDeliveryMethod('air')}
                            style={{ 
                              flex: 1, 
                              padding: '12px 8px', 
                              borderRadius: '10px', 
                              border: selectedDeliveryMethod === 'air' ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.1)', 
                              background: selectedDeliveryMethod === 'air' ? 'rgba(14,165,233,0.1)' : 'transparent',
                              color: selectedDeliveryMethod === 'air' ? 'var(--accent-blue)' : '#fff',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>✈️</span>
                            Авиа ($13/кг)
                          </button>
                          <button 
                            onClick={() => setSelectedDeliveryMethod('truck')}
                            style={{ 
                              flex: 1, 
                              padding: '12px 8px', 
                              borderRadius: '10px', 
                              border: selectedDeliveryMethod === 'truck' ? '2px solid var(--accent-blue)' : '1px solid rgba(255,255,255,0.1)', 
                              background: selectedDeliveryMethod === 'truck' ? 'rgba(14,165,233,0.1)' : 'transparent',
                              color: selectedDeliveryMethod === 'truck' ? 'var(--accent-blue)' : '#fff',
                              fontSize: '0.8rem',
                              fontWeight: 700,
                              transition: 'all 0.2s',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>🚛</span>
                            Авто ($6/кг)
                          </button>
                        </div>
                      </div>

                      <button
                        className="btn-primary"
                        style={{ width: '100%', padding: '15px', fontWeight: 800, fontSize: '1rem' }}
                        onClick={async () => {
                          if (!selectedDeliveryMethod) return alert('Пожалуйста, выберите способ доставки (Авиа или Авто)');
                          await selectOffer(selectedOrder.id, offer.id, selectedDeliveryMethod);
                          setSelectedOrder(null);
                        }}
                      >
                        ВЫБРАТЬ И ОПЛАТИТЬ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedOrder.status === 'offer_selected' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>💰</div>
                <h3>Ожидание оплаты товара</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '10px' }}>
                  Пожалуйста, произведите оплату ${selectedOrder.price} и отправьте подтверждение админу. 
                  Ваш товар будет выкуплен сразу после подтверждения.
                </p>
              </div>
            )}

            {selectedOrder.status === 'paid_product' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle2 color="#10b981" size={50} style={{ margin: '0 auto 15px' }} />
                <h3>Товар оплачен!</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '10px' }}>
                  Поставщик готовит товар к отправке на наш склад в Китае.
                </p>
              </div>
            )}

            {selectedOrder.status === 'shipped_by_seller' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <Truck size={50} color="var(--accent-blue)" style={{ margin: '0 auto 15px' }} />
                <h3>В пути на склад</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '10px' }}>
                  Товар отправлен поставщиком. Трек-номер: <br/>
                  <strong style={{ color: 'var(--accent-blue)' }}>{selectedOrder.track_number}</strong>
                </p>
              </div>
            )}

            {selectedOrder.status === 'waiting_delivery_payment' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Товар на складе в Китае 🇨🇳</h4>
                  <div style={{ width: '100%', height: '150px', borderRadius: '10px', overflow: 'hidden', marginBottom: '15px' }}>
                    <ImageCarousel images={selectedOrder.warehouse_photo_url} height="100%" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
                    <div>Вес: <strong>{selectedOrder.weight} кг</strong></div>
                    <div>Размеры: <strong>{selectedOrder.dimensions}</strong></div>
                  </div>
                </div>
                
                <div style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <p style={{ fontSize: '0.85rem', opacity: 0.7 }}>К оплате за доставку:</p>
                  <h2 style={{ color: '#10b981', margin: '5px 0' }}>${selectedOrder.shipping_price}</h2>
                  <p style={{ fontSize: '0.75rem', opacity: 0.5 }}>После оплаты товар будет отправлен в Узбекистан</p>
                </div>
              </div>
            )}

            {selectedOrder.status === 'delivery_paid' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <CheckCircle2 color="#10b981" size={50} style={{ margin: '0 auto 15px' }} />
                <h3>Доставка оплачена!</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '10px' }}>
                  Товар готовится к вылету/выезду из Китая.
                </p>
              </div>
            )}

            {selectedOrder.status === 'shipped_to_uzbekistan' && (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🛫</div>
                <h3>Летит в Узбекистан</h3>
                <p style={{ opacity: 0.6, fontSize: '0.9rem', marginTop: '10px' }}>
                   Ожидаемое время прибытия: {selectedOrder.delivery_method === 'air' ? '3-7 дней' : '10-15 дней'}.
                </p>
                {selectedOrder.shipping_track_number && (
                   <p style={{ marginTop: '10px', fontSize: '0.85rem' }}>Рейс/Трек: <strong>{selectedOrder.shipping_track_number}</strong></p>
                )}
              </div>
            )}

            {selectedOrder.status === 'delivered' && (
              <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '15px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎁</div>
                <h3 style={{ color: '#10b981' }}>Прибыл в Ташкент!</h3>
                <p style={{ opacity: 0.8, fontSize: '0.9rem', marginTop: '10px' }}>
                  Товар готов к выдаче на складе. При получении назовите код: 
                  <br/><strong style={{ fontSize: '1.2rem', color: 'var(--accent-blue)' }}>{user.user_code}</strong>
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}


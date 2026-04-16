import { useState, useCallback, useEffect } from 'react';
import { api } from '../services/api';

export const useGarageState = () => {
    const [user, setUser] = useState(null);
    const [view, setView] = useState('catalog');
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // --- Utility Functions (Define these first to avoid hoisting issues) ---

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setOrders([]);
        setView('dashboard');
    }, []);

    const navigate = useCallback((v) => {
        setView(v);
        window.scrollTo(0, 0);
    }, []);

    const fetchProducts = useCallback(async (filters = {}) => {
        setIsLoading(true);
        try {
            const res = await api.products.getAll(filters);
            setProducts(res.data.products);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchOrders = useCallback(async () => {
        if (!user) return;
        try {
            const res = await api.orders.getMy();
            setOrders(res.data.orders);
        } catch (err) {
            console.error('Failed to fetch orders:', err.message);
            if (err.message.includes('token') || err.message.includes('logged in')) {
                logout();
            }
        }
    }, [user, logout]);

    // --- Auth Actions ---

    const login = useCallback(async (phone, password) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.auth.login(phone, password);
            const { token, data } = res;
            const user = data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            await fetchOrders();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchOrders]);

    const register = useCallback(async (phone, password, name) => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await api.auth.register(phone, password, name);
            const { token, data } = res;
            const user = data.user;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            setUser(user);
            await fetchOrders();
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchOrders]);

    // --- Order/Cart Actions ---

    const addToCart = useCallback((item) => {
        setCart(prev => [...prev, item]);
        alert('Добавлено в корзину!');
        navigate('cart');
    }, [navigate]);

    const addOrder = useCallback(async (itemName, carInfo, description, photoFiles, carBrand, year, quantity) => {
        setIsLoading(true);
        try {
            let photoUrl = null;

            // 1. Upload photos if exist
            const filesArray = Array.isArray(photoFiles) ? photoFiles : (photoFiles ? [photoFiles] : []);
            
            if (filesArray.length > 0) {
                const uploadPromises = filesArray.map(async (file) => {
                    if (typeof file === 'string') return file; // Already URL
                    
                    const formData = new FormData();
                    formData.append('image', file);

                    const uploadRes = await fetch(`${api.baseUrl}/upload/order-image`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            'ngrok-skip-browser-warning': 'true'
                        },
                        body: formData
                    });

                    const uploadData = await uploadRes.json();
                    if (uploadData.status === 'success') {
                        return uploadData.imageUrl;
                    }
                    return null;
                });
                
                const urls = await Promise.all(uploadPromises);
                const validUrls = urls.filter(u => u !== null);
                if (validUrls.length > 0) {
                    photoUrl = validUrls.join(',');
                }
            }

            // 2. Create order
            await api.orders.create({
                itemName,
                carInfo,
                description,
                photoUrl,
                carBrand,
                year,
                quantity
            });
            await fetchOrders();
            navigate('orders');
        } catch (err) {
            alert('Ошибка при создании заказа: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    }, [navigate, fetchOrders]);

    const updateOrderStatus = useCallback((id, nextStatus, nextText) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: nextStatus, statusText: nextText } : o));
    }, []);

    const fetchOrderOffers = useCallback(async (orderId) => {
        setIsLoading(true);
        try {
            const res = await api.orders.getOffers(orderId);
            return res.data.offers;
        } catch (err) {
            console.error('Failed to fetch order offers:', err);
            return [];
        } finally {
            setIsLoading(false);
        }
    }, []);

    const selectOffer = useCallback(async (orderId, offerId, deliveryMethod) => {
        setIsLoading(true);
        try {
            await api.orders.selectOffer({ orderId, offerId, deliveryMethod });
            await fetchOrders();
            return true;
        } catch (err) {
            alert('Error selecting offer: ' + err.message);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, [fetchOrders]);

    // --- Effects (Dependency arrays now have access to initialized variables) ---

    useEffect(() => {
        fetchProducts();

        const savedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (savedUser && token && token !== 'undefined') {
            try {
                const parsedUser = JSON.parse(savedUser);
                setUser(parsedUser);
                api.orders.getMy().then(res => setOrders(res.data.orders)).catch((err) => {
                    if (err.message.includes('token') || err.message.includes('logged in')) {
                        logout();
                    }
                });
            } catch (e) {
                logout();
            }
        }
    }, [fetchProducts, logout]);

    return {
        user,
        view,
        products,
        orders,
        cart,
        isLoading,
        error,
        navigate,
        login,
        register,
        logout,
        addToCart,
        addOrder,
        fetchProducts,
        updateOrderStatus,
        fetchOrderOffers,
        selectOffer
    };
};

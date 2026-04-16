const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_URL = isLocal ? 'http://localhost:5001/api/v1' : '/api/v1';
export const BASE_IMAGE_URL = isLocal ? 'http://localhost:5001' : '';

const getHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

        if (response.status === 204) {
            return null;
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    },

    auth: {
        login: (phone, password) =>
            api.request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ phone, password })
            }),
        register: (phone, password, name) =>
            api.request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ phone, password, name })
            }),
        me: () => api.request('/auth/me')
    },

    products: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return api.request(`/products?${query}`);
        },
        create: (productData) =>
            api.request('/products', {
                method: 'POST',
                body: JSON.stringify(productData)
            }),
        update: (id, productData) =>
            api.request(`/products/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(productData)
            }),
        delete: (id) =>
            api.request(`/products/${id}`, {
                method: 'DELETE'
            }),
        approve: (id, price) =>
            api.request(`/products/${id}/approve`, {
                method: 'PATCH',
                body: JSON.stringify({ price })
            })
    },

    orders: {
        getAll: () => api.request('/orders'),
        getMy: () => api.request('/orders/my'),
        create: (orderData) =>
            api.request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            }),
        updateStatus: (id, status, car_info) =>
            api.request(`/orders/${id}/status`, {
                method: 'PATCH',
                body: JSON.stringify({ status, car_info })
            }),
        getPending: () => api.request('/orders/pending'),
        respond: (payload) =>
            api.request('/orders/respond', {
                method: 'POST',
                body: JSON.stringify(payload)
            }),
        getPendingOffers: () => api.request('/orders/pending-offers'),
        approveOffer: (offerId, payload) =>
            api.request(`/orders/offers/${offerId}/approve`, {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }),
        getByStatus: (statuses) => api.request(`/orders/by-status?statuses=${statuses}`),
        selectOffer: (payload) =>
            api.request('/orders/select-offer', {
                method: 'POST',
                body: JSON.stringify(payload)
            }),
        updateTrack: (payload) =>
            api.request('/orders/update-track', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }),
        receiveWarehouse: (payload) =>
            api.request('/orders/receive-warehouse', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }),
        confirmProductPayment: (orderId) =>
            api.request(`/orders/${orderId}/confirm-product-payment`, {
                method: 'PATCH'
            }),
        confirmDeliveryPayment: (orderId) =>
            api.request(`/orders/${orderId}/confirm-delivery-payment`, {
                method: 'PATCH'
            }),
        shipToUz: (payload) =>
            api.request('/orders/ship-to-uz', {
                method: 'PATCH',
                body: JSON.stringify(payload)
            }),
        markDelivered: (orderId) =>
            api.request(`/orders/${orderId}/mark-delivered`, {
                method: 'PATCH'
            }),
        getLogisticsStats: () => api.request('/orders/logistics-stats')
    },

    admin: {
        getUsers: () => api.request('/auth/users'),
        updateUserRole: (id, role) =>
            api.request(`/auth/users/${id}/role`, {
                method: 'PATCH',
                body: JSON.stringify({ role })
            }),
        deleteUser: (id) =>
            api.request(`/auth/users/${id}`, {
                method: 'DELETE'
            }),
        createUser: (data) =>
            api.request('/auth/register', { // Using the existing register endpoint since it creates users
                method: 'POST',
                body: JSON.stringify(data)
            }),
        getUserOrders: (id) => api.request(`/auth/users/${id}/orders`)
    }
};

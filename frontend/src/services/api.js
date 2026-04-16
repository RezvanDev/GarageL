const API_URL = '/api/v1';
export const BASE_IMAGE_URL = window.location.origin;

const getHeaders = () => {
    const token = localStorage.getItem('token');
    const isValidToken = token && token !== 'undefined' && token !== 'null';
    return {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
        ...(isValidToken ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const api = {
    baseUrl: API_URL,
    async request(endpoint, options = {}) {
        const response = await fetch(`${API_URL}${endpoint}`, {
            ...options,
            headers: {
                ...getHeaders(),
                ...options.headers
            }
        });

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
            })
    },

    products: {
        getAll: (params = {}) => {
            const query = new URLSearchParams(params).toString();
            return api.request(`/products?${query}`);
        }
    },

    orders: {
        create: (orderData) =>
            api.request('/orders', {
                method: 'POST',
                body: JSON.stringify(orderData)
            }),
        getMy: () => api.request('/orders/my'),
        getOffers: (orderId) => api.request(`/orders/${orderId}/offers`),
        selectOffer: (payload) => api.request('/orders/select-offer', {
            method: 'POST',
            body: JSON.stringify(payload)
        })
    }
};

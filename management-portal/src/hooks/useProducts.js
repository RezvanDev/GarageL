import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

/**
 * Hook for fetching and managing the product list.
 * @param {object} initialFilters - initial query filters (e.g. { includeUnapproved: 'false' })
 */
export const useProducts = (initialFilters = {}) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    const fetchProducts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.products.getAll(filters);
            setProducts(data.data.products || []);
        } catch (err) {
            console.error('Failed to fetch products:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const createProduct = async (productData) => {
        const result = await api.products.create(productData);
        await fetchProducts();
        return result;
    };

    const updateProduct = async (id, productData) => {
        const result = await api.products.update(id, productData);
        await fetchProducts();
        return result;
    };

    const deleteProduct = async (id) => {
        await api.products.delete(id);
        await fetchProducts();
    };

    const approveProduct = async (id, price) => {
        const result = await api.products.approve(id, price);
        await fetchProducts();
        return result;
    };

    return {
        products,
        loading,
        error,
        filters,
        setFilters,
        refetch: fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        approveProduct,
    };
};

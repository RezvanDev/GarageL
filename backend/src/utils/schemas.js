const { z } = require('zod');

// --- Helper Coercions ---
const coercedInt = z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseInt(val, 10);
        return isNaN(parsed) ? val : parsed;
    }
    return val;
}, z.number().int());

const coercedNumber = z.preprocess((val) => {
    if (typeof val === 'string' && val.trim() !== '') {
        const parsed = parseFloat(val);
        return isNaN(parsed) ? val : parsed;
    }
    return val;
}, z.number());

// --- Authentication Schemas ---

const registerSchema = z.object({
    body: z.object({
        phone: z.string().min(5, 'Phone number too short').max(20, 'Phone number too long'),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        name: z.string().max(100).optional(),
        role: z.enum(['client', 'supplier', 'logist', 'admin']).optional(),
        allowedBrands: z.array(z.string()).optional(),
        allowedCategories: z.array(z.string()).optional(),
        logisticsType: z.enum(['air', 'truck']).nullable().optional(),
    }),
});

const loginSchema = z.object({
    body: z.object({
        phone: z.string().min(5),
        password: z.string().min(1),
    }),
});

const updateRoleSchema = z.object({
    params: z.object({
        id: coercedInt,
    }),
    body: z.object({
        role: z.enum(['client', 'supplier', 'logist', 'admin']),
        allowedBrands: z.array(z.string()).nullable().optional(),
        allowedCategories: z.array(z.string()).nullable().optional(),
        logisticsType: z.enum(['air', 'truck']).nullable().optional(),
    }),
});

const telegramSyncSchema = z.object({
    body: z.object({
        initData: z.string().min(1, 'initData is required'),
    }),
});

// --- Product Schemas ---

const getAllProductsSchema = z.object({
    query: z.object({
        brand: z.string().optional(),
        model: z.string().optional(),
        search: z.string().optional(),
        includeUnapproved: z.string().optional(),
    }),
});

const createProductSchema = z.object({
    body: z.object({
        brand: z.string().min(1, 'Brand is required').max(50),
        model: z.string().min(1, 'Model is required').max(50),
        name: z.string().min(1, 'Name is required').max(200),
        code: z.string().min(1, 'Code is required').max(100),
        price: coercedNumber.refine((val) => val > 0, 'Price must be positive'),
        description: z.string().max(1000).optional(),
        image_url: z.string().max(500).optional(),
        quantity: coercedInt.refine((val) => val >= 0, 'Quantity cannot be negative').optional(),
    }),
});

const updateProductSchema = z.object({
    params: z.object({
        id: coercedInt,
    }),
    body: z.object({
        brand: z.string().max(50).optional(),
        model: z.string().max(50).optional(),
        name: z.string().max(200).optional(),
        code: z.string().max(100).optional(),
        price: coercedNumber.refine((val) => val > 0, 'Price must be positive').optional(),
        description: z.string().max(1000).optional(),
        image_url: z.string().max(500).optional(),
        quantity: coercedInt.refine((val) => val >= 0, 'Quantity cannot be negative').optional(),
    }),
});

// --- Order Schemas ---

const createOrderSchema = z.object({
    body: z.object({
        productId: coercedInt.optional(),
        deliveryMethod: z.enum(['air', 'truck']).optional(),
        itemName: z.string().max(200).optional(),
        carInfo: z.string().max(200).optional(),
        description: z.string().max(1000).optional(),
        photoUrl: z.string().max(500).optional(),
        carBrand: z.string().max(50).optional(),
        year: z.string().max(4).optional(),
        quantity: coercedInt.refine((val) => val > 0, 'Quantity must be greater than 0').optional(),
        category: z.string().max(50).optional(),
    }),
});

const respondToOrderSchema = z.object({
    body: z.object({
        orderId: coercedInt,
        offers: z.array(
            z.object({
                price: coercedNumber.refine((val) => val > 0, 'Offer price must be positive'),
                deliveryTime: z.string().max(50).nullable().optional(),
                photoUrl: z.string().max(500).nullable().optional(),
                condition: z.enum(['new', 'used']).optional(),
                itemName: z.string().max(200).nullable().optional(),
                itemCode: z.string().max(100).nullable().optional(),
                comment: z.string().max(500).nullable().optional(),
                year: z.string().max(4).nullable().optional(),
                quantity: coercedInt.refine((val) => val > 0, 'Quantity must be positive').optional(),
            })
        ).min(1, 'At least one offer is required'),
    }),
});

const receiveAtWarehouseSchema = z.object({
    body: z.object({
        orderId: coercedInt,
        weight: coercedNumber.refine((val) => val > 0, 'Weight must be positive'),
        dimensions: z.string().min(1).max(50),
        shippingPrice: coercedNumber.refine((val) => val > 0, 'Shipping price must be positive'),
        photoUrl: z.string().max(500).optional(),
    }),
});

module.exports = {
    registerSchema,
    loginSchema,
    updateRoleSchema,
    telegramSyncSchema,
    getAllProductsSchema,
    createProductSchema,
    updateProductSchema,
    createOrderSchema,
    respondToOrderSchema,
    receiveAtWarehouseSchema,
};

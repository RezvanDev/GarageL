const Product = require('../models/productModel');
const AppError = require('../utils/appError');

exports.getAllProducts = async (req, res, next) => {
    try {
        const { brand, model, search, includeUnapproved } = req.query;

        const filters = {
            brand,
            model,
            search,
        };

        if (req.user?.role === 'supplier') {
            filters.supplier_id = req.user.id;
            filters.includeUnapproved = 'true'; // Suppliers always see their own unapproved products
        } else if (req.user?.role === 'admin' && includeUnapproved === 'true') {
            filters.includeUnapproved = 'true';
        } else {
            filters.includeUnapproved = 'false';
        }

        const products = await Product.getAll(filters);

        res.status(200).json({
            status: 'success',
            results: products.length,
            data: {
                products
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.createProduct = async (req, res, next) => {
    try {
        const data = { ...req.body };
        if (data.quantity) data.quantity = parseInt(data.quantity, 10);

        if (req.user.role === 'supplier') {
            // Check allowed brands
            const allowedBrands = req.user.allowed_brands || [];
            if (allowedBrands.length > 0 && !allowedBrands.includes(data.brand)) {
                return next(new require('../utils/appError')(`У вас нет доступа к добавлению товаров марки ${data.brand}`, 403));
            }

            data.supplier_id = req.user.id;
            data.supplier_price = req.body.price;
            data.is_approved = false;
        } else if (req.user.role === 'admin') {
            data.is_approved = true;
        }

        const product = await Product.create(data);
        res.status(201).json({
            status: 'success',
            data: {
                product
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.approveProduct = async (req, res, next) => {
    try {
        const { price } = req.body;
        if (!price) {
            return res.status(400).json({ status: 'fail', message: 'Please provide final price' });
        }

        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({ status: 'fail', message: 'Product not found' });
        }

        const updateData = {
            price,
            is_approved: true
        };

        // Lock the supplier price to the original CNY price if it was not set
        if (!product.supplier_price) {
            updateData.supplier_price = product.price;
        }

        const updatedProduct = await Product.update(req.params.id, updateData);

        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProduct
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.updateProduct = async (req, res, next) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return res.status(404).json({
                status: 'fail',
                message: 'Product not found'
            });
        }

        const data = { ...req.body };
        if (req.user.role === 'supplier') {
            // Check ownership
            if (Number(product.supplier_id) !== Number(req.user.id)) {
                return next(new AppError('У вас нет прав на редактирование этого товара', 403));
            }
            data.supplier_price = req.body.price;
            delete data.price; // Prevent supplier from overwriting the approved UZS price
            data.is_approved = false; // Mark unapproved when edited
        }

        const updatedProduct = await Product.update(req.params.id, data);
        res.status(200).json({
            status: 'success',
            data: {
                product: updatedProduct
            }
        });
    } catch (err) {
        next(err);
    }
};

exports.deleteProduct = async (req, res, next) => {
    try {
        const product = await Product.getById(req.params.id);
        if (!product) {
            return next(new AppError('Товар не найден', 404));
        }

        // Если пользователь поставщик, проверяем, что он владелец товара
        if (req.user.role === 'supplier' && Number(product.supplier_id) !== Number(req.user.id)) {
            return next(new AppError('У вас нет прав на удаление этого товара', 403));
        }

        await Product.delete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    } catch (err) {
        next(err);
    }
};

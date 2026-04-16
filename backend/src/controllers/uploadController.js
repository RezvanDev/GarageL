exports.uploadProductImage = (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: 'fail',
            message: 'No file uploaded'
        });
    }

    const imageUrl = `/uploads/products/${req.file.filename}`;
    res.status(200).json({
        status: 'success',
        imageUrl
    });
};

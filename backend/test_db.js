const Product = require('./src/models/productModel');

async function run() {
    try {
        console.log("TESTING ALL PRODUCTS (includeUnapproved: 'true')");
        const products = await Product.getAll({ includeUnapproved: 'true' });
        console.log(products.map(p => ({ id: p.id, is_approved: p.is_approved })));
    } catch(err) {
        console.error(err);
    }
    process.exit(0);
}

run();

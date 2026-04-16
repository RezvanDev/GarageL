const db = require('./index');

const seed = async () => {
    try {
        console.log('Seeding data...');

        // 1. Roles (already in schema.sql but making sure)
        await db.query(`
            INSERT INTO roles (name) VALUES ('client'), ('supplier'), ('logist'), ('admin')
            ON CONFLICT (name) DO NOTHING
        `);

        // 2. Mock Products
        const products = [
            // Hyundai
            ['hyundai', 'Sonata', 'Тормозные колодки передние', 'HY-BK-001', 45.00, 'Оригинальные тормозные колодки для Hyundai Sonata 2019-2023'],
            ['hyundai', 'Sonata', 'Фильтр масляный', 'HY-OF-002', 12.00, 'Масляный фильтр Mobis'],
            ['hyundai', 'Elantra', 'Свечи зажигания (комплект)', 'HY-SP-003', 35.00, 'Иридиевые свечи NGK'],
            ['hyundai', 'Santa Fe', 'Ремень ГРМ', 'HY-TB-004', 85.00, 'Ремень ГРМ с роликами'],

            // Toyota
            ['toyota', 'Camry 70', 'Фара левая (LED)', 'TY-HL-001', 450.00, 'Оригинальная светодиодная фара'],
            ['toyota', 'Camry 70', 'Бампер передний', 'TY-FB-002', 220.00, 'Бампер под покраску'],
            ['toyota', 'Corolla', 'Амортизатор передний', 'TY-SA-003', 95.00, 'Амортизатор Kayaba'],
            ['toyota', 'RAV4', 'Диск тормозной', 'TY-BD-004', 70.00, 'Вентилируемый тормозной диск'],

            // BMW
            ['bmw', 'X5 G05', 'Радиатор охлаждения', 'BM-RD-001', 320.00, 'Основной радиатор двигателя'],
            ['bmw', '5 Series G30', 'Рычаг передний нижний', 'BM-CA-002', 140.00, 'Рычаг в сборе с сайлентблоком'],
            ['bmw', '3 Series G20', 'Помпа водяная', 'BM-WP-003', 180.00, 'Электрическая водяная помпа'],

            // KIA
            ['kia', 'K5', 'Стойка стабилизатора', 'KI-SL-001', 25.00, 'Стойка переднего стабилизатора'],
            ['kia', 'Sportage', 'Катушка зажигания', 'KI-IC-002', 40.00, 'Оригинальная катушка зажигания'],
            ['kia', 'Sorento', 'Подшипник ступицы', 'KI-HB-003', 65.00, 'Передний ступичный подшипник']
        ];

        for (const p of products) {
            await db.query(
                `INSERT INTO products (brand, model, name, code, price, description) 
                 VALUES ($1, $2, $3, $4, $5, $6)
                 ON CONFLICT (code) DO NOTHING`,
                p
            );
        }

        console.log('Seeding completed successfully');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding data:', err);
        process.exit(1);
    }
};

seed();

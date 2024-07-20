const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const Product = require('../models/Product');
const Category = require('../models/Category');
const xmlbuilder = require('xmlbuilder');
const ExcelJS = require('exceljs');

function convertToSlug(title) {
    return title
        .toLowerCase()
        .trim() 
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
}

// List a new product
router.get('/products', async (req, res) => {
    try {
        const { category, search } = req.query;

        let whereClause = {};
        
        if (category) {
            whereClause.categoryId = category;
        }

        if (search) {
            whereClause.title = {
                [Op.like]: `%${search}%`
            };
        }

        const allProducts = await Product.findAll({
            where: whereClause,
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'] // Specify which attributes to include from the Category model
                }
            ]
        });

        res.json(allProducts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    const { title, price, stock, imageUrl, categoryId } = req.body;
    slug = convertToSlug(title)
    try {
        // Create a new product using the Product model
        const newProduct = await Product.create({
            title,
            slug,
            price,
            stock,
            imageUrl,
            categoryId
        });

        res.status(201).json(newProduct);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});
        
// Updawte a new product
router.put('/products/:id', async (req, res) => {
    const id = req.params.id;
    const { title, price, stock, imageUrl } = req.body;

    try {
        const product = await Product.findByPk(id);
        if (product) {
            product.title = title;
            product.price = price;
            product.stock = stock;
            product.imageUrl = imageUrl;
            await product.save();
            res.status(200).send('Product updated successfully');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).send('Error updating product');
    }
});

// Delete a new product
router.delete('/products/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const result = await Product.destroy({ where: { id } });
        if (result) {
            res.status(200).send('Product deleted successfully');
        } else {
            res.status(404).send('Product not found');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).send('Error deleting product');
    }
});

// Export to xml
router.get('/export/xml', async (req, res) => {
    try {
    
        const categoryId = req.query.category;
        const queryOptions = {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'] 
                }
            ],
            raw: true 
        };
        if (categoryId) {
            queryOptions.where = { categoryId }; 
        } 
        
        const products = await Product.findAll(queryOptions);
        console.log(products)
        // Build XML
        const xml = xmlbuilder.create('Products')
            .ele('ProductList')
            .ele(products.map(product => ({
                Product: {
                    id: product.id,
                    title: product.title,
                    price: product.price,
                    stock: product.stock,
                    category: product['category.name'],
                    imageUrl: product.imageUrl,
                    created_at: new Date(product.created_at).toISOString(), 
                    updated_at: new Date(product.updated_at).toISOString() 
                }
            })))
            .end({ pretty: true });

        // Set XML content type and send response
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xml');
        res.send(xml);
    } catch (error) {
        console.error('Error exporting XML:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export to excel
router.get('/export/excel', async (req, res) => {
    try {
        const categoryId = req.query.category;
        const queryOptions = {
            include: [
                {
                    model: Category,
                    as: 'category',
                    attributes: ['name'] // Include category name
                }
            ]
        };
        if (categoryId) {
            queryOptions.where = { categoryId }; 
        }
        const products = await Product.findAll(queryOptions);

        // Create a new workbook and worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Products');

        // Define columns
        worksheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Title', key: 'title', width: 30 },
            { header: 'Price', key: 'price', width: 15 },
            { header: 'Stock', key: 'stock', width: 15 },
            { header: 'Category', key: 'category', width: 30 },
            { header: 'Image URL', key: 'imageUrl', width: 50 },
            { header: 'Created At', key: 'createdAt', width: 25 },
            { header: 'Updated At', key: 'updatedAt', width: 25 }
        ];

        // Add rows to the worksheet
        products.forEach(product => {
            worksheet.addRow({
                id: product.id,
                title: product.title,
                price: product.price,
                stock: product.stock,
                category: product.category.name,
                imageUrl: product.imageUrl,
                createdAt: product.createdAt,
                updatedAt: product.updatedAt
            });
        });
 
        const buffer = await workbook.xlsx.writeBuffer();
 
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
        res.send(buffer);
    } catch (error) {
        console.error('Error exporting Excel:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
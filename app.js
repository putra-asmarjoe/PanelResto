const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mustacheExpress = require('mustache-express');
const axios = require('axios');
const sequelize = require('./config/database');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Score = require('./models/Score');
const {insertSampleData, getAverageScoreAndModeEmotion} = require('./utils/score'); 
const { Op, fn, col } = require('sequelize');

const app = express();
const productRoutes = require('./routes/router'); 
const port = 3000;

// Setup Mustache sebagai template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

// Middleware untuk melayani file statis
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Tes koneksi ke database
sequelize.authenticate()
    .then(async () => {
        console.log('Connection has been established successfully.');

        // Sinkronisasi database
        await sequelize.sync();

        // Periksa apakah tabel Products memiliki data
        const productCount = await Product.count();
        if (productCount === 0) {
            console.log('No products found in the database. Fetching from API...');

            // Ambil data dari API dan simpan ke database
            try {
                const response = await axios.get('https://portal.panelo.co/paneloresto/api/productlist/18');
                const products = response.data.products;

                // Simpan data ke database
                for (const category of products) {
                
                    
                    let [categoryInstance, created] = await Category.findOrCreate({
                        where: { id: category.id },
                        defaults: { name: category.name }
                    });
                
                
                    for (const product of category.products) {
                        await Product.create({
                            title: product.title,
                            slug: product.slug,
                            price: product.price.price,
                            stock: product.stock.stock,
                            imageUrl: product.preview.content,
                            categoryId: categoryInstance.id,
                            created_at: product.created_at,
                            updated_at: product.updated_at
                        });
                    }
                }

                console.log('Data successfully fetched and saved to the database.');
            } catch (error) {
                console.error('Error fetching data from API:', error);
                process.exit(1); // Keluar dari aplikasi jika tidak bisa mendapatkan data
            }
        } else {
            console.log(`Found ${productCount} products in the database.`);
        }
        
        
        const scoreCount = await Score.count();
        if (scoreCount === 0) {
            console.log('No scores found in the database. Inserting sample data...');
            await insertSampleData();
        } else {
            console.log(`Found ${scoreCount} scores in the database.`);
        }
         
        
        app.use('/api', productRoutes);
        
        app.get('/', async (req, res) => {
        
            const categories = await Category.findAll();
            console.log(categories)
            try {
                res.render('index', 
                { 
                    title: 'Product List',
                    categories: categories
                });
            } catch (error) {
                console.error('Error fetching data:', error);
                res.status(500).send('Error fetching data');
            }
        });
        

        app.get('/scores', async (req, res) => {
            try {
                const scores = await Score.findAll({
                    order: [['id', 'ASC']]
                });
                
                //Get Avarage scores
                const averageScores = await Score.findAll({
                    attributes: [
                        'name',
                        [fn('AVG', col('score')), 'average_score']
                    ],
                    group: ['name'],
                    raw: true 
                }); 
                
                const result = await Score.findAll({
                    attributes: [
                        'name',
                        'emotion',
                        [fn('COUNT', col('emotion')), 'frequency']
                    ],
                    group: ['name', 'emotion'],
                    order: [
                        ['name', 'ASC'],
                        [fn('COUNT', col('emotion')), 'DESC']
                    ],
                    raw: true
                });
        
                // Format hasil query untuk mendapatkan modus
                const modeMap = {};
                result.forEach(record => {
                    const { name, emotion, frequency } = record;
                    if (!modeMap[name]) {
                        modeMap[name] = { emotion, frequency };
                    } else if (frequency > modeMap[name].frequency) {
                        modeMap[name] = { emotion, frequency };
                    }
                });
        
                
                const modeScores = Object.entries(modeMap).map(([name, { emotion, frequency }]) => ({
                    name,
                    mode_emotion: emotion,
                    frequency
                }));
                
                const avgScorenEmotion = await getAverageScoreAndModeEmotion();
                console.log(avgScorenEmotion)
                
                
                res.render('scores', { scores, averageScores, modeScores, avgScorenEmotion });
            } catch (error) {
                console.error('Error fetching scores:', error);
                res.status(500).send('Error fetching scores');
            }
        });
        
        app.listen(port, () => {
            console.log(`Server berjalan di http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error('Unable to connect to the database:', err);
        process.exit(1); // Keluar dari aplikasi jika tidak bisa konek ke database
    });

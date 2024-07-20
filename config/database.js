const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('panelresto', 'root', 'blackzone', {
    host: 'localhost',
    dialect: 'mysql',
    port: 3307,
});

module.exports = sequelize;
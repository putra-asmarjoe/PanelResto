const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Pastikan path ini sesuai dengan konfigurasi database Anda

const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    }
}, {
    timestamps: false
});

module.exports = Category;

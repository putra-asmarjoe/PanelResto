const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Adjust the path to your database configuration

const Score = sequelize.define('Score', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    emotion: {
        type: DataTypes.STRING,
        allowNull: false
    },
    created: {
        type: DataTypes.DATEONLY, // Use DATEONLY for the date without time
        allowNull: false
    }
}, {
    timestamps: false,
});

module.exports = Score;

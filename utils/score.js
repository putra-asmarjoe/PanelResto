const { fn, col, literal} = require('sequelize');
const Score = require('../models/Score');
const sampleScores = [
    { name: 'Kevin', score: 80, emotion: 'Happy', created: '2020-02-20' },
    { name: 'Josh', score: 90, emotion: 'Sad', created: '2020-02-20' },
    { name: 'Kevin', score: 85, emotion: 'Happy', created: '2020-02-20' },
    { name: 'Kevin', score: 75, emotion: 'Sad', created: '2020-02-20' },
    { name: 'Josh', score: 65, emotion: 'Angry', created: '2020-02-20' },
    { name: 'David', score: 85, emotion: 'Happy', created: '2020-02-21' },
    { name: 'Josh', score: 90, emotion: 'Sad', created: '2020-02-21' },
    { name: 'David', score: 75, emotion: 'Sad', created: '2020-02-21' },
    { name: 'Josh', score: 85, emotion: 'Sad', created: '2020-02-21' },
    { name: 'Josh', score: 70, emotion: 'Happy', created: '2020-02-21' },
    { name: 'Kevin', score: 80, emotion: 'Sad', created: '2020-02-21' },
    { name: 'Kevin', score: 73, emotion: 'Sad', created: '2020-02-22' },
    { name: 'Kevin', score: 75, emotion: 'Angry', created: '2020-02-22' },
    { name: 'David', score: 82, emotion: 'Sad', created: '2020-02-22' },
    { name: 'David', score: 65, emotion: 'Sad', created: '2020-02-22' }
];

const insertSampleData = async () => {
    try {
        await Score.bulkCreate(sampleScores);
        console.log('Sample data inserted successfully');
    } catch (error) {
        console.error('Error inserting sample data:', error);
    }
};

const getAverageScoreAndModeEmotion = async () => {
    try {
      
        results = await Score.findAll({
            attributes: [
                'name',
                'created',
                [fn('AVG', col('score')), 'average_score'],
                [literal(`(
                    SELECT emotion
                    FROM Scores AS innerScores
                    WHERE innerScores.name = Score.name AND innerScores.created = Score.created
                    GROUP BY emotion
                    ORDER BY COUNT(*) DESC, emotion ASC
                    LIMIT 1
                )`), 'modus_emotion'],
                [literal(`(
                    SELECT COUNT(*)
                    FROM Scores AS innerScores
                    WHERE innerScores.name = Score.name AND innerScores.created = Score.created
                    GROUP BY emotion
                    ORDER BY COUNT(*) DESC, emotion ASC
                    LIMIT 1
                )`), 'frequency']
            ],
            group: ['name', 'created'],
            order: [['name', 'ASC'], ['created', 'ASC']],
            raw: true
        });

        
        return results;
    } catch (error) {
        console.error('Error fetching average score and mode emotion:', error);
        throw error;
    }
};

module.exports = {
    insertSampleData,
    getAverageScoreAndModeEmotion
};
const { fn, col, literal } = require('sequelize');
const Score = require('../models/Score'); // Adjust the path to your model

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
        const results = await Score.findAll({
            attributes: [
                'name',
                'created',
                [fn('AVG', col('score')), 'average_score'],
                [literal(`(
                    SELECT emotion
                    FROM (
                        SELECT emotion, COUNT(*) AS frequency
                        FROM Scores
                        WHERE name = Scores.name AND created = Scores.created
                        GROUP BY emotion
                        ORDER BY frequency DESC
                        LIMIT 1
                    ) AS mode_emotion
                )`), 'mode_emotion']
            ],
            group: ['name', 'created'],
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
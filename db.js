const spicedPg = require('spiced-pg');
const dbUrl = process.env.DATABASE_URL || `postgres:postgres:postgres@localhost:5432/timinggame`;
const db = spicedPg(dbUrl);

exports.insertScore = ({ player, time }) => {
    const q = `
            INSERT INTO scores (player, time)
            VALUES ($1, $2)
            RETURNING *`;
    const params = [player || null, time || null];
    return db.query(q, params).then((result) => result.rows[0]);
};

exports.getScores = () => {
    const q = `
            SELECT * 
            FROM scores
            ORDER BY time ASC
            LIMIT 20;
            `;
    return db.query(q).then((result) => result.rows);
};

exports.resetScores = () => {
    const q = `
            DROP TABLE IF EXISTS scores;
            CREATE TABLE scores (
                id SERIAL PRIMARY KEY,
                player VARCHAR(100) NOT NULL,
                time INT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            `;
    return db.query(q).then((result) => result.rows);
};

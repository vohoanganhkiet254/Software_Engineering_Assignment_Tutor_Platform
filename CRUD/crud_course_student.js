const pool = require('../backend/database');

async function RateCourse(userID, courseID, rating, review) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(`
            INSERT INTO course_reviews (userID, tutor_courseID, rating, review)
            VALUES (?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE rating = ?, review = ?
        `, [userID, courseID, rating, review, rating, review]);
        connection.release();
        console.log(`Course rated: User ${userID}, Course ${courseID}, Rating: ${rating}`);
        return true;
    } catch (error) {
        console.error('Error rating course:', error);
        return false;
    }
}
module.exports = {
    RateCourse
};
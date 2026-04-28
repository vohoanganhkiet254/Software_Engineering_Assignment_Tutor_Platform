const pool = require('../backend/database');

/**
 * Get user profile by userID
 */
async function getUserProfile(userID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_profile WHERE userID = ?',
            [userID]
        );
        connection.release();
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
}

/**
 * Get user profile by email
 */
async function getUserProfileByEmail(email) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_profile WHERE email = ?',
            [email]
        );
        connection.release();
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching user profile by email:', error);
        throw error;
    }
}

/**
 * Verify login credentials (email and password)
 */
async function verifyLogin(email, password) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(
            'SELECT * FROM user_profile WHERE email = ? AND password = ?',
            [email, password]
        );
        connection.release();
        return rows[0] || null;
    } catch (error) {
        console.error('Error verifying login:', error);
        throw error;
    }
}

/**
 * Update user profile
 */
async function updateUserProfile(userID, name, current_role, email, more_detail) {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE user_profile SET name = ?, current_role = ?, email = ?, more_detail = ? WHERE userID = ?',
            [name, current_role, email, more_detail, userID]
        );
        connection.release();
        return { success: true, userID };
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
}

module.exports = {
    getUserProfile,
    getUserProfileByEmail,
    verifyLogin,
    updateUserProfile,
};

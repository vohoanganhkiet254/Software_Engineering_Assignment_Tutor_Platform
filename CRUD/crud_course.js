const pool = require('../backend/database');

async function getAllCoursesList() {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor,
                tc.open_state,
                COUNT(tce.userID) as enrolledCount
            FROM tutor_course tc
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            LEFT JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            WHERE tc.open_state != 'Private'
            GROUP BY tc.tutor_courseID
            ORDER BY tc.tutor_courseID DESC
        `);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching courses:', error);
        throw error;
    }
}

/**
 * Get course by ID
 */
async function getCourseById(courseID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.*,
                up.name as tutor
            FROM tutor_course tc
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tc.tutor_courseID = ?
        `, [courseID]);
        connection.release();
        return rows[0] || null;
    } catch (error) {
        console.error('Error fetching course:', error);
        throw error;
    }
}

/**
 * Get courses by user ID (enrolled courses)
 */
async function getEnrolledCourses(userID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor,
                tc.open_state
            FROM tutor_course tc
            JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tce.userID = ?
            ORDER BY tc.tutor_courseID DESC
        `, [userID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching enrolled courses:', error);
        throw error;
    }
}

/**
 * Create new course
 */
async function createCourse(ownerID, courseTitle, description, openState = 'Open') {
    try {
        console.log('🔧 [CRUD] createCourse called with:', { ownerID, courseTitle, description, openState });
        
        const connection = await pool.getConnection();
        console.log('✅ [CRUD] Database connection established');
        
        const query = 'INSERT INTO tutor_course (ownerID, course_title, description, open_state) VALUES (?, ?, ?, ?)';
        console.log('📝 [CRUD] Executing query:', query);
        console.log('📦 [CRUD] Parameters:', [ownerID, courseTitle, description, openState]);
        
        const [result] = await connection.execute(query, [ownerID, courseTitle, description, openState]);
        
        console.log('✅ [CRUD] Insert result:', result);
        console.log('🎯 [CRUD] insertId:', result.insertId);
        
        connection.release();
        console.log('✅ [CRUD] Connection released');
        
        return { success: true, courseID: result.insertId };
    } catch (error) {
        console.error('❌ [CRUD] Error creating course:', error.message);
        console.error('❌ [CRUD] Full error:', error);
        throw error;
    }
}

/**
 * Update course
 */
async function updateCourse(courseID, courseTitle, description, openState) {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            'UPDATE tutor_course SET course_title = ?, description = ?, open_state = ? WHERE tutor_courseID = ?',
            [courseTitle, description, openState, courseID]
        );
        connection.release();
        return { success: true, courseID };
    } catch (error) {
        console.error('Error updating course:', error);
        throw error;
    }
}

/**
 * Enroll user in course
 */
async function enrollUserInCourse(courseID, userID) {
    try{
        const connect = await pool.getConnection();
        await connect.execute(
            'INSERT INTO tutor_course_enrollment(tutor_courseID, userID) VALUES(?,?)'[courseID,userID]
        )
        connect.release();
         return {success: true}; 
    }catch (error) {
        console.error('Error enrolling user in course:', error);
        throw error;
    }
}

/**
 * Get courses managed by a specific owner (tutor)
 */
async function getManagedCourses(ownerID) {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor,
                tc.open_state,
                COUNT(tce.userID) as enrolledCount
            FROM tutor_course tc
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            LEFT JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            WHERE tc.ownerID = ?
            GROUP BY tc.tutor_courseID
            ORDER BY tc.tutor_courseID DESC
        `, [ownerID]);
        connection.release();
        return rows;
    } catch (error) {
        console.error('Error fetching managed courses:', error);
        throw error;
    }
}

module.exports = {
    getAllCoursesList,
    getCourseById,
    getEnrolledCourses,
    createCourse,
    updateCourse,
    enrollUserInCourse,
    getManagedCourses
};
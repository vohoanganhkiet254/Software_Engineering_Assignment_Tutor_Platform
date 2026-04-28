const pool = require('../backend/database');

/**
 * Get dashboard overview for a user
 * Returns: enrolled courses count, university courses count, average GPA, total study hours
 */
async function getDashboardOverview(userID) {
    try {
        const connection = await pool.getConnection();
        
        // Get enrolled courses count
        const [enrolledCourses] = await connection.execute(`
            SELECT COUNT(*) as count FROM tutor_course_enrollment 
            WHERE userID = ?
        `, [userID]);
        
        // Get university courses taken
        const [universityCourses] = await connection.execute(`
            SELECT COUNT(*) as count, AVG(GPA) as avgGPA 
            FROM unicourse_taken 
            WHERE userID = ?
        `, [userID]);
        
        // Get user info
        const [userInfo] = await connection.execute(`
            SELECT name, current_role, email FROM user_profile 
            WHERE userID = ?
        `, [userID]);
        
        connection.release();
        
        return {
            success: true,
            user: userInfo[0] || null,
            enrolledCoursesCount: enrolledCourses[0].count,
            universitaryCoursesCount: universityCourses[0].count,
            averageGPA: universityCourses[0].avgGPA || 0,
            totalStudyHours: 0  // Can be calculated from schedule if needed
        };
    } catch (error) {
        console.error('Error fetching dashboard overview:', error);
        throw error;
    }
}

/**
 * Get all enrolled courses with recent activity for user dashboard
 */
async function getEnrolledCoursesWithActivity(userID) {
    try {
        const connection = await pool.getConnection();
        
        const [courses] = await connection.execute(`
            SELECT 
                tc.tutor_courseID,
                tc.course_title as name,
                tc.description,
                up.name as tutor,
                tc.open_state,
                (SELECT COUNT(*) FROM chapter WHERE tutor_courseID = tc.tutor_courseID) as chaptersCount,
                (SELECT COUNT(*) FROM forum_thread WHERE tutor_courseID = tc.tutor_courseID) as forumThreadsCount,
                (SELECT MAX(date) FROM log WHERE tutor_courseID = tc.tutor_courseID) as lastUpdated
            FROM tutor_course tc
            JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tce.userID = ?
            ORDER BY tc.tutor_courseID DESC
        `, [userID]);
        
        connection.release();
        return courses;
    } catch (error) {
        console.error('Error fetching enrolled courses with activity:', error);
        throw error;
    }
}

/**
 * Get recent activity/schedule for dashboard
 */
async function getRecentSchedule(userID, limit = 5) {
    try {
        const connection = await pool.getConnection();
        
        const [schedule] = await connection.execute(`
            SELECT 
                s.tutor_courseID,
                s.schedule_title,
                s.schedule_content,
                s.start_date,
                s.end_date,
                s.location,
                tc.course_title,
                up.name as tutor
            FROM schedule s
            JOIN tutor_course tc ON s.tutor_courseID = tc.tutor_courseID
            JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE tce.userID = ?
            AND s.start_date >= CURDATE()
            ORDER BY s.start_date ASC, s.end_date ASC
            LIMIT ?
        `, [userID, limit]);
        
        connection.release();
        return schedule;
    } catch (error) {
        console.error('Error fetching recent schedule:', error);
        throw error;
    }
}

/**
 * Get user's waiting queue requests
 */
async function getWaitingQueueRequests(userID) {
    try {
        const connection = await pool.getConnection();
        
        const [requests] = await connection.execute(`
            SELECT 
                wq.tutor_courseID,
                wq.status,
                tc.course_title,
                tc.description,
                up.name as tutor
            FROM waiting_queue wq
            JOIN tutor_course tc ON wq.tutor_courseID = tc.tutor_courseID
            LEFT JOIN user_profile up ON tc.ownerID = up.userID
            WHERE wq.userID = ?
            ORDER BY wq.tutor_courseID DESC
        `, [userID]);
        
        connection.release();
        return requests;
    } catch (error) {
        console.error('Error fetching waiting queue:', error);
        throw error;
    }
}

/**
 * Get recent forum activity for courses user is enrolled in
 */
async function getRecentForumActivity(userID, limit = 5) {
    try {
        const connection = await pool.getConnection();
        
        const [threads] = await connection.execute(`
            SELECT 
                ft.forumID,
                ft.createDate,
                ft.inner_body,
                ft.tutor_courseID,
                tc.course_title,
                (SELECT COUNT(*) FROM forum_answer WHERE forumID = ft.forumID) as answerCount
            FROM forum_thread ft
            JOIN tutor_course tc ON ft.tutor_courseID = tc.tutor_courseID
            JOIN tutor_course_enrollment tce ON tc.tutor_courseID = tce.tutor_courseID
            WHERE tce.userID = ?
            ORDER BY ft.createDate DESC
            LIMIT ?
        `, [userID, limit]);
        
        connection.release();
        return threads;
    } catch (error) {
        console.error('Error fetching recent forum activity:', error);
        throw error;
    }
}

/**
 * Get user's university courses performance
 */
async function getUserUniversityCourses(userID) {
    try {
        const connection = await pool.getConnection();
        
        const [courses] = await connection.execute(`
            SELECT 
                uc.courseID,
                uc.course_name,
                ut.GPA
            FROM unicourse_taken ut
            JOIN university_courses uc ON ut.courseID = uc.courseID
            WHERE ut.userID = ?
            ORDER BY ut.GPA DESC
        `, [userID]);
        
        connection.release();
        return courses;
    } catch (error) {
        console.error('Error fetching university courses:', error);
        throw error;
    }
}

/**
 * Get learning progress for a specific course (based on chapters viewed/completed)
 */
async function getCourseProgress(userID, courseID) {
    try {
        const connection = await pool.getConnection();
        
        // Check if user is enrolled in course
        const [enrolled] = await connection.execute(`
            SELECT * FROM tutor_course_enrollment 
            WHERE userID = ? AND tutor_courseID = ?
        `, [userID, courseID]);
        
        if (enrolled.length === 0) {
            throw new Error('User not enrolled in this course');
        }
        
        // Get total chapters
        const [chapters] = await connection.execute(`
            SELECT COUNT(*) as total FROM chapter 
            WHERE tutor_courseID = ?
        `, [courseID]);
        
        // Get course info
        const [courseInfo] = await connection.execute(`
            SELECT tutor_courseID, course_title, description 
            FROM tutor_course 
            WHERE tutor_courseID = ?
        `, [courseID]);
        
        connection.release();
        
        return {
            course: courseInfo[0],
            totalChapters: chapters[0].total,
            completedChapters: 0,  // To be implemented based on your progress tracking logic
            progress: 0
        };
    } catch (error) {
        console.error('Error fetching course progress:', error);
        throw error;
    }
}

/**
 * Get course materials for a specific chapter
 */
async function getChapterMaterials(courseID, chapterNum) {
    try {
        const connection = await pool.getConnection();
        
        const [materials] = await connection.execute(`
            SELECT 
                material_title,
                material_link,
                type
            FROM material
            WHERE tutor_courseID = ? AND chapter_num = ?
            ORDER BY material_title
        `, [courseID, chapterNum]);
        
        connection.release();
        return materials;
    } catch (error) {
        console.error('Error fetching chapter materials:', error);
        throw error;
    }
}

/**
 * Get all chapters for a course
 */
async function getCourseChapters(courseID) {
    try {
        const connection = await pool.getConnection();
        
        const [chapters] = await connection.execute(`
            SELECT 
                chapter_num,
                chapter_name
            FROM chapter
            WHERE tutor_courseID = ?
            ORDER BY chapter_num ASC
        `, [courseID]);
        
        connection.release();
        return chapters;
    } catch (error) {
        console.error('Error fetching course chapters:', error);
        throw error;
    }
}

module.exports = {
    getDashboardOverview,
    getEnrolledCoursesWithActivity,
    getRecentSchedule,
    getWaitingQueueRequests,
    getRecentForumActivity,
    getUserUniversityCourses,
    getCourseProgress,
    getChapterMaterials,
    getCourseChapters
};

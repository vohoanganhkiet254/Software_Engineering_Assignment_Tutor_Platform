const pool = require('../backend/database');

// Get all threads for a course
async function getForumThreads(courseID) {
    try {
        const connection = await pool.getConnection();
        const [threads] = await connection.execute(
            `SELECT ft.forumID, ft.createDate, ft.inner_body, ft.userID, up.name as user_name
             FROM forum_thread ft
             LEFT JOIN user_profile up ON ft.userID = up.userID
             WHERE ft.tutor_courseID = ? 
             ORDER BY ft.createDate DESC`,
            [courseID]
        );
        connection.release();
        return threads;
    } catch (error) {
        console.error('Error fetching forum threads:', error);
        throw error;
    }
}

// Get a single thread with all its answers and follow-ups
async function getForumThreadDetail(threadID) {
    try {
        const connection = await pool.getConnection();
        const [thread] = await connection.execute(
            `SELECT ft.forumID, ft.createDate, ft.inner_body, ft.tutor_courseID, ft.userID, up.name as user_name
             FROM forum_thread ft
             LEFT JOIN user_profile up ON ft.userID = up.userID
             WHERE ft.forumID = ?`,
            [threadID]
        );

        if (thread.length === 0) {
            connection.release();
            throw new Error('Thread not found');
        }

        // Get main answers (not follow-ups)
        const [answers] = await connection.execute(
            `SELECT fa.answerID, fa.answer_body, fa.userID, fa.createDate, up.name as user_name, fa.parent_answerID
             FROM forum_answer fa
             LEFT JOIN user_profile up ON fa.userID = up.userID
             WHERE fa.forumID = ? AND fa.parent_answerID IS NULL
             ORDER BY fa.answerID ASC`,
            [threadID]
        );
        connection.release();

        // For each main answer, fetch its follow-ups
        const answersWithFollowUps = await Promise.all(
            answers.map(async (answer) => {
                const followUps = await getFollowUpQuestions(answer.answerID);
                return { ...answer, followUps };
            })
        );

        return {
            thread: thread[0],
            answers: answersWithFollowUps
        };
    } catch (error) {
        console.error('Error fetching forum thread detail:', error);
        throw error;
    }
}

// Create a new forum thread (new conversation/question)
async function createForumThread(courseID, questionBody, userID) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO forum_thread (tutor_courseID, inner_body, createDate, userID) 
             VALUES (?, ?, NOW(), ?)`,
            [courseID, questionBody, userID]
        );
        connection.release();
        return result.insertId;
    } catch (error) {
        console.error('Error creating forum thread:', error);
        throw error;
    }
}

// Add a reply to a forum thread (tutor or student answer)
async function addForumAnswer(threadID, answerBody, userID, parentAnswerID = null) {
    try {
        const connection = await pool.getConnection();
        const [result] = await connection.execute(
            `INSERT INTO forum_answer (forumID, answer_body, userID, parent_answerID, createDate) 
             VALUES (?, ?, ?, ?, NOW())`,
            [threadID, answerBody, userID, parentAnswerID]
        );
        connection.release();
        return result.insertId;
    } catch (error) {
        console.error('Error adding forum answer:', error);
        throw error;
    }
}

// Delete a forum thread (admin/tutor only)
async function deleteForumThread(threadID) {
    try {
        const connection = await pool.getConnection();
        // Delete all answers first
        await connection.execute(
            `DELETE FROM forum_answer WHERE forumID = ?`,
            [threadID]
        );
        // Delete the thread
        await connection.execute(
            `DELETE FROM forum_thread WHERE forumID = ?`,
            [threadID]
        );
        connection.release();
        return true;
    } catch (error) {
        console.error('Error deleting forum thread:', error);
        throw error;
    }
}

// Delete a forum answer
async function deleteForumAnswer(answerID) {
    try {
        const connection = await pool.getConnection();
        await connection.execute(
            `DELETE FROM forum_answer WHERE answerID = ?`,
            [answerID]
        );
        connection.release();
        return true;
    } catch (error) {
        console.error('Error deleting forum answer:', error);
        throw error;
    }
}

// Create a follow-up question to a tutor answer (student asking for clarification)
async function createFollowUpQuestion(parentAnswerID, AnswerBody, userID) {
    try {
        const connection = await pool.getConnection();
        // Get the answer to find its forumID
        const [answer] = await connection.execute(
            `SELECT forumID FROM forum_answer WHERE answerID = ?`,
            [parentAnswerID]
        );

        if (answer.length === 0) {
            connection.release();
            throw new Error('Parent answer not found');
        }

        const forumID = answer[0].forumID;

        // Insert follow-up as a new answer with parent_answerID set
        const [result] = await connection.execute(
            `INSERT INTO forum_answer (forumID, answer_body, userID, parent_answerID, createDate) 
             VALUES (?, ?, ?, ?, NOW())`,
            [forumID, AnswerBody, userID, parentAnswerID]
        );
        connection.release();
        return result.insertId;
    } catch (error) {
        console.error('Error creating follow-up question:', error);
        throw error;
    }
}

// Get follow-up questions for an answer
async function getFollowUpQuestions(parentAnswerID) {
    try {
        const connection = await pool.getConnection();
        // Get all direct follow-ups to this answer
        const [followUps] = await connection.execute(
            `SELECT fa.answerID, fa.answer_body, fa.userID, fa.createDate, up.name as user_name, fa.parent_answerID
             FROM forum_answer fa
             LEFT JOIN user_profile up ON fa.userID = up.userID
             WHERE fa.parent_answerID = ?
             ORDER BY fa.createDate ASC`,
            [parentAnswerID]
        );
        connection.release();
        
        // Recursively get nested follow-ups for each follow-up
        const followUpsWithNested = await Promise.all(
            followUps.map(async (followUp) => {
                const nestedFollowUps = await getFollowUpQuestions(followUp.answerID);
                return { ...followUp, followUps: nestedFollowUps };
            })
        );
        
        return followUpsWithNested;
    } catch (error) {
        console.error('Error fetching follow-up questions:', error);
        return [];
    }
}

module.exports = {
    getForumThreads,
    getForumThreadDetail,
    createForumThread,
    addForumAnswer,
    deleteForumThread,
    deleteForumAnswer,
    createFollowUpQuestion,
    getFollowUpQuestions
};

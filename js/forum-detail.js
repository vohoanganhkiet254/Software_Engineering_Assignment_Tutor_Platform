// Get course ID and thread ID from URL
let courseId = null;
let threadId = null;
let userId = null;
let isTutor = false; // Will be set based on user role

// Initialize page on load
document.addEventListener('DOMContentLoaded', () => {
    // Get IDs from URL parameters
    const params = new URLSearchParams(window.location.search);
    courseId = params.get('courseId');
    threadId = params.get('threadId');

    if (!courseId || !threadId) {
        showError('Missing course or thread ID');
        return;
    }

    // Get user ID from localStorage
    userId = localStorage.getItem('currentUserID');
    if (!userId) {
        showError('Please log in first');
        return;
    }

    // Setup event listeners
    document.getElementById('backBtn').addEventListener('click', goBackToForumList);

    // Check if user is tutor (in real app, get from session)
    checkIfTutor();

    // Load thread detail
    loadThreadDetail();
});

// Load forum thread and answers
async function loadThreadDetail() {
    try {
        showLoading(true);
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads/${threadId}`);
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to load thread');
        }

        displayThread(data.data);
        showLoading(false);
    } catch (error) {
        console.error('Error loading thread:', error);
        showError('Failed to load conversation: ' + error.message);
        showLoading(false);
    }
}

// Display thread and answers
function displayThread(threadData) {
    const { thread, answers } = threadData;

    // Display question
    document.getElementById('questionTitle').textContent = thread.inner_body.substring(0, 100);
    document.getElementById('questionBody').textContent = thread.inner_body;

    const date = new Date(thread.createDate);
    const formattedDate = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    const askerName = thread.user_name || 'Anonymous';
    document.getElementById('questionDate').textContent = `Asked by ${askerName} on ${formattedDate}`;

    // Display answers (tutor or student replies) with their follow-ups
    const answersList = document.getElementById('answersList');
    const noAnswers = document.getElementById('noAnswers');

    answersList.innerHTML = '';

    if (answers.length === 0) {
        noAnswers.classList.remove('hidden');
    } else {
        noAnswers.classList.add('hidden');
        answers.forEach((answer, index) => {
            // Create answer card
            const answerCard = document.createElement('div');
            answerCard.className = 'answer-card';
            const authorName = answer.user_name || 'Anonymous';
            answerCard.innerHTML = `
                <div class="answer-header">
                    <span class="answer-number">Reply #${index + 1} by ${authorName}</span>
                    ${isTutor ? `<button class="delete-btn" onclick="deleteAnswer(${answer.answerID})">Delete</button>` : ''}
                </div>
                <p class="answer-text">${escapeHtml(answer.answer_body)}</p>
            `;
            answersList.appendChild(answerCard);

            // Display follow-ups for this answer
            if (answer.followUps && answer.followUps.length > 0) {
                const followUpContainer = document.createElement('div');
                followUpContainer.className = 'followup-container';
                followUpContainer.innerHTML = '<div class="followup-label">📝 Follow-ups:</div>';
                
                answer.followUps.forEach((followUp, fIndex) => {
                    const followUpCard = document.createElement('div');
                    followUpCard.className = 'followup-card';
                    
                    const fDate = new Date(followUp.createDate);
                    const fFormattedDate = fDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    });
                    
                    const followUpAuthor = followUp.user_name || 'Anonymous';
                    followUpCard.innerHTML = `
                        <p class="followup-author"><strong>${followUpAuthor}</strong> - ${fFormattedDate}</p>
                        <p class="followup-text">${escapeHtml(followUp.answer_body)}</p>
                    `;
                    followUpContainer.appendChild(followUpCard);
                });
                
                answersList.appendChild(followUpContainer);
            }

            // Add follow-up form for all users under each answer
            const followUpFormContainer = document.createElement('div');
            followUpFormContainer.className = 'followup-form-container';
            followUpFormContainer.innerHTML = `
                <input type="hidden" class="answer-id" value="${answer.answerID}">
                <textarea 
                    class="followup-input" 
                    placeholder="Ask a follow-up question about this reply..."
                    rows="2"></textarea>
                <button class="btn-submit btn-small" onclick="submitFollowUp(${answer.answerID})">Ask Follow-up</button>
            `;
            answersList.appendChild(followUpFormContainer);
        });
    }

    // Show tutor reply section if user is tutor
    if (isTutor) {
        document.getElementById('tutorReplySection').classList.remove('hidden');
    } else {
        // Hide tutor section for students
        document.getElementById('tutorReplySection').classList.add('hidden');
    }
}

// Submit a reply (tutor answer)
async function submitReply() {
    const replyText = document.getElementById('replyText').value.trim();

    if (!replyText) {
        showError('Please enter a reply');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads/${threadId}/reply`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                answerBody: replyText,
                user_id: userId
            })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to submit reply');
        }

        document.getElementById('replyText').value = '';
        showLoading(false);
        // Reload thread detail
        loadThreadDetail();
    } catch (error) {
        console.error('Error submitting reply:', error);
        showError('Failed to post reply: ' + error.message);
        showLoading(false);
    }
}

// Delete an answer
async function deleteAnswer(answerId) {
    if (!confirm('Are you sure you want to delete this reply?')) {
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/answers/${answerId}`, {
            method: 'DELETE'
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to delete reply');
        }

        showLoading(false);
        // Reload thread detail
        loadThreadDetail();
    } catch (error) {
        console.error('Error deleting answer:', error);
        showError('Failed to delete reply: ' + error.message);
        showLoading(false);
    }
}

// Submit a follow-up question to a specific answer
async function submitFollowUp(answerId) {
    // Find the textarea for this answer
    const textareas = document.querySelectorAll('.followup-input');
    let followUpText = '';
    
    // Find the textarea that matches this answerId
    document.querySelectorAll('.followup-form-container').forEach((container, index) => {
        const hiddenAnswerId = container.querySelector('.answer-id').value;
        if (parseInt(hiddenAnswerId) === answerId) {
            followUpText = container.querySelector('.followup-input').value.trim();
        }
    });

    if (!followUpText) {
        showError('Please enter your follow-up question');
        return;
    }

    try {
        showLoading(true);
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/answers/${answerId}/followup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                followupBody: followUpText,
                user_id: userId
            })
        });

        const data = await response.json();

        if (!data.success) {
            // Check if it's the follow-up not implemented error
            if (data.error && data.error.includes('not yet implemented')) {
                showError('Follow-up feature is coming soon! For now, please create a new question in the forum instead.');
            } else {
                throw new Error(data.error || 'Failed to submit follow-up question');
            }
            showLoading(false);
            return;
        }

        showLoading(false);
        // Reload thread detail to show new follow-up
        loadThreadDetail();
    } catch (error) {
        console.error('Error submitting follow-up question:', error);
        showLoading(false);
        // Check if it's a "not implemented" error
        if (error.message.includes('Follow-up functionality is not yet implemented')) {
            showError('Follow-up feature is not yet available. Please ask a new question in the forum instead.');
        } else {
            showError('Failed to post follow-up: ' + error.message);
        }
    }
}

// Submit a follow-up question (student clarification)
async function submitFollowUpQuestion() {
    const followUpText = document.getElementById('followUpText').value.trim();

    if (!followUpText) {
        showError('Please enter your follow-up question');
        return;
    }

    try {
        showLoading(true);
        // Post as a new follow-up thread
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads/${threadId}/followup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ questionBody: followUpText })
        });

        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to submit question');
        }

        document.getElementById('followUpText').value = '';
        showLoading(false);
        // Reload thread detail to show new question
        loadThreadDetail();
    } catch (error) {
        console.error('Error submitting follow-up question:', error);
        showError('Failed to post question: ' + error.message);
        showLoading(false);
    }
}

// Check if current user is tutor (simplified version)
function checkIfTutor() {
    // Check from localStorage (set during login)
    const userRole = localStorage.getItem('currentUserRole') || sessionStorage.getItem('userRole') || '';
    isTutor = userRole === 'tutor' || userRole === 'Lecturer' || userRole === 'Senior Undergraduated';
}

// Go back to course page
function goBackToForumList() {
    // Get user role from session/local storage
    const userRole = localStorage.getItem('currentUserRole') || localStorage.getItem('userRole') || 'Student';
    
    if (userRole === 'Lecturer' || userRole === 'Senior Undergraduated') {
        window.location.href = `enter-course-from-tutor.html?courseId=${courseId}`;
    } else {
        window.location.href = `enter-course-from-students.html?courseId=${courseId}`;
    }
}

// Show/hide loading indicator
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (show) {
        spinner.classList.remove('hidden');
    } else {
        spinner.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
    setTimeout(() => {
        errorDiv.classList.add('hidden');
    }, 5000);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

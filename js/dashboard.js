// Get userID from localStorage (set during login)
const userID = localStorage.getItem('currentUserID') || 2312345; // Default for testing

/**
 * Load all schedules for upcoming view
 */
async function loadAllUpcomingSchedules() {
    try {
        const response = await fetch(`http://localhost:3000/courses/managed/${userID}`);
        const data = await response.json();
        
        const courses = data.courses || data;
        let allSchedules = [];
        
        // Fetch schedules for each managed course
        for (const course of courses) {
            try {
                const scheduleRes = await fetch(`http://localhost:3000/api/schedule/${course.tutor_courseID}`);
                const scheduleData = await scheduleRes.json();
                
                if (scheduleData.success && scheduleData.schedules) {
                    allSchedules = allSchedules.concat(
                        scheduleData.schedules.map(s => ({
                            ...s,
                            course_name: course.name,
                            course_id: course.tutor_courseID
                        }))
                    );
                }
            } catch (error) {
                console.error(`Error loading schedules for course ${course.tutor_courseID}:`, error);
            }
        }
        
        displayUpcomingSchedules(allSchedules);
    } catch (error) {
        console.error('Error loading all upcoming schedules:', error);
    }
}

/**
 * Display upcoming schedules and deadlines
 */
function displayUpcomingSchedules(schedules) {
    const scheduleList = document.getElementById('scheduleList');
    if (!scheduleList) return;
    
    if (!schedules || schedules.length === 0) {
        scheduleList.innerHTML = '<p style="text-align: center; padding: 20px;">No upcoming events.</p>';
        return;
    }
    
    // Sort by start_date
    const sortedSchedules = schedules.sort((a, b) => new Date(a.start_date) - new Date(b.start_date));
    
    // Create individual cards for each schedule
    const scheduleHTML = sortedSchedules.map(event => {
        const startDate = new Date(event.start_date);
        const dayName = startDate.toLocaleDateString('en-US', { weekday: 'short' });
        const dateStr = startDate.toLocaleDateString();
        const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="schedule-card">
                <div class="schedule-date-header">${dayName}, ${dateStr}</div>
                <div class="schedule-content">
                    <div class="schedule-time">${timeStr}</div>
                    <div class="course-item">
                        <p class="course-title"><strong>${event.course_name}</strong> - ${event.schedule_title}</p>
                        <p class="content">${event.schedule_content}</p>
                        <p class="location">📍 ${event.location || 'Online'}</p>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    scheduleList.innerHTML = scheduleHTML;
}

/**
 * Initialize dashboard - Load all sections
 */
function initDashboard() {
    if (!userID || userID === '2312345') {
        // Check if not logged in
        const storedUserID = localStorage.getItem('currentUserID');
        if (!storedUserID) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }
    }
    
    loadAllUpcomingSchedules();
}

// Load dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}

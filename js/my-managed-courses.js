// Load managed courses for the currently logged-in user
(async function() {
    try {
        const userID = localStorage.getItem('currentUserID');
        if (!userID) {
            window.location.href = 'login.html';
            return;
        }

        const url = `http://localhost:3000/courses/managed/${encodeURIComponent(userID)}`;
        console.log('Fetching managed courses from', url);
        const res = await fetch(url);
        if (!res.ok) {
            const text = await res.text();
            console.error('Managed courses request failed', res.status, text);
            document.querySelector('.course-list').innerHTML = `<p>Error loading courses (status ${res.status}). Check server logs.</p>`;
            return;
        }
        const data = await res.json();
        const courses = data.courses || data;

        if (!courses || courses.length === 0) {
            document.querySelector('.course-list').innerHTML = '<p>No managed courses found.</p>';
            return;
        }

        const newArray = courses.map(item => {
            const courseId = item.tutor_courseID || item.courseID || item.id;
            console.log(item);
            return `
            <div class="enrolled_course_card col-xl-4 col-lg-6 col-md-12">
                <a href="course-detail.html" data-course-id="${courseId}">
                    <div class="course-card">
                        <img src="../assets/images/course_thumbnail.png" alt="Course Image" style="width: 100%; height: 200px; object-fit: cover;"/>
                        <div class="inner-course-title">${item.name}</div>
                        <div class="inner-course-desc">${item.description || ''}</div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div class="inner-course-tutor">${item.tutor || 'Unknown'}</div>
                            <div class="inner-course-access" style="border: 4px solid ${item.open_state === 'Open' ? '#28a745' : item.open_state === 'Permission' ? '#ffc107' : '#fd0e0eff'}; padding: 6px 10px; border-radius: 4px; font-weight: bold;">${item.open_state || 'Open'}</div>
                        </div>
                    </div>
                </a>
            </div>
            `;
        });

        document.querySelector('.course-list').innerHTML = newArray.join('');
        
        // Add click listeners to save course_id to local storage
        document.querySelectorAll(".enrolled_course_card a").forEach(link => {
            link.addEventListener("click", (event) => {
                const courseId = link.getAttribute("data-course-id");
                localStorage.setItem("course_id", courseId);
            });
        });

        // Add click listener for Scheduling button
        document.getElementById('scheduleBtn').addEventListener('click', () => {
            window.location.href = 'make-schedule.html';
        });
    } catch (error) {
        console.error('Error loading managed courses:', error);
        document.querySelector('.course-list').innerHTML = '<p>Error loading courses. Check console for details.</p>';
    }
})();
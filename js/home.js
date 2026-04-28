// Load first 3 courses from API
async function loadCourses() {
    try {
        const response = await fetch("http://localhost:3000/api/courses/home");
        const data = await response.json();

        if (data.success && data.courses) {
            const newArray = data.courses.map(item => {
                return `
                    <div class="home_course_card col-xl-3 col-lg-4 col-md-6">
                        <a href="course-detail.html" data-course-id="${item.tutor_courseID}">
                            <div class="course-card">
                                <img src="../assets/images/course_thumbnail.png" alt="Course Image" style="width: 100%; height: 200px; object-fit: cover;"/>
                                <div class="inner-course-title">${item.name}</div>
                                <div class="inner-course-desc">${item.description}</div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div class="inner-course-tutor">${item.tutor || 'Unknown'}</div>
                                    <div id ="access" class="inner-course-access" style="border: 4px solid ${item.open_state === 'Open' ? '#28a745' : item.open_state === 'Permission' ? '#ffc107' : '#fd0e0eff'}; padding: 6px 10px; border-radius: 4px; font-weight: bold;">${item.open_state}</div>
                                </div>
                            </div>
                        </a>
                    </div>
                `;
            });
            document.querySelector(".course-list").innerHTML = newArray.join("");
            
            // Add click listeners to save course_id to local storage
            document.querySelectorAll(".home_course_card a").forEach(link => {
                link.addEventListener("click", (event) => {
                    const courseId = link.getAttribute("data-course-id");
                    localStorage.setItem("course_id", courseId);
                });
            });
        } else {
            console.error("No courses found");
            document.querySelector(".course-list").innerHTML = "<p>No courses available</p>";
        }
    } catch (error) {
        console.error("Error loading courses:", error);
        document.querySelector(".course-list").innerHTML = "<p>Error loading courses</p>";
    }
}

// Load courses when page loads
loadCourses();
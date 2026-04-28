// Load managed courses on page load
(async function() {
    try {
        const userID = localStorage.getItem('currentUserID');
        if (!userID) {
            alert('Lỗi: Vui lòng đăng nhập trước.');
            window.location.href = 'login.html';
            return;
        }

        // Fetch managed courses
        const url = `http://localhost:3000/courses/managed/${encodeURIComponent(userID)}`;
        const res = await fetch(url);
        
        if (!res.ok) {
            alert('Không thể tải danh sách khóa học. Vui lòng thử lại.');
            return;
        }

        const data = await res.json();
        const courses = data.courses || data;

        if (!courses || courses.length === 0) {
            alert('Bạn không có khóa học nào để tạo schedule. Vui lòng tạo khóa học trước.');
            window.location.href = 'my-managed-courses.html';
            return;
        }

        // Populate course dropdown
        const courseSelect = document.getElementById('courseName');
        courses.forEach(course => {
            const option = document.createElement('option');
            option.value = course.tutor_courseID || course.courseID || course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error loading courses:', error);
        alert('Lỗi: Không thể tải danh sách khóa học.');
    }
})();

// Handle form submission
document.getElementById('scheduleForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form data
    const formData = {
        courseName: document.getElementById('courseName').value,
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        startDate: document.getElementById('startDate').value,
        startTime: document.getElementById('startTime').value,
        endDate: document.getElementById('endDate').value,
        endTime: document.getElementById('endTime').value,
        urlLocation: document.getElementById('urlLocation').value
    };
    
    // Validation: Check if startDate < endDate
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (startDateTime >= endDateTime) {
        alert('Lỗi: Thời gian bắt đầu phải trước thời gian kết thúc. Vui lòng nhập lại!');
        return;
    }
    
    try {
        // Get userID
        const userID = localStorage.getItem('currentUserID');
        
        if (!userID) {
            alert('Lỗi: Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.');
            return;
        }
        
        // Prepare data for API
        const scheduleData = {
            tutor_courseID: parseInt(formData.courseName),
            schedule_title: formData.title,
            schedule_content: formData.description,
            start_date: formData.startDate,
            start_time: formData.startTime,
            end_date: formData.endDate,
            end_time: formData.endTime,
            location: formData.urlLocation
        };
        
        // Send data to API
        const response = await fetch('http://localhost:3000/api/schedule/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(scheduleData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Lịch học đã được lưu thành công!');
            // Reset form
            this.reset();
            // Redirect back to my-managed-courses
            window.location.href = 'my-managed-courses.html';
        } else {
            alert('Lỗi: ' + (result.message || 'Không thể lưu lịch học'));
        }
    } catch (error) {
        console.error('Error saving schedule:', error);
        alert('Lỗi: Không thể kết nối đến server. Vui lòng thử lại.');
    }
});
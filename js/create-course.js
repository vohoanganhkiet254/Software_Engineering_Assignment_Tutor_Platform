// Check if user is authorized to create courses (must be Lecturer, Graduated, or Senior Undergraduated)
(async function() {
    try {
        const userID = localStorage.getItem('currentUserID');
        
        if (!userID) {
            alert('Please log in first');
            window.location.href = 'login.html';
            return;
        }

        // Fetch user profile to check role
        const response = await fetch(`http://localhost:3000/api/user/${userID}`);
        const data = await response.json();
        
        if (!data.success || !data.user) {
            alert('Unable to verify your account');
            window.location.href = 'login.html';
            return;
        }

        // Check if user has permission to create courses
        const allowedRoles = ['Lecturer', 'Graduated', 'Senior Undergraduated'];
        if (!allowedRoles.includes(data.user.current_role)) {
            alert(`Access Denied! Only Lecturers, Graduated students, and Senior Undergraduated students can create courses.\n\nYour role: ${data.user.current_role}`);
            window.location.href = 'my-managed-courses.html';
            return;
        }

        console.log(`User ${data.user.name} is authorized to create courses`);
    } catch (error) {
        console.error('Error checking user authorization:', error);
        alert('Error verifying your account');
        window.location.href = 'login.html';
    }
})();

// Handle form submission
document.getElementById('courseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        courseName: document.getElementById('courseName').value,
        description: document.getElementById('description').value,
        openState: document.getElementById('openState').value
    };

    console.log('📝 Form Data:', formData);

    // Validation
    if (!formData.courseName.trim()) {
        alert('Course name cannot be empty');
        return;
    }

    if (!formData.description.trim()) {
        alert('Description cannot be empty');
        return;
    }

    if (!formData.openState) {
        alert('Please select access rights');
        return;
    }

    try {
        const userID = localStorage.getItem('currentUserID');
        
        if (!userID) {
            alert('Error: User not logged in');
            return;
        }

        const requestData = {
            ownerID: parseInt(userID),
            course_title: formData.courseName,
            description: formData.description,
            open_state: formData.openState
        };

        console.log('🚀 Sending request to http://localhost:3000/api/courses/create');
        console.log('📦 Request data:', requestData);

        // Send data to API
        const response = await fetch('http://localhost:3000/api/courses/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('📥 Response status:', response.status);
        console.log('📥 Response headers:', {
            'content-type': response.headers.get('content-type'),
            'content-length': response.headers.get('content-length')
        });

        // Try to parse response as JSON
        let result;
        try {
            result = await response.json();
            console.log('📊 Response JSON:', result);
        } catch (parseError) {
            console.error('❌ Failed to parse response as JSON:', parseError);
            const text = await response.text();
            console.error('❌ Response text:', text);
            alert('Server error: Invalid response format');
            return;
        }

        // Check if response is successful
        if (!response.ok) {
            console.error('❌ HTTP error:', response.status, result);
            alert('Error: ' + (result.message || result.error || `HTTP ${response.status}`));
            return;
        }

        if (result.success) {
            console.log('✅ Course created successfully! ID:', result.courseID);
            alert('Course created successfully!');
            // Reset form
            this.reset();
            // Redirect back to managed courses
            setTimeout(() => {
                window.location.href = 'my-managed-courses.html';
            }, 1000);
        } else {
            console.error('❌ API returned success=false:', result);
            alert('Error: ' + (result.message || result.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('❌ Exception caught:', error);
        console.error('❌ Error name:', error.name);
        console.error('❌ Error message:', error.message);
        console.error('❌ Error stack:', error.stack);
        alert('Error: ' + error.message);
    }
});
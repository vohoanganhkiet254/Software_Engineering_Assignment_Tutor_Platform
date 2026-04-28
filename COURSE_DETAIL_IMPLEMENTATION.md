# Course Detail Page - Two View System

## Overview
The course detail page now has two different views based on the user's enrollment status:

### 1. Preview View (Non-Enrolled Students)
- **Access**: When a student is NOT enrolled in the course
- **Content**:
  - Course title and description
  - Tutor/instructor information
  - "Join now" button to enroll
  - Course content section is **HIDDEN**
  - Instructor details shown

### 2. Full Course View (Enrolled Students)
- **Access**: When a student IS enrolled in the course
- **Content**:
  - Course title and description
  - "Already Enrolled" button (disabled)
  - Full course content is **VISIBLE**:
    - Lectures and sections
    - Course materials
    - Quizzes (if implemented)
    - Libraries (if implemented)
  - Instructor details shown

## How It Works

### Flow:
1. User clicks a course card on home page
   - `course_id` is saved to local storage

2. User navigates to `course-detail.html`
   - `course-detail.js` loads automatically

3. Script checks:
   - Retrieves `course_id` from local storage
   - Retrieves `currentUserID` from local storage (set during login)
   - Fetches course data from API
   - Checks if user is enrolled in the course

4. Based on enrollment status:
   - **NOT enrolled** → Shows preview with "Join now" button
   - **IS enrolled** → Shows full course content

5. When user clicks "Join now":
   - Makes API call to enroll user
   - Refreshes page to show enrolled view

## Backend API Endpoints

### New Endpoints Added:

1. **Check Enrollment Status**
   ```
   GET /api/enrollment/:courseId/:userId
   Response: { success: true, enrolled: true/false }
   ```

2. **Enroll User in Course**
   ```
   POST /api/enroll
   Body: { courseId: id, userId: id }
   Response: { success: true }
   ```

## Files Modified/Created

### Created:
- `js/course-detail.js` - Handles two-view logic

### Modified:
- `view/course-detail.html` - Added script reference
- `backend/api.js` - Added new endpoints and imports

### Unchanged but Important:
- `CRUD/crud_course.js` - Uses existing functions
- `js/login2.js` - Already saves user ID as `currentUserID`

## Key Functions in course-detail.js

- `checkEnrollment()` - Checks if user is enrolled
- `loadCourseDetail()` - Main function that loads course and decides which view to show
- `loadPreviewView()` - Renders preview for non-enrolled students
- `loadEnrolledStudentView()` - Renders full course for enrolled students
- `enrollCourse()` - Handles enrollment when "Join now" is clicked
- `updateInstructorInfo()` - Updates instructor details
- `populateCourseSections()` - Placeholder for fetching course sections/lectures

## To Complete Implementation

To fully implement course content (lectures, quizzes, etc.), you need to:

1. Create database tables for:
   - Course sections/modules
   - Lectures/lessons
   - Quizzes and questions
   - Course materials/libraries

2. Create CRUD functions for fetching this content

3. Implement API endpoints to retrieve this content

4. Update `populateCourseSections()` in course-detail.js to display this content

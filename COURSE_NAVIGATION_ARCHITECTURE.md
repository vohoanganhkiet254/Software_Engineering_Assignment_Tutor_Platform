# Course View Architecture - Updated

## Page Flow

### For Unenrolled Students:
1. **home.html** → Browse courses (first 3)
2. **course-browsing.html** → View all courses
3. **course-detail.html** (Preview Mode) → View course overview
   - Shows course title, description, instructor, objectives
   - Displays "Join Now" button
   - Has "Enroll to view" badges on chapters
4. **Click "Join Now"** → Enrollment
5. **After Enrollment** → Redirects to `enter-course-from-students.html`

### For Enrolled Students:
1. **course-detail.html** (Accessed with course_id in localStorage)
   - Auto-detects enrollment
   - Redirects to `enter-course-from-students.html`
2. **enter-course-from-students.html** (Full Course Access)
   - Displays all chapters and materials
   - Shows videos, PDFs, resources
   - Can view course reviews and forum discussions
   - Can submit reviews and participate in discussions

### For Lecturers:
1. **login.html** → Login with Lecturer role
2. **lecturer-dashboard.html** → View all owned courses
   - Shows course status (Open/Permission/Private)
   - Shows enrollment count
   - Edit/View buttons
3. **Click "Edit Content"** → Opens course editor modal
   - Shows chapters with accordions
   - Can upload materials (PDFs/videos) to chapters
   - Can delete materials
   - Can manage pending enrollment requests
4. **Click "View Course"** → Redirects to `enter-course-from-students.html` (as student view)
5. **Click "Edit Course"** → Redirects to `enter-course-from-tutor.html`
   - Full edit mode with add/edit chapters
   - Upload materials interface
   - Can add new sections

## Files Structure

### HTML Pages
- `view/home.html` - Home page with course browsing
- `view/course-browsing.html` - Browse all courses
- `view/course-detail.html` - Preview/enrollment page (unenrolled)
- `view/enter-course-from-students.html` - Full course access (enrolled students)
- `view/enter-course-from-tutor.html` - Course edit mode (lecturers)
- `view/lecturer-dashboard.html` - Lecturer's course management dashboard

### JavaScript Files
- `js/home.js` - Load home courses
- `js/course-browsing.js` - Browse all courses
- `js/course-detail.js` - Preview/enrollment logic
- `js/enter-course-from-students.js` - Enrolled student course view
- `js/enter-course-from-tutor.js` - Lecturer course edit mode (existing)
- `js/lecturer-dashboard.js` - Lecturer dashboard (new)

## API Endpoints Required

### Course Information
- `GET /api/courses/:courseId` - Get course details
- `GET /api/courses/home` - Get first 3 courses
- `GET /api/all_courses` - Get all courses
- `GET /api/course/:courseId/chapters` - Get course chapters
- `GET /api/course/:courseId/chapter/:chapterNum/materials` - Get chapter materials

### Enrollment & Access
- `GET /api/enrollment/:courseId/:userId` - Check if enrolled
- `POST /api/enroll` - Direct enrollment (Open courses)
- `POST /api/enroll-request` - Request enrollment (Permission courses)

### Lecturer Features
- `GET /api/lecturer/:userId/courses` - Get lecturer's courses
- `POST /api/course/:courseId/chapter/:chapterNum/upload-material` - Upload material
- `DELETE /api/course/:courseId/chapter/:chapterNum/delete-material` - Delete material
- `GET /api/course/:courseId/enrollments/pending` - Get pending enrollments

### Reviews & Forum
- `GET /api/course/:courseId/reviews` - Get course reviews
- `POST /api/course/:courseId/review` - Submit review
- `GET /api/course/:courseId/forum` - Get forum posts
- `POST /api/course/:courseId/forum` - Post to forum

## Local Storage Keys
- `currentUserID` - Current logged-in user ID
- `currentUserRole` - User role (Lecturer/Student)
- `course_id` - Currently viewing/selected course ID

## Next Steps
1. Add all missing API endpoints to `backend/api.js`
2. Update course-detail.html to use correct redirects after enrollment
3. Test the full enrollment flow (preview → enroll → student view)
4. Implement lecturer course editing and material uploads

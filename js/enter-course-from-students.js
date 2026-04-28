// Get user info from local storage
const userId = localStorage.getItem("currentUserID");
const courseId = localStorage.getItem("course_id");

// Check access and initialization
function initializeStudentCourseView() {
    if (!userId) {
        alert("Please log in first");
        window.location.href = "login.html";
        return false;
    }

    if (!courseId) {
        alert("No course selected");
        window.location.href = "home.html";
        return false;
    }

    return true;
}

// Load course details
async function loadCourseDetails() {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success && data.course) {
            const course = data.course;
            document.querySelector(".inner-title").textContent = course.course_title || course.name;
            
            // Get instructor info
            const instructorName = course.instructor_name || "Instructor";
            document.querySelector(".inner-tutor").textContent = `Created by ${instructorName}, Developer and Lead Instructor`;

            // Load chapters and materials
            loadCourseContent();
        } else {
            alert("Course not found");
            window.location.href = "my-enrolled-courses.html";
        }
    } catch (error) {
        console.error("Error loading course details:", error);
        alert("Error loading course details. Please try again.");
    }
}

// Load course chapters and materials
async function loadCourseContent() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapters`);
        const data = await response.json();

        if (data.success && data.chapters) {
            displayChapters(data.chapters);
        } else {
            document.getElementById("courseAccordion").innerHTML = "<p class='text-muted'>No course content available yet.</p>";
        }
    } catch (error) {
        console.error("Error loading course content:", error);
        document.getElementById("courseAccordion").innerHTML = "<p class='text-muted'>Error loading course content.</p>";
    }
}

// Display chapters with materials
async function displayChapters(chapters) {
    const accordion = document.getElementById("courseAccordion");
    accordion.innerHTML = '';

    for (const chapter of chapters) {
        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        
        const accordionHeader = document.createElement('h2');
        accordionHeader.className = 'accordion-header';
        
        const button = document.createElement('button');
        button.className = 'accordion-button collapsed';
        button.type = 'button';
        button.setAttribute('data-bs-toggle', 'collapse');
        button.setAttribute('data-bs-target', `#section${chapter.chapter_num}`);
        button.textContent = chapter.chapter_name;
        
        accordionHeader.appendChild(button);
        accordionItem.appendChild(accordionHeader);

        const accordionBody = document.createElement('div');
        accordionBody.id = `section${chapter.chapter_num}`;
        accordionBody.className = 'accordion-collapse collapse';
        accordionBody.setAttribute('data-bs-parent', '#courseAccordion');

        const bodyContent = document.createElement('div');
        bodyContent.className = 'accordion-body';
        bodyContent.innerHTML = '<p class="text-muted">Loading materials...</p>';

        accordionBody.appendChild(bodyContent);
        accordionItem.appendChild(accordionBody);
        accordion.appendChild(accordionItem);

        // Load materials for this chapter
        try {
            const materialsResponse = await fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapter.chapter_num}/materials`);
            const materialsData = await materialsResponse.json();

            if (materialsData.success && materialsData.materials) {
                displayMaterials(chapter.chapter_num, materialsData.materials, bodyContent);
            } else {
                bodyContent.innerHTML = '<p class="text-muted">No materials available for this chapter.</p>';
            }
        } catch (error) {
            console.error(`Error loading materials for chapter ${chapter.chapter_num}:`, error);
            bodyContent.innerHTML = '<p class="text-muted">Error loading materials.</p>';
        }
    }
}

// Display materials within a chapter
function displayMaterials(chapterNum, materials, bodyContent) {
    if (!materials || materials.length === 0) {
        bodyContent.innerHTML = '<p class="text-muted">No materials available for this chapter.</p>';
        return;
    }

    bodyContent.innerHTML = '';
    
    const materialList = document.createElement('ul');
    materialList.className = 'list-group list-group-flush';

    materials.forEach(material => {
        const item = document.createElement('li');
        item.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'flex-grow-1';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'fw-bold mb-2';
        titleDiv.textContent = material.material_title;
        
        const typeSpan = document.createElement('span');
        typeSpan.className = 'badge bg-info me-2';
        typeSpan.textContent = material.type;
        
        let actionButton = '';
        if (material.material_link) {
            actionButton = `<a href="${material.material_link}" target="_blank" class="btn btn-sm btn-outline-primary">
                <i class="fas fa-external-link-alt"></i> View ${material.type}
            </a>`;
        }
        
        contentDiv.innerHTML = `
            <div class="fw-bold mb-2">${material.material_title}</div>
            <div>
                <span class="badge bg-info me-2">${material.type}</span>
                ${actionButton}
            </div>
        `;
        
        item.appendChild(contentDiv);
        materialList.appendChild(item);
    });

    bodyContent.appendChild(materialList);
}

// Load ratings and reviews
async function loadRatingsAndReviews() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/reviews`);
        if (!response.ok) {
            console.warn("Reviews endpoint not available");
            return; // Silently return if endpoint doesn't exist
        }
        const data = await response.json();

        if (data.success && data.reviews) {
            displayReviews(data.reviews, data.averageRating, data.ratingCount);
        }
    } catch (error) {
        console.warn("Error loading reviews (using defaults):", error);
        // Use default values if reviews can't be loaded
    }
}

// Display reviews
function displayReviews(reviews, averageRating, ratingCount) {
    const reviewsContainer = document.querySelector('.section-six');
    if (!reviewsContainer) return;

    // Update rating header
    const ratingHeader = reviewsContainer.querySelector('.inner-title');
    if (ratingHeader) {
        ratingHeader.innerHTML = `
            <span class="text-warning fs-2">★</span>
            ${averageRating || '4.7'} course rating <span class="text-muted">(${ratingCount || '455,678'} ratings)</span>
        `;
    }

    // Display reviews
    const reviewsContent = reviewsContainer.innerHTML;
    const reviewsDisplay = reviewsContainer.querySelector('.border');
    
    if (reviewsDisplay && reviews.length > 0) {
        const container = reviewsDisplay.parentElement;
        container.innerHTML = '';

        reviews.slice(0, 3).forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.className = 'border p-3 mb-3 rounded';
            reviewDiv.innerHTML = `
                <h5 class="fw-bold">${review.user_name || 'Anonymous'}</h5>
                <div class="text-warning mb-2">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
                <p>${review.comment || review.review_text}</p>
            `;
            container.appendChild(reviewDiv);
        });
    }
}

// Submit review/rating
async function submitReview() {
    const reviewInput = document.querySelector('.input-group input[placeholder="Feedback/Rating"]');
    const feedback = reviewInput?.value || '';

    if (!feedback) {
        alert("Please enter your feedback");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/review`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user_id: userId,
                comment: feedback,
                rating: 5 // Default rating, can be updated to use star selection
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Thank you for your feedback!");
            reviewInput.value = '';
            loadRatingsAndReviews(); // Reload reviews
        } else {
            alert("Error submitting feedback");
        }
    } catch (error) {
        console.error("Error submitting review:", error);
        alert("Error submitting feedback. Please try again.");
    }
}


// ============================================
// RATING & FEEDBACK SYSTEM
// ============================================

let rating = 0; // Store the current rating

// Initialize star rating functionality
function initializeStarRating() {
    const stars = document.querySelectorAll('.star');
    const feedbackInput = document.getElementById('feedback-input');
    const sendBtn = document.getElementById('send-feedback-btn');
    
    if (!stars.length) return;
    
    // Add click event to each star
    stars.forEach(star => {
        star.addEventListener('click', function() {
            rating = parseInt(this.getAttribute('data-rating'));
            updateStars(rating);
        });
        
        // Add hover effect
        star.addEventListener('mouseenter', function() {
            const hoverRating = parseInt(this.getAttribute('data-rating'));
            updateStars(hoverRating);
        });
    });
    
    // Reset to current rating when mouse leaves
    const starContainer = document.getElementById('star-rating');
    if (starContainer) {
        starContainer.addEventListener('mouseleave', function() {
            updateStars(rating);
        });
    }
    
    // Handle send button click
    if (sendBtn) {
        sendBtn.addEventListener('click', function() {
            const feedback = feedbackInput ? feedbackInput.value.trim() : '';
            
            if (rating === 0) {
                alert('Please select a rating (1-5 stars)');
                return;
            }
            
            if (feedback === '') {
                alert('Please write your feedback');
                return;
            }
            
            // Call function to send feedback and rating to database
            sendFeedbackToDatabase(feedback, rating);
        });
    }
}

// Update star display (filled or empty)
function updateStars(count) {
    const stars = document.querySelectorAll('.star');
    stars.forEach((star, index) => {
        if (index < count) {
            star.classList.remove('fa-regular');
            star.classList.add('fa-solid', 'text-warning');
        } else {
            star.classList.remove('fa-solid', 'text-warning');
            star.classList.add('fa-regular', 'text-secondary');
        }
    });
}

// Send feedback and rating to database
async function sendFeedbackToDatabase(feedback, rating) {
    if (!userId) {
        alert('Please log in to submit feedback');
        return;
    }
    
    if (!courseId) {
        alert('Course information not found');
        return;
    }
    
    console.log('Sending feedback to database:');
    console.log('Course ID:', courseId);
    console.log('User ID:', userId);
    console.log('Rating:', rating);
    console.log('Feedback:', feedback);
    
    try {
        // TODO: Replace with your actual API endpoint
        const response = await fetch('http://localhost:3000/api/feedback', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                courseId: courseId,
                userId: userId,
                rating: rating,
                feedback: feedback
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Thank you for your feedback!');
            // Reset form
            document.getElementById('feedback-input').value = '';
            rating = 0;
            updateStars(0);
            // Reload ratings and reviews
            loadRatingsAndReviews();
        } else {
            alert('Failed to submit feedback: ' + (data.message || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting feedback:', error);
        alert('Error submitting feedback. Please try again.');
    }
}

// Setup event listeners
document.addEventListener('DOMContentLoaded', () => {
    if (!initializeStudentCourseView()) {
        return;
    }

    // Load initial data
    loadCourseDetails();
    loadRatingsAndReviews();
    loadForumQuestions();
    
    // Initialize star rating system
    initializeStarRating();

    // Setup button handlers
    const sendReviewBtn = document.querySelector('.section-six .btn-primary');
    if (sendReviewBtn) {
        sendReviewBtn.addEventListener('click', submitReview);
    }

    const sendForumBtn = document.querySelector('.section-seven .btn-primary');
    if (sendForumBtn) {
        sendForumBtn.addEventListener('click', submitForumQuestion);
    }

    // Profile button
    const profileBtn = document.getElementById("button-header-profile");
    if (profileBtn) {
        profileBtn.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = "user-profile.html";
        });
    }
});

async function rateCourse(rating) {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/rate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userID: userId,
                courseID: courseId,
                rating: rating,
                review: '' // You can add a review input if needed
            })
        });

        const data = await response.json();

        if (data.success) {
            alert("Thank you for rating the course!");
            loadRatingsAndReviews(); // Reload ratings and reviews
        } else {
            alert("Error submitting rating");
        }
    } catch (error) {
        console.error("Error submitting rating:", error);
        alert("Error submitting rating. Please try again.");
    }
}

// =============== FORUM FUNCTIONS ===============

// Load forum questions for display
async function loadForumQuestions() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`);
        const data = await response.json();

        if (data.success && data.threads) {
            displayForumQuestions(data.threads);
        } else {
            document.getElementById('forumQuestionsList').innerHTML = '<p class="text-muted">No questions yet. Be the first to ask!</p>';
        }
    } catch (error) {
        console.error('Error loading forum questions:', error);
        document.getElementById('forumQuestionsList').innerHTML = '<p class="text-danger">Error loading forum.</p>';
    }
}

// Display forum questions as clickable items
function displayForumQuestions(threads) {
    const container = document.getElementById('forumQuestionsList');
    container.innerHTML = '';

    if (threads.length === 0) {
        container.innerHTML = '<p class="text-muted">No questions yet. Be the first to ask!</p>';
        return;
    }

    threads.forEach(thread => {
        const date = new Date(thread.createDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const questionDiv = document.createElement('div');
        questionDiv.className = 'comment mb-4';
        questionDiv.style.cursor = 'pointer';
        
        const askerName = thread.user_name || 'Anonymous';
        questionDiv.innerHTML = `
            <h6 class="fw-bold" style="color: #667eea;">Question by ${askerName}</h6>
            <p class="comment-text">${escapeHtml(thread.inner_body)}</p>
            <div class="reply-btn text-muted small">
                <i class="bi bi-reply me-1"></i> View Replies - ${formattedDate}
            </div>
        `;
        
        // Set onclick AFTER setting innerHTML to ensure it works
        questionDiv.onclick = () => viewForumDetail(thread.forumID);
        
        container.appendChild(questionDiv);
    });
}

// Submit new forum question
async function submitForumQuestion() {
    const input = document.getElementById('forumInput');
    const questionBody = input.value.trim();

    if (!questionBody) {
        alert('Please enter your question');
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                questionBody: questionBody,
                user_id: userId
            })
        });

        const data = await response.json();

        if (data.success) {
            input.value = '';
            await loadForumQuestions(); // Reload to show new question
            // Success - no error message needed
        } else {
            alert('Error posting question: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error submitting question:', error);
        alert('Error posting question. Please try again.');
    }
}

// View forum question detail (go to detail page)
function viewForumDetail(threadId) {
    window.location.href = `forum-detail.html?courseId=${courseId}&threadId=${threadId}`;
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
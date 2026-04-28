// Get course_id and user_id from local storage
const courseId = localStorage.getItem("course_id");
const userId = localStorage.getItem("currentUserID");

let courseData = null;
let sectionCounter = 0;
let lectureCounters = {};

// ============================================
// INITIALIZATION - Load lecturer course data
// ============================================

// Load course data for editing
async function loadCourseData() {
    try {
        const response = await fetch(`http://localhost:3000/api/courses/${courseId}`);
        const data = await response.json();

        if (data.success && data.course) {
            courseData = data.course;
            displayCourseInfo();
            loadCourseChapters();
        } else {
            alert("Course not found");
            window.location.href = "home.html";
        }
    } catch (error) {
        console.error("Error loading course data:", error);
        alert("Error loading course. Please try again.");
    }
}

// Display course info in header
function displayCourseInfo() {
    const innerTitle = document.querySelector(".section-one .inner-title");
    if (innerTitle) {
        innerTitle.textContent = courseData.name || courseData.course_title;
    }
}

// Load existing chapters
async function loadCourseChapters() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapters`);
        const data = await response.json();

        if (data.success && data.chapters) {
            displayChapters(data.chapters);
        }
    } catch (error) {
        console.error("Error loading chapters:", error);
    }
}

// Display chapters in accordion for editing
function displayChapters(chapters) {
    const accordion = document.getElementById('courseAccordion');
    accordion.innerHTML = '';

    chapters.forEach(chapter => {
        const sectionId = `chapter-${chapter.chapter_num}`;
        sectionCounter = Math.max(sectionCounter, chapter.chapter_num);

        const accordionItem = document.createElement('div');
        accordionItem.className = 'accordion-item';
        accordionItem.id = `item-${sectionId}`;
        accordionItem.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${sectionId}">
                    <span id="title-${sectionId}">${chapter.chapter_name}</span>
                </button>
                <button class="add-lecture-btn" onclick="addLecture('${sectionId}')">
                    <i class="fas fa-plus"></i> Material
                </button>
                <button class="btn btn-sm btn-danger ms-2" onclick="deleteChapter('${sectionId}', ${chapter.chapter_num})">
                    <i class="fas fa-trash"></i>
                </button>
            </h2>
            <div id="${sectionId}" class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
                <div class="accordion-body" id="body-${sectionId}">
                    <p class="text-muted">Loading materials...</p>
                </div>
            </div>
        `;
        accordion.appendChild(accordionItem);

        // Load materials for this chapter
        loadChapterMaterials(chapter.chapter_num, sectionId);
    });
}

// Load materials for a chapter
async function loadChapterMaterials(chapterNum, sectionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/materials`);
        const data = await response.json();

        const bodyElement = document.getElementById(`body-${sectionId}`);
        
        if (data.success && data.materials && data.materials.length > 0) {
            let materialsHTML = '<ul class="list-group">';
            data.materials.forEach(material => {
                // Escape special characters in the link for safe HTML attribute usage
                const safeLink = material.material_link.replace(/"/g, '&quot;');
                materialsHTML += `
                    <li class="list-group-item d-flex justify-content-between align-items-center">
                        <a href="${safeLink}" target="_blank" style="text-decoration: none; color: inherit; flex-grow: 1;">
                            <strong>${material.material_title}</strong>
                            <span class="badge bg-info ms-2">${material.type}</span>
                        </a>
                        <button class="btn btn-sm btn-danger" onclick="deleteMaterial(${chapterNum}, '${material.material_link.replace(/'/g, "\\'")}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </li>
                `;
            });
            materialsHTML += '</ul>';
            bodyElement.innerHTML = materialsHTML;
        } else {
            bodyElement.innerHTML = '<p class="text-muted">No materials yet. Click "Material" to add one.</p>';
        }
    } catch (error) {
        console.error("Error loading materials:", error);
    }
}

// ============================================
// SECTION/CHAPTER MANAGEMENT
// ============================================

function addSection() {
    sectionCounter++;
    const sectionId = `section${sectionCounter}`;
    lectureCounters[sectionId] = 0;

    const accordion = document.getElementById('courseAccordion');
    const sectionHTML = `
        <div class="accordion-item" id="item-${sectionId}">
            <h2 class="accordion-header">
                <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${sectionId}">
                    <span id="title-${sectionId}">Section ${sectionCounter}</span>
                </button>
                <button class="add-lecture-btn" onclick="addLecture('${sectionId}')">
                    <i class="fas fa-plus"></i> Material
                </button>
            </h2>
            <div id="${sectionId}" class="accordion-collapse collapse" data-bs-parent="#courseAccordion">
                <div class="accordion-body" id="body-${sectionId}">
                    <p class="text-muted">There are no materials yet. Click "Material" to add one.</p>
                </div>
            </div>
        </div>
    `;
    
    accordion.insertAdjacentHTML('beforeend', sectionHTML);
    
    // Auto edit title
    setTimeout(() => editSection(sectionId), 100);
}

function editSection(sectionId) {
    const titleElement = document.getElementById(`title-${sectionId}`);
    const currentText = titleElement.textContent;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'form-control';
    input.style.width = '300px';
    
    titleElement.replaceWith(input);
    input.focus();
    input.select();
    
    async function saveEdit() {
        const newTitle = input.value.trim() || currentText;
        const chapterNum = parseInt(sectionId.replace('section', ''));

        try {
            // Save chapter to database
            const response = await fetch(`http://localhost:3000/api/course/${courseId}/chapter`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chapterNum: chapterNum,
                    chapterName: newTitle
                })
            });
            const data = await response.json();

            if (data.success) {
                console.log(`Chapter ${chapterNum} saved to database with name: ${newTitle}`);
            } else {
                console.error("Error saving chapter:", data.error || data.message);
            }
        } catch (error) {
            console.error("Error saving chapter to database:", error);
        }

        const span = document.createElement('span');
        span.id = `title-${sectionId}`;
        span.textContent = newTitle;
        input.replaceWith(span);
    }

    input.addEventListener('blur', saveEdit);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') saveEdit();
    });
}

function deleteChapter(sectionId, chapterNum) {
    if (!confirm("Are you sure you want to delete this chapter?")) {
        return;
    }

    try {
        fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}`, {
            method: 'DELETE'
        }).then(res => res.json()).then(data => {
            if (data.success) {
                alert("Chapter deleted successfully");
                document.getElementById(`item-${sectionId}`)?.remove();
            } else {
                alert("Error deleting chapter");
            }
        });
    } catch (error) {
        console.error("Error deleting chapter:", error);
        alert("Error deleting chapter. Please try again.");
    }
}

// ============================================
// MATERIAL/LECTURE MANAGEMENT
// ============================================

function addLecture(sectionId) {
    const bodyElement = document.getElementById(`body-${sectionId}`);
    
    const inputHTML = `
        <div class="card p-3 mb-3" id="material-form-${sectionId}">
            <div class="mb-3">
                <label class="form-label">Material Title</label>
                <input type="text" class="form-control" id="material-title-${sectionId}" placeholder="Enter material title">
            </div>
            <div class="mb-3">
                <label class="form-label">Material Type</label>
                <select class="form-select" id="material-type-${sectionId}">
                    <option value="Video">Video</option>
                    <option value="PDF">PDF</option>
                </select>
            </div>
            <div class="mb-3">
                <label class="form-label">Material Link/URL</label>
                <input type="text" class="form-control" id="material-link-${sectionId}" placeholder="https://example.com/material">
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-success btn-sm" onclick="saveMaterial('${sectionId}')">
                    <i class="fas fa-check"></i> Save
                </button>
                <button class="btn btn-secondary btn-sm" onclick="cancelMaterial('${sectionId}')">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    bodyElement.insertAdjacentHTML('beforeend', inputHTML);
}

function saveMaterial(sectionId) {
    const title = document.getElementById(`material-title-${sectionId}`)?.value?.trim();
    const type = document.getElementById(`material-type-${sectionId}`)?.value;
    const link = document.getElementById(`material-link-${sectionId}`)?.value?.trim();

    if (!title || !link) {
        alert("Please fill in all fields");
        return;
    }

    // Extract chapter number from sectionId
    let chapterNum = sectionId.includes('chapter-') 
        ? parseInt(sectionId.split('-')[1])
        : parseInt(sectionId.replace('section', ''));

    try {
        fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/upload-material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                material_title: title,
                type: type,
                material_link: link
            })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                alert("Material added successfully");
                // Remove the form and reload materials
                document.getElementById(`material-form-${sectionId}`)?.remove();
                loadChapterMaterials(chapterNum, sectionId);
            } else {
                alert("Error adding material: " + (data.error || data.message || 'Unknown error'));
            }
        }).catch(error => {
            console.error("Error saving material:", error);
            alert("Error saving material. Please try again.");
        });
    } catch (error) {
        console.error("Error saving material:", error);
        alert("Error saving material. Please try again.");
    }
}

function uploadMaterialFile(title, type, file, chapterNum, sectionId) {
    const formData = new FormData();
    formData.append('material_title', title);
    formData.append('type', type);
    formData.append('file', file);

    try {
        fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/upload-material`, {
            method: 'POST',
            body: formData
        }).then(res => res.json()).then(data => {
            if (data.success) {
                alert("Material uploaded successfully");
                // Remove the form and reload materials
                document.getElementById(`material-form-${sectionId}`)?.remove();
                loadChapterMaterials(chapterNum, sectionId);
            } else {
                alert("Error uploading material: " + (data.error || data.message || 'Unknown error'));
            }
        }).catch(error => {
            console.error("Error uploading file:", error);
            alert("Error uploading file. Please try again.");
        });
    } catch (error) {
        console.error("Error uploading material:", error);
        alert("Error uploading material. Please try again.");
    }
}

function saveMaterialURL(title, type, link, chapterNum, sectionId) {
    try {
        fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/upload-material`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                material_title: title,
                type: type,
                material_link: link
            })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                alert("Material added successfully");
                // Remove the form and reload materials
                document.getElementById(`material-form-${sectionId}`)?.remove();
                loadChapterMaterials(chapterNum, sectionId);
            } else {
                alert("Error adding material: " + (data.error || data.message || 'Unknown error'));
            }
        }).catch(error => {
            console.error("Error saving material:", error);
            alert("Error saving material. Please try again.");
        });
    } catch (error) {
        console.error("Error saving material:", error);
        alert("Error saving material. Please try again.");
    }
}

function cancelMaterial(sectionId) {
    const formElement = document.getElementById(`material-form-${sectionId}`);
    if (formElement) {
        formElement.remove();
    }
}

function deleteMaterial(chapterNum, materialLink) {
    if (!confirm("Are you sure you want to delete this material?")) {
        return;
    }

    try {
        fetch(`http://localhost:3000/api/course/${courseId}/chapter/${chapterNum}/delete-material`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ material_link: materialLink })
        }).then(res => res.json()).then(data => {
            if (data.success) {
                alert("Material deleted successfully");
                loadCourseChapters();
            } else {
                alert("Error deleting material");
            }
        });
    } catch (error) {
        console.error("Error deleting material:", error);
        alert("Error deleting material. Please try again.");
    }
}

// =============== FORUM FUNCTIONS ===============

// Handle forum posts
async function submitForumPost() {
    const forumInput = document.querySelector('.section-seven .input-group input[placeholder="Join the conversation"]');
    const message = forumInput?.value || '';

    if (!message) {
        alert("Please enter a message");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                questionBody: message,
                user_id: userId
            })
        });

        const data = await response.json();

        if (data.success) {
            forumInput.value = '';
            loadForumPosts(); // Reload forum
        } else {
            alert("Error posting message");
        }
    } catch (error) {
        console.error("Error posting to forum:", error);
        alert("Error posting message. Please try again.");
    }
}

// Load forum posts
async function loadForumPosts() {
    try {
        const response = await fetch(`http://localhost:3000/api/course/${courseId}/forum/threads`);
        const data = await response.json();

        if (data.success && data.threads) {
            displayForumPosts(data.threads);
        }
    } catch (error) {
        console.error("Error loading forum posts:", error);
    }
}

// Display forum posts
function displayForumPosts(posts) {
    const forumContainer = document.querySelector('.section-seven');
    if (!forumContainer) return;

    // Find all existing comments (but not the input group)
    const existingComments = forumContainer.querySelectorAll('.comment');
    
    // Remove all existing comments
    existingComments.forEach(comment => {
        comment.remove();
    });

    // Add new posts (threads/questions)
    posts.forEach(post => {
        const date = new Date(post.createDate);
        const formattedDate = date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment mb-4';
        commentDiv.style.cursor = 'pointer';
        
        const askerName = post.user_name || 'Anonymous';
        commentDiv.innerHTML = `
            <h6 class="fw-bold" style="color: #667eea;">Question by ${askerName}</h6>
            <p class="comment-text">${escapeHtml(post.inner_body || post.post_text)}</p>
            <div class="reply-btn text-muted small mb-2">
                <i class="bi bi-reply me-1"></i> View & Reply - ${formattedDate}
            </div>
        `;
        
        // Set onclick AFTER setting innerHTML to ensure it works
        commentDiv.onclick = () => viewForumDetail(post.forumID);
        
        forumContainer.appendChild(commentDiv);
    });
}

// Navigate to forum detail page
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

// ============================================
// PAGE INITIALIZATION
// ============================================

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadCourseData();
    loadForumPosts();
    
    // Setup forum button event listener
    const sendBtn = document.querySelector('.section-seven .btn-primary');
    if (sendBtn) {
        sendBtn.addEventListener('click', submitForumPost);
    }
});

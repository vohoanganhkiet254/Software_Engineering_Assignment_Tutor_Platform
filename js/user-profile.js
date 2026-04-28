// ===== Load user info =====
    window.onload = function() {
      // Get values from localStorage (set during login)
      const name = localStorage.getItem('currentUserName');
      const email = localStorage.getItem('currentUserEmail');
      const userID = localStorage.getItem('currentUserID');
      const role = localStorage.getItem('currentUserRole');
      const detail = localStorage.getItem('currentDetail');

      // Set form fields with localStorage values
      if (name) document.getElementById('name').value = name;
      if (email) document.getElementById('email').value = email;
      if (userID) document.getElementById('userID').value = userID;
      if (role) document.getElementById('title').value = role;
      if (detail) document.getElementById('about').value = detail;

      console.log('User data loaded from localStorage:', { name, email, userID, role });
    };

    // ===== Enable/Disable edit mode =====
    const editBtn = document.getElementById('edit-btn');
    const saveBtn = document.getElementById('save-btn');
const aboutTextarea = document.getElementById('about');
const profileInputs = document.querySelectorAll('.profile-fields input');

    editBtn.addEventListener('click', () => {
      // Only enable the "About Me" textarea for editing
      aboutTextarea.disabled = false;
      aboutTextarea.focus();

      // Keep profile fields disabled (read-only)
      profileInputs.forEach(i => i.disabled = true);

      saveBtn.disabled = false;
      editBtn.style.display = 'none';
    });

saveBtn.addEventListener('click', async () => {
  const userID = localStorage.getItem('currentUserID');
  const name = localStorage.getItem('currentUserName');
  const email = localStorage.getItem('currentUserEmail');
  const role = localStorage.getItem('currentUserRole');
  const detail = document.getElementById('about').value; // Only get the About field

  try {
    const response = await fetch(`http://localhost:3000/api/profile/${userID}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name,
        email,
        current_role: role,
        more_detail: detail  // Only send About field (more_detail)
      })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      // Update localStorage with new About value
      localStorage.setItem('currentDetail', detail);

      // Disable About textarea and hide save button
      aboutTextarea.disabled = true;
      saveBtn.disabled = true;
      editBtn.style.display = 'inline-block';
      alert('About Me saved successfully!');
      console.log('Profile updated:', data);
    } else {
      alert(data.message || 'Failed to save profile!');
    }
  } catch (err) {
    console.error('Error saving profile:', err);
    alert('Error connecting to server!');
  }
});

const logo = document.getElementById('logo');
logo.addEventListener('click', () => {
  window.location.href = 'home.html';
});
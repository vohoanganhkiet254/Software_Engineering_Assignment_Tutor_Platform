document.getElementById("btn-login").addEventListener("click", async (event) => {
    event.preventDefault();

    const email = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch("http://localhost:3000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const err = await response.json();
            alert(err.message || "Đăng nhập thất bại!");
            return;
        }

        const data = await response.json();
        if (data.success) {
            alert("Đăng nhập thành công!");
            const currentUser = data.user;
            localStorage.setItem("currentDetail", currentUser.more_detail);
            localStorage.setItem("currentUserID", currentUser.userID);
            localStorage.setItem("currentUserRole", currentUser.current_role);
            localStorage.setItem("currentUserEmail", currentUser.email);
            localStorage.setItem("currentUserName", currentUser.name);
            localStorage.setItem("loggedIn", true);
            window.location.href = "home.html";
        }
    } catch (err) {
        console.error("Lỗi kết nối:", err);
        alert("Không thể kết nối tới server!");
    }
});
const API_BASE_URL = 'http://127.0.0.1:8000';

// If already logged in, skip login page
if (sessionStorage.getItem('adminToken')) {
    window.location.href = 'admin.html';
}

const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');
const loginBtn = document.getElementById('loginBtn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');
    
    loginBtn.textContent = 'Verifying PIN...';
    loginBtn.disabled = true;

    const pinVal = document.getElementById('pinCode').value.trim();

    // DEFAULT ADMIN PASSCODE BYPASS
    if (pinVal === '54321') {
        sessionStorage.setItem('adminToken', 'default-admin-token');
        window.location.href = 'admin.html';
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/admin/login-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pin: pinVal })
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Invalid PIN");
        }
        
        const data = await response.json();
        
        if (data.success) {
            sessionStorage.setItem('adminToken', data.token);
            window.location.href = 'admin.html';
        }
    } catch (error) {
        console.error("Login Error:", error);
        loginError.textContent = error.message;
        loginError.classList.remove('hidden');
        document.getElementById('pinCode').value = '';
    } finally {
        loginBtn.textContent = 'Access Dashboard';
        loginBtn.disabled = false;
    }
});

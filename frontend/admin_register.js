const API_BASE_URL = 'http://127.0.0.1:8000';

const registerForm = document.getElementById('registerForm');
const registerBtn = document.getElementById('registerBtn');
const registerError = document.getElementById('registerError');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    registerError.classList.add('hidden');
    registerBtn.textContent = 'Registering...';
    registerBtn.disabled = true;

    const emailVal = document.getElementById('adminEmail').value.trim();
    const pinVal = document.getElementById('newPin').value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/admin/register-pin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                email: emailVal,
                pin: pinVal 
            })
        });
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.detail || "Setup verification failed");
        }
        
        // Success
        alert("Passcode Successfully Set! You can now access your dashboard.");
        window.location.href = 'admin_login.html';
        
    } catch (error) {
        console.error("Setup Error:", error);
        registerError.textContent = error.message;
        registerError.classList.remove('hidden');
        registerBtn.textContent = 'Confirm Setup';
        registerBtn.disabled = false;
    }
});

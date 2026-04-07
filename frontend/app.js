// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000';

// DOM Elements
const contentInput = document.getElementById('contentInput');
const checkBtn = document.getElementById('checkBtn');
const resultCard = document.getElementById('resultCard');
const scoreValue = document.getElementById('scoreValue');
const classificationText = document.getElementById('classificationText');
const analyzedContentSpan = document.getElementById('analyzedContent');
const tabBtns = document.querySelectorAll('.tab-btn');

let currentMode = 'url';

// Tab Logic
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        tabBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');
        
        currentMode = btn.dataset.type;
        
        // Update placeholder
        if (currentMode === 'url') {
            contentInput.placeholder = "Enter URL here (e.g., https://example.com)";
        } else if (currentMode === 'email') {
            contentInput.placeholder = "Paste the suspicious email contents here...";
        } else if (currentMode === 'sms') {
            contentInput.placeholder = "Paste the suspicious SMS text here...";
        }
    });
});
const reportActionBox = document.getElementById('reportActionBox');
const reportBtn = document.getElementById('reportBtn');
const reportMessage = document.getElementById('reportMessage');

const reporterModal = document.getElementById('reporterModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const submitReportBtn = document.getElementById('submitReportBtn');
const modalName = document.getElementById('modalName');
const modalEmail = document.getElementById('modalEmail');
const modalPhone = document.getElementById('modalPhone');

let lastCheckedContent = '';
let lastCheckedType = 'url';

// Check Event
checkBtn.addEventListener('click', async () => {
    const content = contentInput.value.trim();
    if (!content) {
        alert(`Please enter some ${currentMode.toUpperCase()} to check.`);
        return;
    }

    // Reset UI state
    resultCard.classList.add('hidden');
    reportActionBox.classList.add('hidden');
    reportMessage.classList.add('hidden');
    resultCard.className = 'result-card hidden'; // remove previous status classes
    checkBtn.textContent = 'Checking...';
    checkBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content: content, type: currentMode })
        });
        
        if (!response.ok) throw new Error("API request failed");
        
        const data = await response.json();
        
        // Update variables
        lastCheckedContent = content;
        lastCheckedType = currentMode;
        
        // Display results
        scoreValue.textContent = data.score;
        classificationText.textContent = data.result;
        analyzedContentSpan.textContent = content.length > 50 ? content.substring(0, 50) + "..." : content;
        
        // Appy color coding based on result
        if (data.result === 'Safe') {
            resultCard.classList.add('status-safe');
        } else if (data.result === 'Suspicious') {
            resultCard.classList.add('status-suspicious');
        } else {
            resultCard.classList.add('status-dangerous');
        }
        
        // Unhide result card
        resultCard.classList.remove('hidden');
        
        // Show report button if it's suspicious/dangerous or if the user simply wants to report
        // For project demonstration we'll always show it
        reportActionBox.classList.remove('hidden');

    } catch (error) {
        console.error("Error checking content:", error);
        alert("Failed to connect to the backend server. Please make sure the FastAPI server is running.");
    } finally {
        checkBtn.textContent = 'Analyze';
        checkBtn.disabled = false;
    }
});

// Open Modal Event
reportBtn.addEventListener('click', () => {
    reporterModal.classList.remove('hidden');
});

// Close Modal Event
closeModalBtn.addEventListener('click', () => {
    reporterModal.classList.add('hidden');
});

// Submit Report Feedback Event
submitReportBtn.addEventListener('click', async () => {
    submitReportBtn.disabled = true;
    submitReportBtn.textContent = 'Reporting...';
    
    const name = modalName.value.trim();
    const email = modalEmail.value.trim();
    const phone = modalPhone.value.trim();
    
    let reporterInfoParts = [];
    if (name) reporterInfoParts.push(`Name: ${name}`);
    if (email) reporterInfoParts.push(`Email: ${email}`);
    if (phone) reporterInfoParts.push(`Phone: ${phone}`);
    
    const reporterInfo = reporterInfoParts.length > 0 ? reporterInfoParts.join(', ') : 'Anonymous';

    try {
        const response = await fetch(`${API_BASE_URL}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                content: lastCheckedContent, 
                type: lastCheckedType,
                reporter_info: reporterInfo
            })
        });
        
        if (!response.ok) throw new Error("Failed to report");
        
        // Show success message
        reporterModal.classList.add('hidden');
        reportActionBox.classList.add('hidden');
        reportMessage.textContent = 'Reported successfully. Thank you!';
        reportMessage.style.color = 'var(--safe-color)';
        reportMessage.classList.remove('hidden');

        // Clear modal inputs
        modalName.value = '';
        modalEmail.value = '';
        modalPhone.value = '';

    } catch (error) {
        console.error("Error reporting content:", error);
        alert("Failed to submit the report.");
    } finally {
        submitReportBtn.disabled = false;
        submitReportBtn.textContent = 'Confirm & Submit Report';
    }
});

// Let Shift+Enter submit the form
contentInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        checkBtn.click();
    }
});

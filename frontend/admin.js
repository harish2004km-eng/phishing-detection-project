const API_BASE_URL = 'http://127.0.0.1:8000';

// SECURITY CHECK
if (!sessionStorage.getItem('adminToken')) {
    window.location.href = 'admin_login.html';
}

// DOM Elements
const totalCount = document.getElementById('totalCount');
const pendingCount = document.getElementById('pendingCount');
const resolvedCount = document.getElementById('resolvedCount');
const reportsTableBody = document.getElementById('reportsTableBody');
const logoutBtn = document.getElementById('logoutBtn');

let threatChartInstance = null; // Global reference to the Chart.js instance

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('adminToken');
        window.location.href = 'admin_login.html';
    });
}

// Load Dashboard Data
async function loadDashboard() {
    try {
        await Promise.all([fetchStats(), fetchReports()]);
    } catch (error) {
        console.error("Failed to load dashboard data:", error);
        // Do not spam alerts if backend is simply off, but good for debugging
    }
}

// Fetch stats for the top cards
async function fetchStats() {
    const response = await fetch(`${API_BASE_URL}/reports/stats`);
    if (!response.ok) throw new Error("Failed to fetch stats");
    
    const data = await response.json();
    totalCount.textContent = data.total;
    pendingCount.textContent = data.pending;
    resolvedCount.textContent = data.resolved;
}

// Fetch list of all reports
async function fetchReports() {
    const response = await fetch(`${API_BASE_URL}/reports`);
    if (!response.ok) throw new Error("Failed to fetch reports");
    
    const reports = await response.json();
    
    // Clear table body
    reportsTableBody.innerHTML = '';
    
    // Update Chart before anything otherwise empty states skip it
    updateThreatChart(reports);

    if (reports.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align: center; color: var(--text-muted);">No reports found</td>`;
        reportsTableBody.appendChild(tr);
        return;
    }
    
    // Inject rows
    reports.forEach(report => {
        const tr = document.createElement('tr');
        
        const dateObj = new Date(report.timestamp);
        const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();

        // format badge
        let badgeClass = 'badge-pending';
        if (report.status === 'resolved') badgeClass = 'badge-resolved';
        if (report.status === 'forwarded') badgeClass = 'badge-forwarded';
        
        const displayStatus = report.status.charAt(0).toUpperCase() + report.status.slice(1);
        
        // format action button (always show buttons to ensure visibility, but disable if not pending)
        let resolveDisabled = (report.status !== 'pending') ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
        let forwardDisabled = (report.status !== 'pending') ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : '';
        
        let actionHtml = `
            <div style="display: flex; gap: 0.5rem; justify-content: flex-start;">
                <button class="btn-resolve" onclick="resolveReport(${report.id})" ${resolveDisabled}>Mark Resolved</button>
                <button class="btn-forward" onclick="forwardReport(${report.id})" ${forwardDisabled}>Forward</button>
            </div>
        `;

        const displayType = report.type ? report.type.toUpperCase() : 'URL';
        tr.innerHTML = `
            <td>#${report.id}</td>
            <td><span class="badge" style="background:rgba(255,255,255,0.1);color:var(--text-muted);font-weight:600;">${displayType}</span></td>
            <td style="max-width: 200px; word-break: break-all;">${report.content}</td>
            <td>${report.reporter_info || 'Anonymous'}</td>
            <td><span class="badge ${badgeClass}">${displayStatus}</span></td>
            <td>${dateStr}</td>
            <td>${actionHtml}</td>
        `;
        
        reportsTableBody.appendChild(tr);
    });
}

// Global resolve function so it can be called from inline onclick handler
window.resolveReport = async function(id) {
    if (!confirm("Are you sure you want to mark this report as resolved?")) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/reports/resolve`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        if (!response.ok) throw new Error("Failed to resolve report");
        
        // Reload dashboard to update stats and table
        loadDashboard();
        
    } catch (error) {
        console.error("Error resolving report:", error);
        alert("Failed to resolve report");
    }
};

// Global forward function
window.forwardReport = async function(id) {
    if (!confirm("Are you sure you want to transfer this report and user details securely to Cyber Crime Authorities?")) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/reports/forward`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: id })
        });
        
        if (!response.ok) throw new Error("Failed to forward report");
        
        alert("Report details securely transferred to Cyber Crime.");
        
        // Reload dashboard to update stats and table
        loadDashboard();
        
    } catch (error) {
        console.error("Error forwarding report:", error);
        alert("Failed to forward report to Cyber Crime.");
    }
};

// --- CHART RENDERING LOGIC ---
function updateThreatChart(reports) {
    const ctx = document.getElementById('threatChart');
    if (!ctx) return; // Canvas not found (maybe not on admin page)

    // Aggregate report types
    let counts = { url: 0, email: 0, sms: 0 };
    reports.forEach(r => {
        let typeStr = (r.type || 'url').toLowerCase();
        if (counts[typeStr] !== undefined) counts[typeStr]++;
    });

    const dataValues = [counts.url, counts.email, counts.sms];
    const isAllZero = dataValues.every(val => val === 0);

    // If chart already exists, just update data
    if (threatChartInstance) {
        threatChartInstance.data.datasets[0].data = isAllZero ? [1, 1, 1] : dataValues;
        threatChartInstance.update();
        return;
    }

    // Chart Options & Configuration
    const data = {
        labels: ['Web URL', 'Email Content', 'SMS Message'],
        datasets: [{
            label: 'Threats Detected',
            data: isAllZero ? [1, 1, 1] : dataValues, // Show uniform grey if empty
            backgroundColor: isAllZero 
                ? ['#475569', '#334155', '#1e293b'] 
                : ['#3b82f6', '#10b981', '#f59e0b'],
            borderColor: 'transparent',
            hoverOffset: 4,
            borderWidth: 0
        }]
    };

    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%', // Sleek ring depth
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: '#94a3b8', // text-muted
                        font: {
                            family: "'Inter', sans-serif"
                        },
                        padding: 20
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (isAllZero) return 'No data yet';
                            return ` ${context.label}: ${context.raw} Reports`;
                        }
                    }
                }
            }
        }
    };

    // Create a new Chart instance
    threatChartInstance = new Chart(ctx, config);
}

// Auto-refresh the dashboard every 10 seconds for real-time updates
setInterval(loadDashboard, 10000);

// Initial load
loadDashboard();

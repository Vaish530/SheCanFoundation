/**
 * She Can Foundation - Admin Dashboard Script
 * Hand-coded Vanilla JS for managing database submissions, authentication, search, and dynamic rendering.
 */

document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupEventListeners();
});

// Cache for volunteer submissions
let submissionsCache = [];
let selectedSubmissionId = null;

// DOM Elements
const loginWrapper = document.getElementById('loginWrapper');
const dashboardWrapper = document.getElementById('dashboardWrapper');
const logoutBtn = document.getElementById('logoutBtn');
const adminLoginForm = document.getElementById('adminLoginForm');
const loginError = document.getElementById('loginError');

// Table & Filtering Elements
const submissionsTableBody = document.getElementById('submissionsTableBody');
const adminSearchInput = document.getElementById('adminSearchInput');
const adminRoleFilter = document.getElementById('adminRoleFilter');



// Modal Elements
const detailModal = document.getElementById('detailModal');
const modalRoleBadge = document.getElementById('modalRoleBadge');
const modalName = document.getElementById('modalName');
const modalEmail = document.getElementById('modalEmail');
const modalMessage = document.getElementById('modalMessage');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalDeleteBtn = document.getElementById('modalDeleteBtn');

// State for custom confirmation callback
let confirmCallback = null;

function showConfirmModal(message, onConfirm) {
    const confirmModal = document.getElementById('confirmModal');
    const confirmMessage = document.getElementById('confirmMessage');
    if (!confirmModal || !confirmMessage) return;
    
    confirmMessage.innerText = message;
    confirmCallback = onConfirm;
    confirmModal.classList.add('active');
}

function hideConfirmModal() {
    const confirmModal = document.getElementById('confirmModal');
    if (confirmModal) confirmModal.classList.remove('active');
    confirmCallback = null;
}

/* ==========================================================================
   AUTHENTICATION CHECKS
   ========================================================================== */

async function checkAuth() {
    try {
        const res = await fetch('/api/admin/check');
        const data = await res.json();

        if (data.authenticated) {
            showDashboard();
        } else {
            showLogin();
        }
    } catch (err) {
        console.error('Auth Check Error:', err);
        showLogin();
    }
}

function showLogin() {
    loginWrapper.style.display = 'block';
    dashboardWrapper.style.display = 'none';
    logoutBtn.style.display = 'none';
}

function showDashboard() {
    loginWrapper.style.display = 'none';
    dashboardWrapper.style.display = 'block';
    logoutBtn.style.display = 'block';
    fetchSubmissions();
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
    // Handle Login Submit
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            loginError.style.display = 'none';

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const res = await fetch('/api/admin/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await res.json();

                if (res.ok && data.success) {
                    showDashboard();
                    adminLoginForm.reset();
                } else {
                    loginError.style.display = 'block';
                }
            } catch (err) {
                console.error('Login Error:', err);
                loginError.style.display = 'block';
            }
        });
    }

    // Handle Logout Click
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const res = await fetch('/api/admin/logout', { method: 'POST' });
                if (res.ok) {
                    showLogin();
                    submissionsCache = [];
                }
            } catch (err) {
                console.error('Logout error:', err);
            }
        });
    }

    // Real-Time Search & Filtering
    if (adminSearchInput) {
        adminSearchInput.addEventListener('input', applyFilters);
    }
    if (adminRoleFilter) {
        adminRoleFilter.addEventListener('change', applyFilters);
    }

    // Modal Close Triggers
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeDetailsModal);
    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeDetailsModal);

    // Modal Delete Trigger
    if (modalDeleteBtn) {
        modalDeleteBtn.addEventListener('click', () => {
            if (selectedSubmissionId) {
                const subName = modalName.innerText;
                closeDetailsModal();
                showConfirmModal(`Are you sure you want to delete ${subName}'s registration?`, () => {
                    deleteSubmission(selectedSubmissionId);
                });
            }
        });
    }

    // Custom Confirmation Modal Buttons
    const confirmOkBtn = document.getElementById('confirmOkBtn');
    const confirmCancelBtn = document.getElementById('confirmCancelBtn');
    const confirmModal = document.getElementById('confirmModal');
    
    if (confirmOkBtn) {
        confirmOkBtn.addEventListener('click', () => {
            if (confirmCallback) confirmCallback();
            hideConfirmModal();
        });
    }
    
    if (confirmCancelBtn) {
        confirmCancelBtn.addEventListener('click', hideConfirmModal);
    }
    
    if (confirmModal) {
        confirmModal.addEventListener('click', (e) => {
            if (e.target === confirmModal) hideConfirmModal();
        });
    }
}

/* ==========================================================================
   DASHBOARD FETCH & RENDERING
   ========================================================================== */

async function fetchSubmissions() {
    try {
        const res = await fetch('/api/admin/submissions');
        const data = await res.json();

        if (res.ok && data.success) {
            submissionsCache = data.submissions;
            renderTable(submissionsCache);
            document.getElementById('lastSyncText').innerText = `Synced at ${new Date().toLocaleTimeString()}`;
        } else {
            submissionsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 40px; color: var(--danger);">
                        ⚠️ Failed to retrieve registrations. Please log in again.
                    </td>
                </tr>
            `;
        }
    } catch (err) {
        console.error('Fetch Error:', err);
    }
}



function renderTable(submissions) {
    if (submissions.length === 0) {
        submissionsTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No volunteer applications found.
                </td>
            </tr>
        `;
        return;
    }

    submissionsTableBody.innerHTML = '';
    
    submissions.forEach(sub => {
        const row = document.createElement('tr');
        row.style.cursor = 'pointer';
        
        // Format Date
        const dateObj = new Date(sub.createdAt);
        const formattedDate = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

        // Truncate Message preview
        const cleanMessage = sub.message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        const msgPreview = cleanMessage.length > 55 ? cleanMessage.substring(0, 52) + '...' : cleanMessage;

        const roleName = sub.role === 'training' ? 'Skills Livelihood' : sub.role;
        const capitalizedRole = roleName.charAt(0).toUpperCase() + roleName.slice(1);

        row.innerHTML = `
            <td style="white-space: nowrap;">${formattedDate}</td>
            <td style="font-weight: 600; color: var(--text-primary);">${escapeHtml(sub.name)}</td>
            <td><a href="mailto:${escapeHtml(sub.email)}" style="color: inherit; text-decoration: none;" onclick="event.stopPropagation();">${escapeHtml(sub.email)}</a></td>
            <td>${capitalizedRole}</td>
            <td style="max-width: 250px; font-style: italic;">"${msgPreview}"</td>
            <td style="text-align: center;" onclick="event.stopPropagation();">
                <button class="btn-delete" title="Delete Profile" data-id="${sub._id}">
                    <span class="material-icons" style="font-size: 20px;">delete</span>
                </button>
            </td>
        `;

        // Click row opens details modal
        row.addEventListener('click', () => openDetailsModal(sub));

        // Setup delete button click inside cell
        const deleteCellBtn = row.querySelector('.btn-delete');
        deleteCellBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showConfirmModal(`Are you sure you want to delete ${sub.name}'s registration?`, () => {
                deleteSubmission(sub._id);
            });
        });

        submissionsTableBody.appendChild(row);
    });
}

function applyFilters() {
    const query = adminSearchInput.value.toLowerCase().trim();
    const roleFilter = adminRoleFilter.value;

    const filtered = submissionsCache.filter(sub => {
        const matchesQuery = 
            sub.name.toLowerCase().includes(query) || 
            sub.email.toLowerCase().includes(query) || 
            sub.message.toLowerCase().includes(query);
            
        const matchesRole = roleFilter === 'all' || sub.role === roleFilter;

        return matchesQuery && matchesRole;
    });

    renderTable(filtered);
}

/* ==========================================================================
   MODAL CONTROLLER
   ========================================================================== */

function openDetailsModal(sub) {
    selectedSubmissionId = sub._id;
    
    // Setup badges
    modalRoleBadge.className = `card-tag badge-${sub.role}`;
    modalRoleBadge.innerText = sub.role === 'training' ? 'Skills Training & Livelihood' : sub.role;
    
    modalName.innerText = sub.name;
    modalEmail.innerText = sub.email;
    modalEmail.href = `mailto:${sub.email}`;
    modalMessage.innerHTML = escapeHtml(sub.message).replace(/\n/g, '<br>');

    detailModal.classList.add('active');
}

function closeDetailsModal() {
    detailModal.classList.remove('active');
    selectedSubmissionId = null;
}

/* ==========================================================================
   DELETE API CALL
   ========================================================================== */

async function deleteSubmission(id) {
    try {
        const res = await fetch(`/api/admin/submissions/${id}`, {
            method: 'DELETE'
        });
        const data = await res.json();

        if (res.ok && data.success) {
            // Remove from local cache and re-apply filters
            submissionsCache = submissionsCache.filter(sub => sub._id !== id);
            applyFilters();
        } else {
            alert('Failed to delete registration. Please try again.');
        }
    } catch (err) {
        console.error('Delete Error:', err);
    }
}

// Utility to escape HTML and prevent XSS injection
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

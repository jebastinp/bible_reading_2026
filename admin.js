// Admin panel logic

let isAuthenticated = false;
let currentAdmin = null;
// Ensure helper script is present (local-only mode)
function ensureDataSupabaseLoaded() {
    if (typeof initializeReadingPlan === 'undefined') {
        throw new Error('data-supabase.js did not load.');
    }
    window.__supabaseHelpersLoaded = true;
}

// Wait for helper globals to appear
async function waitForSupabaseHelpers(timeoutMs = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
        if (typeof initializeReadingPlan !== 'undefined') {
            return true;
        }
        await new Promise(r => setTimeout(r, 50));
    }
    return false;
}

// Local mode: always connected
async function ensureDataReady() {
    ensureDataSupabaseLoaded();
    const helpersReady = await waitForSupabaseHelpers();
    return helpersReady;
}

// Fallback: ensure verifyAdmin exists even if data-supabase.js failed to attach
if (typeof window.verifyAdmin === 'undefined') {
    console.warn('⚠️ verifyAdmin not found. Using fallback auth.');
    window.verifyAdmin = async (username, password) => {
        const fallback = {
            admin: 'bible2026',
            jebastin: 'admin123'
        };
        if (fallback[username] && fallback[username] === password) {
            return { success: true, admin: { id: 1, username } };
        }
        return { success: false, error: 'Invalid username or password' };
    };
}

// Guard missing initializeReadingPlan early to surface a clear error
if (typeof window.initializeReadingPlan === 'undefined') {
    console.error('❌ initializeReadingPlan is not defined. data-supabase.js may have failed to load.');
    window.initializeReadingPlan = async () => {
        const msg = 'Data helpers are missing. Ensure data-supabase.js is loaded before admin.js.';
        alert(msg);
        throw new Error(msg);
    };
}

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Wait for helpers to initialize
    try {
        await ensureDataSupabaseLoaded();
        const helpersReady = await waitForSupabaseHelpers();
        if (!helpersReady) {
            throw new Error('Data helpers did not load. Check for 404 on data-supabase.js.');
        }
        await initializeReadingPlan();
        checkAuthentication();
    } catch (err) {
        console.error('❌ Failed to initialize:', err);
        alert(err.message || 'Initialization failed. Please ensure data-supabase.js is loaded.');
    }
});

// Check if already authenticated
function checkAuthentication() {
    const authenticated = sessionStorage.getItem('adminAuthenticated');
    const adminData = sessionStorage.getItem('adminData');
    
    if (authenticated === 'true' && adminData) {
        isAuthenticated = true;
        currentAdmin = JSON.parse(adminData);
        showAdminPanel();
    }
}

// Handle password enter key
function handlePasswordEnter(event) {
    if (event.key === 'Enter') {
        login();
    }
}

// Handle username enter key
function handleUsernameEnter(event) {
    if (event.key === 'Enter') {
        document.getElementById('adminPassword').focus();
    }
}

// Login function - local authentication
async function login() {
    console.log('🔑 Login button clicked');
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const errorDiv = document.getElementById('loginError');
    const loginBtn = document.querySelector('.login-btn');
    
    console.log('📝 Username:', username);
    console.log('📝 Password length:', password.length);
    
    // Validation
    if (!username || !password) {
        errorDiv.textContent = 'Please enter both username and password';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Show loading state
    loginBtn.disabled = true;
    loginBtn.textContent = 'Verifying...';
    errorDiv.style.display = 'none';
    
    try {
        console.log('🔐 Calling verifyAdmin...');
        // Verify credentials with local auth
        const result = await verifyAdmin(username, password);
        console.log('📊 Verification result:', result);
        
        if (result.success) {
            console.log('✅ Login successful!');
            isAuthenticated = true;
            currentAdmin = result.admin;
            
            // Store in session
            sessionStorage.setItem('adminAuthenticated', 'true');
            sessionStorage.setItem('adminData', JSON.stringify(result.admin));
            
            // Clear form
            document.getElementById('adminUsername').value = '';
            document.getElementById('adminPassword').value = '';
            errorDiv.style.display = 'none';
            
            // Show admin panel
            await showAdminPanel();
        } else {
            console.error('❌ Login failed:', result.error);
            errorDiv.textContent = result.error || 'Invalid username or password';
            errorDiv.style.display = 'block';
            document.getElementById('adminPassword').value = '';
        }
    } catch (err) {
        console.error('💥 Login exception:', err);
        errorDiv.textContent = 'Login failed: ' + err.message;
        errorDiv.style.display = 'block';
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'Login';
    }
}

// Show admin panel
async function showAdminPanel() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    
    console.log('📊 Loading admin panel...');
    
    try {
        const connected = await ensureDataReady();
        if (!connected) {
            showErrorMessage('Data helpers not ready. Using sample data.');
        }
        await loadAdminStats();
        await loadParticipantsList();
        await loadUserFilter();
        await loadProgressMonitor();
        await setDefaultWeek();
        
        console.log('✅ Admin panel loaded successfully');
    } catch (error) {
        console.error('❌ Error loading admin panel:', error);
        showErrorMessage(error.message || 'Failed to load admin panel.');
    }
}

// Logout function
function logout() {
    sessionStorage.removeItem('adminAuthenticated');
    sessionStorage.removeItem('adminData');
    isAuthenticated = false;
    currentAdmin = null;
    window.location.href = 'index.html';
}

// Load admin statistics
async function loadAdminStats() {
    const participants = await getParticipants({ strict: true });
    const completions = await getCompletions();
    const todayString = getTodayString();
    
    // Total participants
    document.getElementById('totalParticipants').textContent = participants.length;
    
    // Total completions
    document.getElementById('totalCompletions').textContent = completions.length;
    
    // Average completion percentage
    const totalReadings = getReadingsUpToDate(todayString).length;
    let totalPercentage = 0;
    
    participants.forEach(name => {
        const userCompletions = completions.filter(c => c.userName === name).length;
        const percentage = totalReadings > 0 ? (userCompletions / totalReadings) * 100 : 0;
        totalPercentage += percentage;
    });
    
    const avgCompletion = participants.length > 0 ? Math.round(totalPercentage / participants.length) : 0;
    document.getElementById('avgCompletion').textContent = avgCompletion + '%';
    
    // Today's completions
    const todayCompletions = completions.filter(c => c.date === todayString).length;
    document.getElementById('todayCompletions').textContent = todayCompletions;
}

// Add new participant
async function addParticipant() {
    console.log('➕ Add participant clicked');
    const input = document.getElementById('newUserName');
    const name = input.value.trim();
    
    if (!name) {
        alert('Please enter a name');
        return;
    }
    
    console.log('👤 Adding participant:', name);

    const connected = await ensureDataReady();
    if (!connected) {
        alert('Data helpers are not ready. Please refresh the page.');
        return;
    }

    const participants = await getParticipants({ strict: true });
    
    if (participants.includes(name)) {
        alert('This participant already exists');
        return;
    }
    
    try {
        await saveParticipant(name);
        
        input.value = '';
        await loadParticipantsList();
        await loadAdminStats();
        await loadUserFilter();
        
        showSuccessMessage(`${name} added successfully!`);
        console.log('✅ Participant added successfully:', name);
    } catch (error) {
        console.error('❌ Error adding participant:', error);
        alert('Failed to add participant: ' + error.message);
    }
}

// Load participants list
async function loadParticipantsList() {
    const participants = await getParticipants({ strict: true });
    const completions = await getCompletions();
    const todayString = getTodayString();
    const totalReadings = getReadingsUpToDate(todayString).length;
    
    const container = document.getElementById('participantsList');
    container.innerHTML = '';
    
    if (participants.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <p style="color: var(--text-secondary);">No participants yet. Add some above!</p>
            </div>
        `;
        return;
    }
    
    participants.forEach(name => {
        const userCompletions = completions.filter(c => c.userName === name);
        const percentage = totalReadings > 0 ? Math.round((userCompletions.length / totalReadings) * 100) : 0;
        
        const card = document.createElement('div');
        card.className = 'admin-participant-card';
        
        card.innerHTML = `
            <div class="admin-participant-info">
                <h4>${name}</h4>
                <p>${userCompletions.length} readings • ${percentage}% complete</p>
            </div>
            <button class="btn-danger" onclick="removeParticipantConfirm('${name}')">Remove</button>
        `;
        
        container.appendChild(card);
    });
}

// Remove participant
async function removeParticipantConfirm(name) {
    if (!confirm(`Are you sure you want to remove ${name}? This will mark them as inactive.`)) {
        return;
    }
    
    try {
        await removeParticipant(name);
        
        await loadParticipantsList();
        await loadAdminStats();
        await loadUserFilter();
        await loadProgressMonitor();
        
        showSuccessMessage(`${name} removed successfully`);
    } catch (error) {
        console.error('Error removing participant:', error);
        alert('Failed to remove participant. Please try again.');
    }
}

// Load user filter dropdown
async function loadUserFilter() {
    const participants = await getParticipants({ strict: true });
    const select = document.getElementById('userFilter');
    
    select.innerHTML = '<option value="">All Users</option>';
    
    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Set default week
async function setDefaultWeek() {
    const today = new Date();
    const weekInput = document.getElementById('weekSelector');
    
    // Format: YYYY-Www
    const year = today.getFullYear();
    const week = getWeekNumber(today);
    weekInput.value = `${year}-W${String(week).padStart(2, '0')}`;
    
    await loadWeeklyReport();
}

// Get week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

// Load weekly report
async function loadWeeklyReport() {
    console.log('📅 Loading weekly report...');
    const weekInput = document.getElementById('weekSelector');
    const weekValue = weekInput.value;
    
    if (!weekValue) {
        console.warn('⚠️ No week selected');
        return;
    }
    
    console.log('📊 Week selected:', weekValue);
    
    // Parse week value (YYYY-Www)
    const [year, week] = weekValue.split('-W');
    
    // Get date range for the week
    const firstDay = getDateOfISOWeek(parseInt(week), parseInt(year));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    
    // Get all readings for the week
    const weekReadings = BIBLE_READING_PLAN.filter(reading => {
        const readingDate = new Date(reading.date);
        return readingDate >= firstDay && readingDate <= lastDay;
    });
    
    let participants;
    let completions;
    try {
        participants = await getParticipants({ strict: true });
        completions = await getCompletions();
    } catch (error) {
        console.error('❌ Error loading weekly data:', error);
        document.getElementById('weeklyReportContent').innerHTML = '<p style="color: var(--accent-red); padding: 20px;">Unable to load weekly report. Please refresh.</p>';
        return;
    }
    
    const container = document.getElementById('weeklyReportContent');
    container.innerHTML = '';
    
    if (weekReadings.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 20px;">No readings scheduled for this week</p>';
        return;
    }
    
    container.innerHTML = `
        <h3 style="padding: 0 0 16px 0; font-size: 16px;">Week ${week}, ${year}</h3>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-primary);">
                        <th style="padding: 12px; text-align: left; font-size: 14px;">Participant</th>
                        <th style="padding: 12px; text-align: center; font-size: 14px;">Completed</th>
                        <th style="padding: 12px; text-align: center; font-size: 14px;">Missed</th>
                        <th style="padding: 12px; text-align: center; font-size: 14px;">Rate</th>
                    </tr>
                </thead>
                <tbody>
                    ${participants.map(name => {
                        const userWeekCompletions = completions.filter(c => {
                            const compDate = new Date(c.date);
                            return c.userName === name && compDate >= firstDay && compDate <= lastDay;
                        }).length;
                        
                        const missed = weekReadings.length - userWeekCompletions;
                        const rate = weekReadings.length > 0 ? Math.round((userWeekCompletions / weekReadings.length) * 100) : 0;
                        
                        return `
                            <tr style="border-bottom: 1px solid #E2E8F0;">
                                <td style="padding: 12px; font-weight: 600;">${name}</td>
                                <td style="padding: 12px; text-align: center; color: var(--accent-green);">${userWeekCompletions}</td>
                                <td style="padding: 12px; text-align: center; color: var(--accent-red);">${missed}</td>
                                <td style="padding: 12px; text-align: center;">
                                    <span style="background: ${rate >= 80 ? 'var(--accent-green)' : rate >= 50 ? 'var(--accent-orange)' : 'var(--accent-red)'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600;">
                                        ${rate}%
                                    </span>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Get date of ISO week
function getDateOfISOWeek(week, year) {
    const simple = new Date(year, 0, 1 + (week - 1) * 7);
    const dow = simple.getDay();
    const ISOweekStart = simple;
    if (dow <= 4)
        ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
    else
        ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
    return ISOweekStart;
}

// Load progress monitor
async function loadProgressMonitor() {
    await filterProgress();
}

// Filter progress
async function filterProgress() {
    const userFilter = document.getElementById('userFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    let completions = await getCompletions();
    
    // Apply filters
    if (userFilter) {
        completions = completions.filter(c => c.userName === userFilter);
    }
    
    if (dateFilter) {
        completions = completions.filter(c => c.date === dateFilter);
    }
    
    // Sort by date (newest first)
    completions.sort((a, b) => new Date(b.completedOn) - new Date(a.completedOn));
    
    const container = document.getElementById('progressMonitorList');
    container.innerHTML = '';
    
    if (completions.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No completions found</p>';
        return;
    }
    
    completions.slice(0, 50).forEach(completion => {
        const date = new Date(completion.date);
        const completedDate = new Date(completion.completedOn);
        const isCatchup = completion.catchup || false;
        
        const item = document.createElement('div');
        item.className = 'monitor-item';
        
        item.innerHTML = `
            <div class="monitor-info">
                <h4>${completion.userName} ${isCatchup ? '<span style="color: var(--accent-orange); font-size: 11px;">(CATCH-UP)</span>' : ''}</h4>
                <p>${completion.portion} • ${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <div style="text-align: right;">
                <div style="color: var(--accent-green); font-weight: 600; font-size: 14px;">✓ Completed</div>
                <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${completedDate.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
    
    if (completions.length > 50) {
        const moreMsg = document.createElement('p');
        moreMsg.style.cssText = 'text-align: center; color: var(--text-secondary); padding: 16px; font-size: 13px;';
        moreMsg.textContent = `Showing 50 of ${completions.length} completions`;
        container.appendChild(moreMsg);
    }
}

// Export all data
async function exportAllData() {
    try {
        const participants = await getParticipants({ strict: true });
        const completions = await getCompletions();
        const todayString = getTodayString();
        const totalReadings = getReadingsUpToDate(todayString).length;
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Bible Reading Tracker - Complete Report\n";
        csvContent += `Generated: ${new Date().toLocaleString()}\n`;
        csvContent += `Total Participants: ${participants.length}\n`;
        csvContent += `Total Completions: ${completions.length}\n\n`;
        csvContent += "User Name,Reading Date,Portion,Day,Completed On,Type,Status\n";
        
        participants.forEach(name => {
            const userCompletions = completions.filter(c => c.userName === name);
            
            // Get all readings up to today
            const allReadings = getReadingsUpToDate(todayString);
            
            allReadings.forEach(reading => {
                const completion = userCompletions.find(c => c.date === reading.date);
                
                if (completion) {
                    const type = completion.catchup ? 'Catch-up' : 'Regular';
                    csvContent += `${name},${reading.date},${reading.portion},${reading.day},${new Date(completion.completedOn).toLocaleString()},${type},Completed\n`;
                } else {
                    csvContent += `${name},${reading.date},${reading.portion},${reading.day},Not Completed,N/A,Pending\n`;
                }
            });
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_reading_complete_report_${formatDate(new Date())}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage('Data exported successfully!');
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        alert('Failed to export data. Please try again.');
    }
}

// Show success message
function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #48BB78 0%, #38A169 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
    msgDiv.textContent = message;
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => msgDiv.remove(), 3000);
}

    // Show error message
    function showErrorMessage(message) {
        const msgDiv = document.createElement('div');
        msgDiv.style.cssText = `
            position: fixed;
            top: 80px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #F56565 0%, #E53E3E 100%);
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(229, 62, 62, 0.3);
            z-index: 1000;
            font-weight: 600;
        `;
        msgDiv.textContent = message;

        document.body.appendChild(msgDiv);
        setTimeout(() => msgDiv.remove(), 3500);
    }

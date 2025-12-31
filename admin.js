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
        await initializeDownloadSection();
        
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
            <div class="admin-participant-actions">
                <button class="btn-secondary btn-small" onclick="renameParticipant('${name}')" title="Rename">✏️</button>
                <button class="btn-danger btn-small" onclick="removeParticipantConfirm('${name}')" title="Remove">✖</button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Remove participant
async function removeParticipantConfirm(name) {
    if (!confirm(`Are you sure you want to remove ${name}? This will remove them from the participants list.`)) {
        return;
    }
    
    try {
        await removeParticipant(name);
        
        await loadParticipantsList();
        await loadAdminStats();
        await loadUserFilter();
        await loadProgressMonitor();
        await loadDownloadUserSelector();
        
        showSuccessMessage(`${name} removed successfully`);
    } catch (error) {
        console.error('Error removing participant:', error);
        alert('Failed to remove participant. Please try again.');
    }
}

// Rename participant
async function renameParticipant(oldName) {
    const newName = prompt(`Enter new name for "${oldName}":`, oldName);
    
    if (!newName || newName.trim() === '' || newName.trim() === oldName) {
        return;
    }
    
    const trimmedName = newName.trim();
    
    try {
        const participants = await getParticipants({ strict: true });
        
        if (participants.includes(trimmedName)) {
            alert('A participant with this name already exists!');
            return;
        }
        
        // Get all completions for old name
        const completions = await getCompletions();
        const userCompletions = completions.filter(c => c.userName === oldName);
        
        // Add new participant
        await saveParticipant(trimmedName);
        
        // Transfer all completions to new name
        for (const completion of userCompletions) {
            await saveCompletion(trimmedName, completion.date, completion.portion, completion.day, completion.catchup);
            await removeCompletion(oldName, completion.date);
        }
        
        // Remove old participant
        await removeParticipant(oldName);
        
        await loadParticipantsList();
        await loadAdminStats();
        await loadUserFilter();
        await loadProgressMonitor();
        await loadDownloadUserSelector();
        
        showSuccessMessage(`Renamed "${oldName}" to "${trimmedName}" successfully!`);
    } catch (error) {
        console.error('Error renaming participant:', error);
        alert('Failed to rename participant. Please try again.');
    }
}

// Clear participant's progress data
async function clearParticipantData(name) {
    if (!confirm(`Are you sure you want to clear all progress data for ${name}?\n\nThis will delete all their completions and points. This action cannot be undone!`)) {
        return;
    }
    
    try {
        const completions = await getCompletions();
        const userCompletions = completions.filter(c => c.userName === name);
        
        // Remove all completions for this user
        for (const completion of userCompletions) {
            await removeCompletion(name, completion.date);
        }
        
        await loadParticipantsList();
        await loadAdminStats();
        await loadProgressMonitor();
        
        showSuccessMessage(`Cleared all progress data for ${name}`);
    } catch (error) {
        console.error('Error clearing participant data:', error);
        alert('Failed to clear participant data. Please try again.');
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

// Initialize download section
async function initializeDownloadSection() {
    // Set default week for download
    const today = new Date();
    const weekInput = document.getElementById('downloadWeekSelector');
    if (weekInput) {
        const year = today.getFullYear();
        const week = getWeekNumber(today);
        weekInput.value = `${year}-W${String(week).padStart(2, '0')}`;
    }
    
    // Set default month for download
    const monthInput = document.getElementById('downloadMonthSelector');
    if (monthInput) {
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        monthInput.value = `${year}-${month}`;
    }
    
    // Set default date range (current week)
    const fromDate = document.getElementById('downloadFromDate');
    const toDate = document.getElementById('downloadToDate');
    if (fromDate && toDate) {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
        
        fromDate.value = formatDate(startOfWeek);
        toDate.value = formatDate(endOfWeek);
    }
    
    // Load user dropdown for individual report
    await loadDownloadUserSelector();
}

// Load user dropdown for individual report
async function loadDownloadUserSelector() {
    const participants = await getParticipants({ strict: true });
    const select = document.getElementById('downloadUserSelector');
    
    if (!select) return;
    
    select.innerHTML = '<option value="">Select participant...</option>';
    
    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Download Weekly Report
async function downloadWeeklyReport() {
    const weekInput = document.getElementById('downloadWeekSelector');
    const weekValue = weekInput.value;
    
    if (!weekValue) {
        alert('Please select a week');
        return;
    }
    
    const [year, week] = weekValue.split('-W');
    
    // Get date range for the week
    const firstDay = getDateOfISOWeek(parseInt(week), parseInt(year));
    const lastDay = new Date(firstDay);
    lastDay.setDate(lastDay.getDate() + 6);
    
    try {
        const participants = await getParticipants({ strict: true });
        const completions = await getCompletions();
        
        // Get readings for the week
        const weekReadings = BIBLE_READING_PLAN.filter(reading => {
            const readingDate = new Date(reading.date);
            return readingDate >= firstDay && readingDate <= lastDay;
        });
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Bible Reading - Weekly Report\n`;
        csvContent += `Week ${week}, ${year}\n`;
        csvContent += `Date Range: ${formatDate(firstDay)} to ${formatDate(lastDay)}\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
        csvContent += "Participant,Completed,Missed,Completion Rate,Details\n";
        
        participants.forEach(name => {
            const userWeekCompletions = completions.filter(c => {
                const compDate = new Date(c.date);
                return c.userName === name && compDate >= firstDay && compDate <= lastDay;
            });
            
            const completed = userWeekCompletions.length;
            const missed = weekReadings.length - completed;
            const rate = weekReadings.length > 0 ? Math.round((completed / weekReadings.length) * 100) : 0;
            
            const completedDates = userWeekCompletions.map(c => c.date).join('; ');
            
            csvContent += `${name},${completed},${missed},${rate}%,"${completedDates}"\n`;
        });
        
        // Add summary
        csvContent += `\n\nWeekly Summary\n`;
        csvContent += `Total Participants,${participants.length}\n`;
        csvContent += `Total Readings This Week,${weekReadings.length}\n`;
        
        const totalCompleted = completions.filter(c => {
            const compDate = new Date(c.date);
            return compDate >= firstDay && compDate <= lastDay;
        }).length;
        csvContent += `Total Completions,${totalCompleted}\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_reading_week${week}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage(`Week ${week} report downloaded!`);
    } catch (error) {
        console.error('❌ Error downloading weekly report:', error);
        alert('Failed to download report. Please try again.');
    }
}

// Download Date Range Report
async function downloadDateRangeReport() {
    const fromDate = document.getElementById('downloadFromDate').value;
    const toDate = document.getElementById('downloadToDate').value;
    
    if (!fromDate || !toDate) {
        alert('Please select both from and to dates');
        return;
    }
    
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);
    
    if (startDate > endDate) {
        alert('From date must be before To date');
        return;
    }
    
    try {
        const participants = await getParticipants({ strict: true });
        const completions = await getCompletions();
        
        // Get readings for the date range
        const rangeReadings = BIBLE_READING_PLAN.filter(reading => {
            const readingDate = new Date(reading.date);
            return readingDate >= startDate && readingDate <= endDate;
        });
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Bible Reading - Date Range Report\n`;
        csvContent += `From: ${fromDate} To: ${toDate}\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
        csvContent += "Participant,Date,Portion,Day,Status,Completed On,Type\n";
        
        participants.forEach(name => {
            const userCompletions = completions.filter(c => c.userName === name);
            
            rangeReadings.forEach(reading => {
                const completion = userCompletions.find(c => c.date === reading.date);
                
                if (completion) {
                    const type = completion.catchup ? 'Catch-up' : 'Regular';
                    csvContent += `${name},${reading.date},"${reading.portion}",Day ${reading.day},Completed,${new Date(completion.completedOn).toLocaleString()},${type}\n`;
                } else {
                    csvContent += `${name},${reading.date},"${reading.portion}",Day ${reading.day},Pending,-,-\n`;
                }
            });
        });
        
        // Add summary
        csvContent += `\n\nSummary\n`;
        csvContent += `Total Participants,${participants.length}\n`;
        csvContent += `Total Readings in Range,${rangeReadings.length}\n`;
        
        const totalCompleted = completions.filter(c => {
            const compDate = new Date(c.date);
            return compDate >= startDate && compDate <= endDate;
        }).length;
        csvContent += `Total Completions,${totalCompleted}\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_reading_${fromDate}_to_${toDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage('Date range report downloaded!');
    } catch (error) {
        console.error('❌ Error downloading date range report:', error);
        alert('Failed to download report. Please try again.');
    }
}

// Download Monthly Report
async function downloadMonthlyReport() {
    const monthInput = document.getElementById('downloadMonthSelector');
    const monthValue = monthInput.value;
    
    if (!monthValue) {
        alert('Please select a month');
        return;
    }
    
    const [year, month] = monthValue.split('-');
    
    // Get first and last day of month
    const firstDay = new Date(parseInt(year), parseInt(month) - 1, 1);
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    
    const monthName = firstDay.toLocaleString('en-US', { month: 'long' });
    
    try {
        const participants = await getParticipants({ strict: true });
        const completions = await getCompletions();
        
        // Get readings for the month
        const monthReadings = BIBLE_READING_PLAN.filter(reading => {
            const readingDate = new Date(reading.date);
            return readingDate >= firstDay && readingDate <= lastDay;
        });
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Bible Reading - Monthly Report\n`;
        csvContent += `${monthName} ${year}\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
        csvContent += "Participant,Total Completed,Total Missed,Completion Rate,Regular Completions,Catch-up Completions,Points Earned\n";
        
        participants.forEach(name => {
            const userCompletions = completions.filter(c => c.userName === name);
            const userMonthCompletions = userCompletions.filter(c => {
                const compDate = new Date(c.date);
                return compDate >= firstDay && compDate <= lastDay;
            });
            
            const completed = userMonthCompletions.length;
            const missed = monthReadings.length - completed;
            const rate = monthReadings.length > 0 ? Math.round((completed / monthReadings.length) * 100) : 0;
            
            const regularCompletions = userMonthCompletions.filter(c => !c.catchup).length;
            const catchupCompletions = userMonthCompletions.filter(c => c.catchup).length;
            
            // Calculate points
            const regularPoints = regularCompletions * 10;
            const catchupPoints = catchupCompletions * 5;
            const totalPoints = regularPoints + catchupPoints;
            
            csvContent += `${name},${completed},${missed},${rate}%,${regularCompletions},${catchupCompletions},${totalPoints}\n`;
        });
        
        // Add summary
        csvContent += `\n\nMonthly Summary\n`;
        csvContent += `Total Participants,${participants.length}\n`;
        csvContent += `Total Readings This Month,${monthReadings.length}\n`;
        
        const totalCompleted = completions.filter(c => {
            const compDate = new Date(c.date);
            return compDate >= firstDay && compDate <= lastDay;
        }).length;
        csvContent += `Total Completions,${totalCompleted}\n`;
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_reading_${monthName.toLowerCase()}_${year}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage(`${monthName} ${year} report downloaded!`);
    } catch (error) {
        console.error('❌ Error downloading monthly report:', error);
        alert('Failed to download report. Please try again.');
    }
}

// Download Individual Report
async function downloadIndividualReport() {
    const userSelect = document.getElementById('downloadUserSelector');
    const selectedUser = userSelect.value;
    
    if (!selectedUser) {
        alert('Please select a participant');
        return;
    }
    
    try {
        const completions = await getCompletions();
        const todayString = getTodayString();
        
        const userCompletions = completions.filter(c => c.userName === selectedUser);
        
        // Get all readings up to today
        const allReadings = getReadingsUpToDate(todayString);
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += `Bible Reading - Individual Report\n`;
        csvContent += `Participant: ${selectedUser}\n`;
        csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
        
        // Calculate stats
        const totalReadings = allReadings.length;
        const totalCompleted = userCompletions.length;
        const regularCompletions = userCompletions.filter(c => !c.catchup).length;
        const catchupCompletions = userCompletions.filter(c => c.catchup).length;
        
        // Points calculation
        const regularPoints = regularCompletions * 10;
        const catchupPoints = catchupCompletions * 5;
        
        // Calculate streak
        let currentStreak = 0;
        const sortedDates = allReadings.map(r => r.date).sort().reverse();
        for (const date of sortedDates) {
            if (userCompletions.find(c => c.date === date)) {
                currentStreak++;
            } else {
                break;
            }
        }
        const streakBonus = currentStreak * 2;
        const totalPoints = regularPoints + catchupPoints + streakBonus;
        
        csvContent += `Summary Statistics\n`;
        csvContent += `Total Readings Available,${totalReadings}\n`;
        csvContent += `Total Completed,${totalCompleted}\n`;
        csvContent += `Completion Rate,${totalReadings > 0 ? Math.round((totalCompleted / totalReadings) * 100) : 0}%\n`;
        csvContent += `Regular Completions,${regularCompletions}\n`;
        csvContent += `Catch-up Completions,${catchupCompletions}\n`;
        csvContent += `Current Streak,${currentStreak} days\n\n`;
        
        csvContent += `Points Breakdown\n`;
        csvContent += `Regular Points (${regularCompletions} x 10),${regularPoints}\n`;
        csvContent += `Catch-up Points (${catchupCompletions} x 5),${catchupPoints}\n`;
        csvContent += `Streak Bonus (${currentStreak} x 2),${streakBonus}\n`;
        csvContent += `Total Points,${totalPoints}\n\n`;
        
        csvContent += `Detailed Reading Log\n`;
        csvContent += "Date,Day,Portion,Status,Completed On,Type,Points\n";
        
        allReadings.forEach(reading => {
            const completion = userCompletions.find(c => c.date === reading.date);
            
            if (completion) {
                const type = completion.catchup ? 'Catch-up' : 'Regular';
                const points = completion.catchup ? 5 : 10;
                csvContent += `${reading.date},Day ${reading.day},"${reading.portion}",Completed,${new Date(completion.completedOn).toLocaleString()},${type},${points}\n`;
            } else {
                csvContent += `${reading.date},Day ${reading.day},"${reading.portion}",Pending,-,-,0\n`;
            }
        });
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `bible_reading_${selectedUser.replace(/\s+/g, '_')}_report.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showSuccessMessage(`${selectedUser}'s report downloaded!`);
    } catch (error) {
        console.error('❌ Error downloading individual report:', error);
        alert('Failed to download report. Please try again.');
    }
}

// Reset all data for New Year
async function resetForNewYear() {
    const confirmFirst = confirm('⚠️ WARNING: This will delete ALL completion data!\n\nAre you sure you want to reset everything for the new year?');
    
    if (!confirmFirst) return;
    
    const confirmSecond = confirm('🚨 FINAL CONFIRMATION\n\nThis action CANNOT be undone!\n\nType OK to confirm you want to clear all completions, points, and progress data.');
    
    if (!confirmSecond) return;
    
    try {
        console.log('🗑️ Starting New Year reset...');
        
        // Clear all completions from Firebase
        await clearAllCompletions();
        
        console.log('✅ All completions cleared from Firebase');
        
        // Reload admin stats
        await loadAdminStats();
        await loadProgressMonitor();
        await loadWeeklyReport();
        
        showSuccessMessage('🎆 New Year Reset Complete! All data cleared. Ready for 2026!');
        
        console.log('✅ New Year reset completed successfully');
    } catch (error) {
        console.error('❌ Error during New Year reset:', error);
        alert('Failed to reset data. Please try again.\n\nError: ' + error.message);
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

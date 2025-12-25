// Progress page logic

let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Always show popup first - user must select their name each time
    showSelectNamePopup();
});

// Show popup to select name
async function showSelectNamePopup() {
    // Load participants for dropdown
    await initializeReadingPlan();
    const participants = await getParticipants();
    
    // Create options HTML
    let optionsHTML = '<option value="">Choose your name...</option>';
    participants.forEach(p => {
        optionsHTML += `<option value="${p.name}">${p.name}</option>`;
    });
    
    // Create overlay with inline styles
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        padding: 20px;
    `;
    
    overlay.innerHTML = `
        <div class="popup-card" style="
            background: #FFFFFF;
            border-radius: 24px;
            padding: 40px 32px;
            text-align: center;
            max-width: 340px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        ">
            <div style="font-size: 64px; margin-bottom: 16px;">📊</div>
            <h2 style="font-size: 24px; font-weight: 700; color: #2D2D2D; margin-bottom: 12px;">View Progress</h2>
            <p style="font-size: 15px; color: #6B6B6B; margin-bottom: 24px; line-height: 1.5;">Select your name to view your reading progress.</p>
            <select id="popupUserSelect" style="
                width: 100%;
                padding: 14px 16px;
                font-size: 16px;
                border-radius: 12px;
                border: 2px solid #E5E5E5;
                margin-bottom: 16px;
                background: #FAFAFA;
                color: #2D2D2D;
                cursor: pointer;
            ">
                ${optionsHTML}
            </select>
            <button onclick="selectUserAndShowProgress()" style="
                width: 100%;
                padding: 16px 24px;
                font-size: 16px;
                font-weight: 600;
                border-radius: 50px;
                background: linear-gradient(135deg, #D4A574 0%, #C4956A 100%);
                color: white;
                border: none;
                cursor: pointer;
            ">
                View My Progress
            </button>
            <button onclick="window.location.href='index.html'" style="
                width: 100%;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: 500;
                border-radius: 50px;
                background: transparent;
                color: #6B6B6B;
                border: none;
                cursor: pointer;
                margin-top: 8px;
            ">
                ← Back to Home
            </button>
        </div>
    `;
    document.body.appendChild(overlay);
}

// Select user from popup and show progress
async function selectUserAndShowProgress() {
    const select = document.getElementById('popupUserSelect');
    const selectedUser = select.value;
    
    if (!selectedUser) {
        alert('Please select your name');
        return;
    }
    
    currentUser = selectedUser;
    saveCurrentUser(selectedUser);
    
    // Remove popup
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.remove();
    }
    
    // Show progress
    document.getElementById('progressUserName').textContent = currentUser;
    await updateProgressDisplay();
    await loadReadingHistory();
}

// Load current user
function loadCurrentUser() {
    currentUser = getCurrentUser();
    if (currentUser) {
        document.getElementById('progressUserName').textContent = currentUser;
    }
}

// Calculate progress statistics
async function calculateProgress() {
    const todayString = getTodayString();
    const totalReadings = getReadingsUpToDate(todayString).length;
    
    const completions = await getCompletions();
    const userCompletions = completions.filter(c => c.userName === currentUser);
    const completedCount = userCompletions.length;
    
    const percentage = totalReadings > 0 ? Math.round((completedCount / totalReadings) * 100) : 0;
    const remaining = totalReadings - completedCount;
    
    // Calculate streak
    const streak = calculateStreak(userCompletions);
    
    return {
        total: totalReadings,
        completed: completedCount,
        percentage: percentage,
        remaining: remaining > 0 ? remaining : 0,
        streak: streak
    };
}

// Calculate reading streak
function calculateStreak(userCompletions) {
    if (userCompletions.length === 0) return 0;
    
    // Sort completions by date (newest first)
    const sortedCompletions = userCompletions
        .map(c => c.date)
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
        const dateString = formatDate(currentDate);
        
        // Skip weekends
        if (isWeekend(currentDate)) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }
        
        // Check if reading for this date exists
        const reading = getReadingForDate(dateString);
        if (!reading) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }
        
        // Check if user completed this reading
        if (sortedCompletions.includes(dateString)) {
            streak++;
        } else {
            // If it's not today, break the streak
            if (i > 0) break;
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Update progress display
async function updateProgressDisplay() {
    const stats = await calculateProgress();
    
    // Update progress circle
    const circle = document.getElementById('progressCircle');
    const circumference = 2 * Math.PI * 85;
    const offset = circumference - (stats.percentage / 100) * circumference;
    
    circle.style.strokeDasharray = circumference;
    circle.style.strokeDashoffset = offset;
    
    // Add gradient to circle
    const svg = circle.closest('svg');
    if (!svg.querySelector('defs')) {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        gradient.setAttribute('id', 'progressGradient');
        gradient.setAttribute('x1', '0%');
        gradient.setAttribute('y1', '0%');
        gradient.setAttribute('x2', '100%');
        gradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#F2C94C');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#D4A574');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
    
    // Update percentage text with animation
    animateValue('progressPercentage', 0, stats.percentage, 1500);
    
    // Update stat cards with animation
    animateValue('completedCount', 0, stats.completed, 1000);
    animateValue('totalCount', 0, stats.total, 1000);
    animateValue('remainingCount', 0, stats.remaining, 1000);
    animateValue('streakCount', 0, stats.streak, 1000);
}

// Animate counting up numbers
function animateValue(elementId, start, end, duration) {
    const element = document.getElementById(elementId);
    const isPercentage = elementId === 'progressPercentage';
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(start + (end - start) * easeOut);
        
        element.textContent = isPercentage ? current + '%' : current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// Load reading history
async function loadReadingHistory() {
    const completions = await getCompletions();
    const userCompletions = completions
        .filter(c => c.userName === currentUser)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    
    const container = document.getElementById('historyList');
    container.innerHTML = '';
    
    if (userCompletions.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <span style="font-size: 64px; display: block; margin-bottom: 16px;">📚</span>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">No readings yet</h3>
                <p style="color: var(--text-secondary);">Start your Bible reading journey today!</p>
            </div>
        `;
        return;
    }
    
    userCompletions.forEach(completion => {
        const date = new Date(completion.date);
        const completedDate = new Date(completion.completedOn);
        
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const isCatchup = completion.catchup || false;
        
        item.innerHTML = `
            <div class="history-info">
                <h4>${formatPortionDisplay(completion.portion)} ${isCatchup ? '<span style="color: var(--accent-orange); font-size: 12px;">(Catch-up)</span>' : ''}</h4>
                <p>${completion.day} - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
            <div class="history-date">
                <div style="color: var(--accent-green); font-weight: 600; font-size: 14px;">✓ Completed</div>
                <div style="font-size: 12px; margin-top: 2px;">${completedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
        `;
        
        container.appendChild(item);
    });
}

// Export progress
async function exportProgress() {
    const stats = await calculateProgress();
    const completions = await getCompletions();
    const userCompletions = completions.filter(c => c.userName === currentUser);
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Bible Reading Progress Report\n";
    csvContent += `User: ${currentUser}\n`;
    csvContent += `Generated: ${new Date().toLocaleString()}\n\n`;
    csvContent += `Total Readings: ${stats.total}\n`;
    csvContent += `Completed: ${stats.completed}\n`;
    csvContent += `Progress: ${stats.percentage}%\n`;
    csvContent += `Current Streak: ${stats.streak} days\n\n`;
    csvContent += "Date,Portion,Day,Completed On,Type\n";
    
    userCompletions
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .forEach(completion => {
            const type = completion.catchup ? 'Catch-up' : 'Regular';
            csvContent += `${completion.date},${completion.portion},${completion.day},${new Date(completion.completedOn).toLocaleString()},${type}\n`;
        });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `bible_progress_${currentUser}_${formatDate(new Date())}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showSuccessMessage('Progress exported successfully!');
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

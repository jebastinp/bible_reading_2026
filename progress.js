// Progress page logic

let currentUser = null;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await initializeReadingPlan();
    loadCurrentUser();
    if (currentUser) {
        await updateProgressDisplay();
        await loadReadingHistory();
    } else {
        window.location.href = 'index.html';
    }
});

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
        stop1.setAttribute('stop-color', '#667EEA');
        
        const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#764BA2');
        
        gradient.appendChild(stop1);
        gradient.appendChild(stop2);
        defs.appendChild(gradient);
        svg.appendChild(defs);
    }
    
    // Update percentage text
    document.getElementById('progressPercentage').textContent = stats.percentage + '%';
    
    // Update stat cards
    document.getElementById('completedCount').textContent = stats.completed;
    document.getElementById('totalCount').textContent = stats.total;
    document.getElementById('remainingCount').textContent = stats.remaining;
    document.getElementById('streakCount').textContent = stats.streak;
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

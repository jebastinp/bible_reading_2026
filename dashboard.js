// Dashboard page logic

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await initializeReadingPlan();
    await loadTopReaders();
    await loadAllParticipants();
});

// Calculate user statistics
async function calculateUserStats(userName) {
    const todayString = getTodayString();
    const totalReadings = getReadingsUpToDate(todayString).length;
    
    const completions = await getCompletions();
    const userCompletions = completions.filter(c => c.userName === userName);
    const completedCount = userCompletions.length;
    
    const percentage = totalReadings > 0 ? Math.round((completedCount / totalReadings) * 100) : 0;
    
    // Calculate streak
    const streak = calculateStreak(userCompletions);
    
    return {
        userName: userName,
        completed: completedCount,
        percentage: percentage,
        streak: streak,
        recentCompletions: userCompletions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
    };
}

// Calculate streak for user
function calculateStreak(userCompletions) {
    if (userCompletions.length === 0) return 0;
    
    const sortedCompletions = userCompletions
        .map(c => c.date)
        .sort((a, b) => new Date(b) - new Date(a));
    
    let streak = 0;
    let currentDate = new Date();
    
    for (let i = 0; i < 365; i++) {
        const dateString = formatDate(currentDate);
        
        if (isWeekend(currentDate)) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }
        
        const reading = getReadingForDate(dateString);
        if (!reading) {
            currentDate.setDate(currentDate.getDate() - 1);
            continue;
        }
        
        if (sortedCompletions.includes(dateString)) {
            streak++;
        } else {
            if (i > 0) break;
        }
        
        currentDate.setDate(currentDate.getDate() - 1);
    }
    
    return streak;
}

// Load top 5 readers
async function loadTopReaders() {
    const participants = await getParticipants();
    
    // Calculate stats for all participants
    const allStats = await Promise.all(
        participants.map(name => calculateUserStats(name))
    );
    
    // Sort by completed count
    const topReaders = allStats
        .sort((a, b) => b.completed - a.completed)
        .slice(0, 5);
    
    const container = document.getElementById('topReadersList');
    container.innerHTML = '';
    
    if (topReaders.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <span style="font-size: 64px; display: block; margin-bottom: 16px;">🏆</span>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">No readers yet</h3>
                <p style="color: var(--text-secondary);">Be the first to start reading!</p>
            </div>
        `;
        return;
    }
    
    topReaders.forEach((reader, index) => {
        const card = document.createElement('div');
        card.className = 'top-reader-card';
        card.onclick = () => showUserDetail(reader.userName);
        
        let rankClass = '';
        let rankEmoji = index + 1;
        
        if (index === 0) {
            rankClass = 'gold';
            rankEmoji = '🥇';
        } else if (index === 1) {
            rankClass = 'silver';
            rankEmoji = '🥈';
        } else if (index === 2) {
            rankClass = 'bronze';
            rankEmoji = '🥉';
        }
        
        card.innerHTML = `
            <div class="rank-badge ${rankClass}">${rankEmoji}</div>
            <div class="reader-info">
                <h3>${reader.userName}</h3>
                <p>${reader.percentage}% complete • ${reader.streak} day streak</p>
            </div>
            <div class="reader-stats">
                <div class="completion-count">${reader.completed}</div>
                <div class="completion-label">readings</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Load all participants
async function loadAllParticipants() {
    const participants = await getParticipants();
    const allStats = await Promise.all(
        participants.map(name => calculateUserStats(name))
    );
    
    // Sort by name
    allStats.sort((a, b) => a.userName.localeCompare(b.userName));
    
    const container = document.getElementById('allParticipantsList');
    container.innerHTML = '';
    
    if (allStats.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px;">
                <span style="font-size: 64px; display: block; margin-bottom: 16px;">👥</span>
                <h3 style="color: var(--text-primary); margin-bottom: 8px;">No participants</h3>
                <p style="color: var(--text-secondary);">Add participants in the admin panel</p>
            </div>
        `;
        return;
    }
    
    allStats.forEach(user => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.onclick = () => showUserDetail(user.userName);
        
        card.innerHTML = `
            <div>
                <div class="participant-name">${user.userName}</div>
                <div class="participant-progress">${user.completed} readings completed</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: var(--primary-purple);">${user.percentage}%</div>
                <div style="font-size: 12px; color: var(--text-secondary);">progress</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Show user detail modal
async function showUserDetail(userName) {
    const stats = await calculateUserStats(userName);
    
    document.getElementById('modalUserName').textContent = userName;
    document.getElementById('modalCompleted').textContent = stats.completed;
    document.getElementById('modalPercentage').textContent = stats.percentage + '%';
    document.getElementById('modalStreak').textContent = stats.streak;
    
    // Load recent completions
    const recentList = document.getElementById('modalRecentList');
    recentList.innerHTML = '';
    
    if (stats.recentCompletions.length === 0) {
        recentList.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No completions yet</p>';
    } else {
        stats.recentCompletions.forEach(completion => {
            const date = new Date(completion.date);
            const item = document.createElement('div');
            item.className = 'modal-recent-item';
            
            const isCatchup = completion.catchup || false;
            
            item.innerHTML = `
                ${formatPortionDisplay(completion.portion)} ${isCatchup ? '<span style="color: var(--accent-orange);">(Catch-up)</span>' : ''}<br>
                ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            `;
            
            recentList.appendChild(item);
        });
    }
    
    document.getElementById('userDetailModal').style.display = 'flex';
}

// Close user detail modal
function closeUserDetail() {
    document.getElementById('userDetailModal').style.display = 'none';
}

// Refresh dashboard
async function refreshDashboard() {
    await loadTopReaders();
    await loadAllParticipants();
    showSuccessMessage('Dashboard refreshed!');
}

// Show success message
function showSuccessMessage(message) {
    const msgDiv = document.createElement('div');
    msgDiv.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        z-index: 1000;
        font-weight: 600;
    `;
    msgDiv.textContent = message;
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => msgDiv.remove(), 2000);
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('userDetailModal');
    if (event.target === modal) {
        closeUserDetail();
    }
});

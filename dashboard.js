// Dashboard page logic

/*
 * RANKING ALGORITHM:
 * ===================
 * Points System:
 * - Daily Regular Completion (same day): 10 points
 * - Catchup Completion (completed later): 5 points
 * - Consistency Bonus: +2 points per day in current streak
 * 
 * Total Score = Regular Points + Catchup Points + (Streak × 2)
 * 
 * Ranking Priority:
 * 1. Total Points (highest first)
 * 2. If tied: Current Streak (highest first)
 * 3. If still tied: Completion Count (highest first)
 */

const POINTS = {
    REGULAR_COMPLETION: 10,  // Completed on the same day
    CATCHUP_COMPLETION: 5,   // Completed later (catchup)
    STREAK_BONUS: 2          // Per day of streak
};

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    await initializeReadingPlan();
    await loadTopReaders();
    await loadAllParticipants();
});

// Calculate user statistics with points
async function calculateUserStats(userName) {
    const todayString = getTodayString();
    const totalReadings = getReadingsUpToDate(todayString).length;
    
    const completions = await getCompletions();
    const userCompletions = completions.filter(c => c.userName === userName);
    const completedCount = userCompletions.length;
    
    const percentage = totalReadings > 0 ? Math.round((completedCount / totalReadings) * 100) : 0;
    
    // Calculate streak
    const streak = calculateStreak(userCompletions);
    
    // Calculate points
    const pointsBreakdown = calculatePoints(userCompletions, streak);
    
    return {
        userName: userName,
        completed: completedCount,
        percentage: percentage,
        streak: streak,
        totalPoints: pointsBreakdown.total,
        regularPoints: pointsBreakdown.regular,
        catchupPoints: pointsBreakdown.catchup,
        streakBonus: pointsBreakdown.streakBonus,
        regularCount: pointsBreakdown.regularCount,
        catchupCount: pointsBreakdown.catchupCount,
        recentCompletions: userCompletions
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5)
    };
}

// Calculate points for a user
function calculatePoints(userCompletions, streak) {
    let regularCount = 0;
    let catchupCount = 0;
    
    userCompletions.forEach(completion => {
        // Check if it was completed on the same day or later
        const readingDate = new Date(completion.date);
        const completedDate = new Date(completion.completedOn);
        
        // Compare just the dates (ignore time)
        const readingDateStr = completion.date;
        const completedDateStr = completedDate.toISOString().split('T')[0];
        
        if (completion.catchup === true || completedDateStr > readingDateStr) {
            // Catchup completion
            catchupCount++;
        } else {
            // Regular completion (same day)
            regularCount++;
        }
    });
    
    const regularPoints = regularCount * POINTS.REGULAR_COMPLETION;
    const catchupPoints = catchupCount * POINTS.CATCHUP_COMPLETION;
    const streakBonus = streak * POINTS.STREAK_BONUS;
    const total = regularPoints + catchupPoints + streakBonus;
    
    return {
        regular: regularPoints,
        catchup: catchupPoints,
        streakBonus: streakBonus,
        total: total,
        regularCount: regularCount,
        catchupCount: catchupCount
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

// Load top 5 readers - sorted by POINTS
async function loadTopReaders() {
    const participants = await getParticipants();
    
    // Calculate stats for all participants
    const allStats = await Promise.all(
        participants.map(name => calculateUserStats(name))
    );
    
    // Sort by points (highest first)
    const topReaders = allStats
        .sort((a, b) => {
            // First sort by total points (descending)
            if (b.totalPoints !== a.totalPoints) {
                return b.totalPoints - a.totalPoints;
            }
            // If tied, sort by streak (descending)
            if (b.streak !== a.streak) {
                return b.streak - a.streak;
            }
            // If still tied, sort by completion count
            return b.completed - a.completed;
        })
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
                <p>${reader.streak} day streak • ${reader.completed} readings</p>
            </div>
            <div class="reader-stats">
                <div class="completion-count">${reader.totalPoints}</div>
                <div class="completion-label">points</div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Load all participants - sorted by points
async function loadAllParticipants() {
    const participants = await getParticipants();
    const allStats = await Promise.all(
        participants.map(name => calculateUserStats(name))
    );
    
    // Sort by points (descending)
    allStats.sort((a, b) => b.totalPoints - a.totalPoints);
    
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
    
    allStats.forEach((user, index) => {
        const card = document.createElement('div');
        card.className = 'participant-card';
        card.onclick = () => showUserDetail(user.userName);
        
        card.innerHTML = `
            <div>
                <div class="participant-name">#${index + 1} ${user.userName}</div>
                <div class="participant-progress">${user.completed} readings • ${user.streak} day streak</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 24px; font-weight: 700; color: var(--accent-gold);">${user.totalPoints}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">points</div>
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
    
    // Update points display if elements exist
    const pointsEl = document.getElementById('modalPoints');
    if (pointsEl) {
        pointsEl.textContent = stats.totalPoints;
    }
    
    // Load recent completions
    const recentList = document.getElementById('modalRecentList');
    recentList.innerHTML = '';
    
    // Add points breakdown
    const pointsBreakdown = document.createElement('div');
    pointsBreakdown.style.cssText = 'background: #FDF8F3; padding: 16px; border-radius: 12px; margin-bottom: 16px;';
    pointsBreakdown.innerHTML = `
        <h4 style="margin-bottom: 12px; color: #2D2D2D; font-size: 14px;">📊 Points Breakdown</h4>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6B6B6B;">Regular completions (${stats.regularCount} × 10)</span>
            <span style="font-weight: 600; color: #27AE60;">+${stats.regularPoints}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6B6B6B;">Catchup completions (${stats.catchupCount} × 5)</span>
            <span style="font-weight: 600; color: #F2994A;">+${stats.catchupPoints}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #6B6B6B;">Streak bonus (${stats.streak} × 2)</span>
            <span style="font-weight: 600; color: #9B51E0;">+${stats.streakBonus}</span>
        </div>
        <div style="display: flex; justify-content: space-between; border-top: 1px solid #E5E5E5; padding-top: 8px; margin-top: 8px;">
            <span style="font-weight: 700; color: #2D2D2D;">Total Points</span>
            <span style="font-weight: 700; color: #D4A574; font-size: 18px;">${stats.totalPoints}</span>
        </div>
    `;
    recentList.appendChild(pointsBreakdown);
    
    if (stats.recentCompletions.length === 0) {
        recentList.innerHTML += '<p style="color: var(--text-secondary); text-align: center; padding: 20px;">No completions yet</p>';
    } else {
        const recentTitle = document.createElement('h4');
        recentTitle.style.cssText = 'margin: 16px 0 12px; color: #2D2D2D; font-size: 14px;';
        recentTitle.textContent = '📖 Recent Completions';
        recentList.appendChild(recentTitle);
        
        stats.recentCompletions.forEach(completion => {
            const date = new Date(completion.date);
            const item = document.createElement('div');
            item.className = 'modal-recent-item';
            
            const completedDate = new Date(completion.completedOn);
            const isCatchup = completion.catchup || completedDate.toISOString().split('T')[0] > completion.date;
            
            item.innerHTML = `
                ${formatPortionDisplay(completion.portion)} 
                ${isCatchup ? '<span style="color: var(--accent-orange); font-size: 11px;">(+5 catchup)</span>' : '<span style="color: var(--accent-green); font-size: 11px;">(+10 regular)</span>'}
                <br>
                <span style="font-size: 12px; color: #9A9A9A;">${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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

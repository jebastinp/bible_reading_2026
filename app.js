// Main application logic for index.html

let currentUser = null;
let dataLoaded = false;

// Initialize page
document.addEventListener('DOMContentLoaded', async function() {
    // Show loading indicator
    showLoadingIndicator();
    
    // Wait for data to load
    await initializeReadingPlan();
    dataLoaded = true;
    
    // Hide loading indicator
    hideLoadingIndicator();
    
    loadUserSelect();
    updateCurrentDate();
    loadCurrentUser();
    updateTodayReading();
});

// Show loading indicator
function showLoadingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'loadingIndicator';
    indicator.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px 40px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        text-align: center;
    `;
    indicator.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 16px;">📖</div>
        <div style="font-size: 18px; font-weight: 600; color: var(--primary-purple); margin-bottom: 8px;">Loading Bible Reading Plan...</div>
        <div style="font-size: 14px; color: var(--text-secondary);">Fetching data from Google Sheets</div>
    `;
    document.body.appendChild(indicator);
}

// Hide loading indicator
function hideLoadingIndicator() {
    const indicator = document.getElementById('loadingIndicator');
    if (indicator) {
        indicator.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => indicator.remove(), 300);
    }
}

// Load user selection dropdown
async function loadUserSelect() {
    const participants = await getParticipants();
    const select = document.getElementById('userSelect');
    
    select.innerHTML = '<option value="">Choose your name...</option>';
    
    participants.forEach(name => {
        const option = document.createElement('option');
        option.value = name;
        option.textContent = name;
        select.appendChild(option);
    });
}

// Load current user from storage
function loadCurrentUser() {
    const savedUser = getCurrentUser();
    if (savedUser) {
        document.getElementById('userSelect').value = savedUser;
        selectUser();
    }
}

// Handle user selection
async function selectUser() {
    const select = document.getElementById('userSelect');
    currentUser = select.value;
    
    if (currentUser) {
        saveCurrentUser(currentUser);
        await updateTodayReading();
        await loadRecentReadings();
        await loadMissedReadings();
    }
}

// Update current date display
function updateCurrentDate() {
    const today = new Date();
    const dayName = getDayName(today.getDay());
    document.getElementById('currentDate').textContent = dayName;
}

// Update today's reading section
async function updateTodayReading() {
    const today = new Date();
    const todayString = getTodayString();
    
    const todayCard = document.getElementById('todayReadingCard');
    const noReadingCard = document.getElementById('noReadingCard');
    
    if (isWeekend(today)) {
        // Show no reading card on weekends
        todayCard.style.display = 'none';
        noReadingCard.style.display = 'block';
    } else {
        // Show today's reading
        const reading = getReadingForDate(todayString);
        
        if (reading) {
            todayCard.style.display = 'block';
            noReadingCard.style.display = 'none';
            
            const date = new Date(reading.date);
            document.getElementById('todayDay').textContent = date.getDate();
            document.getElementById('todayMonth').textContent = getMonthName(date.getMonth());
            document.getElementById('todayPortion').innerHTML = formatPortionDisplay(reading.portion);
            
            // Check if already completed
            await updateCompleteButton(todayString);
            await updateCompletionCount(todayString);
        } else {
            todayCard.style.display = 'none';
            noReadingCard.style.display = 'block';
        }
    }
}

// Update complete button based on completion status
async function updateCompleteButton(dateString) {
    if (!currentUser) return;
    
    const completions = await getCompletions();
    const completed = completions.find(c => 
        c.userName === currentUser && c.date === dateString
    );
    
    const btn = document.getElementById('completeBtn');
    if (completed) {
        btn.textContent = 'Completed ✓';
        btn.style.background = 'linear-gradient(135deg, #48BB78 0%, #38A169 100%)';
        btn.disabled = true;
    } else {
        btn.textContent = 'Complete';
        btn.style.background = '';
        btn.disabled = false;
    }
}

// Update completion count
async function updateCompletionCount(dateString) {
    const completions = await getCompletions();
    const count = completions.filter(c => c.date === dateString).length;
    document.getElementById('completionCount').textContent = `+${count} Completed`;
}

// Mark reading as complete
async function markComplete() {
    if (!currentUser) {
        alert('Please select your name first');
        return;
    }
    
    const todayString = getTodayString();
    const reading = getReadingForDate(todayString);
    
    if (!reading) {
        alert('No reading assigned for today');
        return;
    }
    
    const completions = await getCompletions();
    
    // Check if already completed
    const existing = completions.find(c => 
        c.userName === currentUser && c.date === todayString
    );
    
    if (existing) {
        alert('You have already completed today\'s reading!');
        return;
    }
    
    try {
        // Save locally
        await saveCompletion(currentUser, todayString, reading.portion, reading.day, false);
        
        // Update UI
        await updateCompleteButton(todayString);
        await updateCompletionCount(todayString);
        await loadRecentReadings();
        await loadMissedReadings();
        
        // Show success message
        showSuccessMessage('Reading completed! Keep it up! 🎉');
    } catch (error) {
        console.error('Error saving completion:', error);
        alert('Failed to save completion. Please try again.');
    }
}

// Load recent readings
async function loadRecentReadings() {
    if (!currentUser) return;
    
    const completions = await getCompletions();
    const userCompletions = completions
        .filter(c => c.userName === currentUser)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 6);
    
    const container = document.getElementById('recentReadingsList');
    container.innerHTML = '';
    
    if (userCompletions.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">No completed readings yet. Start today!</p>';
        return;
    }
    
    userCompletions.forEach(completion => {
        const date = new Date(completion.date);
        const card = createMiniCard(completion, date, true);
        container.appendChild(card);
    });
}

// Load missed readings
async function loadMissedReadings() {
    if (!currentUser) return;
    
    const today = new Date();
    const todayString = getTodayString();
    const completions = await getCompletions();
    const userCompletions = completions.filter(c => c.userName === currentUser);
    
    // Get all readings up to yesterday
    const allReadings = getReadingsUpToDate(todayString).filter(r => r.date !== todayString);
    
    // Find missed readings
    const missedReadings = allReadings.filter(reading => {
        return !userCompletions.find(c => c.date === reading.date);
    });
    
    const section = document.getElementById('missedReadingsSection');
    const container = document.getElementById('missedReadingsList');
    
    if (missedReadings.length === 0) {
        section.style.display = 'none';
        return;
    }
    
    section.style.display = 'block';
    container.innerHTML = '';
    
    missedReadings.slice(-6).forEach(reading => {
        const date = new Date(reading.date);
        const card = createMiniCard(reading, date, false, true);
        container.appendChild(card);
    });
}

// Create mini card
function createMiniCard(data, date, isCompleted, isMissed = false) {
    const card = document.createElement('div');
    card.className = 'mini-card';
    
    card.innerHTML = `
        <div class="mini-card-image">
            <img src="images/photo-1509021436665-8f07dbf5bf1d.jpeg" alt="Bible Reading">
            <div class="mini-date-badge">
                <div class="date-day">${date.getDate()}</div>
                <div class="date-month">${getMonthName(date.getMonth())}</div>
            </div>
        </div>
        <div class="mini-card-content">
            <h4>${formatPortionDisplay(data.portion)}</h4>
            <p>${data.day || getDayName(date.getDay())}</p>
            <div class="mini-card-footer">
                ${isCompleted ? 
                    '<span class="completed-badge">✓ Completed</span>' : 
                    isMissed ? 
                        `<button class="btn-primary" onclick="markMissedComplete('${data.date}', '${data.portion}', '${data.day}')">Complete</button>` :
                        '<span class="pending-badge">Pending</span>'
                }
            </div>
        </div>
    `;
    
    return card;
}

// Mark missed reading as complete
async function markMissedComplete(dateString, portion, day) {
    if (!currentUser) {
        alert('Please select your name first');
        return;
    }
    
    const completions = await getCompletions();
    
    // Check if already completed
    const existing = completions.find(c => 
        c.userName === currentUser && c.date === dateString
    );
    
    if (existing) {
        alert('You have already completed this reading!');
        return;
    }
    
    try {
        // Save locally
        await saveCompletion(currentUser, dateString, portion, day, true);
        
        // Update UI
        await loadRecentReadings();
        await loadMissedReadings();
        
        // Show success message
        showSuccessMessage('Catch-up reading completed! Great job! 🎉');
    } catch (error) {
        console.error('Error saving catch-up completion:', error);
        alert('Failed to save completion. Please try again.');
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
        animation: slideDown 0.3s ease;
    `;
    msgDiv.textContent = message;
    
    document.body.appendChild(msgDiv);
    
    setTimeout(() => {
        msgDiv.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => msgDiv.remove(), 300);
    }, 3000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
        to {
            opacity: 1;
            transform: translate(-50%, 0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translate(-50%, 0);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -20px);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

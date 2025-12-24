// Bible Reading Plan Data - 2026
// Data will be loaded from Google Sheet or CSV

let BIBLE_READING_PLAN = [];

// Google Sheets Configuration
const GOOGLE_SHEET_CONFIG = {
    // Option 1: Use CSV export URL from Google Sheets
    // Go to: File > Share > Publish to web > Select "Comma-separated values (.csv)"
    // REPLACE THIS WITH YOUR GOOGLE SHEET CSV URL:
    csvUrl: 'https://docs.google.com/spreadsheets/d/1tGfMfbtNTA3e-tvkRSxqFtGm5OtBnRy4P8gQmoix68A/edit?usp=sharing', // Add your published CSV URL here
    
    // Option 2: Use Google Sheets API (requires API key)
    apiKey: '', // Add your API key here
    spreadsheetId: '', // Add your spreadsheet ID here
    range: 'Sheet1!A:C', // Adjust range as needed
};

// Load reading plan from Google Sheet CSV
async function loadReadingPlanFromCSV(csvUrl) {
    console.log('Loading reading plan from Google Sheet...');
    
    try {
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const csvText = await response.text();
        console.log('CSV data received:', csvText.substring(0, 200) + '...');
        
        // Parse CSV
        const lines = csvText.split('\n');
        const readings = [];
        
        // Skip header row, start from index 1
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Handle CSV with quotes and commas
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            if (!matches || matches.length < 3) continue;
            
            const date = matches[0].replace(/"/g, '').trim();
            const day = matches[1].replace(/"/g, '').trim();
            const portion = matches[2].replace(/"/g, '').trim();
            
            if (date && portion) {
                readings.push({
                    date: date,
                    day: day,
                    portion: portion
                });
            }
        }
        
        BIBLE_READING_PLAN = readings;
        console.log(`✅ Successfully loaded ${readings.length} readings from Google Sheet`);
        console.log('Sample reading:', readings[0]);
        return readings;
    } catch (error) {
        console.error('❌ Error loading reading plan from Google Sheet:', error);
        console.log('Falling back to sample data...');
        // Fallback to sample data
        loadSampleData();
        return BIBLE_READING_PLAN;
    }
}

// Load reading plan from Google Sheets API
async function loadReadingPlanFromAPI() {
    const { apiKey, spreadsheetId, range } = GOOGLE_SHEET_CONFIG;
    
    if (!apiKey || !spreadsheetId) {
        console.warn('Google Sheets API not configured');
        loadSampleData();
        return;
    }
    
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();
        
        const readings = [];
        const rows = data.values;
        
        // Skip header row, start from index 1
        for (let i = 1; i < rows.length; i++) {
            const [date, day, portion] = rows[i];
            
            if (date && portion) {
                readings.push({
                    date: date,
                    day: day,
                    portion: portion
                });
            }
        }
        
        BIBLE_READING_PLAN = readings;
        console.log(`Loaded ${readings.length} readings from Google Sheets API`);
    } catch (error) {
        console.error('Error loading from Google Sheets API:', error);
        loadSampleData();
    }
}

// Load sample data as fallback
function loadSampleData() {
    console.log('📚 Loading sample data...');
    BIBLE_READING_PLAN = [
        { date: '2026-01-01', portion: 'Matthew 1', day: 'Thursday' },
        { date: '2026-01-02', portion: 'Matthew 2', day: 'Friday' },
        { date: '2026-01-05', portion: 'Matthew 3', day: 'Monday' },
        { date: '2026-01-06', portion: 'Matthew 4', day: 'Tuesday' },
        { date: '2026-01-07', portion: 'Matthew 5', day: 'Wednesday' },
        { date: '2026-01-08', portion: 'Matthew 6', day: 'Thursday' },
        { date: '2026-01-09', portion: 'Matthew 7', day: 'Friday' },
        { date: '2026-01-12', portion: 'Matthew 8', day: 'Monday' },
        { date: '2026-01-13', portion: 'Matthew 9', day: 'Tuesday' },
        { date: '2026-01-14', portion: 'Matthew 10', day: 'Wednesday' },
        { date: '2026-01-15', portion: 'Matthew 11', day: 'Thursday' },
        { date: '2026-01-16', portion: 'Matthew 12', day: 'Friday' },
    ];
    console.log('✅ Sample data loaded:', BIBLE_READING_PLAN.length, 'readings');
}

// Initialize reading plan
async function initializeReadingPlan() {
    console.log('🚀 Initializing Bible Reading Plan...');
    
    if (GOOGLE_SHEET_CONFIG.csvUrl && GOOGLE_SHEET_CONFIG.csvUrl !== 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSample/pub?output=csv') {
        // Load from CSV URL
        console.log('📊 Fetching from Google Sheets CSV...');
        await loadReadingPlanFromCSV(GOOGLE_SHEET_CONFIG.csvUrl);
    } else if (GOOGLE_SHEET_CONFIG.apiKey && GOOGLE_SHEET_CONFIG.spreadsheetId) {
        // Load from Google Sheets API
        console.log('🔑 Fetching from Google Sheets API...');
        await loadReadingPlanFromAPI();
    } else {
        // Use sample data
        console.log('⚠️ No Google Sheet configured. Using sample data.');
        console.log('💡 To use Google Sheets: Add your CSV URL in data.js');
        loadSampleData();
    }
    
    return BIBLE_READING_PLAN;
}

// Call this when the page loads
initializeReadingPlan();

// Default participants
const DEFAULT_PARTICIPANTS = [
    'John',
    'Mary',
    'Peter',
    'Sarah',
    'David'
];

// Admin password
const ADMIN_PASSWORD = 'bible2025';

// Storage keys
const STORAGE_KEYS = {
    PARTICIPANTS: 'bible_participants',
    COMPLETIONS: 'bible_completions',
    CURRENT_USER: 'bible_current_user'
};

// Initialize data if not exists
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(DEFAULT_PARTICIPANTS));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.COMPLETIONS)) {
        localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify([]));
    }
}

// Get participants
function getParticipants() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
}

// Save participants
function saveParticipants(participants) {
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(participants));
}

// Get completions
function getCompletions() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
}

// Save completions
function saveCompletions(completions) {
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
}

// Get current user
function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

// Save current user
function saveCurrentUser(userName) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userName);
}

// Get reading for specific date
function getReadingForDate(dateString) {
    return BIBLE_READING_PLAN.find(reading => reading.date === dateString);
}

// Get all readings up to date
function getReadingsUpToDate(dateString) {
    const targetDate = new Date(dateString);
    return BIBLE_READING_PLAN.filter(reading => {
        const readingDate = new Date(reading.date);
        return readingDate <= targetDate;
    });
}

// Check if date is weekend
function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6; // Sunday or Saturday
}

// Check if date is weekday
function isWeekday(date) {
    return !isWeekend(date);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get today's date string
function getTodayString() {
    return formatDate(new Date());
}

// Get month name
function getMonthName(monthIndex) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 
                   'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[monthIndex];
}

// Get day name
function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

// Initialize on load
initializeData();

// Local data storage (no external backend)

const STORAGE_KEYS = {
    PARTICIPANTS: 'bible_participants',
    COMPLETIONS: 'bible_completions',
    CURRENT_USER: 'bible_current_user'
};

let BIBLE_READING_PLAN = [
    { date: '2025-12-23', portion: 'Genesis 1-3', day: 'Monday' },
    { date: '2025-12-24', portion: 'Genesis 4-7', day: 'Tuesday' },
    { date: '2025-12-26', portion: 'Genesis 8-11', day: 'Thursday' },
    { date: '2025-12-27', portion: 'Genesis 12-15', day: 'Friday' },
    { date: '2025-12-30', portion: 'Genesis 16-19', day: 'Monday' },
    { date: '2025-12-31', portion: 'Genesis 20-23', day: 'Tuesday' },
    { date: '2026-01-02', portion: 'Genesis 24-26', day: 'Friday' },
    { date: '2026-01-05', portion: 'Genesis 27-29', day: 'Monday' },
    { date: '2026-01-06', portion: 'Genesis 30-32', day: 'Tuesday' },
    { date: '2026-01-07', portion: 'Genesis 33-36', day: 'Wednesday' },
    { date: '2026-01-08', portion: 'Genesis 37-40', day: 'Thursday' },
    { date: '2026-01-09', portion: 'Genesis 41-43', day: 'Friday' }
];

function ensureLocalStorageDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PARTICIPANTS)) {
        localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(['John', 'Mary', 'Peter', 'Sarah', 'David']));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMPLETIONS)) {
        localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify([]));
    }
}

async function initializeReadingPlan() {
    ensureLocalStorageDefaults();
    return BIBLE_READING_PLAN;
}

async function getParticipants() {
    ensureLocalStorageDefaults();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS) || '[]');
}

async function saveParticipant(name) {
    ensureLocalStorageDefaults();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS));
    if (list.includes(name)) {
        throw new Error('This participant already exists');
    }
    list.push(name);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(list));
    return { name };
}

async function removeParticipant(name) {
    ensureLocalStorageDefaults();
    const list = JSON.parse(localStorage.getItem(STORAGE_KEYS.PARTICIPANTS));
    const filtered = list.filter(n => n !== name);
    localStorage.setItem(STORAGE_KEYS.PARTICIPANTS, JSON.stringify(filtered));
}

async function getCompletions() {
    ensureLocalStorageDefaults();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
}

async function saveCompletion(userName, date, portion, day, isCatchup = false) {
    ensureLocalStorageDefaults();
    const completions = JSON.parse(localStorage.getItem(STORAGE_KEYS.COMPLETIONS) || '[]');
    const exists = completions.find(c => c.userName === userName && c.date === date);
    if (exists) {
        throw new Error('Already marked complete');
    }
    const entry = {
        userName,
        date,
        portion,
        completedOn: new Date().toISOString(),
        catchup: isCatchup,
        day
    };
    completions.push(entry);
    localStorage.setItem(STORAGE_KEYS.COMPLETIONS, JSON.stringify(completions));
    return entry;
}

function getCurrentUser() {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
}

function saveCurrentUser(userName) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, userName);
}

function getReadingForDate(dateString) {
    return BIBLE_READING_PLAN.find(reading => reading.date === dateString);
}

function getReadingsUpToDate(dateString) {
    const targetDate = new Date(dateString);
    return BIBLE_READING_PLAN.filter(reading => new Date(reading.date) <= targetDate);
}

function isWeekend(date) {
    const day = date.getDay();
    return day === 0 || day === 6;
}

function isWeekday(date) {
    return !isWeekend(date);
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayString() {
    return formatDate(new Date());
}

function getMonthName(monthIndex) {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return months[monthIndex];
}

function getDayName(dayIndex) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayIndex];
}

function clearLocalData() {
    localStorage.removeItem(STORAGE_KEYS.PARTICIPANTS);
    localStorage.removeItem(STORAGE_KEYS.COMPLETIONS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
}

async function verifyAdmin(username, password) {
    const fallbackCredentials = {
        admin: 'bible2026',
        jebastin: 'admin123'
    };
    if (fallbackCredentials[username] && fallbackCredentials[username] === password) {
        return { success: true, admin: { id: 1, username } };
    }
    return { success: false, error: 'Invalid username or password' };
}

async function addAdmin() {
    return { success: false, error: 'Admin creation not supported in local-only mode.' };
}

const ADMIN_PASSWORD = 'bible2026';

// Expose globals
window.getParticipants = getParticipants;
window.saveParticipant = saveParticipant;
window.removeParticipant = removeParticipant;
window.getCompletions = getCompletions;
window.saveCompletion = saveCompletion;
window.getCurrentUser = getCurrentUser;
window.saveCurrentUser = saveCurrentUser;
window.getReadingForDate = getReadingForDate;
window.getReadingsUpToDate = getReadingsUpToDate;
window.isWeekend = isWeekend;
window.isWeekday = isWeekday;
window.formatDate = formatDate;
window.getTodayString = getTodayString;
window.getMonthName = getMonthName;
window.getDayName = getDayName;
window.loadSampleData = () => BIBLE_READING_PLAN;
window.initializeReadingPlan = initializeReadingPlan;
window.verifyAdmin = verifyAdmin;
window.addAdmin = addAdmin;
window.ADMIN_PASSWORD = ADMIN_PASSWORD;
window.BIBLE_READING_PLAN = BIBLE_READING_PLAN;
window.clearLocalData = clearLocalData;
window.__supabaseHelpersLoaded = true;

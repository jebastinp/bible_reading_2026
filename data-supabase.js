// Firebase-backed data storage

const firebaseConfig = {
    apiKey: 'AIzaSyCmwYbCToCdCyP4Qre8FrehEdU4Q3f6p0w',
    authDomain: 'bible-84953.firebaseapp.com',
    databaseURL: 'https://bible-84953-default-rtdb.firebaseio.com',
    projectId: 'bible-84953',
    storageBucket: 'bible-84953.firebasestorage.app',
    messagingSenderId: '810731825434',
    appId: '1:810731825434:web:cf0e0713bbab451e5ee4a3'
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
let firebaseApp;
let firebaseDb;

function initFirebase() {
    if (firebaseApp) return;
    firebaseApp = firebase.initializeApp(firebaseConfig);
    firebaseDb = firebase.database();
}

async function initializeReadingPlan() {
    initFirebase();
    return BIBLE_READING_PLAN;
}

async function getParticipants() {
    initFirebase();
    const snapshot = await firebaseDb.ref('participants').once('value');
    const data = snapshot.val() || {};
    return Object.keys(data);
}

async function saveParticipant(name) {
    initFirebase();
    const existing = await getParticipants();
    if (existing.includes(name)) {
        throw new Error('This participant already exists');
    }
    await firebaseDb.ref(`participants/${name}`).set(true);
    return { name };
}

async function removeParticipant(name) {
    initFirebase();
    await firebaseDb.ref(`participants/${name}`).remove();
}

async function getCompletions() {
    initFirebase();
    const snapshot = await firebaseDb.ref('completions').once('value');
    const data = snapshot.val() || {};
    const results = [];
    Object.keys(data).forEach(user => {
        Object.keys(data[user]).forEach(date => {
            results.push(data[user][date]);
        });
    });
    return results;
}

async function saveCompletion(userName, date, portion, day, isCatchup = false) {
    initFirebase();
    const existingSnap = await firebaseDb.ref(`completions/${userName}/${date}`).once('value');
    if (existingSnap.exists()) {
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
    await firebaseDb.ref(`completions/${userName}/${date}`).set(entry);
    return entry;
}

function getCurrentUser() {
    return localStorage.getItem('bible_current_user');
}

function saveCurrentUser(userName) {
    localStorage.setItem('bible_current_user', userName);
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

function formatPortionDisplay(portion) {
    return portion === 'Genesis 4-7' ? '<strong>Genesis 4-7</strong>' : portion;
}

function clearLocalData() {
    localStorage.removeItem('bible_current_user');
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
window.formatPortionDisplay = formatPortionDisplay;
window.loadSampleData = () => BIBLE_READING_PLAN;
window.initializeReadingPlan = initializeReadingPlan;
window.verifyAdmin = verifyAdmin;
window.addAdmin = addAdmin;
window.ADMIN_PASSWORD = ADMIN_PASSWORD;
window.BIBLE_READING_PLAN = BIBLE_READING_PLAN;
window.clearLocalData = clearLocalData;
window.__supabaseHelpersLoaded = true;

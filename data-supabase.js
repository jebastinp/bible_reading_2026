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

let BIBLE_READING_PLAN_2026 = [
    { date: '2026-01-01', day: 'Thursday', portion: 'Matthew 1' },
    { date: '2026-01-02', day: 'Friday', portion: 'Matthew 2' },
    { date: '2026-01-05', day: 'Monday', portion: 'Matthew 3' },
    { date: '2026-01-06', day: 'Tuesday', portion: 'Matthew 4' },
    { date: '2026-01-07', day: 'Wednesday', portion: 'Matthew 5' },
    { date: '2026-01-08', day: 'Thursday', portion: 'Matthew 6' },
    { date: '2026-01-09', day: 'Friday', portion: 'Matthew 7' },
    { date: '2026-01-12', day: 'Monday', portion: 'Matthew 8' },
    { date: '2026-01-13', day: 'Tuesday', portion: 'Matthew 9' },
    { date: '2026-01-14', day: 'Wednesday', portion: 'Matthew 10' },
    { date: '2026-01-15', day: 'Thursday', portion: 'Matthew 11' },
    { date: '2026-01-16', day: 'Friday', portion: 'Matthew 12' },
    { date: '2026-01-19', day: 'Monday', portion: 'Matthew 13' },
    { date: '2026-01-20', day: 'Tuesday', portion: 'Matthew 14' },
    { date: '2026-01-21', day: 'Wednesday', portion: 'Matthew 15' },
    { date: '2026-01-22', day: 'Thursday', portion: 'Matthew 16' },
    { date: '2026-01-23', day: 'Friday', portion: 'Matthew 17' },
    { date: '2026-01-26', day: 'Monday', portion: 'Matthew 18' },
    { date: '2026-01-27', day: 'Tuesday', portion: 'Matthew 19' },
    { date: '2026-01-28', day: 'Wednesday', portion: 'Matthew 20' },
    { date: '2026-01-29', day: 'Thursday', portion: 'Matthew 21' },
    { date: '2026-01-30', day: 'Friday', portion: 'Matthew 22' },
    { date: '2026-02-02', day: 'Monday', portion: 'Matthew 23' },
    { date: '2026-02-03', day: 'Tuesday', portion: 'Matthew 24' },
    { date: '2026-02-04', day: 'Wednesday', portion: 'Matthew 25' },
    { date: '2026-02-05', day: 'Thursday', portion: 'Matthew 26' },
    { date: '2026-02-06', day: 'Friday', portion: 'Matthew 27' },
    { date: '2026-02-09', day: 'Monday', portion: 'Matthew 28' },
    { date: '2026-02-10', day: 'Tuesday', portion: 'Mark 1' },
    { date: '2026-02-11', day: 'Wednesday', portion: 'Mark 2' },
    { date: '2026-02-12', day: 'Thursday', portion: 'Mark 3' },
    { date: '2026-02-13', day: 'Friday', portion: 'Mark 4' },
    { date: '2026-02-16', day: 'Monday', portion: 'Mark 5' },
    { date: '2026-02-17', day: 'Tuesday', portion: 'Mark 6' },
    { date: '2026-02-18', day: 'Wednesday', portion: 'Mark 7' },
    { date: '2026-02-19', day: 'Thursday', portion: 'Mark 8' },
    { date: '2026-02-20', day: 'Friday', portion: 'Mark 9' },
    { date: '2026-02-23', day: 'Monday', portion: 'Mark 10' },
    { date: '2026-02-24', day: 'Tuesday', portion: 'Mark 11' },
    { date: '2026-02-25', day: 'Wednesday', portion: 'Mark 12' },
    { date: '2026-02-26', day: 'Thursday', portion: 'Mark 13' },
    { date: '2026-02-27', day: 'Friday', portion: 'Mark 14' },
    { date: '2026-03-02', day: 'Monday', portion: 'Mark 15' },
    { date: '2026-03-03', day: 'Tuesday', portion: 'Mark 16' },
    { date: '2026-03-04', day: 'Wednesday', portion: 'Luke 1' },
    { date: '2026-03-05', day: 'Thursday', portion: 'Luke 2' },
    { date: '2026-03-06', day: 'Friday', portion: 'Luke 3' },
    { date: '2026-03-09', day: 'Monday', portion: 'Luke 4' },
    { date: '2026-03-10', day: 'Tuesday', portion: 'Luke 5' },
    { date: '2026-03-11', day: 'Wednesday', portion: 'Luke 6' },
    { date: '2026-03-12', day: 'Thursday', portion: 'Luke 7' },
    { date: '2026-03-13', day: 'Friday', portion: 'Luke 8' },
    { date: '2026-03-16', day: 'Monday', portion: 'Luke 9' },
    { date: '2026-03-17', day: 'Tuesday', portion: 'Luke 10' },
    { date: '2026-03-18', day: 'Wednesday', portion: 'Luke 11' },
    { date: '2026-03-19', day: 'Thursday', portion: 'Luke 12' },
    { date: '2026-03-20', day: 'Friday', portion: 'Luke 13' },
    { date: '2026-03-23', day: 'Monday', portion: 'Luke 14' },
    { date: '2026-03-24', day: 'Tuesday', portion: 'Luke 15' },
    { date: '2026-03-25', day: 'Wednesday', portion: 'Luke 16' },
    { date: '2026-03-26', day: 'Thursday', portion: 'Luke 17' },
    { date: '2026-03-27', day: 'Friday', portion: 'Luke 18' },
    { date: '2026-03-30', day: 'Monday', portion: 'Luke 19' },
    { date: '2026-03-31', day: 'Tuesday', portion: 'Luke 20' },
    { date: '2026-04-01', day: 'Wednesday', portion: 'Luke 21' },
    { date: '2026-04-02', day: 'Thursday', portion: 'Luke 22' },
    { date: '2026-04-03', day: 'Friday', portion: 'Luke 23' },
    { date: '2026-04-06', day: 'Monday', portion: 'Luke 24' },
    { date: '2026-04-07', day: 'Tuesday', portion: 'John 1' },
    { date: '2026-04-08', day: 'Wednesday', portion: 'John 2' },
    { date: '2026-04-09', day: 'Thursday', portion: 'John 3' },
    { date: '2026-04-10', day: 'Friday', portion: 'John 4' },
    { date: '2026-04-13', day: 'Monday', portion: 'John 5' },
    { date: '2026-04-14', day: 'Tuesday', portion: 'John 6' },
    { date: '2026-04-15', day: 'Wednesday', portion: 'John 7' },
    { date: '2026-04-16', day: 'Thursday', portion: 'John 8' },
    { date: '2026-04-17', day: 'Friday', portion: 'John 9' },
    { date: '2026-04-20', day: 'Monday', portion: 'John 10' },
    { date: '2026-04-21', day: 'Tuesday', portion: 'John 11' },
    { date: '2026-04-22', day: 'Wednesday', portion: 'John 12' },
    { date: '2026-04-23', day: 'Thursday', portion: 'John 13' },
    { date: '2026-04-24', day: 'Friday', portion: 'John 14' },
    { date: '2026-04-27', day: 'Monday', portion: 'John 15' },
    { date: '2026-04-28', day: 'Tuesday', portion: 'John 16' },
    { date: '2026-04-29', day: 'Wednesday', portion: 'John 17' },
    { date: '2026-04-30', day: 'Thursday', portion: 'John 18' },
    { date: '2026-05-01', day: 'Friday', portion: 'John 19' },
    { date: '2026-05-04', day: 'Monday', portion: 'John 20' },
    { date: '2026-05-05', day: 'Tuesday', portion: 'John 21' },
    { date: '2026-05-06', day: 'Wednesday', portion: 'Acts 1' },
    { date: '2026-05-07', day: 'Thursday', portion: 'Acts 2' },
    { date: '2026-05-08', day: 'Friday', portion: 'Acts 3' },
    { date: '2026-05-11', day: 'Monday', portion: 'Acts 4' },
    { date: '2026-05-12', day: 'Tuesday', portion: 'Acts 5' },
    { date: '2026-05-13', day: 'Wednesday', portion: 'Acts 6' },
    { date: '2026-05-14', day: 'Thursday', portion: 'Acts 7' },
    { date: '2026-05-15', day: 'Friday', portion: 'Acts 8' },
    { date: '2026-05-18', day: 'Monday', portion: 'Acts 9' },
    { date: '2026-05-19', day: 'Tuesday', portion: 'Acts 10' },
    { date: '2026-05-20', day: 'Wednesday', portion: 'Acts 11' },
    { date: '2026-05-21', day: 'Thursday', portion: 'Acts 12' },
    { date: '2026-05-22', day: 'Friday', portion: 'Acts 13' },
    { date: '2026-05-25', day: 'Monday', portion: 'Acts 14' },
    { date: '2026-05-26', day: 'Tuesday', portion: 'Acts 15' },
    { date: '2026-05-27', day: 'Wednesday', portion: 'Acts 16' },
    { date: '2026-05-28', day: 'Thursday', portion: 'Acts 17' },
    { date: '2026-05-29', day: 'Friday', portion: 'Acts 18' },
    { date: '2026-06-01', day: 'Monday', portion: 'Acts 19' },
    { date: '2026-06-02', day: 'Tuesday', portion: 'Acts 20' },
    { date: '2026-06-03', day: 'Wednesday', portion: 'Acts 21' },
    { date: '2026-06-04', day: 'Thursday', portion: 'Acts 22' },
    { date: '2026-06-05', day: 'Friday', portion: 'Acts 23' },
    { date: '2026-06-08', day: 'Monday', portion: 'Acts 24' },
    { date: '2026-06-09', day: 'Tuesday', portion: 'Acts 25' },
    { date: '2026-06-10', day: 'Wednesday', portion: 'Acts 26' },
    { date: '2026-06-11', day: 'Thursday', portion: 'Acts 27' },
    { date: '2026-06-12', day: 'Friday', portion: 'Acts 28' },
    { date: '2026-06-15', day: 'Monday', portion: 'Romans 1' },
    { date: '2026-06-16', day: 'Tuesday', portion: 'Romans 2' },
    { date: '2026-06-17', day: 'Wednesday', portion: 'Romans 3' },
    { date: '2026-06-18', day: 'Thursday', portion: 'Romans 4' },
    { date: '2026-06-19', day: 'Friday', portion: 'Romans 5' },
    { date: '2026-06-22', day: 'Monday', portion: 'Romans 6' },
    { date: '2026-06-23', day: 'Tuesday', portion: 'Romans 7' },
    { date: '2026-06-24', day: 'Wednesday', portion: 'Romans 8' },
    { date: '2026-06-25', day: 'Thursday', portion: 'Romans 9' },
    { date: '2026-06-26', day: 'Friday', portion: 'Romans 10' },
    { date: '2026-06-29', day: 'Monday', portion: 'Romans 11' },
    { date: '2026-06-30', day: 'Tuesday', portion: 'Romans 12' },
    { date: '2026-07-01', day: 'Wednesday', portion: 'Romans 13' },
    { date: '2026-07-02', day: 'Thursday', portion: 'Romans 14' },
    { date: '2026-07-03', day: 'Friday', portion: 'Romans 15' },
    { date: '2026-07-06', day: 'Monday', portion: 'Romans 16' },
    { date: '2026-07-07', day: 'Tuesday', portion: '1 Corinthians 1' },
    { date: '2026-07-08', day: 'Wednesday', portion: '1 Corinthians 2' },
    { date: '2026-07-09', day: 'Thursday', portion: '1 Corinthians 3' },
    { date: '2026-07-10', day: 'Friday', portion: '1 Corinthians 4' },
    { date: '2026-07-13', day: 'Monday', portion: '1 Corinthians 5' },
    { date: '2026-07-14', day: 'Tuesday', portion: '1 Corinthians 6' },
    { date: '2026-07-15', day: 'Wednesday', portion: '1 Corinthians 7' },
    { date: '2026-07-16', day: 'Thursday', portion: '1 Corinthians 8' },
    { date: '2026-07-17', day: 'Friday', portion: '1 Corinthians 9' },
    { date: '2026-07-20', day: 'Monday', portion: '1 Corinthians 10' },
    { date: '2026-07-21', day: 'Tuesday', portion: '1 Corinthians 11' },
    { date: '2026-07-22', day: 'Wednesday', portion: '1 Corinthians 12' },
    { date: '2026-07-23', day: 'Thursday', portion: '1 Corinthians 13' },
    { date: '2026-07-24', day: 'Friday', portion: '1 Corinthians 14' },
    { date: '2026-07-27', day: 'Monday', portion: '1 Corinthians 15' },
    { date: '2026-07-28', day: 'Tuesday', portion: '1 Corinthians 16' },
    { date: '2026-07-29', day: 'Wednesday', portion: '2 Corinthians 1' },
    { date: '2026-07-30', day: 'Thursday', portion: '2 Corinthians 2' },
    { date: '2026-07-31', day: 'Friday', portion: '2 Corinthians 3' },
    { date: '2026-08-03', day: 'Monday', portion: '2 Corinthians 4' },
    { date: '2026-08-04', day: 'Tuesday', portion: '2 Corinthians 5' },
    { date: '2026-08-05', day: 'Wednesday', portion: '2 Corinthians 6' },
    { date: '2026-08-06', day: 'Thursday', portion: '2 Corinthians 7' },
    { date: '2026-08-07', day: 'Friday', portion: '2 Corinthians 8' },
    { date: '2026-08-10', day: 'Monday', portion: '2 Corinthians 9' },
    { date: '2026-08-11', day: 'Tuesday', portion: '2 Corinthians 10' },
    { date: '2026-08-12', day: 'Wednesday', portion: '2 Corinthians 11' },
    { date: '2026-08-13', day: 'Thursday', portion: '2 Corinthians 12' },
    { date: '2026-08-14', day: 'Friday', portion: '2 Corinthians 13' },
    { date: '2026-08-17', day: 'Monday', portion: 'Galatians 1' },
    { date: '2026-08-18', day: 'Tuesday', portion: 'Galatians 2' },
    { date: '2026-08-19', day: 'Wednesday', portion: 'Galatians 3' },
    { date: '2026-08-20', day: 'Thursday', portion: 'Galatians 4' },
    { date: '2026-08-21', day: 'Friday', portion: 'Galatians 5' },
    { date: '2026-08-24', day: 'Monday', portion: 'Galatians 6' },
    { date: '2026-08-25', day: 'Tuesday', portion: 'Ephesians 1' },
    { date: '2026-08-26', day: 'Wednesday', portion: 'Ephesians 2' },
    { date: '2026-08-27', day: 'Thursday', portion: 'Ephesians 3' },
    { date: '2026-08-28', day: 'Friday', portion: 'Ephesians 4' },
    { date: '2026-08-31', day: 'Monday', portion: 'Ephesians 5' },
    { date: '2026-09-01', day: 'Tuesday', portion: 'Ephesians 6' },
    { date: '2026-09-02', day: 'Wednesday', portion: 'Philippians 1' },
    { date: '2026-09-03', day: 'Thursday', portion: 'Philippians 2' },
    { date: '2026-09-04', day: 'Friday', portion: 'Philippians 3' },
    { date: '2026-09-07', day: 'Monday', portion: 'Philippians 4' },
    { date: '2026-09-08', day: 'Tuesday', portion: 'Colossians 1' },
    { date: '2026-09-09', day: 'Wednesday', portion: 'Colossians 2' },
    { date: '2026-09-10', day: 'Thursday', portion: 'Colossians 3' },
    { date: '2026-09-11', day: 'Friday', portion: 'Colossians 4' },
    { date: '2026-09-14', day: 'Monday', portion: '1 Thessalonians 1' },
    { date: '2026-09-15', day: 'Tuesday', portion: '1 Thessalonians 2' },
    { date: '2026-09-16', day: 'Wednesday', portion: '1 Thessalonians 3' },
    { date: '2026-09-17', day: 'Thursday', portion: '1 Thessalonians 4' },
    { date: '2026-09-18', day: 'Friday', portion: '1 Thessalonians 5' },
    { date: '2026-09-21', day: 'Monday', portion: '2 Thessalonians 1' },
    { date: '2026-09-22', day: 'Tuesday', portion: '2 Thessalonians 2' },
    { date: '2026-09-23', day: 'Wednesday', portion: '2 Thessalonians 3' },
    { date: '2026-09-24', day: 'Thursday', portion: '1 Timothy 1' },
    { date: '2026-09-25', day: 'Friday', portion: '1 Timothy 2' },
    { date: '2026-09-28', day: 'Monday', portion: '1 Timothy 3' },
    { date: '2026-09-29', day: 'Tuesday', portion: '1 Timothy 4' },
    { date: '2026-09-30', day: 'Wednesday', portion: '1 Timothy 5' },
    { date: '2026-10-01', day: 'Thursday', portion: '1 Timothy 6' },
    { date: '2026-10-02', day: 'Friday', portion: '2 Timothy 1' },
    { date: '2026-10-05', day: 'Monday', portion: '2 Timothy 2' },
    { date: '2026-10-06', day: 'Tuesday', portion: '2 Timothy 3' },
    { date: '2026-10-07', day: 'Wednesday', portion: '2 Timothy 4' },
    { date: '2026-10-08', day: 'Thursday', portion: 'Titus 1' },
    { date: '2026-10-09', day: 'Friday', portion: 'Titus 2' },
    { date: '2026-10-12', day: 'Monday', portion: 'Titus 3' },
    { date: '2026-10-13', day: 'Tuesday', portion: 'Philemon' },
    { date: '2026-10-14', day: 'Wednesday', portion: 'Hebrews 1' },
    { date: '2026-10-15', day: 'Thursday', portion: 'Hebrews 2' },
    { date: '2026-10-16', day: 'Friday', portion: 'Hebrews 3' },
    { date: '2026-10-19', day: 'Monday', portion: 'Hebrews 4' },
    { date: '2026-10-20', day: 'Tuesday', portion: 'Hebrews 5' },
    { date: '2026-10-21', day: 'Wednesday', portion: 'Hebrews 6' },
    { date: '2026-10-22', day: 'Thursday', portion: 'Hebrews 7' },
    { date: '2026-10-23', day: 'Friday', portion: 'Hebrews 8' },
    { date: '2026-10-26', day: 'Monday', portion: 'Hebrews 9' },
    { date: '2026-10-27', day: 'Tuesday', portion: 'Hebrews 10' },
    { date: '2026-10-28', day: 'Wednesday', portion: 'Hebrews 11' },
    { date: '2026-10-29', day: 'Thursday', portion: 'Hebrews 12' },
    { date: '2026-10-30', day: 'Friday', portion: 'Hebrews 13' },
    { date: '2026-11-02', day: 'Monday', portion: 'James 1' },
    { date: '2026-11-03', day: 'Tuesday', portion: 'James 2' },
    { date: '2026-11-04', day: 'Wednesday', portion: 'James 3' },
    { date: '2026-11-05', day: 'Thursday', portion: 'James 4' },
    { date: '2026-11-06', day: 'Friday', portion: 'James 5' },
    { date: '2026-11-09', day: 'Monday', portion: '1 Peter 1' },
    { date: '2026-11-10', day: 'Tuesday', portion: '1 Peter 2' },
    { date: '2026-11-11', day: 'Wednesday', portion: '1 Peter 3' },
    { date: '2026-11-12', day: 'Thursday', portion: '1 Peter 4' },
    { date: '2026-11-13', day: 'Friday', portion: '1 Peter 5' },
    { date: '2026-11-16', day: 'Monday', portion: '2 Peter 1' },
    { date: '2026-11-17', day: 'Tuesday', portion: '2 Peter 2' },
    { date: '2026-11-18', day: 'Wednesday', portion: '2 Peter 3' },
    { date: '2026-11-19', day: 'Thursday', portion: '1 John 1' },
    { date: '2026-11-20', day: 'Friday', portion: '1 John 2' },
    { date: '2026-11-23', day: 'Monday', portion: '1 John 3' },
    { date: '2026-11-24', day: 'Tuesday', portion: '1 John 4' },
    { date: '2026-11-25', day: 'Wednesday', portion: '1 John 5' },
    { date: '2026-11-26', day: 'Thursday', portion: '2 John' },
    { date: '2026-11-27', day: 'Friday', portion: '3 John' },
    { date: '2026-11-30', day: 'Monday', portion: 'Jude' },
    { date: '2026-12-01', day: 'Tuesday', portion: 'Revelation 1' },
    { date: '2026-12-02', day: 'Wednesday', portion: 'Revelation 2' },
    { date: '2026-12-03', day: 'Thursday', portion: 'Revelation 3' },
    { date: '2026-12-04', day: 'Friday', portion: 'Revelation 4' },
    { date: '2026-12-07', day: 'Monday', portion: 'Revelation 5' },
    { date: '2026-12-08', day: 'Tuesday', portion: 'Revelation 6' },
    { date: '2026-12-09', day: 'Wednesday', portion: 'Revelation 7' },
    { date: '2026-12-10', day: 'Thursday', portion: 'Revelation 8' },
    { date: '2026-12-11', day: 'Friday', portion: 'Revelation 9' },
    { date: '2026-12-14', day: 'Monday', portion: 'Revelation 10' },
    { date: '2026-12-15', day: 'Tuesday', portion: 'Revelation 11' },
    { date: '2026-12-16', day: 'Wednesday', portion: 'Revelation 12' },
    { date: '2026-12-17', day: 'Thursday', portion: 'Revelation 13' },
    { date: '2026-12-18', day: 'Friday', portion: 'Revelation 14' },
    { date: '2026-12-21', day: 'Monday', portion: 'Revelation 15' },
    { date: '2026-12-22', day: 'Tuesday', portion: 'Revelation 16' },
    { date: '2026-12-23', day: 'Wednesday', portion: 'Revelation 17' },
    { date: '2026-12-24', day: 'Thursday', portion: 'Revelation 18' },
    { date: '2026-12-25', day: 'Friday', portion: 'Revelation 19' },
    { date: '2026-12-28', day: 'Monday', portion: 'Revelation 20' },
    { date: '2026-12-29', day: 'Tuesday', portion: 'Revelation 21' },
    { date: '2026-12-30', day: 'Wednesday', portion: 'Revelation 22' }
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

async function removeCompletion(userName, date) {
    initFirebase();
    await firebaseDb.ref(`completions/${userName}/${date}`).remove();
    return true;
}

// Clear ALL completions for fresh start (New Year reset)
async function clearAllCompletions() {
    initFirebase();
    await firebaseDb.ref('completions').remove();
    return true;
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

// Create alias for BIBLE_READING_PLAN
const BIBLE_READING_PLAN = BIBLE_READING_PLAN_2026;

// Expose globals
window.getParticipants = getParticipants;
window.saveParticipant = saveParticipant;
window.removeParticipant = removeParticipant;
window.getCompletions = getCompletions;
window.saveCompletion = saveCompletion;
window.removeCompletion = removeCompletion;
window.clearAllCompletions = clearAllCompletions;
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

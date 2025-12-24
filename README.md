# 📖 Bible Reading Tracker - Annual Web Application

A clean and modern web application designed to help individuals and groups track their daily Bible reading progress throughout the year.

## 🌟 Features

### User Features
- **Daily Reading Display**: View today's assigned Bible reading (Monday-Friday)
- **Progress Tracking**: Mark readings as completed with visual feedback
- **Personal Dashboard**: View completion percentage with circular progress indicator
- **Reading History**: Review all completed readings with dates
- **Catch-up System**: Complete missed weekday readings during weekends
- **Community View**: See top 5 readers and compare progress

### Admin Features
- **Secure Access**: Password-protected admin panel (default: `bible2025`)
- **User Management**: Add or remove participants
- **Progress Monitoring**: View completion status for all users
- **Weekly Reports**: Generate week-by-week completion summaries
- **Data Export**: Download complete reading data as CSV files
- **Real-time Statistics**: Monitor total completions, average progress, and daily activity

## 🎨 Design

The application features a modern, clean interface inspired by contemporary mobile apps with:
- Beautiful purple gradient color scheme (#667EEA to #764BA2)
- Smooth animations and transitions
- Responsive card-based layout
- Intuitive bottom navigation
- Mobile-first design

## 📅 Reading Schedule

- **Reading Days**: Monday to Friday only
- **Rest Days**: Saturday and Sunday (no assigned readings)
- **Catch-up Allowed**: Complete missed weekday readings on weekends
- **Flexible**: Maintains accountability while preventing burnout

## 🚀 Getting Started

### Installation

1. Download all files to a directory on your computer
2. Open `index.html` in a modern web browser (Chrome, Firefox, Safari, Edge)
3. No server setup required - runs entirely in the browser!

### File Structure

```
BIBLE_READING/
├── index.html          # Main page (Today's reading)
├── progress.html       # Personal progress page
├── dashboard.html      # Community dashboard
├── admin.html         # Admin panel
├── styles.css         # All styling
├── data.js           # Data structure and storage functions
├── app.js            # Main page logic
├── progress.js       # Progress page logic
├── dashboard.js      # Dashboard logic
└── admin.js          # Admin panel logic
```

## 💾 Data Storage

- Uses browser's `localStorage` for data persistence
- All data stored locally on user's device
- No backend server or database required
- Data persists between sessions

## 🔐 Admin Access

**Default Password**: `bible2025`

To change the admin password:
1. Open `data.js`
2. Find the line: `const ADMIN_PASSWORD = 'bible2025';`
3. Change the password value
4. Save the file

## 📊 Using the Application

### For Users

1. **Select Your Name**: Choose your name from the dropdown on the main page
2. **View Today's Reading**: See the assigned Bible portion for today
3. **Mark Complete**: Click "Complete" button after finishing your reading
4. **Check Progress**: Visit the Progress page to see your statistics
5. **Catch Up**: On weekends, complete any missed readings from the week

### For Admins

1. **Login**: Click "Admin" in the bottom navigation, enter password
2. **Add Participants**: Enter names in the "Manage Participants" section
3. **View Reports**: Use the Weekly Report feature to monitor group progress
4. **Export Data**: Download CSV files for record-keeping
5. **Monitor Activity**: View recent completions in real-time

## 🛠️ Customization

### Adding More Readings

Edit `data.js` and add entries to the `BIBLE_READING_PLAN` array:

```javascript
{ date: '2025-01-06', portion: 'Genesis 1-3', day: 'Monday' },
```

### Changing Colors

Edit `styles.css` and modify the CSS variables:

```css
:root {
    --primary-purple: #667EEA;
    --primary-blue: #5A67D8;
    /* ... other colors ... */
}
```

### Default Participants

Edit `data.js` and modify the `DEFAULT_PARTICIPANTS` array:

```javascript
const DEFAULT_PARTICIPANTS = [
    'John',
    'Mary',
    'Peter'
];
```

## 🌐 Browser Compatibility

- ✅ Google Chrome (recommended)
- ✅ Mozilla Firefox
- ✅ Safari
- ✅ Microsoft Edge
- ✅ Opera

Requires a modern browser with ES6 support and localStorage.

## 📱 Mobile Support

Fully responsive design works on:
- 📱 Smartphones
- 📲 Tablets
- 💻 Desktop computers
- 🖥️ Large displays

## 🎯 Key Benefits

- **No Installation**: Just open in a browser
- **No Internet Required**: Works completely offline
- **No Account Needed**: Simple name selection
- **Privacy Focused**: All data stays on your device
- **Easy to Use**: Intuitive interface
- **Motivating**: Community features encourage consistency

## ⚠️ Important Notes

1. **Data Backup**: Data is stored in browser localStorage. Clear browser data = lost progress
2. **Single Device**: Data doesn't sync between devices
3. **Browser Specific**: Data is tied to the specific browser used
4. **Export Regularly**: Use the export feature to backup progress

## 📝 Tips for Success

- Check the app daily to stay consistent
- Use weekends to catch up on missed readings
- View the community dashboard for motivation
- Admins should download weekly reports for records
- Celebrate progress milestones!

## 🆘 Troubleshooting

**Can't see my progress?**
- Make sure you selected your name on the main page
- Check that you're using the same browser/device

**Complete button doesn't work?**
- Ensure you've selected your name first
- Check if it's a weekday (Mon-Fri) or if you're completing a catch-up

**Admin panel won't open?**
- Check the password (default: `bible2025`)
- Make sure JavaScript is enabled

**Lost my data?**
- Check if browser data was cleared
- Try restoring from exported CSV files

## 📄 License

This is a free, open-source project created for Bible reading accountability and spiritual growth.

## 🤝 Contributing

Feel free to customize this application for your church, small group, or personal use!

---

**Made with ❤️ for consistent Bible reading and spiritual growth**

*"Your word is a lamp to my feet and a light to my path." - Psalm 119:105*

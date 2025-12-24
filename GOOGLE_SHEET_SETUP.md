# 📊 Google Sheets Integration Guide

## 🎯 Quick Setup (CSV Method - Recommended)

### Step 1: Prepare Your Google Sheet

Create a Google Sheet with this format:

| Date       | Day       | Portion    |
|------------|-----------|------------|
| 2026-01-01 | Thursday  | Matthew 1  |
| 2026-01-02 | Friday    | Matthew 2  |
| 2026-01-05 | Monday    | Matthew 3  |
| 2026-01-06 | Tuesday   | Matthew 4  |

**Important:**
- Column A: Date (format: YYYY-MM-DD)
- Column B: Day name
- Column C: Bible portion
- Row 1: Headers (Date, Day, Portion)

### Step 2: Publish Your Google Sheet as CSV

1. Open your Google Sheet
2. Click **File** → **Share** → **Publish to web**
3. In the dropdown, select **Comma-separated values (.csv)**
4. Click **Publish**
5. Copy the generated URL (it will look like):
   ```
   https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv
   ```

### Step 3: Add the URL to Your Application

1. Open `data.js` file
2. Find the line:
   ```javascript
   csvUrl: '', // Add your published CSV URL here
   ```
3. Paste your CSV URL:
   ```javascript
   csvUrl: 'https://docs.google.com/spreadsheets/d/e/YOUR_SHEET_ID/pub?output=csv',
   ```
4. Save the file

### Step 4: Test

Refresh your application - it will now load data from your Google Sheet!

---

## 🔧 Advanced Setup (Google Sheets API)

If you need more control or want to access private sheets:

### Step 1: Get Google API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API**
4. Create credentials (API Key)
5. Copy your API key

### Step 2: Get Your Spreadsheet ID

From your Google Sheet URL:
```
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
```

### Step 3: Configure in data.js

```javascript
const GOOGLE_SHEET_CONFIG = {
    apiKey: 'YOUR_API_KEY_HERE',
    spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE',
    range: 'Sheet1!A:C', // Adjust if your sheet name is different
};
```

### Step 4: Make Sheet Public

1. Click **Share** button
2. Change to **Anyone with the link can view**
3. Click **Done**

---

## 📝 Sample Google Sheet Template

You can make a copy of this template:

[Copy this template structure]

**Sheet Name:** Sheet1

```
Date         Day        Portion
2026-01-01   Thursday   Matthew 1
2026-01-02   Friday     Matthew 2
2026-01-05   Monday     Matthew 3
2026-01-06   Tuesday    Matthew 4
2026-01-07   Wednesday  Matthew 5
2026-01-08   Thursday   Matthew 6
2026-01-09   Friday     Matthew 7
2026-01-12   Monday     Matthew 8
2026-01-13   Tuesday    Matthew 9
```

**Tips:**
- Only include weekday readings (Mon-Fri)
- Use consistent date format: YYYY-MM-DD
- Keep portion names simple and clear
- You can have as many rows as you need for the year

---

## 🔄 Updating Your Reading Plan

### CSV Method:
1. Edit your Google Sheet
2. Changes automatically sync
3. Users just need to refresh the page

### No re-deployment needed!

---

## ⚠️ Troubleshooting

**Problem: Data not loading**
- Check if CSV URL is correct
- Verify Google Sheet is published to web
- Open CSV URL directly in browser to test

**Problem: CORS errors**
- Google Sheets CSV is CORS-enabled by default
- If using API, ensure API key is valid

**Problem: Wrong data format**
- Ensure first row has headers
- Check date format is YYYY-MM-DD
- Verify no extra commas in portion names

---

## 🎉 Benefits

✅ **Easy Updates:** Change readings anytime in Google Sheets
✅ **No Coding:** Just edit spreadsheet cells
✅ **Collaborative:** Multiple people can manage the schedule
✅ **Version History:** Google Sheets tracks all changes
✅ **Flexible:** Add/remove readings as needed

---

## 📞 Need Help?

The application will use sample data if Google Sheet fails to load, so users always have a working app!

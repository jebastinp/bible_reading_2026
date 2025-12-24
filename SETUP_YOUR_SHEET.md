# 🚀 Quick Setup - Connect Your Google Sheet

## Step 1: Create Your Google Sheet

Create a new Google Sheet with this exact format:

```
Date         Day        Portion
2026-01-01   Thursday   Matthew 1
2026-01-02   Friday     Matthew 2
2026-01-05   Monday     Matthew 3
2026-01-06   Tuesday    Matthew 4
```

**Column Requirements:**
- **Column A (Date)**: Format as `YYYY-MM-DD` (e.g., 2026-01-01)
- **Column B (Day)**: Day name (e.g., Monday, Tuesday)
- **Column C (Portion)**: Bible reading (e.g., Matthew 1, Genesis 1-3)

## Step 2: Publish Your Sheet as CSV

1. In your Google Sheet, click **File** → **Share** → **Publish to web**
2. In the dropdown menu, select **Comma-separated values (.csv)**
3. Click **Publish**
4. **Copy the URL** that appears (it looks like this):
   ```
   https://docs.google.com/spreadsheets/d/e/2PACX-1vT...../pub?output=csv
   ```

## Step 3: Add URL to Your App

1. Open the file: `data.js`
2. Find line 10: `csvUrl: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSample/pub?output=csv',`
3. **Replace** with your copied URL:
   ```javascript
   csvUrl: 'YOUR_ACTUAL_URL_HERE',
   ```
4. Save the file

## Step 4: Test It!

1. Refresh your browser
2. Open Developer Console (F12 or Cmd+Option+I)
3. Look for messages like:
   ```
   ✅ Successfully loaded 250 readings from Google Sheet
   ```

## ✅ You're Done!

Your app now automatically loads Bible readings from your Google Sheet!

### Benefits:
- ✨ Update readings anytime in Google Sheets
- 🔄 Users just refresh to see changes
- 📊 Easy to manage and edit
- 👥 Multiple people can collaborate

---

## 🆘 Troubleshooting

**Problem: "Using sample data" message**
- Make sure you published the sheet as CSV (not web page)
- Check the URL is pasted correctly in `data.js`
- Verify the sheet has the correct column format

**Problem: No data showing**
- Open browser console (F12) to see error messages
- Check if your CSV URL works by pasting it directly in browser
- Ensure first row is headers: Date, Day, Portion

**Problem: Wrong date format**
- Dates must be: YYYY-MM-DD (e.g., 2026-01-01)
- Not: 1/1/2026 or Jan 1, 2026

---

## 📝 Sample Google Sheet Template

You can copy this template:
1. Go to Google Sheets
2. File → Make a copy
3. Edit with your dates and portions
4. Follow steps above to publish

**Need help?** Check the browser console for detailed error messages!

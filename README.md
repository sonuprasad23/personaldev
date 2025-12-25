# PersonaDev - Personal Development Tracker

<div align="center">
  <img src="public/logo.svg" alt="PersonaDev Logo" width="120" height="120">
  
  **Track your daily tasks, exercise, reading, language learning, and more.**
  
  Build better habits and achieve your goals with PersonaDev.
  
  [![Twitter](https://img.shields.io/badge/Twitter-@PrasadMarco-1DA1F2?style=flat&logo=twitter)](https://twitter.com/PrasadMarco)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-sonu--prasad23-0A66C2?style=flat&logo=linkedin)](https://www.linkedin.com/in/sonu-prasad23/)
  [![GitHub](https://img.shields.io/badge/GitHub-sonuprasad23-181717?style=flat&logo=github)](https://github.com/sonuprasad23)
</div>

---

## ✨ Features

- 📋 **Daily Tasks** - Create, manage, and track daily habits
- 🏋️ **Exercise Tracker** - Log workouts with built-in timer
- 📚 **Book Reading** - Track reading time and pages
- 🌍 **Language Learning** - Log vocabulary and study time
- 🎯 **Weekly Goals** - Set and track progress on goals
- 📺 **YouTube Analytics** - Monitor media consumption
- 📅 **Calendar View** - Visualize your activity history
- 🔔 **Reminders** - Set priority-based reminders
- 🔥 **Streak Tracking** - Stay motivated with daily streaks
- ☁️ **Google Sheets Sync** - Store data in the cloud
- 📱 **Android App** - Native mobile experience

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Google Cloud Project with Sheets API enabled
- Android Studio (for APK building)

### Installation

```bash
# Clone or navigate to project
cd personality-dev-app

# Install dependencies
npm install

# Install server dependencies
cd server && npm install && cd ..
```

### Configuration

1. **Create `.env` file** in the root directory:

```env
GOOGLE_SHEET_ID=your_spreadsheet_id_here
GOOGLE_API_KEY=your_api_key_here  # Optional
```

2. **Add `credentials.json`** - Your Google Service Account credentials file

3. **Share your Google Sheet** with the service account email from credentials.json

### Running the App

```bash
# Start both frontend and backend
npm start

# Or run separately:
npm run dev      # Frontend only
npm run server   # Backend only
```

Open http://localhost:5173 in your browser.

---

## 📱 Building Android APK

### Prerequisites

1. **Android Studio** installed
2. **JDK 17+** installed
3. **Android SDK** configured

### Build Steps

```bash
# 1. Build the web app
npm run build

# 2. Sync with Android
npm run android:sync

# 3. Open in Android Studio
npm run android:open
```

### In Android Studio:

1. Wait for Gradle sync to complete
2. Go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**
3. Find the APK at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Or build from command line:

```bash
cd android
./gradlew assembleDebug
```

The APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## ☁️ Google Sheets Setup

### 1. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable **Google Sheets API**

### 2. Create Service Account

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > Service Account**
3. Download the JSON key file
4. Rename it to `credentials.json` and place in project root

### 3. Create Spreadsheet

1. Create a new Google Sheet
2. Copy the Spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```
3. Add it to your `.env` file

### 4. Share Sheet with Service Account

1. Open your Google Sheet
2. Click **Share**
3. Add the service account email (from credentials.json)
4. Give **Editor** access

---

## 📂 Project Structure

```
personality-dev-app/
├── android/              # Android native project
├── public/               # Static assets
│   ├── logo.svg          # App logo
│   └── manifest.json     # PWA manifest
├── server/               # Backend server
│   ├── index.js          # Express server with Google Sheets API
│   └── package.json
├── src/
│   ├── components/       
│   ├── services/         
│   ├── App.jsx           
│   └── index.css         
├── capacitor.config.ts   
├── credentials.json      
├── .env                  
└── package.json
```

---

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run server` | Start backend server |
| `npm start` | Start both frontend and backend |
| `npm run android:sync` | Sync web build to Android |
| `npm run android:open` | Open Android Studio |
| `npm run android:build` | Build and sync Android |

---

## 📤 Data Export Formats

### JSON (.json)
Standard JSON backup with all your data.

### PersonaDev Format (.pdev)
Custom format with metadata:
```json
{
  "_format": "PersonaDev",
  "_version": "2.0.0",
  "_exportedAt": "2024-01-01T00:00:00.000Z",
  "_creator": "PersonaDev by Sonu Prasad",
  "data": { ... }
}
```

### CSV (.csv)
Spreadsheet-compatible format for analysis.

---

## 👤 Created By

**Sonu Prasad**

- Twitter: [@PrasadMarco](https://twitter.com/PrasadMarco)
- LinkedIn: [sonu-prasad23](https://www.linkedin.com/in/sonu-prasad23/)
- GitHub: [sonuprasad23](https://github.com/sonuprasad23)

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

<div align="center">
  Made with ❤️ by Sonu Prasad
  
  © 2025 PersonaDev. All rights reserved.
</div>

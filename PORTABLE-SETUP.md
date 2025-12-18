# Dividend Analyzer Pro - Quick Start

## 🚀 Running the Project

This project uses **portable** Python and Node.js installations, so no system-wide installation is required!

### Method 1: Using the Launcher Script (Recommended)
Simply double-click `run.bat` in Windows Explorer.

The launcher will:
1. Ask if you want to sync data from Yahoo Finance
2. Start the development server
3. Display the local URL

### Method 2: Manual Commands

#### Sync Data (Optional)
```bash
.\.portable\python\python.exe data_sync.py
```

#### Run Development Server
```bash
.\.portable\node-v20.11.0-win-x64\node.exe .\node_modules\vite\bin\vite.js
```

Or use the shortcut:
```bash
sync-data.bat  # Just sync data
run.bat        # Full launcher
```

## 📱 Access on iPhone

1. Make sure your phone is on the same Wi-Fi network as your PC
2. Find your PC's IP address (run `ipconfig` in terminal, look for IPv4 Address)
3. On your iPhone, open Safari and navigate to: `http://YOUR-PC-IP:5173`
4. Tap the Share button → "Add to Home Screen"
5. The app will now work like a native app with offline support!

## 📂 Project Structure

- `.portable/` - Contains portable Python and Node.js installations (local only)
- `public/data.json` - Dividend data from Yahoo Finance
- `data_sync.py` - Python script to fetch S&P 500 dividend data
- `run.bat` - Main launcher script
- `sync-data.bat` - Data sync shortcut

## 🔧 Troubleshooting

**Server not starting?**
- Make sure no other application is using port 5173
- Try running as Administrator

**Data sync failing?**
- Check your internet connection
- The script may take 10-30 minutes to complete (it analyzes 500+ stocks)

**Can't access on iPhone?**
- Verify both devices are on the same Wi-Fi
- Temporarily disable Windows Firewall or add an exception for port 5173
- Make sure you're using your PC's local IP (192.168.x.x), not 127.0.0.1

## 📦 What's Installed Locally

- **Python 3.11.9** (portable, embeddable)
  - yfinance (stock data)
  - pandas (data processing)
  - requests (HTTP requests)
  - lxml & html5lib (HTML parsing)
  
- **Node.js 20.11.0** (portable)
  - Vite (dev server & build tool)
  - React (UI framework)
  - TailwindCSS (styling)
  - And all other project dependencies

Everything is self-contained in the `.portable` folder!

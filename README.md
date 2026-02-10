# 📖 Digital Diary — Kid-Friendly Story Recorder PWA

A progressive web app where kids can record stories with their voice, see their words appear in real-time via browser speech recognition, listen with fun character voices, and save everything for later.

## Features

- 🎤 **Voice Recording** — tap to record, tap to stop
- ✨ **Live Transcription** — browser-native speech recognition (no API key, no cost)
- 🔊 **Text-to-Speech** — stories read back in fun character voices
- 👧👦 **Multiple Kids** — each child gets their own profile
- 🔒 **Parent PIN** — settings/upload locked behind a PIN (server-validated)
- 📤 **OneDrive Backup** — save stories to the cloud
- 📴 **Offline Support** — record and browse stories without internet
- 📱 **Installable PWA** — add to home screen on any device

## Project Structure

```
digital-diary/
├── public/                  # Static files served to the browser
│   ├── index.html           # Home / record page (with live transcription)
│   ├── review.html          # Review, edit, listen to story
│   ├── history.html         # Browse past stories
│   ├── kids.html            # Select / manage kid profiles
│   ├── settings.html        # Parent-only settings & upload
│   ├── manifest.json        # PWA manifest
│   ├── service-worker.js    # Offline caching & sync
│   ├── icons/               # App icons
│   ├── styles/
│   │   └── style.css        # All styles
│   └── scripts/
│       ├── app.js           # Shared utilities & navigation
│       ├── recorder.js      # Audio recording logic
│       ├── speech-recognition.js  # Browser-native speech-to-text
│       ├── tts.js           # Text-to-speech playback
│       └── storage.js       # IndexedDB wrapper
├── api/                     # Vercel serverless functions
│   └── verify-pin.js        # Server-side PIN verification
├── package.json
├── vercel.json
├── .env.example
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
- A modern browser (Chrome, Edge, or Safari) for speech recognition

### Local Development

```bash
git clone https://github.com/YOUR_USERNAME/digital-diary.git
cd digital-diary
npm install

# Copy env template and fill in your keys
cp .env.example .env

# Start local dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

### Deploy to Vercel

```bash
# Set environment variables
vercel env add PARENT_PIN_HASH

# Deploy
vercel --prod
```

### Setting the Parent PIN

The PIN is stored as a SHA-256 hash (never plaintext). To generate a hash:

```bash
# On macOS/Linux:
echo -n "your-pin" | shasum -a 256

# On Windows PowerShell:
$bytes = [System.Text.Encoding]::UTF8.GetBytes("your-pin")
$hash = [System.Security.Cryptography.SHA256]::Create().ComputeHash($bytes)
($hash | ForEach-Object { $_.ToString("x2") }) -join ''
```

Set the resulting hash as `PARENT_PIN_HASH` in your environment.

## Offline vs Online Mode

| Feature | Offline | Online |
|---------|---------|--------|
| Record audio | ✅ | ✅ |
| Live speech-to-text | ⚠️ (browser-dependent) | ✅ |
| Play back recording | ✅ | ✅ |
| Browse story history | ✅ | ✅ |
| Text-to-speech | ✅ (browser) | ✅ |
| OneDrive upload | ❌ | ✅ |

> **Note:** Chrome requires an internet connection for SpeechRecognition.
> Edge and Android may work offline depending on the device.

## Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS (no framework — fast & simple)
- **Speech-to-Text**: Web Speech API (browser-native, free)
- **Text-to-Speech**: Web Speech Synthesis API (browser-native, free)
- **Backend**: Vercel serverless functions (PIN verification only)
- **Storage**: IndexedDB (local), OneDrive (cloud backup)
- **Auth**: MSAL.js for Microsoft Graph API

## License

MIT

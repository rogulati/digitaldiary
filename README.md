# 📖 Digital Diary — Kid-Friendly Story Recorder PWA

A progressive web app where kids can record stories with their voice, see their words appear in real-time via browser speech recognition, listen with fun character voices, and save everything for later.

## Features

- 🎤 **Voice Recording** — tap to record, tap to stop
- ✨ **Live Transcription** — browser-native speech recognition (no API key, no cost)
- 🔊 **Text-to-Speech** — stories read back in fun character voices
- 👧👦 **Multiple Kids** — each child gets their own profile
- 🔒 **Parent PIN** — settings locked behind a client-side SHA-256 PIN
- 📤 **OneDrive Backup** — save stories to the cloud
- 📴 **Offline Support** — record and browse stories without internet
- 📱 **Installable PWA** — add to home screen on any device

## Project Structure

```
digital-diary/
├── index.html               # Home / record page (with live transcription)
├── review.html              # Review, edit, listen to story
├── history.html             # Browse past stories
├── kids.html                # Select / manage kid profiles
├── settings.html            # Parent-only settings & upload
├── manifest.json            # PWA manifest
├── service-worker.js        # Offline caching
├── icons/                   # App icons
├── styles/
│   └── style.css            # All styles
├── scripts/
│   ├── app.js               # Shared utilities & navigation
│   ├── recorder.js          # Audio recording logic
│   ├── speech-recognition.js # Browser-native speech-to-text
│   ├── tts.js               # Text-to-speech playback
│   └── storage.js           # IndexedDB wrapper
├── .gitignore
└── README.md
```

## Getting Started

### Deploy to GitHub Pages

1. Create a new GitHub repository (e.g. `digital-diary`)
2. Push this code:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/digital-diary.git
   git branch -M main
   git push -u origin main
   ```
3. Go to **Settings → Pages** in your GitHub repo
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder → click **Save**
6. Your app will be live at `https://YOUR_USERNAME.github.io/digital-diary/`

### Local Development

No build tools required — just serve the files with any static server:

```bash
# Python
python -m http.server 3000

# Node.js (npx)
npx serve .

# VS Code Live Server extension
# Right-click index.html → Open with Live Server
```

Open `http://localhost:3000` in Chrome or Edge.

### Setting the Parent PIN

The PIN is verified client-side using a SHA-256 hash. The default PIN is `1234`.

To change it, run this in your browser console:

```js
crypto.subtle.digest('SHA-256', new TextEncoder().encode('YOUR_NEW_PIN'))
  .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2,'0')).join(''))
  .then(console.log)
```

Then replace the `PIN_HASH` value in `settings.html`.

### OneDrive Setup

The app uses MSAL.js to upload stories to OneDrive. To use your own App Registration:

1. Go to [Azure Portal → App Registrations](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationsListBlade)
2. Create a new registration with **Single-page application** redirect URI pointing to your GitHub Pages URL
3. Enable **Personal Microsoft accounts** under supported account types
4. Copy the **Application (client) ID** and replace it in `settings.html`

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
- **Hosting**: GitHub Pages (free, static)
- **Storage**: IndexedDB (local), OneDrive (cloud backup)
- **Auth**: MSAL.js for Microsoft Graph API

## License

MIT

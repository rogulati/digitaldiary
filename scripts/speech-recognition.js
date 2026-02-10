/**
 * speech-recognition.js — Browser-native speech-to-text
 *
 * Uses the Web Speech API (SpeechRecognition) to transcribe speech in real-time.
 * Works in Chrome, Edge, Safari, and Android browsers — no API key needed.
 *
 * Note: This runs in parallel with MediaRecorder so kids see their words
 * appear as text while they speak.
 */

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

/** Check if the browser supports speech recognition */
export const isSupported = !!SpeechRecognition;

let recognition = null;
let fullTranscript = '';
let onUpdateCallback = null;

/**
 * Start live speech recognition.
 * @param {Object} options
 * @param {string} options.lang — BCP-47 language code (default: 'en-US')
 * @param {function} options.onUpdate — called with (transcriptSoFar) on each result
 * @param {function} options.onEnd — called when recognition stops
 */
export function startRecognition({ lang = 'en-US', onUpdate, onEnd } = {}) {
  if (!isSupported) {
    console.warn('SpeechRecognition not supported in this browser');
    return;
  }

  // Stop any existing session
  stopRecognition();

  recognition = new SpeechRecognition();
  recognition.lang = lang;
  recognition.continuous = true;       // Keep listening until stopped
  recognition.interimResults = true;   // Show words as they're spoken
  recognition.maxAlternatives = 1;

  fullTranscript = '';
  onUpdateCallback = onUpdate || null;

  let resultIndex = 0; // Track which results we've already finalized

  recognition.addEventListener('result', (event) => {
    let interimTranscript = '';

    for (let i = resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      if (result.isFinal) {
        fullTranscript += result[0].transcript + ' ';
        resultIndex = i + 1; // Don't re-process this result
      } else {
        interimTranscript += result[0].transcript;
      }
    }

    const displayText = (fullTranscript + interimTranscript).trim();

    if (onUpdateCallback) {
      onUpdateCallback(displayText);
    }
  });

  recognition.addEventListener('end', () => {
    // SpeechRecognition may auto-stop (e.g., silence timeout).
    // If we haven't explicitly stopped, restart it to keep listening.
    if (recognition && recognition._keepAlive) {
      recognition.start();
    } else if (onEnd) {
      onEnd(fullTranscript);
    }
  });

  recognition.addEventListener('error', (event) => {
    // 'no-speech' and 'aborted' are normal — ignore them
    if (event.error === 'no-speech' || event.error === 'aborted') return;
    console.warn('Speech recognition error:', event.error);
  });

  recognition._keepAlive = true;
  recognition.start();
}

/**
 * Stop speech recognition and return the final transcript.
 * @returns {string} the full transcribed text
 */
export function stopRecognition() {
  if (recognition) {
    recognition._keepAlive = false;
    recognition.stop();
    recognition = null;
  }
  const result = fullTranscript;
  onUpdateCallback = null;
  return result;
}

/**
 * Get the current transcript without stopping.
 * @returns {string}
 */
export function getCurrentTranscript() {
  return fullTranscript;
}

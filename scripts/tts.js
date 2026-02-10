/**
 * tts.js — Text-to-Speech using the Web Speech API
 *
 * Works fully offline (browser built-in voices).
 */

/**
 * Speak the given text aloud with a character voice.
 * @param {string} text
 * @param {'default-high'|'default-low'} voiceType
 */
export function speakStory(text, voiceType = 'default-high') {
  // Cancel any ongoing speech
  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  // Configure voice based on character type
  if (voiceType === 'default-high') {
    utterance.pitch = 1.3;
    utterance.rate = 0.9;
  } else {
    utterance.pitch = 0.7;
    utterance.rate = 0.85;
  }

  // Try to pick a good voice
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    // Prefer English voices
    const englishVoices = voices.filter(v => v.lang.startsWith('en'));
    if (englishVoices.length > 0) {
      utterance.voice = englishVoices[0];
    }
  }

  speechSynthesis.speak(utterance);
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking() {
  speechSynthesis.cancel();
}

// Pre-load voices (some browsers need this)
if (typeof speechSynthesis !== 'undefined') {
  speechSynthesis.getVoices();
  speechSynthesis.addEventListener('voiceschanged', () => {
    speechSynthesis.getVoices();
  });
}

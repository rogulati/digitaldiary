/**
 * recorder.js — Audio recording using MediaRecorder API
 *
 * Stores the raw Blob (not a URL) so it persists across page navigations.
 */

let mediaRecorder = null;
let audioChunks = [];
let resolveStop = null;

/**
 * Start audio recording.
 * @param {MediaStream} [existingStream] — optional mic stream to reuse
 * @returns {Promise<MediaStream>} the mic stream (for sharing with other APIs)
 * @throws if microphone access is denied
 */
export async function startRecording(existingStream) {
  const stream = existingStream || await navigator.mediaDevices.getUserMedia({ audio: true });

  // Prefer webm/opus, fall back to whatever the browser supports
  const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/webm';

  mediaRecorder = new MediaRecorder(stream, { mimeType });
  audioChunks = [];

  mediaRecorder.addEventListener('dataavailable', (e) => {
    if (e.data.size > 0) audioChunks.push(e.data);
  });

  mediaRecorder.addEventListener('stop', () => {
    // Stop all tracks to release the microphone
    stream.getTracks().forEach(track => track.stop());

    const blob = new Blob(audioChunks, { type: mimeType });
    if (resolveStop) {
      resolveStop(blob);
      resolveStop = null;
    }
  });

  mediaRecorder.start(1000); // Collect data every second for reliability
}

/**
 * Stop recording and return the audio Blob.
 * @returns {Promise<Blob>} the recorded audio
 */
export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') {
      resolve(null);
      return;
    }
    resolveStop = resolve;
    mediaRecorder.stop();
  });
}

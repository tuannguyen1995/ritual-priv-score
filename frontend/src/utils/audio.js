// Web Audio API wrapper for Cyber Sound Effects
let audioCtx;
let isAudioEnabled = true;

const initAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
};

export const setAudioEnabled = (enabled) => {
  isAudioEnabled = enabled;
};

export const getAudioEnabled = () => isAudioEnabled;

export const playBlipSound = () => {
  if (!isAudioEnabled) return;
  initAudioContext();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.type = 'square';
  // Random high pitch for computer typing effect
  osc.frequency.setValueAtTime(400 + Math.random() * 800, audioCtx.currentTime); 
  
  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.05);
};

export const playSuccessSound = () => {
  if (!isAudioEnabled) return;
  initAudioContext();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
  osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
  osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
  osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.6);
};

export const playClickSound = () => {
  if (!isAudioEnabled) return;
  initAudioContext();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  osc.type = 'triangle';
  osc.frequency.setValueAtTime(300, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.1);

  gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
};

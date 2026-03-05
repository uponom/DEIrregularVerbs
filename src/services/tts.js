const TTS_RATE = 1.0;
const TTS_PITCH = 1.0;

export function createTtsService() {
  const state = {
    voices: [],
    deVoice: null,
    lastError: null,
  };

  function hasApi() {
    return 'speechSynthesis' in window && Boolean(window.SpeechSynthesisUtterance);
  }

  function pickGermanVoice() {
    try {
      const list = window.speechSynthesis?.getVoices?.() || [];
      state.voices = list;

      let voice = list.find((v) => /de-DE/i.test(v.lang)) || list.find((v) => /^de[-_]/i.test(v.lang));
      if (!voice) {
        const prefs = [
          /Microsoft (Katja|Conrad|Stefan)/i,
          /Google Deutsch/i,
          /German \(Germany\)/i,
          /Anna|Petra|Markus|Vicki/i,
        ];
        for (const rx of prefs) {
          voice = list.find((v) => rx.test(v.name));
          if (voice) break;
        }
      }

      state.deVoice = voice || null;
      state.lastError = null;
    } catch (_err) {
      state.deVoice = null;
      state.lastError = 'VOICE_PICK_FAILED';
    }
  }

  function speakSequence(parts, enabled) {
    if (!enabled) return;
    if (!hasApi()) return;

    try {
      const text = (parts || []).filter(Boolean).join(' ');
      if (!text) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'de-DE';
      if (state.deVoice) utterance.voice = state.deVoice;
      utterance.rate = TTS_RATE;
      utterance.pitch = TTS_PITCH;
      window.speechSynthesis.speak(utterance);
      state.lastError = null;
    } catch (_err) {
      state.lastError = 'SPEAK_FAILED';
    }
  }

  function speakSegments(segments, enabled, options) {
    const force = Boolean(options && options.force);
    if (!force && !enabled) return;
    if (!hasApi()) return;

    const queue = (segments || [])
      .map((segment) => ({
        text: String(segment?.text || '').trim(),
        lang: segment?.lang || 'de-DE',
      }))
      .filter((segment) => segment.text);

    if (!queue.length) return;

    try {
      window.speechSynthesis.cancel();
      for (const segment of queue) {
        const utterance = new SpeechSynthesisUtterance(segment.text);
        utterance.lang = segment.lang;
        if (/^de[-_]/i.test(segment.lang) && state.deVoice) {
          utterance.voice = state.deVoice;
        }
        utterance.rate = TTS_RATE;
        utterance.pitch = TTS_PITCH;
        window.speechSynthesis.speak(utterance);
      }
      state.lastError = null;
    } catch (_err) {
      state.lastError = 'SPEAK_FAILED';
    }
  }

  function renderInfo(target, enabled, version, labels) {
    if (!target) return;

    const safeLabels = labels || {};
    const voice = state.deVoice;
    const parts = [
      `${safeLabels.version || 'Version'}: ${version || 'dev'}`,
      `${safeLabels.engine || 'Engine'}: ${hasApi() ? 'Web Speech API' : '—'}`,
      `${safeLabels.enabled || 'Enabled'}: ${enabled ? (safeLabels.yes || 'yes') : (safeLabels.no || 'no')}`,
      `${safeLabels.voice || 'Voice'}: ${voice ? `${voice.name} (${voice.lang || ''})` : '—'}`,
      `${safeLabels.speed || 'Rate'}: ${TTS_RATE}`,
      `${safeLabels.pitch || 'Pitch'}: ${TTS_PITCH}`,
    ];
    target.textContent = parts.join(' · ');
  }

  function init(onVoicesChanged) {
    pickGermanVoice();
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.onvoiceschanged = () => {
        pickGermanVoice();
        if (onVoicesChanged) onVoicesChanged();
      };
      setTimeout(() => {
        pickGermanVoice();
        if (onVoicesChanged) onVoicesChanged();
      }, 300);
      setTimeout(() => {
        pickGermanVoice();
        if (onVoicesChanged) onVoicesChanged();
      }, 1200);
    } catch (_err) {
      // Ignore voice bootstrap errors.
    }
  }

  return {
    getLastError: () => state.lastError,
    init,
    pickGermanVoice,
    renderInfo,
    speakSegments,
    speakSequence,
  };
}

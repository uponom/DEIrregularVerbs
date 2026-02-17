const TTS_RATE = 0.95;
const TTS_PITCH = 1.0;

export function createTtsService() {
  const state = {
    voices: [],
    deVoice: null,
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
    } catch (_err) {
      state.deVoice = null;
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
    } catch (_err) {
      // Ignore TTS errors to keep app flow stable.
    }
  }

  function renderInfo(target, enabled, version) {
    if (!target) return;

    const voice = state.deVoice;
    const parts = [
      `Version: ${version || 'dev'}`,
      `Движок: ${hasApi() ? 'Web Speech API' : '—'}`,
      `Включено: ${enabled ? 'да' : 'нет'}`,
      `Голос: ${voice ? `${voice.name} (${voice.lang || ''})` : '—'}`,
      `Скорость: ${TTS_RATE}`,
      `Тембр: ${TTS_PITCH}`,
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
    init,
    pickGermanVoice,
    renderInfo,
    speakSequence,
  };
}
